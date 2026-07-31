import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';
import { ContactForm } from '@/components/contact/ContactForm';
import { storeConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with The Blenders Club — store location, phone, email, and a direct contact form.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Get in Touch" title="Contact The Blenders Club" />

      <section className="py-16">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-xl font-semibold">Visit or Reach Us</h2>
            <ul className="mt-5 space-y-4 text-sm text-tbc-cream-muted">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                {storeConfig.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <a href={`tel:${storeConfig.phone}`} className="hover:text-tbc-gold-400">
                  {storeConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <a href={`mailto:${storeConfig.email}`} className="hover:text-tbc-gold-400">
                  {storeConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                {storeConfig.openingHours}
              </li>
            </ul>

            <a
              href={storeConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block overflow-hidden rounded-xl2 border border-tbc-charcoal-border"
            >
              <div className="flex h-48 items-center justify-center bg-tbc-charcoal-light text-sm text-tbc-cream-dim">
                View on Google Maps →
              </div>
            </a>
          </div>

          <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 sm:p-8">
            <h2 className="mb-5 text-xl font-semibold">Send Us a Message</h2>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
