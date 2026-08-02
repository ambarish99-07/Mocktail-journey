import type { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db/collections';

/**
 * Advances a user's order-count-based rewards after an order is confirmed
 * (COD: at creation; Razorpay: after payment verification — never at
 * creation time for online payment, since the order isn't real until paid).
 *
 * `punchCardRewardApplied` is the flag already decided for this specific order
 * at creation time (see POST /api/orders), not re-derived here — an atomic
 * $inc for the common case, so two orders completing at the same instant
 * can't race each other into losing an increment.
 */
export async function recordCompletedOrderForUser(userId: ObjectId, punchCardRewardApplied: boolean): Promise<void> {
  const users = await getUsersCollection();
  const now = new Date().toISOString();

  if (punchCardRewardApplied) {
    // Reset is idempotent regardless of ordering, so no race concern here.
    await users.updateOne(
      { _id: userId },
      { $inc: { 'loyalty.completedOrderCount': 1 }, $set: { 'punchCard.ordersSinceReward': 0, updatedAt: now } }
    );
  } else {
    await users.updateOne(
      { _id: userId },
      { $inc: { 'loyalty.completedOrderCount': 1, 'punchCard.ordersSinceReward': 1 }, $set: { updatedAt: now } }
    );
  }
}
