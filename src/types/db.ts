import type { ObjectId } from 'mongodb';
import type { CartItem } from './cart';
import type { DeliveryDetails, LoyaltyTier, OrderStatus, OrderTotals, PaymentMethod, PaymentStatus } from './order';

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

/** MongoDB `orders` collection document. Server-only shape — see PlacedOrder (src/types/order.ts) for the trimmed client projection. */
export interface OrderDoc {
  _id: ObjectId;
  /** Cryptographically random public identifier — used instead of _id in URLs/API responses so order links can't be guessed or enumerated (Mongo ObjectIds are only partially random). */
  accessToken: string;
  orderNumber: string;
  userId: ObjectId | null;
  items: CartItem[];
  delivery: DeliveryDetails;
  totals: OrderTotals;
  loyaltyTierAtOrder: LoyaltyTier | null;
  estimatedMinutes: number;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  whatsapp: {
    adminNotifiedAt?: string;
    customerNotifiedStatuses: OrderStatus[];
    recommendationSentAt?: string;
  };
  /** Whether this order redeemed the punch-card reward (see src/lib/punch-card.ts). */
  punchCardRewardApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

/** MongoDB `users` collection document. */
export interface UserDoc {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  loyalty: {
    completedOrderCount: number;
    isGoldMember: boolean;
  };
  /** "Order 5, get 50% off your 6th" — resets to 0 each time the reward is redeemed. */
  punchCard: {
    ordersSinceReward: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** Safe-to-return-to-client projection of UserDoc — never includes passwordHash. */
export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  loyalty: {
    completedOrderCount: number;
    isGoldMember: boolean;
  };
  punchCard: {
    ordersSinceReward: number;
  };
}
