import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Star, Crown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';
import { buttonClasses } from '@/components/ui/Button';
import { RewardsStatusBanner } from '@/components/rewards/RewardsStatusBanner';
import { pricingConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Rewards',
  description:
    'The Blenders Club Rewards — earn bigger discounts the more you order directly from our website.',
  alternates: { canonical: '/rewards' },
};

const tiers = [
  {
    icon: Star,
    name: 'First Website Order',
    percent: pricingConfig.loyalty.firstOrderPercent,
    description: 'Your very first order placed directly through our website.',
  },
  {
    icon: Award,
    name: 'Returning Customer',
    percent: pricingConfig.loyalty.returningPercent,
    description: 'Unlocked automatically from your second direct website order onward.',
  },
  {
    icon: Crown,
    name: 'Gold Member',
    percent: pricingConfig.loyalty.goldPercent,
    description: 'Our most loyal customers — reached after 5 completed direct orders.',
  },
];

export default function RewardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Loyalty Program"
        title="The Blenders Club Rewards"
        description="The more you order directly from our website, the more you save. No app, no card — it's tracked automatically."
      />

      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div className="flex h-full flex-col items-center rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                    <tier.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="text-4xl font-bold text-tbc-gold-400">{tier.percent}%</span>
                  <h3 className="mt-2 font-heading text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-2 text-sm text-tbc-cream-muted">{tier.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <RewardsStatusBanner />
          </FadeIn>

          <div className="mt-10 text-center">
            <Link href="/menu" className={buttonClasses('gold', 'lg')}>
              Start Earning Rewards
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
