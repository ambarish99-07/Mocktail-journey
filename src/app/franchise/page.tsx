import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';
import { FranchiseApplicationForm } from '@/components/franchise/FranchiseApplicationForm';
import { franchiseBenefits, franchiseModels, franchiseRoadmap } from '@/data/franchise';

export const metadata: Metadata = {
  title: 'Franchise',
  description:
    'Own a The Blenders Club outlet. Explore franchise models, investment ranges, benefits, and apply directly.',
  alternates: { canonical: '/franchise' },
};

export default function FranchisePage() {
  return (
    <>
      <PageHero
        eyebrow="Franchise Opportunities"
        title="Build Your Business With The Blenders Club"
        description="A proven premium cloud kitchen concept, backed by full operational support — join our growing network of delivery-only franchise partners."
      />

      <section className="py-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="Why Partner With Us" title="Franchise Benefits" align="left" className="mx-0" />
          </FadeIn>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {franchiseBenefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-4 text-sm text-tbc-cream-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-tbc-emerald-400" aria-hidden="true" />
                {benefit}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="Investment" title="Franchise Models" />
          </FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {franchiseModels.map((model, i) => (
              <FadeIn key={model.id} delay={i * 0.1}>
                <div className="h-full rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light p-6">
                  <h3 className="font-heading text-lg font-semibold">{model.name}</h3>
                  <p className="mt-1 text-sm text-tbc-cream-muted">{model.format}</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p>
                      <span className="text-tbc-cream-dim">Investment: </span>
                      <span className="font-semibold text-tbc-gold-400">{model.investmentRange}</span>
                    </p>
                    <p>
                      <span className="text-tbc-cream-dim">Area Required: </span>
                      <span className="font-medium">{model.areaRequired}</span>
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-tbc-cream-dim">
            Figures shown are indicative placeholders — final investment details are shared in the
            franchise disclosure document during the application process.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="How It Works" title="Expansion Roadmap" />
          </FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {franchiseRoadmap.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
                  <span className="text-2xl font-bold text-tbc-gold-400">{step.step}</span>
                  <h3 className="mt-2 font-heading text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-tbc-cream-muted">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-16">
        <Container className="mx-auto max-w-2xl">
          <FadeIn>
            <SectionHeading eyebrow="Get Started" title="Apply for a Franchise" />
          </FadeIn>
          <div className="mt-10 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 sm:p-8">
            <FranchiseApplicationForm />
          </div>
        </Container>
      </section>
    </>
  );
}
