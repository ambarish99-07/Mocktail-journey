import type { ObjectId } from 'mongodb';
import { getUsersCollection } from '@/lib/db/collections';

interface RewardFlags {
  coldCoffeeRewardApplied: boolean;
  freeItemRewardApplied: boolean;
}

/**
 * Advances a user's order-count-based rewards after an order is confirmed
 * (COD: at creation; Razorpay: after payment verification — never at
 * creation time for online payment, since the order isn't real until paid).
 *
 * The two reward flags are whatever was already decided for this specific
 * order at creation time (see POST /api/orders), not re-derived here —
 * atomic $inc for the common case, so two orders completing at the same
 * instant can't race each other into losing an increment. Four explicit
 * branches (rather than building the update object dynamically) so this
 * stays cleanly typed against MongoDB's UpdateFilter<UserDoc>.
 */
export async function recordCompletedOrderForUser(userId: ObjectId, flags: RewardFlags): Promise<void> {
  const users = await getUsersCollection();
  const now = new Date().toISOString();
  const { coldCoffeeRewardApplied, freeItemRewardApplied } = flags;

  if (coldCoffeeRewardApplied && freeItemRewardApplied) {
    await users.updateOne(
      { _id: userId },
      {
        $inc: { 'loyalty.completedOrderCount': 1 },
        $set: { 'rewards.coldCoffeeCounter': 0, 'rewards.freeItemCounter': 0, updatedAt: now },
      }
    );
  } else if (coldCoffeeRewardApplied) {
    await users.updateOne(
      { _id: userId },
      {
        $inc: { 'loyalty.completedOrderCount': 1, 'rewards.freeItemCounter': 1 },
        $set: { 'rewards.coldCoffeeCounter': 0, updatedAt: now },
      }
    );
  } else if (freeItemRewardApplied) {
    await users.updateOne(
      { _id: userId },
      {
        $inc: { 'loyalty.completedOrderCount': 1, 'rewards.coldCoffeeCounter': 1 },
        $set: { 'rewards.freeItemCounter': 0, updatedAt: now },
      }
    );
  } else {
    await users.updateOne(
      { _id: userId },
      {
        $inc: { 'loyalty.completedOrderCount': 1, 'rewards.coldCoffeeCounter': 1, 'rewards.freeItemCounter': 1 },
        $set: { updatedAt: now },
      }
    );
  }
}
