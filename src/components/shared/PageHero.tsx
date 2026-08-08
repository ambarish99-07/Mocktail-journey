import { Container } from '@/components/ui/Container';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-tbc-cream/5 bg-tbc-charcoal/40 py-16 sm:py-20">
      <Container>
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-tbc-gold-400">
          {eyebrow}
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-xl text-tbc-cream-muted sm:text-lg">{description}</p>
        )}
      </Container>
    </section>
  );
}
