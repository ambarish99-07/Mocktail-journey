'use client';

import { Sparkles, Leaf, Clock, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';

const reasons = [
  {
    icon: Leaf,
    title: 'Quality Ingredients',
    description: 'Real fruit, premium chocolate, and freshly brewed coffee — no shortcuts.',
  },
  {
    icon: Sparkles,
    title: 'Crafted Fresh',
    description: 'Every drink is blended to order, never pre-made or sitting in a fridge.',
  },
  {
    icon: Clock,
    title: 'Fast & Reliable',
    description: 'Consistent quality and quick turnaround on every delivery, straight from our kitchen.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Brand',
    description: 'A premium experience customers keep coming back to, order after order.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-tbc-charcoal/40 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading eyebrow="Our Promise" title="Why Choose The Blenders Club" />
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <FadeIn key={reason.title} delay={i * 0.1}>
              <div className="h-full rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 transition-colors hover:border-tbc-gold-400/40">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
                  <reason.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm text-tbc-cream-muted">{reason.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
