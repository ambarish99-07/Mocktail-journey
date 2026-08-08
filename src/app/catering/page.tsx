import type { Metadata } from 'next';
import Image from 'next/image';
import { Check, Star } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';
import { CateringEnquiryForm } from '@/components/catering/CateringEnquiryForm';
import { cateringOccasions, cateringPackages } from '@/data/catering';
import { testimonials } from '@/data/testimonials';

export const metadata: Metadata = {
  title: 'Catering',
  description:
    'Premium shake and cold coffee catering for birthdays, weddings, corporate events, and more. View packages and submit an enquiry.',
  alternates: { canonical: '/catering' },
};

const galleryImages = [
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=700&q=80',
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=700&q=80',
  'https://images.unsplash.com/photo-1653085315536-1379bc836161?w=700&q=80',
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        eyebrow="Catering Services"
        title="Premium Shake Catering for Every Occasion"
        description="Bring The Blenders Club experience to your next event — birthdays, weddings, corporate gatherings, and more."
      />

      <section className="py-16">
        <Container>
          <div className="flex flex-wrap gap-2">
            {cateringOccasions.map((occasion) => (
              <span
                key={occasion}
                className="rounded-full border border-tbc-charcoal-border px-3.5 py-1.5 text-xs text-tbc-cream-muted"
              >
                {occasion}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="Packages" title="Choose Your Catering Package" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {cateringPackages.map((pkg, i) => (
              <FadeIn key={pkg.id} delay={i * 0.1}>
                <div
                  className={`h-full rounded-xl2 border p-6 ${
                    pkg.id === 'classic'
                      ? 'border-tbc-gold-400 bg-tbc-charcoal-light shadow-gold-glow'
                      : 'border-tbc-charcoal-border bg-tbc-charcoal-light'
                  }`}
                >
                  {pkg.id === 'classic' && (
                    <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-tbc-gold-400 px-2.5 py-1 text-xs font-semibold text-black">
                      <Star className="h-3 w-3" aria-hidden="true" /> Most Popular
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-semibold">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-tbc-cream-muted">{pkg.description}</p>
                  <p className="mt-4 text-2xl font-bold text-tbc-gold-400">{pkg.startingPrice}</p>
                  <p className="text-xs text-tbc-cream-dim">{pkg.bestFor}</p>
                  <ul className="mt-4 space-y-2">
                    {pkg.inclusions.map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm text-tbc-cream-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-tbc-emerald-400" aria-hidden="true" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-tbc-cream-dim">
            Pricing shown is indicative — final quotes depend on location, menu selection, and guest count.
          </p>
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="Past Events" title="Catering Gallery" />
          </FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {galleryImages.map((src) => (
              <div key={src} className="relative aspect-video overflow-hidden rounded-xl2">
                <Image src={src} alt="Catering event" fill sizes="400px" className="object-cover" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="Client Love" title="What Hosts Are Saying" />
          </FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {testimonials
              .filter((t) => t.quote.toLowerCase().includes('birthday') || t.quote.toLowerCase().includes('event'))
              .concat(testimonials.slice(0, 2))
              .slice(0, 2)
              .map((t) => (
                <figure key={t.id} className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
                  <blockquote className="text-sm text-tbc-cream-muted">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-3 text-sm font-semibold">{t.name}</figcaption>
                </figure>
              ))}
          </div>
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-16">
        <Container className="mx-auto max-w-2xl">
          <FadeIn>
            <SectionHeading eyebrow="Let's Talk" title="Request a Catering Quote" />
          </FadeIn>
          <div className="mt-10 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 sm:p-8">
            <CateringEnquiryForm />
          </div>
        </Container>
      </section>
    </>
  );
}
