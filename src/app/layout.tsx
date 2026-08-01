import type { Metadata } from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity';
import { siteConfig, storeConfig } from '@/lib/config';

const heading = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.brandName} — Premium Shakes & Cold Coffee`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  keywords: [
    'premium shakes',
    'cold coffee',
    'milkshake delivery',
    'The Blenders Club',
    'cloud kitchen shake delivery',
  ],
  openGraph: {
    type: 'website',
    siteName: siteConfig.brandName,
    title: `${siteConfig.brandName} — Premium Shakes & Cold Coffee`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: siteConfig.brandName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.brandName} — Premium Shakes & Cold Coffee`,
    description: siteConfig.description,
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

function LocalBusinessJsonLd() {
  // FoodEstablishment (not CafeOrCoffeeShop) — The Blenders Club is a
  // delivery-only cloud kitchen with no dine-in/walk-in service.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: siteConfig.brandName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: storeConfig.phone,
    email: storeConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: storeConfig.address,
    },
    servesCuisine: ['Shakes', 'Cold Coffee', 'Beverages'],
    priceRange: '₹₹',
    openingHours: 'Mo-Su 12:00-24:00',
    hasDeliveryMethod: 'https://schema.org/DeliveryModeDirect',
    acceptsReservations: false,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-noise-overlay">
        <LocalBusinessJsonLd />
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster theme="dark" position="top-center" richColors />
        <GoogleAnalytics />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
