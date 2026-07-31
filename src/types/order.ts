export type FulfilmentType = 'delivery' | 'pickup';

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

export interface PlacedOrder {
  id: string;
  createdAt: string;
  fulfilment: FulfilmentType;
  delivery: DeliveryDetails | null;
  totals: OrderTotals;
  estimatedMinutes: number;
}
