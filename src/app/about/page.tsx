import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The story behind The Blenders Club — a premium shake and cold coffee brand built on quality ingredients and craft.',
  alternates: { canonical: '/about' },
};

const values = [
  { title: 'Quality First', description: 'Real ingredients, sourced with care, blended fresh for every single order.' },
  { title: 'Craft & Creativity', description: 'Every recipe is developed and tasted until it earns the Blenders Club name.' },
  { title: 'Customer Obsession', description: 'From the menu to the checkout, every detail is designed around you.' },
  { title: 'Consistent Excellence', description: 'The same premium experience, every kitchen, every order, every time.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Crafted by Passion. Blended for You."
        description="The Blenders Club was founded on a simple belief: a shake or cold coffee can be a genuinely premium experience — not an afterthought."
      />

      <section className="py-20">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl2">
              <Image
                src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1000&q=80"
                alt="Behind the scenes at The Blenders Club"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl font-semibold sm:text-4xl">A Premium Cloud Kitchen, Reimagined</h2>
            <p className="mt-4 text-tbc-cream-muted">
              What started as a pursuit of the perfect shake has grown into a brand built around
              quality, creativity, and an obsession with the customer experience. We&apos;re a
              delivery-only cloud kitchen — every drink on our menu is blended fresh to order the
              moment it&apos;s placed, never pre-made, never rushed, and sent straight to your door.
            </p>
            <p className="mt-4 text-tbc-cream-muted">
              Today, The Blenders Club serves signature shakes and cold coffees designed to feel
              indulgent yet effortless, whether you&apos;re ordering for yourself, catering an event, or
              exploring a franchise partnership with us.
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-20">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow="What We Stand For" title="Our Values" />
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.08}>
                <div className="h-full rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
                  <h3 className="font-heading text-lg font-semibold text-tbc-gold-400">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-tbc-cream-muted">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
