import { ADD_ON_OPTIONS } from '@/types/menu';
import type { CartItem } from '@/types/cart';
import type { LoyaltyTier, OrderTotals } from '@/types/order';
import { pricingConfig } from '@/lib/config';
import { PUNCH_CARD_DISCOUNT_PERCENT } from '@/lib/punch-card';

/** Effective per-unit price of a line, including its selected add-ons (not multiplied by quantity). */
function unitEffectivePrice(item: CartItem): number {
  const addOnsTotal = item.customization.addOnIds.reduce((sum, id) => {
    const addOn = ADD_ON_OPTIONS.find((a) => a.id === id);
    return sum + (addOn?.price ?? 0);
  }, 0);
  return item.unitPrice + addOnsTotal;
}

/** Price of one cart line, including quantity and selected add-ons. */
export function lineItemTotal(item: CartItem): number {
  return unitEffectivePrice(item) * item.quantity;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

/**
 * Punch-card reward: half off a single unit of the cheapest eligible drink.
 * Combo lines (menuItemId starting "combo:") don't qualify — only individual
 * shakes/cold coffees do.
 */
function punchCardDiscountAmount(items: CartItem[]): number {
  const eligible = items.filter((item) => !item.menuItemId.startsWith('combo:'));
  if (eligible.length === 0) return 0;

  const cheapest = eligible.reduce((min, item) =>
    unitEffectivePrice(item) < unitEffectivePrice(min) ? item : min
  );
  return Math.round((unitEffectivePrice(cheapest) * PUNCH_CARD_DISCOUNT_PERCENT) / 100);
}

/** Loyalty discount percent for a given tier — falls back to the always-on website discount. */
export function loyaltyDiscountPercent(tier: LoyaltyTier | null): number {
  switch (tier) {
    case 'first-order':
      return pricingConfig.loyalty.firstOrderPercent;
    case 'returning':
      return pricingConfig.loyalty.returningPercent;
    case 'gold':
      return pricingConfig.loyalty.goldPercent;
    default:
      return 0;
  }
}

/**
 * Computes full order totals for checkout.
 * The website discount (always-on) and loyalty discount are mutually
 * exclusive — a logged-in loyalty member gets the better of the two, never both stacked,
 * to keep the incentive structure simple and predictable for customers.
 * The punch-card reward is a separate mechanic (a per-item markdown, not a
 * subtotal percentage) and stacks on top of whichever of the two applies.
 */
export function computeOrderTotals(
  items: CartItem[],
  options: { loyaltyTier?: LoyaltyTier | null; punchCardReward?: boolean } = {}
): OrderTotals {
  const subtotal = cartSubtotal(items);

  const punchCardDiscount = options.punchCardReward ? punchCardDiscountAmount(items) : 0;

  const websiteDiscountAmount = Math.round((subtotal * pricingConfig.websiteDiscountPercent) / 100);
  const loyaltyPercent = loyaltyDiscountPercent(options.loyaltyTier ?? null);
  const loyaltyDiscountAmount = Math.round((subtotal * loyaltyPercent) / 100);

  const bestDiscount = Math.max(websiteDiscountAmount, loyaltyDiscountAmount);
  const websiteDiscount = loyaltyDiscountAmount > websiteDiscountAmount ? 0 : bestDiscount;
  const loyaltyDiscount = loyaltyDiscountAmount > websiteDiscountAmount ? bestDiscount : 0;

  const deliveryFee = subtotal >= pricingConfig.freeDeliveryThreshold ? 0 : pricingConfig.deliveryFee;

  const taxableAmount = subtotal - bestDiscount - punchCardDiscount;
  const tax = Math.round((taxableAmount * pricingConfig.taxRatePercent) / 100);

  const total = taxableAmount + tax + deliveryFee;

  return {
    subtotal,
    punchCardDiscount,
    websiteDiscount,
    loyaltyDiscount,
    deliveryFee,
    tax,
    total,
  };
}

/** Estimated delivery time — The Blenders Club is delivery-only, no pickup/dine-in. */
export const ESTIMATED_DELIVERY_MINUTES = 35;
