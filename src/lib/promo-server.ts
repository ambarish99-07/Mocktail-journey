import type { ObjectId } from 'mongodb';
import { getPromoCodeDef } from '@/data/promo-codes';
import { getUsersCollection } from '@/lib/db/collections';
import type { UserDoc } from '@/types/db';

/** Server-only — Node/DB access. Never import this from a client component. */

export interface ResolvedPromo {
  code: string;
  amountRupees: number;
  description: string;
}

/**
 * Re-derives a promo code's discount server-side — never trusts a
 * client-computed amount, same principle as every other price in this app.
 * `subtotal` is the cart's pre-discount subtotal; `user` is null for guests
 * (oncePerCustomer codes are registered-accounts-only, same restriction as
 * BOGO/milestone rewards).
 */
export function resolvePromoCode(
  rawCode: string,
  subtotal: number,
  user: UserDoc | null
): { ok: true; promo: ResolvedPromo } | { ok: false; error: string } {
  const def = getPromoCodeDef(rawCode);
  if (!def) return { ok: false, error: 'That code isn’t valid.' };

  if (def.minOrderRupees && subtotal < def.minOrderRupees) {
    return { ok: false, error: `This code needs a cart of at least ₹${def.minOrderRupees}.` };
  }

  if (def.oncePerCustomer) {
    if (!user) return { ok: false, error: 'Sign in to use this code — it’s a one-time offer for registered accounts.' };
    if (user.redeemedPromoCodes?.includes(def.code)) {
      return { ok: false, error: 'You’ve already used this code.' };
    }
  }

  const rawAmount = def.type === 'flat' ? def.value : Math.round((subtotal * def.value) / 100);
  const amountRupees = Math.min(rawAmount, def.maxDiscountRupees ?? rawAmount, subtotal);

  return { ok: true, promo: { code: def.code, amountRupees, description: def.description } };
}

/** Records a one-time code as used — call only after the order it applied to is actually confirmed (same timing as markCouponUsed). */
export async function markPromoCodeRedeemed(userId: ObjectId, code: string): Promise<void> {
  const users = await getUsersCollection();
  await users.updateOne({ _id: userId }, { $addToSet: { redeemedPromoCodes: code } });
}
