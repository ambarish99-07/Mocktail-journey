import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { notifyCustomerStatusUpdate } from '@/lib/whatsapp-server';
import type { OrderStatus } from '@/types/order';

const VALID_STATUSES: OrderStatus[] = ['received', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  const note = typeof body?.note === 'string' ? body.note : undefined;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ _id: new ObjectId(params.id) });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const event = { status: status as OrderStatus, at: now, note };

  await orders.updateOne(
    { _id: order._id },
    {
      $set: { status: event.status, updatedAt: now },
      $push: { statusHistory: event },
    }
  );

  // Dedup: only message the customer once per distinct status. Never blocks the update.
  if (!order.whatsapp.customerNotifiedStatuses.includes(event.status)) {
    await notifyCustomerStatusUpdate({ ...order, status: event.status }, event);
    await orders.updateOne({ _id: order._id }, { $push: { 'whatsapp.customerNotifiedStatuses': event.status } });
  }

  const updated = await orders.findOne({ _id: order._id });
  return NextResponse.json({
    order: updated && {
      id: updated._id.toHexString(),
      status: updated.status,
      statusHistory: updated.statusHistory,
      updatedAt: updated.updatedAt,
    },
  });
}
