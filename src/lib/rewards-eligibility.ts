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

/** Buy 1 Get 1 Free is registered-accounts-only, one-time — true exactly for a customer's first order. */
export function isFirstOrderBogoEligible(completedOrderCount: number): boolean {
  return completedOrderCount === 0;
}

type PremiumCardFields = { isActive: boolean; purchasedAt: string | null; expiresAt: string | null } | undefined;

/** Renewal reminder starts showing this many days before expiry. */
const PREMIUM_CARD_RENEWAL_WINDOW_DAYS = 2;

/** True only while a purchased Premium Membership Card (₹21/60 days, free-delivery-only) hasn't yet expired. */
export function isPremiumCardActive(premiumCard: PremiumCardFields): boolean {
  if (!premiumCard?.isActive || !premiumCard.expiresAt) return false;
  return new Date(premiumCard.expiresAt).getTime() > Date.now();
}

/** True once a purchased Premium Card's validity window has fully passed — button should read "Renew Now". */
export function isPremiumCardExpired(premiumCard: PremiumCardFields): boolean {
  if (!premiumCard?.purchasedAt || !premiumCard.expiresAt) return false;
  return new Date(premiumCard.expiresAt).getTime() <= Date.now();
}

/** True while still active but within the renewal-reminder window before expiry. */
export function isPremiumCardExpiringSoon(premiumCard: PremiumCardFields): boolean {
  if (!isPremiumCardActive(premiumCard)) return false;
  const msRemaining = new Date(premiumCard!.expiresAt!).getTime() - Date.now();
  return msRemaining <= PREMIUM_CARD_RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

/** Whole days remaining until a still-active Premium Card expires (0 on its last day). */
export function premiumCardDaysRemaining(premiumCard: PremiumCardFields): number {
  if (!premiumCard?.expiresAt) return 0;
  const msRemaining = new Date(premiumCard.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
}
