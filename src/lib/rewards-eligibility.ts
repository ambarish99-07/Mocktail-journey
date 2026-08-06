import { pricingConfig } from '@/lib/config';

/**
 * Repeating milestone rewards — registered accounts only. Each is an
 * independent counter that resets to 0 the instant it triggers its own
 * reward, so they don't stay in sync with each other after the first cycle
 * (e.g. cold coffee fires again at order 12, 18...; free item at 20, 30...).
 */

// counter counts completed orders SINCE the last reward, not including the one
// being checked — so "every 6th order" needs 5 prior orders to have built the
// counter to 5 before the 6th order's check passes (off-by-one against `every`).

export function isColdCoffeeRewardOrder(coldCoffeeCounter: number): boolean {
  return coldCoffeeCounter >= pricingConfig.milestoneRewards.coldCoffee.every - 1;
}

export function isFreeItemRewardOrder(freeItemCounter: number): boolean {
  return freeItemCounter >= pricingConfig.milestoneRewards.freeItem.every - 1;
}

/** Whether a customer has enough completed orders to be OFFERED Premium — they still have to opt in. */
export function isPremiumEligible(completedOrderCount: number): boolean {
  return completedOrderCount >= pricingConfig.premium.unlockAfterOrders;
}

/** Percentage discount for a cart based on how many eligible (non-combo) drinks are in it. */
export function quantityDiscountPercent(totalUnits: number): number {
  const tier = pricingConfig.quantityDiscount.tiers.find((t) => totalUnits >= t.minUnits);
  return tier?.percent ?? 0;
}
