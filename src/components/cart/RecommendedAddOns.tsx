'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { getMenuItemById, menuItems } from '@/data/menu';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';

/** Shows "Customers Also Loved" suggestions based on the last item added to cart. */
export function RecommendedAddOns() {
  const lastAddedMenuItemId = useCartStore((s) => s.lastAddedMenuItemId);
  const addItem = useCartStore((s) => s.addItem);
  const cartItemIds = useCartStore((s) => new Set(s.items.map((i) => i.menuItemId)));

  const source = lastAddedMenuItemId ? getMenuItemById(lastAddedMenuItemId) : null;
  const pairIds = source?.pairsWith ?? [];
  const suggestions = pairIds
    .map((id) => getMenuItemById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item) && !cartItemIds.has(item!.id))
    .slice(0, 2);

  const fallback = suggestions.length
    ? []
    : menuItems.filter((m) => m.isPopular && !cartItemIds.has(m.id)).slice(0, 2);

  const items = suggestions.length ? suggestions : fallback;
  if (!items.length) return null;

  return (
    <div className="border-t border-tbc-charcoal-border pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tbc-gold-400">
        Customers Also Loved
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl2 bg-tbc-charcoal-light p-2"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium leading-tight">{item.signatureName}</p>
              <p className="text-xs text-tbc-cream-dim">{formatCurrency(item.price)}</p>
            </div>
            <button
              type="button"
              aria-label={`Add ${item.signatureName} to cart`}
              onClick={() => addItem(item, 1, DEFAULT_CUSTOMIZATION)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-tbc-gold-400 text-black transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
