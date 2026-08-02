/**
 * "Order 5, get 50% off your 6th" — registered accounts only. Separate mechanic
 * from the percentage loyalty tiers in lib/loyalty.ts: this is a repeating
 * punch card (resets after each reward), applied as a per-item markdown rather
 * than a whole-order percentage, so it stacks with the tier/website discount
 * instead of competing with it.
 */
export const ORDERS_PER_REWARD = 5;
export const PUNCH_CARD_DISCOUNT_PERCENT = 50;

/** True when the order currently being placed is the reward (6th) order. */
export function isPunchCardRewardOrder(ordersSinceReward: number): boolean {
  return ordersSinceReward >= ORDERS_PER_REWARD;
}
