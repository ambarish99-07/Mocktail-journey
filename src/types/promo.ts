export type PromoCodeType = 'percent' | 'flat';

export interface PromoCodeDef {
  code: string;
  type: PromoCodeType;
  /** Percent (0-100) for type 'percent', flat rupee amount for type 'flat'. */
  value: number;
  /** Only relevant for type 'percent' — caps the rupee discount even on a large cart. */
  maxDiscountRupees?: number;
  /** Cart subtotal (pre-discount) must be at least this to redeem the code. */
  minOrderRupees?: number;
  /** Registered accounts only, and only once per account — checked against UserDoc.redeemedPromoCodes. */
  oncePerCustomer?: boolean;
  /** Shown on the Offers page and in checkout messaging. */
  description: string;
}
