import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { notifyAdminNewOrder } from '@/lib/whatsapp-server';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { OrderDoc } from '@/types/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!checkRateLimit('verify-payment', ip, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const razorpayOrderId = body?.razorpayOrderId;
  const razorpayPaymentId = body?.razorpayPaymentId;
  const razorpaySignature = body?.razorpaySignature;
  if (
    typeof razorpayOrderId !== 'string' ||
    typeof razorpayPaymentId !== 'string' ||
    typeof razorpaySignature !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid payment verification request.' }, { status: 400 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ accessToken: params.id });
  if (!order || order.payment.method !== 'razorpay') {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }
  if (order.payment.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: 'Order/payment mismatch.' }, { status: 400 });
  }
  if (order.payment.status === 'paid') {
    return NextResponse.json({ order: toPlacedOrder(order) });
  }

  // The client's success callback is never trusted alone — this signature check,
  // verified against Razorpay's secret key, is the only thing that marks an order paid.
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    await orders.updateOne({ _id: order._id }, { $set: { 'payment.status': 'failed', updatedAt: new Date().toISOString() } });
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpayPaymentId,
        'payment.razorpaySignature': razorpaySignature,
        updatedAt: now,
      },
      $push: { statusHistory: { status: order.status, at: now, note: 'Payment verified' } },
    }
  );

  const paidOrder: OrderDoc = {
    ...order,
    payment: { ...order.payment, status: 'paid', razorpayPaymentId, razorpaySignature },
  };

  // Order wasn't real until paid — this is the correct point for the admin alert on the Razorpay path.
  await notifyAdminNewOrder(paidOrder);
  await orders.updateOne({ _id: order._id }, { $set: { 'whatsapp.adminNotifiedAt': new Date().toISOString() } });

  return NextResponse.json({ order: toPlacedOrder(paidOrder) });
}
