/**
 * Central site configuration. Values are sourced from environment variables
 * (see .env.example) so ordering links, contact details and analytics IDs
 * can change per-environment without touching code.
 */

export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'The Blenders Club',
  tagline: 'Crafted to Refresh. Blended to Impress.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://theblendersclub.com',
  description:
    'Premium shakes and cold coffees made with quality ingredients, crafted fresh for every order. Order directly from The Blenders Club for exclusive discounts and rewards.',
} as const;

export const orderingConfig = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '91XXXXXXXXXX',
} as const;

/** The Blenders Club is a delivery-only cloud kitchen — no walk-in/dine-in at this address. */
export const storeConfig = {
  address:
    process.env.NEXT_PUBLIC_STORE_ADDRESS ||
    'Chaturi Nagar Road, Rampati Nagari, New Chamman Chak, Beside Gyan Ganga Trade Centre, Bypass Road, Patna, Bihar',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 8456978290',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'hello@theblendersclub.com',
  googleMapsUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
    'https://www.google.com/maps/search/?api=1&query=Chaturi+Nagar+Road%2C+Rampati+Nagari%2C+New+Chamman+Chak%2C+Beside+Gyan+Ganga+Trade+Centre%2C+Bypass+Road%2C+Patna%2C+Bihar',
  openingHours: '12:00 PM – 12:00 AM, all days (delivery hours)',
  /**
   * PLACEHOLDER — the exact street address doesn't resolve via free geocoding
   * (too new/informal for OpenStreetMap's data), so these default to Patna's
   * city center, not the actual kitchen. Replace via env vars with the real
   * coordinates (right-click the kitchen's exact spot in Google Maps, copy
   * the lat/lng) before relying on the Premium free-delivery radius check —
   * until then it will be measuring distance from the wrong point.
   */
  latitude: Number(process.env.NEXT_PUBLIC_STORE_LAT) || 25.6093239,
  longitude: Number(process.env.NEXT_PUBLIC_STORE_LNG) || 85.1235252,
} as const;

export const analyticsConfig = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || '',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
} as const;

/** Pricing & rewards logic — single source of truth so it never drifts between UI and checkout math. */
export const pricingConfig = {
  /** Order-wide discount by how many shakes/cold coffees are in THIS cart — not order history. */
  quantityDiscount: {
    tiers: [
      { minUnits: 4, percent: 20 },
      { minUnits: 3, percent: 15 },
      { minUnits: 2, percent: 10 },
    ],
  },
  /** Flat, always-on discount on combo lines specifically — every order, everyone, independent of quantity/Premium status. */
  combo: {
    discountPercent: 15,
  },
  /** Premium Members get this flat rate on every order instead of the quantity discount. */
  premium: {
    discountPercent: 25,
    /** Completed orders needed before a customer can opt in. */
    unlockAfterOrders: 15,
    /** Straight-line delivery radius (km) within which Premium Members get free delivery. */
    freeDeliveryRadiusKm: 3,
  },
  /**
   * Premium Membership Card — a paid, time-limited alternative to the
   * order-count-unlocked Premium tier above. Grants free-delivery
   * eligibility only (same radius check, not the 25% order discount).
   */
  premiumCard: {
    priceRupees: 21,
    validDays: 60,
  },
  /** Repeating milestone rewards — see src/lib/rewards-eligibility.ts. */
  milestoneRewards: {
    coldCoffee: { every: 6, discountPercent: 50 },
    freeItem: { every: 10 },
  },
  /**
   * Estimated delivery time scales with straight-line distance from the
   * kitchen instead of quoting the same figure to everyone regardless of how
   * far they are — see estimateDeliveryMinutes in src/lib/pricing.ts.
   * baseMinutes covers kitchen prep + dispatch; minutesPerKm is assumed
   * average delivery speed under city/traffic conditions (~15km/h). Falls
   * back to the flat default (see ESTIMATED_DELIVERY_MINUTES) whenever the
   * address couldn't be geocoded, rather than under-promising with 0 extra
   * travel time.
   */
  deliveryTime: {
    baseMinutes: 20,
    minutesPerKm: 4,
    maxMinutes: 75,
  },
  /** Cancellation / refund-claim rules — see src/app/api/orders/[id]/cancel and .../refund-claim. */
  cancellation: {
    /** Before "out for delivery": full refund, automatic. */
    fullRefundBeforeStatus: 'out-for-delivery',
    /** From "out for delivery" until actual delivery: half refund, automatic. */
    halfRefundPercent: 50,
  },
  /** Issued when an admin approves a post-delivery refund claim on a COD order — cash was already collected at the door, so this substitutes for a cash refund. */
  compensationCoupon: {
    amountRupees: 100,
    validDays: 60,
  },
  taxRatePercent: 5,
  deliveryFee: 39,
  freeDeliveryThreshold: 499,
} as const;

/** Always visible in the desktop nav bar. */
export const primaryNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Tucked into the desktop nav's "More" dropdown — still shown inline on mobile. */
export const moreNavLinks = [
  { label: 'Catering', href: '/catering' },
  { label: 'Franchise', href: '/franchise' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQs', href: '/faqs' },
] as const;

/** Full set, in display order — used by the mobile nav dropdown, which doesn't need a nested overflow menu. */
export const navLinks = [...primaryNavLinks, ...moreNavLinks] as const;

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Catering', href: '/catering' },
    { label: 'Franchise', href: '/franchise' },
    { label: 'Gallery', href: '/gallery' },
  ],
  support: [
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact', href: '/contact' },
    { label: 'Rewards', href: '/rewards' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Refund & Cancellation Policy', href: '/refund-policy' },
  ],
} as const;
