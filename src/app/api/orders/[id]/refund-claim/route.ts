import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { getSession } from '@/lib/auth/server';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Post-delivery compensation request — the order already happened, so this
 * doesn't cancel it; it files a claim an admin has to approve or reject
 * before any refund/coupon moves (see PATCH /api/admin/orders/[id]/refund-claim).
 * Self-reported reasons ("spilled," "wrong item") can't be auto-verified,
 * so this is deliberately not automatic like the pre-delivery cancellation.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!checkRateLimit('refund-claim', ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
  if (reason.length < 10) {
    return NextResponse.json({ error: 'Please describe what went wrong (at least 10 characters).' }, { status: 400 });
  }

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

  if (order.status !== 'delivered') {
    return NextResponse.json(
      { error: 'This is only for orders that have already been delivered — cancel the order instead if it hasn’t arrived yet.' },
      { status: 400 }
    );
  }
  if (order.refundClaim) {
    return NextResponse.json({ error: 'A refund request has already been filed for this order.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        refundClaim: { requestedAt: now, reason, status: 'pending', decidedAt: null, refundAmount: 0, refundMethod: 'none' },
        updatedAt: now,
      },
    }
  );

  const updated = await orders.findOne({ _id: order._id });
  return NextResponse.json({ order: updated && toPlacedOrder(updated) });
}
