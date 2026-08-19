import crypto from 'node:crypto';
import type { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db/collections';

/** Server-only — Node crypto + DB access. Never import this from a client component. */

/** Human-readable, not security-sensitive — coupons are applied automatically at checkout, never typed in, so this is just a record identifier for order history/support conversations. */
export function generateCouponCode(): string {
  return `MEAL100-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Marks a coupon redeemed once its order is actually confirmed (COD:
 * immediately; Razorpay: after payment verification — same timing as the
 * reward counters in recordCompletedOrderForUser, never at order creation
 * for online payment since the order isn't real until paid).
 */
export async function markCouponUsed(userId: ObjectId, couponCode: string, orderNumber: string): Promise<void> {
  const users = await getUsersCollection();
  await users.updateOne(
    { _id: userId, 'coupons.code': couponCode },
    { $set: { 'coupons.$.usedAt': new Date().toISOString(), 'coupons.$.usedOnOrderNumber': orderNumber } }
  );
}
