import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { resolvePromoCode } from '@/lib/promo-server';
import { getSession } from '@/lib/auth/server';
import { getUsersCollection } from '@/lib/db/collections';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Preview-only — tells the checkout UI whether a code is valid and for how
 * much, so the on-screen total can update before the order is placed. Never
 * marks anything used; POST /api/orders re-resolves the code itself at order
 * creation (never trusts this preview's answer either).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit('promo-apply', ip, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code : '';
  const subtotal = typeof body?.subtotal === 'number' ? body.subtotal : NaN;
  if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const session = await getSession();
  const user = session
    ? await (await getUsersCollection()).findOne({ _id: new ObjectId(session.userId) })
    : null;

  const result = resolvePromoCode(code, subtotal, user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ promo: result.promo });
}
