import type { OrderDoc } from '@/types/db';
import type { PlacedOrder } from '@/types/order';

/** Client-facing projection — id is the random accessToken, never the raw Mongo _id. */
export function toPlacedOrder(doc: OrderDoc): PlacedOrder {
  return {
    id: doc.accessToken,
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    delivery: doc.delivery,
    items: doc.items,
    totals: doc.totals,
    estimatedMinutes: doc.estimatedMinutes,
    status: doc.status,
    payment: { method: doc.payment.method, status: doc.payment.status },
  };
}
