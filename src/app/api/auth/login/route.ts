import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation';
import { getUsersCollection } from '@/lib/db/collections';
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '@/lib/auth/session';
import { toSafeUser } from '@/lib/auth/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Not a real user's hash — exists purely so a login attempt against a
// non-existent email still pays the bcrypt cost, so response timing can't be
// used to enumerate which emails have accounts.
const DUMMY_HASH = '$2a$10$C6UzMDM.H6dfI/f/IKcEeOgwUFXfLl7Wh.Uf6r6t1Cp3.PGvqQxHu';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit('login', ip, 10, 5 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signSession({ userId: user._id.toHexString(), role: user.role });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: toSafeUser(user) });
}
