import { getMenuItemById, menuItems } from '@/data/menu';
import type { MenuItem } from '@/types/menu';
import type { OrderDoc } from '@/types/db';

const MAX_RECOMMENDATIONS = 3;

/**
 * Pure function, no I/O — reusable from both the manual admin-triggered send
 * and (later) an automatic scheduled job, without rework.
 *
 * Scores each menu item the customer hasn't ordered by how often it appears
 * in the `pairsWith` list of items they HAVE ordered, favouring things they
 * haven't tried that go with what they already like. Falls back to popular
 * items for customers with too little history to score anything.
 */
export function recommendItemsForCustomer(pastOrders: OrderDoc[]): MenuItem[] {
  const orderedIds = new Set(
    pastOrders.flatMap((order) => order.items.map((item) => item.menuItemId)).filter((id) => !id.startsWith('combo:'))
  );

  const scores = new Map<string, number>();
  for (const orderedId of orderedIds) {
    const item = getMenuItemById(orderedId);
    for (const pairedId of item?.pairsWith ?? []) {
      if (!orderedIds.has(pairedId)) {
        scores.set(pairedId, (scores.get(pairedId) ?? 0) + 1);
      }
    }
  }

  const scored = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => getMenuItemById(id))
    .filter((item): item is MenuItem => Boolean(item));

  if (scored.length >= MAX_RECOMMENDATIONS) {
    return scored.slice(0, MAX_RECOMMENDATIONS);
  }

  const fallback = menuItems.filter(
    (item) => item.isPopular && !orderedIds.has(item.id) && !scored.some((s) => s.id === item.id)
  );

  return [...scored, ...fallback].slice(0, MAX_RECOMMENDATIONS);
}
