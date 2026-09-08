import type { CartItem } from './cart';

export type OrderStatus = 'received' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  mapsLink?: string;
  specialInstructions?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface RiderLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

/** Customer-facing rider projection — no trackingToken, that's rider-only (see RiderInfo in src/types/db.ts). */
export interface SafeRiderInfo {
  name: string;
  phone: string;
  location: RiderLocation | null;
  sharingActive: boolean;
}

/** How much of the order value comes back, and through what mechanism. */
export type CancellationRefundType = 'full' | 'half' | 'none';
export type RefundMethod = 'razorpay' | 'coupon' | 'none';
export type RefundClaimStatus = 'pending' | 'approved' | 'rejected';

/**
 * Set the moment a customer cancels before delivery — status-based, no
 * approval needed: full refund before "out for delivery," half refund once
 * it's out for delivery. COD orders haven't had cash collected yet at either
 * point, so refundMethod is 'none' there regardless of refundType — there's
 * nothing to hand back.
 */
export interface OrderCancellation {
  at: string;
  refundType: CancellationRefundType;
  refundAmount: number;
  refundMethod: RefundMethod;
  razorpayRefundId?: string;
}

/**
 * A post-delivery compensation request — the order already happened (status
 * stays 'delivered'), so this is a separate claim, not a cancellation. Needs
 * admin judgment on whether the reason is genuine before any money/coupon
 * moves, since it's a self-reported claim.
 */
export interface RefundClaim {
  requestedAt: string;
  reason: string;
  status: RefundClaimStatus;
  decidedAt: string | null;
  refundAmount: number;
  refundMethod: RefundMethod;
  razorpayRefundId?: string;
  couponCode?: string;
}

export interface OrderTotals {
  subtotal: number;
  /** The quantity-tier discount (non-premium) OR the flat 25% Premium Member discount — never both. Applies only to non-combo lines; combos have their own flat comboDiscount instead. */
  orderDiscount: number;
  /** Human-readable reason for orderDiscount, e.g. "Premium Member Discount (25%)" or "Multi-Shake Discount (15%)". Empty string when orderDiscount is 0. */
  orderDiscountLabel: string;
  /** Flat 15% off combo lines — always on, every order, independent of quantity/Premium status. */
  comboDiscount: number;
  /** Every-6th-order reward: 50% off one cold coffee in this order. */
  coldCoffeeDiscount: number;
  /** Every-10th-order reward: one eligible drink fully free. */
  freeItemDiscount: number;
  /** First-order-only "Buy 1 Get 1 Free": cheapest eligible (non-combo) unit is free, requires 2+ eligible units in cart. */
  bogoDiscount: number;
  /** Flat rupee amount from an applied compensation coupon or a self-service promo code (never both — see resolvePromoCode). Capped so it can never make taxableAmount negative. */
  couponDiscount: number;
  /** Human-readable source of couponDiscount, e.g. "Compensation Coupon" or "Coupon (WELCOME50)". Empty string when couponDiscount is 0. */
  couponLabel: string;
  deliveryFee: number;
  tax: number;
  total: number;
}

/**
 * Client-facing, trimmed projection of the server's OrderDoc (see src/types/db.ts) —
 * no userId, no Razorpay signature. This is what /api/orders returns and what
 * order-store.ts persists to sessionStorage for the confirmation page.
 */
export interface PlacedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  delivery: DeliveryDetails;
  items: CartItem[];
  totals: OrderTotals;
  estimatedMinutes: number;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  rider: SafeRiderInfo | null;
  deliveryCoordinates: { lat: number; lng: number } | null;
  cancellation: OrderCancellation | null;
  refundClaim: RefundClaim | null;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
  };
}
