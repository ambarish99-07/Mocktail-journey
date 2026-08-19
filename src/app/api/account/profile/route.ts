import { NextResponse } from 'next/server';
import { requireUser, toSafeUser } from '@/lib/auth/server';
import { getUsersCollection } from '@/lib/db/collections';
import { profileUpdateSchema } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { SavedAddress } from '@/types/db';

/** Explicit profile edits from /account — name, phone, and the saved default delivery address. */
export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: auth.status });
  }
  const { user } = auth;

  const ip = getClientIp(request);
  if (!checkRateLimit('profile-update', ip, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { fullName, phone, address, city, pincode, mapsLink } = parsed.data;

  const defaultAddress: SavedAddress | null = address
    ? { address, city: city || '', pincode: pincode || '', mapsLink: mapsLink || null }
    : null;

  const now = new Date().toISOString();
  const users = await getUsersCollection();
  await users.updateOne(
    { _id: user._id },
    { $set: { fullName, phone, defaultAddress, updatedAt: now } }
  );

  return NextResponse.json({
    user: toSafeUser({ ...user, fullName, phone, defaultAddress, updatedAt: now }),
  });
}
