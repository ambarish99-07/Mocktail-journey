import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { getSession } from '@/lib/auth/server';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/** Lets a customer add/update delivery instructions after placing the order — e.g. "call before arriving," "leave at the gate." Same access model as GET /api/orders/[id]. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!checkRateLimit('order-note-update', ip, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 300) : '';

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ accessToken: params.id });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (order.userId) {
    const session = await getSession();
    if (!session || session.userId !== order.userId.toHexString()) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
  }

  if (order.status === 'delivered' || order.status === 'cancelled') {
    return NextResponse.json({ error: 'This order is already complete.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await orders.updateOne(
    { _id: order._id },
    note
      ? { $set: { 'delivery.specialInstructions': note, updatedAt: now } }
      : { $unset: { 'delivery.specialInstructions': '' }, $set: { updatedAt: now } }
  );

  const updated = await orders.findOne({ _id: order._id });
  return NextResponse.json({ order: updated && toPlacedOrder(updated) });
}
