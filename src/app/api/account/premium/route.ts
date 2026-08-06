import { NextResponse } from 'next/server';
import { requireUser, toSafeUser } from '@/lib/auth/server';
import { getUsersCollection } from '@/lib/db/collections';
import { isPremiumEligible } from '@/lib/rewards-eligibility';

/** Opt in to Premium Membership — requires having reached the unlock threshold; never automatic. */
export async function POST() {
  const auth = await requireUser();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: auth.status });
  }
  const { user } = auth;

  if (user.premium.isMember) {
    return NextResponse.json({ user: toSafeUser(user) });
  }

  if (!isPremiumEligible(user.loyalty.completedOrderCount)) {
    return NextResponse.json({ error: 'Not eligible for Premium Membership yet.' }, { status: 400 });
  }

  const users = await getUsersCollection();
  const now = new Date().toISOString();
  await users.updateOne(
    { _id: user._id },
    { $set: { 'premium.isMember': true, 'premium.enrolledAt': now, updatedAt: now } }
  );

  return NextResponse.json({ user: toSafeUser({ ...user, premium: { isMember: true, enrolledAt: now } }) });
}
