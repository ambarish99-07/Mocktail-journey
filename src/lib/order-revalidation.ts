import { getMenuItemById } from '@/data/menu';
import { chooseNCombos } from '@/data/combos';
import { ADD_ON_OPTIONS } from '@/types/menu';
import type { CartItem } from '@/types/cart';

export class OrderValidationError extends Error {}

/**
 * Server-side price/contents revalidation for a submitted cart — never trust
 * client-sent unitPrice/addOnIds. "Choose N" combos add a synthetic line whose
 * menuItemId is `combo:${comboId}:${timestamp}` (see ChooseComboModal.tsx),
 * priced at the combo's flat comboPrice with no add-ons; everything else is a
 * real menu item priced from src/data/menu.ts + src/types/menu.ts add-ons.
 */
const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY_PER_LINE = 20;

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

    if (item.menuItemId.startsWith('combo:')) {
      const comboId = item.menuItemId.split(':')[1];
      const combo = chooseNCombos.find((c) => c.id === comboId);
      if (!combo) {
        throw new OrderValidationError('One of the combos in your cart is no longer available.');
      }
      return {
        ...item,
        unitPrice: combo.comboPrice,
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
