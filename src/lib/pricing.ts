import { ADD_ON_OPTIONS } from '@/types/menu';
import { getMenuItemById } from '@/data/menu';
import type { CartItem } from '@/types/cart';
import type { OrderTotals } from '@/types/order';
import { pricingConfig } from '@/lib/config';
import { quantityDiscountPercent } from '@/lib/rewards-eligibility';

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

/** Combo lines (menuItemId starting "combo:") are a self-contained bundle deal — excluded from quantity discount, per-item rewards, and "cheapest item" selection. */
function isCombo(item: CartItem): boolean {
  return item.menuItemId.startsWith('combo:');
}

function cheapestItem(items: CartItem[]): CartItem | null {
  const eligible = items.filter((item) => !isCombo(item));
  if (eligible.length === 0) return null;
  return eligible.reduce((min, item) => (unitEffectivePrice(item) < unitEffectivePrice(min) ? item : min));
}

/** Every-6th-order reward: 50% off one unit of the cheapest cold coffee in the cart. 0 if none present. */
function coldCoffeeRewardAmount(items: CartItem[]): number {
  const coldCoffees = items.filter((item) => getMenuItemById(item.menuItemId)?.category === 'cold-coffee');
  const cheapest = cheapestItem(coldCoffees);
  if (!cheapest) return 0;
  return Math.round((unitEffectivePrice(cheapest) * pricingConfig.milestoneRewards.coldCoffee.discountPercent) / 100);
}

/** Every-10th-order reward: one unit of the cheapest eligible drink, fully free. */
function freeItemRewardAmount(items: CartItem[]): number {
  const cheapest = cheapestItem(items);
  return cheapest ? unitEffectivePrice(cheapest) : 0;
}

/** First-order "Buy 1 Get 1 Free": cheapest eligible unit is free, but only once there are 2+ eligible units — otherwise there's no "1" to buy alongside the free one. */
function bogoRewardAmount(items: CartItem[]): number {
  const eligibleUnits = items.filter((item) => !isCombo(item)).reduce((sum, item) => sum + item.quantity, 0);
  if (eligibleUnits < 2) return 0;
  const cheapest = cheapestItem(items);
  return cheapest ? unitEffectivePrice(cheapest) : 0;
}

interface OrderTotalsOptions {
  /** Flat 25% instead of the quantity-tier discount — mutually exclusive, Premium always wins when true. */
  isPremiumMember?: boolean;
  coldCoffeeReward?: boolean;
  freeItemReward?: boolean;
  /** Customer's first order, registered accounts only — cheapest eligible (non-combo) unit goes free. */
  firstOrderBogo?: boolean;
  /** Premium Member (or active Premium Card) + within the free-delivery radius — decided by the caller (needs geocoding, not pure). */
  freeDeliveryEligible?: boolean;
  /** Flat rupee amount from a usable compensation coupon — decided by the caller (looks up the user's coupons, not pure). */
  couponAmountRupees?: number;
}

/**
 * Computes full order totals for checkout.
 *
 * orderDiscount applies only to non-combo lines: either the quantity-tier
 * discount (based on how many eligible drinks are in THIS cart — no order
 * history involved) or, for Premium Members, a flat 25% — never both,
 * Premium always wins since 25% ≥ the quantity tier's max of 20%.
 *
 * comboDiscount is a separate flat 15% on combo lines specifically — always
 * on, every order, regardless of quantity/Premium status (combos are their
 * own bundle deal, not part of the quantity-tier system).
 *
 * The milestone rewards (cold coffee / free item) are a third mechanic —
 * per-item markdowns, not subtotal percentages — and stack on top of both.
 *
 * bogoDiscount is a fourth, one-time mechanic: a customer's first order only,
 * cheapest eligible (non-combo) unit free — also stacks on top of the above.
 */
export function computeOrderTotals(items: CartItem[], options: OrderTotalsOptions = {}): OrderTotals {
  const subtotal = cartSubtotal(items);
  const comboItems = items.filter(isCombo);
  const nonComboItems = items.filter((item) => !isCombo(item));
  const comboSubtotal = cartSubtotal(comboItems);
  const nonComboSubtotal = cartSubtotal(nonComboItems);
  const totalUnits = nonComboItems.reduce((sum, item) => sum + item.quantity, 0);

  let orderDiscount = 0;
  let orderDiscountLabel = '';
  if (options.isPremiumMember) {
    orderDiscount = Math.round((nonComboSubtotal * pricingConfig.premium.discountPercent) / 100);
    orderDiscountLabel = orderDiscount > 0 ? `Premium Member Discount (${pricingConfig.premium.discountPercent}%)` : '';
  } else {
    const percent = quantityDiscountPercent(totalUnits);
    orderDiscount = Math.round((nonComboSubtotal * percent) / 100);
    orderDiscountLabel = orderDiscount > 0 ? `Multi-Shake Discount (${percent}%)` : '';
  }

  const comboDiscount = Math.round((comboSubtotal * pricingConfig.combo.discountPercent) / 100);

  const coldCoffeeDiscount = options.coldCoffeeReward ? coldCoffeeRewardAmount(items) : 0;
  const freeItemDiscount = options.freeItemReward ? freeItemRewardAmount(items) : 0;
  const bogoDiscount = options.firstOrderBogo ? bogoRewardAmount(items) : 0;

  const deliveryFee =
    subtotal >= pricingConfig.freeDeliveryThreshold || options.freeDeliveryEligible ? 0 : pricingConfig.deliveryFee;

  // Capped so a coupon can never push the taxable amount negative.
  const preCouponAmount = subtotal - orderDiscount - comboDiscount - coldCoffeeDiscount - freeItemDiscount - bogoDiscount;
  const couponDiscount = Math.min(options.couponAmountRupees ?? 0, Math.max(0, preCouponAmount));

  const taxableAmount = preCouponAmount - couponDiscount;
  const tax = Math.round((taxableAmount * pricingConfig.taxRatePercent) / 100);

  const total = taxableAmount + tax + deliveryFee;

  return {
    subtotal,
    orderDiscount,
    orderDiscountLabel,
    comboDiscount,
    coldCoffeeDiscount,
    freeItemDiscount,
    bogoDiscount,
    couponDiscount,
    deliveryFee,
    tax,
    total,
  };
}

/** Estimated delivery time — The Blenders Club is delivery-only, no pickup/dine-in. */
export const ESTIMATED_DELIVERY_MINUTES = 35;
