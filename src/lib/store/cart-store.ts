'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartCustomization, CartItem } from '@/types/cart';
import type { MenuItem } from '@/types/menu';

interface CartState {
  items: CartItem[];
  favoriteIds: string[];
  isDrawerOpen: boolean;
  lastAddedMenuItemId: string | null;
  addItem: (menuItem: MenuItem, quantity: number, customization: CartCustomization) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  toggleFavorite: (menuItemId: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/** Two lines are "the same" (and should merge) only if drink + customization match exactly. */
function customizationKey(menuItemId: string, c: CartCustomization) {
  return `${menuItemId}|${c.sugarLevel}|${c.iceLevel}|${[...c.addOnIds].sort().join(',')}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteIds: [],
      isDrawerOpen: false,
      lastAddedMenuItemId: null,

      addItem: (menuItem, quantity, customization) => {
        const key = customizationKey(menuItem.id, customization);
        const existing = get().items.find(
          (item) => customizationKey(item.menuItemId, item.customization) === key
        );

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.lineId === existing.lineId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            lastAddedMenuItemId: menuItem.id,
            isDrawerOpen: true,
          });
          return;
        }

        const newLine: CartItem = {
          lineId: `${menuItem.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          menuItemId: menuItem.id,
          signatureName: menuItem.signatureName,
          commonName: menuItem.commonName,
          image: menuItem.image,
          unitPrice: menuItem.price,
          quantity,
          customization,
        };

        set({
          items: [...get().items, newLine],
          lastAddedMenuItemId: menuItem.id,
          isDrawerOpen: true,
        });
      },

      removeLine: (lineId) => set({ items: get().items.filter((item) => item.lineId !== lineId) }),

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeLine(lineId);
          return;
        }
        set({
          items: get().items.map((item) => (item.lineId === lineId ? { ...item, quantity } : item)),
        });
      },

      toggleFavorite: (menuItemId) => {
        const { favoriteIds } = get();
        set({
          favoriteIds: favoriteIds.includes(menuItemId)
            ? favoriteIds.filter((id) => id !== menuItemId)
            : [...favoriteIds, menuItemId],
        });
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'tbc-cart-storage',
      partialize: (state) => ({ items: state.items, favoriteIds: state.favoriteIds }),
    }
  )
);

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
