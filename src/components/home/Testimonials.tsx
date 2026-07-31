'use client';

import { Star } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { testimonials } from '@/data/testimonials';

export function Testimonials() {
  return (
    <section className="bg-tbc-charcoal/40 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Loved By Customers"
            title="What People Are Saying"
            description="Real feedback from The Blenders Club community. Google Reviews integration coming soon."
          />
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.08}>
              <figure className="h-full rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
                <div className="mb-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < t.rating ? 'fill-tbc-gold-400 text-tbc-gold-400' : 'text-tbc-charcoal-border'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-sm text-tbc-cream-muted">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-tbc-cream">
                  {t.name}
                  {t.location && <span className="font-normal text-tbc-cream-dim"> · {t.location}</span>}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
