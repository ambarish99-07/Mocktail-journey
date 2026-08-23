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
              You can cancel an order any time before it is delivered directly from your order
              confirmation page — no need to call or message us, though you&apos;re welcome to reach
              us at {storeConfig.phone} or {storeConfig.email} if you&apos;d prefer.
            </p>
            <ul>
              <li>
                <strong>Before your order is out for delivery:</strong> cancelling gives a full
                refund.
              </li>
              <li>
                <strong>Once your order is out for delivery:</strong> cancelling gives a half refund
                — your rider is already on the way with freshly prepared items.
              </li>
              <li>
                <strong>After delivery:</strong> orders can no longer be cancelled, but you can file
                a refund request instead (see Section 3).
              </li>
            </ul>

            <h2>2. Refund Amounts &amp; Method</h2>
            <p>
              For orders paid online via Razorpay, refunds are issued automatically to your original
              payment method the moment a cancellation or an approved refund request is processed,
              and typically reflect in your bank/card/UPI statement within 5–7 business days,
              depending on your bank. For Cash on Delivery orders, no cash has been collected at the
              point of cancellation, so there is nothing to refund — the order is simply cancelled at
              no cost to you.
            </p>

            <h2>3. Post-Delivery Refund Requests</h2>
            <p>
              If something was genuinely wrong with a delivered order — an item was spilled in
              transit, incorrect, or missing — you can file a refund request from your order
              confirmation page describing the issue. Our team reviews every request individually
              before approving it; self-reported reasons alone don&apos;t automatically trigger a
              refund. Approved requests on Razorpay-paid orders are refunded to your original payment
              method. Approved requests on Cash on Delivery orders (where payment was already
              collected at the door) are compensated with a ₹100 coupon, valid for 60 days on your
              next order, since a cash refund isn&apos;t possible after the fact.
            </p>

            <h2>4. Non-Refundable Situations</h2>
            <p>
              We are unable to offer refunds for change-of-mind requests after delivery, or for
              delays and delivery issues caused by an incorrect address, unreachable phone number, or
              other incorrect details provided at checkout.
            </p>

            <h2>5. Catering Orders</h2>
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
