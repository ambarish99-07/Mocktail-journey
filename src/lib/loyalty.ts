import type { LoyaltyTier } from '@/types/order';

/** Tier derivation: 0 prior orders -> first-order, 1-4 -> returning, 5+ or flagged Gold -> gold. */
export function deriveLoyaltyTier(completedOrderCount: number, isGoldMember: boolean): LoyaltyTier {
  if (isGoldMember || completedOrderCount >= 5) return 'gold';
  if (completedOrderCount >= 1) return 'returning';
  return 'first-order';
}
