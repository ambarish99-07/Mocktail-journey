import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { getSession } from '@/lib/auth/server';
import { refundPayment } from '@/lib/razorpay';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { pricingConfig } from '@/lib/config';
import type { CancellationRefundType, RefundMethod } from '@/types/order';

/**
 * Pre-delivery cancellation — status-based, automatic, no admin review:
 * full refund before "out for delivery," half refund once it's out for
 * delivery. Post-delivery compensation is a separate flow (see
 * POST /api/orders/[id]/refund-claim) since that needs a genuine-reason
 * judgment call, not just a timing rule.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!checkRateLimit('order-cancel', ip, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
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

  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'This order is already cancelled.' }, { status: 400 });
  }
  if (order.status === 'delivered') {
    return NextResponse.json(
      { error: 'This order has already been delivered — use "Request Refund" instead if something was wrong with it.' },
      { status: 400 }
    );
  }

  const refundType: CancellationRefundType = order.status === 'out-for-delivery' ? 'half' : 'full';
  const owedAmount =
    refundType === 'full' ? order.totals.total : Math.round((order.totals.total * pricingConfig.cancellation.halfRefundPercent) / 100);

  let refundAmount = 0;
  let refundMethod: RefundMethod = 'none';
  let razorpayRefundId: string | undefined;

  // COD hasn't had cash collected at either of these stages (that only
  // happens at the door on delivery), so there's nothing to hand back —
  // cancelling just stops the order, no money movement needed.
  if (order.payment.method === 'razorpay' && order.payment.status === 'paid') {
    const refundId = await refundPayment(order.payment.razorpayPaymentId ?? '', owedAmount);
    if (refundId) {
      refundAmount = owedAmount;
      refundMethod = 'razorpay';
      razorpayRefundId = refundId;
    }
    // If the refund call failed, the order still gets cancelled below —
    // refundMethod stays 'none' so this is visibly flagged for manual
    // follow-up rather than silently claiming a refund that didn't happen.
  }

  const now = new Date().toISOString();
  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        status: 'cancelled',
        updatedAt: now,
        cancellation: { at: now, refundType, refundAmount, refundMethod, razorpayRefundId },
      },
      $push: { statusHistory: { status: 'cancelled', at: now } },
    }
  );

  const updated = await orders.findOne({ _id: order._id });
  return NextResponse.json({ order: updated && toPlacedOrder(updated) });
}
