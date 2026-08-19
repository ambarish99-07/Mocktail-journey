import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db/collections';
import type { SafeUser, UserDoc } from '@/types/db';
import { SESSION_COOKIE_NAME, verifySession, type SessionPayload } from './session';

/** Best-effort session read for Route Handlers — never throws, returns null for guests. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

export function toSafeUser(doc: UserDoc): SafeUser {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    fullName: doc.fullName,
    phone: doc.phone,
    role: doc.role,
    // Fallbacks below cover accounts created before this reward system shipped.
    loyalty: doc.loyalty ?? { completedOrderCount: 0 },
    rewards: doc.rewards ?? { coldCoffeeCounter: 0, freeItemCounter: 0 },
    premium: doc.premium ?? { isMember: false, enrolledAt: null },
    premiumCard: {
      isActive: doc.premiumCard?.isActive ?? false,
      purchasedAt: doc.premiumCard?.purchasedAt ?? null,
      expiresAt: doc.premiumCard?.expiresAt ?? null,
    },
    defaultAddress: doc.defaultAddress ?? null,
  };
}

/** Looks up the full user document for the current session, or null if unauthenticated/not found. */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const session = await getSession();
  if (!session) return null;
  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(session.userId) });
}

/** Throws-as-response helper: returns the user doc, or a 401 marker the caller returns directly. */
export async function requireUser(): Promise<{ user: UserDoc } | { error: true; status: number }> {
  const user = await getCurrentUser();
  if (!user) return { error: true, status: 401 };
  return { user };
}

export async function requireAdmin(): Promise<{ user: UserDoc } | { error: true; status: number }> {
  const result = await requireUser();
  if ('error' in result) return result;
  if (result.user.role !== 'admin') return { error: true, status: 403 };
  return result;
}
