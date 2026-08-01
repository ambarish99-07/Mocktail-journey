export type LoyaltyTier = 'first-order' | 'returning' | 'gold';

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
  websiteDiscount: number;
  loyaltyDiscount: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

/** The Blenders Club is a delivery-only cloud kitchen — every order ships with delivery details, no pickup/dine-in option. */
export interface PlacedOrder {
  id: string;
  createdAt: string;
  delivery: DeliveryDetails;
  totals: OrderTotals;
  estimatedMinutes: number;
}
