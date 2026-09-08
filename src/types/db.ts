import type { ObjectId } from 'mongodb';
import type { CartItem } from './cart';
import type {
  DeliveryDetails,
  OrderCancellation,
  OrderStatus,
  OrderStatusEvent,
  OrderTotals,
  PaymentMethod,
  PaymentStatus,
  RefundClaim,
  RiderLocation,
} from './order';

// Re-exported so existing `import type { OrderStatusEvent } from '@/types/db'` call sites keep working — the canonical definition now lives in order.ts alongside PlacedOrder, which needs it too.
export type { OrderStatusEvent };

/** Rider tracking state on an order — trackingToken is the unguessable credential the rider-facing page uses, never sent to the customer (see SafeRiderInfo in src/types/order.ts). */
export interface RiderInfo {
  name: string;
  phone: string;
  trackingToken: string;
  location: RiderLocation | null;
  sharingActive: boolean;
}

/** A customer's saved default delivery address — set from their profile, or auto-saved from their most recent checkout. */
export interface SavedAddress {
  address: string;
  city: string;
  pincode: string;
  mapsLink: string | null;
}

/** Compensation credit — issued when an admin approves a post-delivery refund claim on a COD order (cash already collected, so a coupon substitutes for a cash refund). Flat rupee amount, auto-applied at the customer's next checkout, one active coupon redeemed at a time. */
export interface Coupon {
  code: string;
  amountRupees: number;
  reason: string;
  issuedAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  usedOnOrderNumber?: string;
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
  /** Whether this order redeemed the first-order Buy 1 Get 1 Free offer. */
  bogoRewardApplied: boolean;
  /** Straight-line distance from the kitchen in km, if it could be determined — null if delivery coordinates couldn't be resolved. Informational + drives the Premium free-delivery radius check. */
  deliveryDistanceKm: number | null;
  /** Resolved once, when a rider is assigned (or earlier if the Premium radius check already resolved it) — lets the delivery map plot the customer's pin without re-geocoding on every poll. */
  deliveryCoordinates: { lat: number; lng: number } | null;
  /** Null until an admin assigns a rider (name + phone) for this delivery. */
  rider: RiderInfo | null;
  /** Code of the compensation coupon applied to this order's total, if any. */
  couponApplied: string | null;
  /** Set the moment the customer cancels before delivery — see OrderCancellation. Null for orders that were never cancelled. */
  cancellation: OrderCancellation | null;
  /** A post-delivery compensation request — order stays 'delivered', this tracks the claim separately. Null unless one was filed. */
  refundClaim: RefundClaim | null;
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
  /**
   * Paid, time-limited membership (₹21 / 60 days) — grants free-delivery
   * eligibility only (not the 25% order discount that full Premium gets).
   * Independent of `premium` above: a customer can hold either, both, or
   * neither at the same time.
   */
  premiumCard: {
    isActive: boolean;
    purchasedAt: string | null;
    expiresAt: string | null;
    razorpayOrderId?: string;
  };
  /** Remembered delivery details — set explicitly from the profile page, or silently kept in sync from the customer's most recent checkout. Null until either happens. */
  defaultAddress: SavedAddress | null;
  /** Compensation coupons from approved post-delivery refund claims. Usually empty. */
  coupons: Coupon[];
  /** Codes (from src/data/promo-codes.ts) this account has redeemed with `oncePerCustomer: true` — checked, never removed. */
  redeemedPromoCodes: string[];
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
  premiumCard: {
    isActive: boolean;
    purchasedAt: string | null;
    expiresAt: string | null;
  };
  defaultAddress: SavedAddress | null;
  coupons: Coupon[];
}
