import type { Metadata } from 'next';
import { MenuPageClient } from '@/components/menu/MenuPageClient';
import { menuItems } from '@/data/menu';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Menu — Signature Shakes & Cold Coffee',
  description:
    'Browse The Blenders Club menu: signature shakes, cold coffee, and combo offers. Order directly for an automatic 10% discount.',
  alternates: { canonical: '/menu' },
};

function MenuJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: menuItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.signatureName,
        description: item.description,
        image: item.image,
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${siteConfig.url}/menu`,
        },
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function MenuPage() {
  return (
    <>
      <MenuJsonLd />
      <MenuPageClient />
    </>
  );
}
