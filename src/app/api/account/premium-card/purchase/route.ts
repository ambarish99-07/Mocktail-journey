import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { getRazorpayClient } from '@/lib/razorpay';
import { getUsersCollection } from '@/lib/db/collections';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { pricingConfig } from '@/lib/config';

/** Creates a Razorpay order for the ₹21/60-day Premium Membership Card. Activation happens only after /verify confirms the signature. */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: auth.status });
  }
  const { user } = auth;

  const ip = getClientIp(request);
  if (!checkRateLimit('premium-card-purchase', ip, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  const razorpayOrder = await getRazorpayClient().orders.create({
    amount: pricingConfig.premiumCard.priceRupees * 100, // paise
    currency: 'INR',
    receipt: `premium-card-${user._id.toHexString()}-${Date.now()}`,
  });

  const users = await getUsersCollection();
  await users.updateOne(
    { _id: user._id },
    { $set: { 'premiumCard.razorpayOrderId': razorpayOrder.id, updatedAt: new Date().toISOString() } }
  );

  return NextResponse.json({
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
}
