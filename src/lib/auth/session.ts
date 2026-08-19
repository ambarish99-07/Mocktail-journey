import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'tbc_session';
// Long-lived + renewed on every /api/auth/me check (see that route) rather
// than a fixed expiry from login time — an active customer's session keeps
// rolling forward indefinitely; only someone who genuinely stops visiting
// for this long gets asked to log in again.
const SESSION_DURATION_SECONDS = 90 * 24 * 60 * 60; // 90 days

export interface SessionPayload {
  userId: string;
  role: 'customer' | 'admin';
}

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not set — add it to .env.local (see .env.example).');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Never throws — returns null on any invalid/expired/missing token, since a session is always optional (guest checkout). */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== 'string' || (payload.role !== 'customer' && payload.role !== 'admin')) {
      return null;
    }
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;
