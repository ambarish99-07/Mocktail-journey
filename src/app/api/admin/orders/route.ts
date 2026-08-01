import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { getOrdersCollection } from '@/lib/db/collections';
import type { OrderDoc, OrderStatusEvent } from '@/types/db';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order';

/** Admin-facing order shape — unlike PlacedOrder, includes payment/whatsapp detail admins need to act on. */
interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  delivery: OrderDoc['delivery'];
  items: OrderDoc['items'];
  totals: OrderDoc['totals'];
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  payment: { method: PaymentMethod; status: PaymentStatus };
  isGuest: boolean;
}

function toAdminOrder(doc: OrderDoc): AdminOrder {
  return {
    id: doc._id.toHexString(),
    orderNumber: doc.orderNumber,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    delivery: doc.delivery,
    items: doc.items,
    totals: doc.totals,
    status: doc.status,
    statusHistory: doc.statusHistory,
    payment: { method: doc.payment.method, status: doc.payment.status },
    isGuest: doc.userId === null,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const orders = await getOrdersCollection();
  const query = status ? { status: status as OrderStatus } : {};
  const docs = await orders.find(query).sort({ createdAt: -1 }).limit(200).toArray();

  return NextResponse.json({ orders: docs.map(toAdminOrder) });
}
