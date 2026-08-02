import type { CartItem } from './cart';

export type LoyaltyTier = 'first-order' | 'returning' | 'gold';

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
  punchCardDiscount: number;
  websiteDiscount: number;
  loyaltyDiscount: number;
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
