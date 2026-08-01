import Link from 'next/link';
import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { footerLinks, siteConfig, storeConfig } from '@/lib/config';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-tbc-black-soft">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="font-heading text-xl font-semibold">
              The <span className="text-gold-gradient">Blenders</span> Club
            </Link>
            <p className="mt-4 max-w-sm text-sm text-tbc-cream-muted">{siteConfig.description}</p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Blenders Club on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:border-tbc-gold-400 hover:text-tbc-gold-400"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Blenders Club on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:border-tbc-gold-400 hover:text-tbc-gold-400"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Support" links={footerLinks.support} />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-tbc-gold-400">
              Delivery Info
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-tbc-cream-muted">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <span>{storeConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <a href={`tel:${storeConfig.phone}`} className="hover:text-tbc-gold-400">
                  {storeConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <a href={`mailto:${storeConfig.email}`} className="hover:text-tbc-gold-400">
                  {storeConfig.email}
                </a>
              </li>
              <li className="text-tbc-cream-dim">{storeConfig.openingHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-tbc-cream-dim sm:flex-row">
          <p>
            &copy; {year} {siteConfig.brandName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-tbc-gold-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-tbc-gold-400">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-tbc-cream-muted">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-tbc-gold-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
