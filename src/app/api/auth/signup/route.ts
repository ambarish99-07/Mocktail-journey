import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';
import { signupSchema } from '@/lib/validation';
import { getUsersCollection } from '@/lib/db/collections';
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '@/lib/auth/session';
import { toSafeUser } from '@/lib/auth/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { UserDoc } from '@/types/db';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit('signup', ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { fullName, email, phone, password } = parsed.data;

  const users = await getUsersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const doc: Omit<UserDoc, '_id'> = {
    email,
    passwordHash,
    fullName,
    phone,
    role: 'customer',
    loyalty: { completedOrderCount: 0 },
    rewards: { coldCoffeeCounter: 0, freeItemCounter: 0 },
    premium: { isMember: false, enrolledAt: null },
    premiumCard: { isActive: false, purchasedAt: null, expiresAt: null },
    defaultAddress: null,
    coupons: [],
    createdAt: now,
    updatedAt: now,
  };

  let userDoc: UserDoc;
  try {
    const result = await users.insertOne(doc as UserDoc);
    userDoc = { ...doc, _id: result.insertedId };
  } catch (err) {
    // Unique index catches the race the findOne check above can't (two concurrent
    // signups for the same email both passing the check before either inserts).
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    throw err;
  }

  const token = await signSession({ userId: userDoc._id.toHexString(), role: userDoc.role });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: toSafeUser(userDoc) }, { status: 201 });
}
