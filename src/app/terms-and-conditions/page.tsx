import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';
import { LegalContent } from '@/components/shared/LegalContent';
import { siteConfig, storeConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms-and-conditions' },
};

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <section className="py-16">
        <Container>
          <p className="mb-6 max-w-3xl rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-4 text-xs text-tbc-cream-dim">
            This is a starting-point terms template for {siteConfig.brandName}. Have it reviewed by
            a qualified legal professional before publishing.
          </p>
          <LegalContent>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the {siteConfig.brandName} website, placing an order, or
              submitting an enquiry, you agree to these Terms & Conditions.
            </p>

            <h2>2. Orders & Pricing</h2>
            <p>
              Website orders receive an automatic checkout discount, which is not a change in listed
              menu price. We reserve the right to correct pricing errors and to modify the menu or
              prices at any time.
            </p>

            <h2>3. Payment</h2>
            <p>
              At present, orders are payable on delivery (cash/UPI). Online payment options will be
              added in a future update and will be governed by the payment processor&apos;s terms at
              that time.
            </p>

            <h2>4. Delivery</h2>
            <p>
              {siteConfig.brandName} is a delivery-only cloud kitchen — we do not offer walk-in or
              dine-in service. Estimated delivery times shown at checkout are approximate and may
              vary due to demand, weather, or circumstances beyond our control.
            </p>

            <h2>5. Rewards Program</h2>
            <p>
              The Blenders Club Rewards discounts (first order, returning customer, Gold Member) are
              tracked automatically and may be adjusted, paused, or discontinued at our discretion,
              with reasonable notice where practical.
            </p>

            <h2>6. Catering & Franchise Enquiries</h2>
            <p>
              Submitting a catering or franchise enquiry does not constitute a binding agreement.
              Final terms are confirmed separately in writing.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the extent permitted by law, {siteConfig.brandName} is not liable for indirect or
              consequential damages arising from use of this website or our products.
            </p>

            <h2>8. Governing Law</h2>
            <p>These Terms are governed by the laws of India.</p>

            <h2>9. Contact</h2>
            <p>Questions about these Terms can be sent to {storeConfig.email}.</p>
          </LegalContent>
        </Container>
      </section>
    </>
  );
}
