'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlacedOrder } from '@/types/order';

interface OrderState {
  lastOrder: PlacedOrder | null;
  setLastOrder: (order: PlacedOrder) => void;
}

/** Session-scoped so a refresh on the confirmation page still shows the order, but it doesn't linger across visits. */
export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    {
      name: 'tbc-last-order',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : (undefined as any)
      ),
    }
  )
);
