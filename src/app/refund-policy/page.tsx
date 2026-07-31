import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';
import { LegalContent } from '@/components/shared/LegalContent';
import { siteConfig, storeConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  robots: { index: true, follow: true },
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Refund & Cancellation Policy" />
      <section className="py-16">
        <Container>
          <p className="mb-6 max-w-3xl rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-4 text-xs text-tbc-cream-dim">
            This is a starting-point policy template for {siteConfig.brandName}. Have it reviewed by
            a qualified legal professional before publishing.
          </p>
          <LegalContent>
            <h2>1. Order Cancellations</h2>
            <p>
              As drinks are freshly blended to order, cancellations are only accepted if the order
              has not yet entered preparation. Please contact us immediately by phone or WhatsApp if
              you need to cancel.
            </p>

            <h2>2. Refund Eligibility</h2>
            <ul>
              <li>Order was cancelled before preparation began.</li>
              <li>An item was missing, incorrect, or of unacceptable quality on arrival.</li>
              <li>The order was significantly delayed beyond the estimated time due to our error.</li>
            </ul>

            <h2>3. How to Request a Refund</h2>
            <p>
              Contact us at {storeConfig.phone} or {storeConfig.email} within 24 hours of your order,
              along with your Order ID and a brief description of the issue.
            </p>

            <h2>4. Refund Method</h2>
            <p>
              Approved refunds will be processed via the original payment method where applicable,
              or store credit, within 5–7 business days. As online payments are not yet enabled,
              current orders are settled on delivery/pickup, so approved refunds may be issued as
              store credit toward a future order.
            </p>

            <h2>5. Non-Refundable Situations</h2>
            <p>
              We are unable to offer refunds for change-of-mind cancellations after preparation has
              begun, or for delays caused by incorrect address or contact details provided at
              checkout.
            </p>

            <h2>6. Catering Orders</h2>
            <p>
              Cancellation and refund terms for catering bookings are confirmed individually as part
              of the catering agreement.
            </p>
          </LegalContent>
        </Container>
      </section>
    </>
  );
}
