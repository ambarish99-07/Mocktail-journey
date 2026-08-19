import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser, getSession, toSafeUser } from '@/lib/auth/server';
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from '@/lib/auth/session';

/**
 * Called on every page load (Navbar hydration) — this is where the sliding
 * session renewal happens. A valid session gets a freshly re-signed cookie
 * with a full new 90-day expiry each time, so an active customer never sees
 * their session run out; only someone who stops visiting entirely will let
 * the cookie actually reach its expiry.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const token = await signSession({ userId: session.userId, role: session.role });
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: toSafeUser(user) });
}
