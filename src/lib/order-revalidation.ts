import { getMenuItemById } from '@/data/menu';
import { fixedCombos, buildYourOwnCombo } from '@/data/combos';
import { ADD_ON_OPTIONS } from '@/types/menu';
import type { CartItem } from '@/types/cart';

export class OrderValidationError extends Error {}

const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY_PER_LINE = 20;

/**
 * Server-side price/contents revalidation for a submitted cart — never trust
 * client-sent unitPrice/addOnIds. Combo lines carry a synthetic menuItemId:
 * `combo:fixed:<comboId>` (a curated pairing, see data/combos.ts fixedCombos)
 * or `combo:custom:<anything>` (the "Create Your Own Combo" picker) — both
 * price at their fixed comboPrice regardless of which real items the display
 * text names, since the bundle price doesn't depend on the exact selection.
 * Everything else is a real menu item priced from src/data/menu.ts.
 */
export function revalidateCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderValidationError('Your cart is empty.');
  }
  if (items.length > MAX_LINE_ITEMS) {
    throw new OrderValidationError('Too many items in one order — please split into multiple orders.');
  }

  return items.map((raw): CartItem => {
    if (
      typeof raw !== 'object' ||
      raw === null ||
      typeof (raw as Record<string, unknown>).lineId !== 'string' ||
      typeof (raw as Record<string, unknown>).menuItemId !== 'string' ||
      typeof (raw as Record<string, unknown>).quantity !== 'number'
    ) {
      throw new OrderValidationError('Invalid cart item.');
    }
    const item = raw as CartItem;

    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      throw new OrderValidationError(`Quantity per item must be between 1 and ${MAX_QUANTITY_PER_LINE}.`);
    }

    if (item.menuItemId.startsWith('combo:fixed:')) {
      const comboId = item.menuItemId.split(':')[2];
      const combo = fixedCombos.find((c) => c.id === comboId);
      if (!combo) {
        throw new OrderValidationError('One of the combos in your cart is no longer available.');
      }
      return {
        ...item,
        unitPrice: combo.comboPrice,
        customization: { ...item.customization, addOnIds: [] },
      };
    }

    if (item.menuItemId.startsWith('combo:custom:')) {
      return {
        ...item,
        unitPrice: buildYourOwnCombo.comboPrice,
        customization: { ...item.customization, addOnIds: [] },
      };
    }

    const menuItem = getMenuItemById(item.menuItemId);
    if (!menuItem) {
      throw new OrderValidationError('One of the items in your cart is no longer available.');
    }

    const addOnIds = Array.isArray(item.customization?.addOnIds)
      ? item.customization.addOnIds.filter((id) => ADD_ON_OPTIONS.some((a) => a.id === id))
      : [];

    return {
      ...item,
      signatureName: menuItem.signatureName,
      commonName: menuItem.commonName,
      image: menuItem.image,
      unitPrice: menuItem.price,
      customization: { ...item.customization, addOnIds },
    };
  });
}

/**
 * Reorder-specific variant: re-prices each line against the CURRENT menu (a
 * past order's stored unitPrice is a snapshot, never trusted for a new
 * order — same "never trust a stale price" principle as checkout), but
 * unlike revalidateCartItems it never throws for one bad line — a menu item
 * removed since the original order was placed just gets skipped and named in
 * `skipped`, rather than blocking the whole reorder.
 */
export function revalidateCartItemsLenient(items: CartItem[]): { items: CartItem[]; skipped: string[] } {
  const valid: CartItem[] = [];
  const skipped: string[] = [];
  for (const item of items) {
    try {
      valid.push(...revalidateCartItems([item]));
    } catch {
      skipped.push(item.signatureName || item.menuItemId);
    }
  }
  return { items: valid, skipped };
}
