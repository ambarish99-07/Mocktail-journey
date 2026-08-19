import type { Metadata } from 'next';
import Link from 'next/link';
import { Coffee, Gift, Crown, GlassWater, Sparkles, Truck } from 'lucide-react';
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
    'The Blenders Club Rewards — automatic multi-shake discounts, repeat-order rewards, and Premium Membership.',
  alternates: { canonical: '/rewards' },
};

const quantityTiers = [...pricingConfig.quantityDiscount.tiers].sort((a, b) => a.minUnits - b.minUnits);

const milestones = [
  {
    icon: Coffee,
    name: 'Cold Coffee Reward',
    description: `Every ${pricingConfig.milestoneRewards.coldCoffee.every}th order gets ${pricingConfig.milestoneRewards.coldCoffee.discountPercent}% off a cold coffee.`,
  },
  {
    icon: Gift,
    name: 'Free Drink Reward',
    description: `Every ${pricingConfig.milestoneRewards.freeItem.every}th order includes one drink on the house.`,
  },
];

export default function RewardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Loyalty Program"
        title="The Blenders Club Rewards"
        description="Order more, save more — automatically. No app, no card, no coupon codes."
      />

      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Every Order"
            title="Multi-Shake Discount"
            description="The more shakes and cold coffees in one order, the bigger the automatic discount — works for guests too."
            align="left"
            className="mx-0"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {quantityTiers.map((tier, i) => (
              <FadeIn key={tier.minUnits} delay={i * 0.1}>
                <div className="flex h-full flex-col items-center rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                    <GlassWater className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="text-4xl font-bold text-tbc-gold-400">{tier.percent}%</span>
                  <h3 className="mt-2 font-heading text-lg font-semibold">{tier.minUnits}+ Drinks</h3>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow="New Customers"
              title="Your First Order: Buy 1 Get 1 Free"
              description="Sign up, order, and the cheapest eligible drink in your cart is on us — automatically, no code needed. Doesn't apply to combos."
              align="left"
              className="mx-0"
            />
            <FadeIn>
              <div className="mt-8 flex flex-col items-start gap-4 rounded-xl2 border border-tbc-gold-400/40 bg-tbc-gold-400/5 p-8 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                  <Sparkles className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tbc-gold-400">Buy 1 Get 1 Free</p>
                  <p className="mt-1 text-sm text-tbc-cream-muted">
                    Add 2 or more eligible drinks to your first order and the cheapest one is free. One-time,
                    registered accounts only.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow="For Registered Customers"
              title="Repeat-Order Rewards"
              description="Two independent, repeating rewards that keep coming back the more you order."
              align="left"
              className="mx-0"
            />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {milestones.map((milestone, i) => (
                <FadeIn key={milestone.name} delay={i * 0.1}>
                  <div className="flex h-full items-start gap-4 rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                      <milestone.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">{milestone.name}</h3>
                      <p className="mt-1 text-sm text-tbc-cream-muted">{milestone.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow={`Unlocked at ${pricingConfig.premium.unlockAfterOrders} Orders`}
              title="Premium Membership"
              description="Our most loyal customers get the best deal on every single order."
              align="left"
              className="mx-0"
            />
            <FadeIn>
              <div className="mt-8 flex flex-col items-start gap-4 rounded-xl2 border border-tbc-gold-400/40 bg-tbc-gold-400/5 p-8 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                  <Crown className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tbc-gold-400">{pricingConfig.premium.discountPercent}% off every order</p>
                  <p className="mt-1 text-sm text-tbc-cream-muted">
                    Plus free delivery within {pricingConfig.premium.freeDeliveryRadiusKm}km of our kitchen. Unlocks after{' '}
                    {pricingConfig.premium.unlockAfterOrders} completed orders — join anytime after that from your account.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="mt-16">
            <SectionHeading
              eyebrow="Don't Want to Wait?"
              title="Premium Membership Card"
              description="A faster, paid path to free delivery — no order-count requirement."
              align="left"
              className="mx-0"
            />
            <FadeIn>
              <div className="mt-8 flex flex-col items-start gap-4 rounded-xl2 border border-tbc-gold-400/40 bg-tbc-gold-400/5 p-8 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                  <Truck className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tbc-gold-400">
                    ₹{pricingConfig.premiumCard.priceRupees} for {pricingConfig.premiumCard.validDays} days
                  </p>
                  <p className="mt-1 text-sm text-tbc-cream-muted">
                    Free delivery eligibility within {pricingConfig.premium.freeDeliveryRadiusKm}km of our kitchen —
                    independent of the order-count Premium tier above. Buy anytime from your account.
                  </p>
                </div>
              </div>
            </FadeIn>
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
