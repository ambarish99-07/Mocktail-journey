import { NextResponse } from 'next/server';
import { requireUser, toSafeUser } from '@/lib/auth/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { getUsersCollection } from '@/lib/db/collections';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { pricingConfig } from '@/lib/config';

/** The client's success callback is never trusted alone — same signature-check pattern as order payment verification. */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: auth.status });
  }
  const { user } = auth;

  const ip = getClientIp(request);
  if (!checkRateLimit('premium-card-verify', ip, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
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

  if (user.premiumCard?.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: 'Order/payment mismatch.' }, { status: 400 });
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + pricingConfig.premiumCard.validDays * 24 * 60 * 60 * 1000).toISOString();

  const users = await getUsersCollection();
  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        'premiumCard.isActive': true,
        'premiumCard.purchasedAt': now.toISOString(),
        'premiumCard.expiresAt': expiresAt,
        updatedAt: now.toISOString(),
      },
    }
  );

  return NextResponse.json({
    user: toSafeUser({
      ...user,
      premiumCard: { isActive: true, purchasedAt: now.toISOString(), expiresAt },
    }),
  });
}
