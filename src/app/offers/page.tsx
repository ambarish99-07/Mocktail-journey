import type { Metadata } from 'next';
import Link from 'next/link';
import { Percent, Tag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';
import { buttonClasses } from '@/components/ui/Button';
import { CopyCodeButton } from '@/components/offers/CopyCodeButton';
import { promoCodes } from '@/data/promo-codes';
import { pricingConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Offers',
  description: 'Current coupon codes and automatic discounts at The Blenders Club.',
  alternates: { canonical: '/offers' },
};

export default function OffersPage() {
  return (
    <>
      <PageHero
        eyebrow="Offers"
        title="Current Offers & Coupon Codes"
        description="Type a code at checkout for an extra discount, on top of everything that's already automatic."
      />

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Coupon Codes"
            title="Apply at Checkout"
            align="left"
            className="mx-0"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {promoCodes.map((promo, i) => (
              <FadeIn key={promo.code} delay={i * 0.1}>
                <div className="flex h-full flex-col items-start gap-3 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
                  <Tag className="h-6 w-6 text-tbc-gold-400" aria-hidden="true" />
                  <CopyCodeButton code={promo.code} />
                  <p className="text-sm text-tbc-cream-muted">{promo.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow="Always On"
              title="Automatic Discounts — No Code Needed"
              description="These apply the moment you're eligible, stacking on top of any coupon code above."
              align="left"
              className="mx-0"
            />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-5">
                <Percent className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <p className="text-sm text-tbc-cream-muted">
                  <strong className="text-tbc-cream">Multi-Shake Discount</strong> — 10% off 2+ drinks, 15% off
                  3+, 20% off 4+, automatically at checkout.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-5">
                <Percent className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <p className="text-sm text-tbc-cream-muted">
                  <strong className="text-tbc-cream">Combo Bundles</strong> — flat {pricingConfig.combo.discountPercent}%
                  off, every order.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-5">
                <Percent className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <p className="text-sm text-tbc-cream-muted">
                  <strong className="text-tbc-cream">First Order Buy 1 Get 1 Free</strong> — registered accounts,
                  one-time.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-5">
                <Percent className="h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
                <p className="text-sm text-tbc-cream-muted">
                  <strong className="text-tbc-cream">Premium Membership</strong> — {pricingConfig.premium.discountPercent}%
                  off every order plus free delivery, unlocked after {pricingConfig.premium.unlockAfterOrders} orders.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/rewards" className="text-sm font-semibold text-tbc-gold-400 hover:underline">
                See the full Rewards program →
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/menu" className={buttonClasses('gold', 'lg')}>
              Order Now
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
