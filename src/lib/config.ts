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
  zomatoUrl: process.env.NEXT_PUBLIC_ZOMATO_URL || 'https://www.zomato.com/',
  swiggyUrl: process.env.NEXT_PUBLIC_SWIGGY_URL || 'https://www.swiggy.com/',
  zomatoAppScheme: process.env.NEXT_PUBLIC_ZOMATO_APP_SCHEME || '',
  swiggyAppScheme: process.env.NEXT_PUBLIC_SWIGGY_APP_SCHEME || '',
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
} as const;

export const analyticsConfig = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || '',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
} as const;

/** Pricing & rewards logic — single source of truth so it never drifts between UI and checkout math. */
export const pricingConfig = {
  /** Flat, no-coupon-needed discount applied to every direct website order. */
  websiteDiscountPercent: 10,
  loyalty: {
    firstOrderPercent: 10,
    returningPercent: 15,
    goldPercent: 20,
  },
  taxRatePercent: 5,
  deliveryFee: 39,
  freeDeliveryThreshold: 499,
} as const;

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Catering', href: '/catering' },
  { label: 'Franchise', href: '/franchise' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
] as const;

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
