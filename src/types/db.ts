import type { ObjectId } from 'mongodb';
import type { CartItem } from './cart';
import type { DeliveryDetails, OrderStatus, OrderTotals, PaymentMethod, PaymentStatus } from './order';

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
  /** Whether the flat 25% Premium Member discount (vs. the quantity-tier discount) applied to this order. */
  isPremiumOrder: boolean;
  /** Whether this order redeemed the every-6th-order cold-coffee reward. */
  coldCoffeeRewardApplied: boolean;
  /** Whether this order redeemed the every-10th-order free-item reward. */
  freeItemRewardApplied: boolean;
  /** Straight-line distance from the kitchen in km, if it could be determined — null if delivery coordinates couldn't be resolved. Informational + drives the Premium free-delivery radius check. */
  deliveryDistanceKm: number | null;
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
  };
  /** Repeating milestone rewards — each counter resets to 0 the moment it triggers its reward. */
  rewards: {
    /** Every 6th order: 50% off one cold coffee. */
    coldCoffeeCounter: number;
    /** Every 10th order: one eligible drink free. */
    freeItemCounter: number;
  };
  /** Unlocks (becomes offerable) at 15 completed orders, but customers must actively opt in — see isMember. */
  premium: {
    isMember: boolean;
    enrolledAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export type LeadType = 'contact' | 'catering' | 'franchise';
export type LeadStatus = 'new' | 'contacted' | 'closed';

/**
 * MongoDB `leads` collection document — backs the contact, catering enquiry,
 * and franchise application forms. One collection with a `type` discriminator
 * (rather than three) so the admin dashboard can list/filter them together;
 * fields not relevant to a given `type` are simply omitted.
 */
export interface LeadDoc {
  _id: ObjectId;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string;
  /** contact: the message itself. catering/franchise: optional extra details. */
  message?: string;
  /** catering only */
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  /** franchise only */
  city?: string;
  investmentBudget?: string;
  experience?: string;
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
  };
  rewards: {
    coldCoffeeCounter: number;
    freeItemCounter: number;
  };
  premium: {
    isMember: boolean;
    enrolledAt: string | null;
  };
}
