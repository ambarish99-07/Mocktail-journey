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
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
  };
}
