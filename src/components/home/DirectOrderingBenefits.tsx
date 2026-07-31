'use client';

import { Percent, Award, Sliders, Zap } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { buttonClasses } from '@/components/ui/Button';
import Link from 'next/link';
import { pricingConfig } from '@/lib/config';

const benefits = [
  {
    icon: Percent,
    title: `Automatic ${pricingConfig.websiteDiscountPercent}% Off`,
    description: 'Applied to every order, no coupon code needed — a discount you won\'t find on Zomato or Swiggy.',
  },
  {
    icon: Award,
    title: 'Earn Rewards',
    description: 'Every direct order builds toward Blenders Club Rewards — up to 20% off as a Gold Member.',
  },
  {
    icon: Sliders,
    title: 'Full Customization',
    description: 'Choose sugar level, ice level, and premium add-ons exactly the way you like your drink.',
  },
  {
    icon: Zap,
    title: 'Same Menu, Better Deal',
    description: 'Identical prices to third-party apps, plus a faster, more direct ordering experience.',
  },
];

export function DirectOrderingBenefits() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-tbc-gold-400">
              Order Smarter
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
              Why Order Directly From The Blenders Club
            </h2>
            <p className="mt-4 max-w-lg text-tbc-cream-muted">
              Ordering through our website is the most rewarding way to enjoy your favourite drinks —
              same great menu, better value, and an experience built entirely around you.
            </p>
            <Link href="/menu" className={`${buttonClasses('gold', 'lg')} mt-8`}>
              Order Directly Now
            </Link>
          </FadeIn>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.1}>
                <div className="h-full rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-5">
                  <benefit.icon className="mb-3 h-6 w-6 text-tbc-gold-400" aria-hidden="true" />
                  <h3 className="font-heading text-base font-semibold">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm text-tbc-cream-muted">{benefit.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
