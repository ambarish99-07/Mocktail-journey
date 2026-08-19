import type { OrderDoc } from '@/types/db';
import type { PlacedOrder, SafeRiderInfo } from '@/types/order';

/** Client-facing projection — id is the random accessToken, never the raw Mongo _id. Rider's trackingToken is stripped — that's the rider-only credential, never sent to the customer. */
export function toPlacedOrder(doc: OrderDoc): PlacedOrder {
  const rider: SafeRiderInfo | null = doc.rider
    ? {
        name: doc.rider.name,
        phone: doc.rider.phone,
        location: doc.rider.location,
        sharingActive: doc.rider.sharingActive,
      }
    : null;

  return {
    id: doc.accessToken,
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    delivery: doc.delivery,
    items: doc.items,
    totals: doc.totals,
    estimatedMinutes: doc.estimatedMinutes,
    status: doc.status,
    statusHistory: doc.statusHistory ?? [],
    rider,
    deliveryCoordinates: doc.deliveryCoordinates ?? null,
    cancellation: doc.cancellation ?? null,
    refundClaim: doc.refundClaim ?? null,
    payment: { method: doc.payment.method, status: doc.payment.status },
  };
}
