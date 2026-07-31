import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';
import { faqs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about ordering, menu customization, rewards, catering, and franchising with The Blenders Club.',
  alternates: { canonical: '/faqs' },
};

function FaqJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function FaqsPage() {
  return (
    <>
      <FaqJsonLd />
      <PageHero eyebrow="Support" title="Frequently Asked Questions" />

      <section className="py-16">
        <Container className="mx-auto max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light open:border-tbc-gold-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-tbc-cream">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-tbc-gold-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-4 text-sm text-tbc-cream-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
