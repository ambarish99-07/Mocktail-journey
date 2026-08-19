import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/server';
import { getOrdersCollection, getUsersCollection } from '@/lib/db/collections';
import { refundPayment } from '@/lib/razorpay';
import { generateCouponCode } from '@/lib/coupons-server';
import { pricingConfig } from '@/lib/config';
import type { RefundMethod } from '@/types/order';
import type { Coupon } from '@/types/db';

/** Admin approves or rejects a post-delivery refund claim — the only point where a "genuine reason" actually gets judged. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ error: 'Invalid decision.' }, { status: 400 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ _id: new ObjectId(params.id) });
  if (!order || !order.refundClaim) {
    return NextResponse.json({ error: 'No refund claim found for this order.' }, { status: 404 });
  }
  if (order.refundClaim.status !== 'pending') {
    return NextResponse.json({ error: 'This claim has already been decided.' }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (decision === 'reject') {
    await orders.updateOne(
      { _id: order._id },
      {
        $set: {
          'refundClaim.status': 'rejected',
          'refundClaim.decidedAt': now,
          'refundClaim.refundAmount': 0,
          'refundClaim.refundMethod': 'none',
          updatedAt: now,
        },
      }
    );
    return NextResponse.json({ ok: true, refundMethod: 'none' });
  }

  // Approved — full refund, via whichever mechanism actually applies.
  let refundAmount = 0;
  let refundMethod: RefundMethod = 'none';
  let razorpayRefundId: string | undefined;
  let couponCode: string | undefined;
  let note: string | undefined;

  if (order.payment.method === 'razorpay' && order.payment.status === 'paid') {
    const refundId = await refundPayment(order.payment.razorpayPaymentId ?? '', order.totals.total);
    if (refundId) {
      refundAmount = order.totals.total;
      refundMethod = 'razorpay';
      razorpayRefundId = refundId;
    } else {
      note = 'Razorpay refund failed — needs manual follow-up.';
    }
  } else if (order.payment.method === 'cod') {
    if (order.userId) {
      const coupon: Coupon = {
        code: generateCouponCode(),
        amountRupees: pricingConfig.compensationCoupon.amountRupees,
        reason: `Refund claim on ${order.orderNumber}`,
        issuedAt: now,
        expiresAt: new Date(Date.now() + pricingConfig.compensationCoupon.validDays * 24 * 60 * 60 * 1000).toISOString(),
        usedAt: null,
      };
      const users = await getUsersCollection();
      await users.updateOne({ _id: order.userId }, { $push: { coupons: coupon } });
      refundAmount = coupon.amountRupees;
      refundMethod = 'coupon';
      couponCode = coupon.code;
    } else {
      note = 'Guest order — no account to issue a coupon to. Contact the customer directly.';
    }
  }

  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        'refundClaim.status': 'approved',
        'refundClaim.decidedAt': now,
        'refundClaim.refundAmount': refundAmount,
        'refundClaim.refundMethod': refundMethod,
        'refundClaim.razorpayRefundId': razorpayRefundId,
        'refundClaim.couponCode': couponCode,
        updatedAt: now,
      },
    }
  );

  return NextResponse.json({ ok: true, refundMethod, refundAmount, couponCode, note });
}
