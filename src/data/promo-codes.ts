import type { PromoCodeDef } from '@/types/promo';

/**
 * Publicly known, self-service codes a customer types at checkout — separate
 * from the ₹100 compensation coupon (src/types/db.ts Coupon), which is
 * auto-issued per-account for an approved refund claim and never typed in.
 * Only one of a promo code or a compensation coupon can apply per order (see
 * resolvePromoCode in lib/promo-server.ts) — a customer never stacks both.
 */
export const promoCodes: PromoCodeDef[] = [
  {
    code: 'WELCOME50',
    type: 'percent',
    value: 50,
    maxDiscountRupees: 100,
    minOrderRupees: 199,
    oncePerCustomer: true,
    description: '50% off (up to ₹100) on your first coupon-code order — registered accounts only, one-time.',
  },
  {
    code: 'FLAT50',
    type: 'flat',
    value: 50,
    minOrderRupees: 299,
    description: '₹50 off orders above ₹299.',
  },
  {
    code: 'FLAT100',
    type: 'flat',
    value: 100,
    minOrderRupees: 599,
    description: '₹100 off orders above ₹599.',
  },
];

export function getPromoCodeDef(code: string): PromoCodeDef | undefined {
  const normalized = code.trim().toUpperCase();
  return promoCodes.find((p) => p.code === normalized);
}
