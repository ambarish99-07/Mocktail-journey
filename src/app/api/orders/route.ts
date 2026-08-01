import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import crypto from 'node:crypto';
import { checkoutSchema } from '@/lib/validation';
import { computeOrderTotals, ESTIMATED_DELIVERY_MINUTES } from '@/lib/pricing';
import { deriveLoyaltyTier } from '@/lib/loyalty';
import { generateOrderId } from '@/lib/utils';
import { getSession } from '@/lib/auth/server';
import { getOrdersCollection, getUsersCollection } from '@/lib/db/collections';
import { revalidateCartItems, OrderValidationError } from '@/lib/order-revalidation';
import { notifyAdminNewOrder } from '@/lib/whatsapp-server';
import { getRazorpayClient } from '@/lib/razorpay';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { OrderDoc } from '@/types/db';

/** Order history for the signed-in user, newest first. Powers /account. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const orders = await getOrdersCollection();
  const docs = await orders
    .find({ userId: new ObjectId(session.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders: docs.map(toPlacedOrder) });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit('orders-create', ip, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many orders placed — please try again shortly.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const deliveryResult = checkoutSchema.safeParse((body as Record<string, unknown>).delivery);
  if (!deliveryResult.success) {
    return NextResponse.json({ error: deliveryResult.error.issues[0]?.message ?? 'Invalid delivery details.' }, { status: 400 });
  }

  const paymentMethod = (body as Record<string, unknown>).paymentMethod;
  if (paymentMethod !== 'cod' && paymentMethod !== 'razorpay') {
    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  }

  let items;
  try {
    items = revalidateCartItems((body as Record<string, unknown>).items);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  // Best-effort session read — guest checkout is fully supported.
  const session = await getSession();
  let userId: ObjectId | null = null;
  let loyaltyTier = null as ReturnType<typeof deriveLoyaltyTier> | null;
  if (session) {
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(session.userId) });
    if (user) {
      userId = user._id;
      loyaltyTier = deriveLoyaltyTier(user.loyalty.completedOrderCount, user.loyalty.isGoldMember);
    }
  }

  const totals = computeOrderTotals(items, { loyaltyTier });
  const now = new Date().toISOString();
  const delivery = deliveryResult.data;

  const orderDoc: Omit<OrderDoc, '_id'> = {
    accessToken: crypto.randomBytes(24).toString('base64url'),
    orderNumber: generateOrderId(),
    userId,
    items,
    delivery: {
      fullName: delivery.fullName,
      phone: delivery.phone,
      address: delivery.address,
      city: delivery.city,
      pincode: delivery.pincode,
      mapsLink: delivery.mapsLink || undefined,
      specialInstructions: delivery.specialInstructions || undefined,
    },
    totals,
    loyaltyTierAtOrder: loyaltyTier,
    estimatedMinutes: ESTIMATED_DELIVERY_MINUTES,
    status: 'received',
    statusHistory: [{ status: 'received', at: now }],
    payment: { method: paymentMethod, status: 'pending' },
    whatsapp: { customerNotifiedStatuses: [] },
    createdAt: now,
    updatedAt: now,
  };

  const orders = await getOrdersCollection();

  if (paymentMethod === 'razorpay') {
    if (totals.total < 1) {
      return NextResponse.json({ error: 'Order total must be greater than zero.' }, { status: 400 });
    }
    const razorpayOrder = await getRazorpayClient().orders.create({
      amount: Math.round(totals.total * 100), // paise
      currency: 'INR',
      receipt: orderDoc.orderNumber,
    });
    orderDoc.payment.razorpayOrderId = razorpayOrder.id;

    const result = await orders.insertOne(orderDoc as OrderDoc);
    const saved: OrderDoc = { ...orderDoc, _id: result.insertedId };

    // Not confirmed yet — the admin alert fires only after payment verification succeeds.
    return NextResponse.json(
      {
        order: toPlacedOrder(saved),
        razorpay: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      },
      { status: 201 }
    );
  }

  const result = await orders.insertOne(orderDoc as OrderDoc);
  const saved: OrderDoc = { ...orderDoc, _id: result.insertedId };

  // COD orders are confirmed immediately — notify the admin now. Never blocks/fails the order.
  await notifyAdminNewOrder(saved);
  await orders.updateOne({ _id: saved._id }, { $set: { 'whatsapp.adminNotifiedAt': new Date().toISOString() } });

  return NextResponse.json({ order: toPlacedOrder(saved) }, { status: 201 });
}
