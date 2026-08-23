import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import crypto from 'node:crypto';
import { checkoutSchema } from '@/lib/validation';
import { computeOrderTotals, estimateDeliveryMinutes } from '@/lib/pricing';
import {
  isColdCoffeeRewardOrder,
  isFreeItemRewardOrder,
  isFirstOrderBogoEligible,
  isPremiumCardActive,
} from '@/lib/rewards-eligibility';
import { recordCompletedOrderForUser } from '@/lib/user-rewards';
import { findUsableCoupon } from '@/lib/coupons';
import { markCouponUsed } from '@/lib/coupons-server';
import { resolveDeliveryCoordinates, haversineDistanceKm } from '@/lib/geo';
import { generateOrderId } from '@/lib/utils';
import { getSession } from '@/lib/auth/server';
import { getOrdersCollection, getUsersCollection } from '@/lib/db/collections';
import { revalidateCartItems, OrderValidationError } from '@/lib/order-revalidation';
import { notifyAdminNewOrder } from '@/lib/whatsapp-server';
import { getRazorpayClient } from '@/lib/razorpay';
import { toPlacedOrder } from '@/lib/order-mapping';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { storeConfig, pricingConfig } from '@/lib/config';
import type { OrderDoc, UserDoc } from '@/types/db';

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

  const delivery = deliveryResult.data;

  // Best-effort session read — guest checkout is fully supported. Premium
  // membership and the milestone rewards are registered-accounts-only, so
  // they stay false/unused for guests; guests still get the quantity discount.
  const session = await getSession();
  let userId: ObjectId | null = null;
  let user: UserDoc | null = null;
  let usersCollection: Awaited<ReturnType<typeof getUsersCollection>> | null = null;
  if (session) {
    usersCollection = await getUsersCollection();
    user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (user) userId = user._id;
  }

  // Silently keep the saved profile in sync with whatever delivery details
  // were just used — "remembers" the customer for next time without asking
  // them to separately visit their profile first. Never blocks the order.
  if (user && usersCollection) {
    try {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            fullName: delivery.fullName,
            phone: delivery.phone,
            defaultAddress: {
              address: delivery.address,
              city: delivery.city,
              pincode: delivery.pincode,
              mapsLink: delivery.mapsLink || null,
            },
            updatedAt: new Date().toISOString(),
          },
        }
      );
    } catch (err) {
      console.error('[orders] failed to sync profile from checkout', err);
    }
  }

  const isPremiumMember = user?.premium.isMember ?? false;
  const hasActivePremiumCard = isPremiumCardActive(user?.premiumCard);
  const coldCoffeeReward = user ? isColdCoffeeRewardOrder(user.rewards.coldCoffeeCounter) : false;
  const freeItemReward = user ? isFreeItemRewardOrder(user.rewards.freeItemCounter) : false;
  const firstOrderBogo = user ? isFirstOrderBogoEligible(user.loyalty.completedOrderCount) : false;
  const usableCoupon = user ? findUsableCoupon(user.coupons ?? []) : null;

  // Resolved for every order now (not just Premium) — the estimated delivery
  // time scales with distance for everyone, so we need it regardless of
  // Premium status. Free-delivery eligibility below still only applies to
  // Premium Members / active Premium Card holders.
  let deliveryDistanceKm: number | null = null;
  let deliveryCoordinates: { lat: number; lng: number } | null = null;
  let freeDeliveryEligible = false;
  const fullAddress = [delivery.address, delivery.city, delivery.pincode].filter(Boolean).join(', ');
  const coords = await resolveDeliveryCoordinates(delivery.mapsLink, fullAddress);
  if (coords) {
    deliveryCoordinates = coords;
    deliveryDistanceKm = haversineDistanceKm({ lat: storeConfig.latitude, lng: storeConfig.longitude }, coords);
    if (isPremiumMember || hasActivePremiumCard) {
      freeDeliveryEligible = deliveryDistanceKm <= pricingConfig.premium.freeDeliveryRadiusKm;
    }
  }

  const totals = computeOrderTotals(items, {
    isPremiumMember,
    coldCoffeeReward,
    freeItemReward,
    firstOrderBogo,
    freeDeliveryEligible,
    couponAmountRupees: usableCoupon?.amountRupees,
  });
  const now = new Date().toISOString();

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
    isPremiumOrder: isPremiumMember,
    coldCoffeeRewardApplied: coldCoffeeReward,
    freeItemRewardApplied: freeItemReward,
    bogoRewardApplied: totals.bogoDiscount > 0,
    deliveryDistanceKm,
    deliveryCoordinates,
    rider: null,
    couponApplied: totals.couponDiscount > 0 ? (usableCoupon?.code ?? null) : null,
    cancellation: null,
    refundClaim: null,
    estimatedMinutes: estimateDeliveryMinutes(deliveryDistanceKm),
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

    // Not confirmed yet — the admin alert and reward counters fire only after
    // payment verification succeeds.
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

  // COD orders are confirmed immediately — notify the admin and advance the
  // customer's reward counters now. Never blocks/fails the order.
  await notifyAdminNewOrder(saved);
  await orders.updateOne({ _id: saved._id }, { $set: { 'whatsapp.adminNotifiedAt': new Date().toISOString() } });
  if (userId) {
    await recordCompletedOrderForUser(userId, {
      coldCoffeeRewardApplied: coldCoffeeReward,
      freeItemRewardApplied: freeItemReward,
    });
    if (saved.couponApplied) {
      await markCouponUsed(userId, saved.couponApplied, saved.orderNumber);
    }
  }

  return NextResponse.json({ order: toPlacedOrder(saved) }, { status: 201 });
}
