import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';
import { LegalContent } from '@/components/shared/LegalContent';
import { siteConfig, storeConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="py-16">
        <Container>
          <p className="mb-6 max-w-3xl rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-4 text-xs text-tbc-cream-dim">
            This is a starting-point policy template for {siteConfig.brandName}. Have it reviewed by
            a qualified legal professional before publishing, and update it as your data practices
            change.
          </p>
          <LegalContent>
            <p>
              Last updated: this policy will be dated automatically as it is finalized and published.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              When you place an order, contact us, or submit an enquiry, we may collect your name,
              phone number, email address, delivery address, and order details. When you use
              location-sharing for WhatsApp ordering, we access your device location only with your
              explicit permission.
            </p>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To process and fulfil your orders (delivery or pickup).</li>
              <li>To communicate order updates, confirmations, and support responses.</li>
              <li>To operate our Rewards program and apply eligible discounts.</li>
              <li>To respond to catering and franchise enquiries.</li>
              <li>To improve our website through aggregated, anonymized analytics.</li>
            </ul>

            <h2>3. Cookies & Analytics</h2>
            <p>
              We use tools such as Google Analytics and Microsoft Clarity to understand how visitors
              use our website. These tools may set cookies or use similar technologies. You can
              control cookies through your browser settings.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share order details with delivery
              partners solely to fulfil your order, and with service providers who help us operate
              the website, under appropriate confidentiality obligations.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We take reasonable technical and organizational measures to protect your information.
              No method of transmission or storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data by
              contacting us at {storeConfig.email}.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              For privacy-related questions, reach out at {storeConfig.email} or {storeConfig.phone}.
            </p>
          </LegalContent>
        </Container>
      </section>
    </>
  );
}
