'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { buttonClasses } from '@/components/ui/Button';
import { faqs } from '@/data/faqs';

const preview = faqs.slice(0, 5);

export function FAQPreview() {
  return (
    <section className="bg-tbc-charcoal/40 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading eyebrow="Good to Know" title="Frequently Asked Questions" />
        </FadeIn>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {preview.map((faq, i) => (
            <FadeIn key={faq.id} delay={i * 0.06}>
              <details className="group rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light open:border-tbc-gold-400/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-tbc-cream">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-tbc-gold-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-4 text-sm text-tbc-cream-muted">{faq.answer}</p>
              </details>
            </FadeIn>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/faqs" className={buttonClasses('outline', 'md')}>
            View All FAQs
          </Link>
        </div>
      </Container>
    </section>
  );
}
