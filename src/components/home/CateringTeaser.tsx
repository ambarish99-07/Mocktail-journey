'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/ui/FadeIn';
import { buttonClasses } from '@/components/ui/Button';

const occasions = [
  'Birthday Parties',
  'Weddings',
  'Corporate Events',
  'School & College Events',
  'House Parties',
  'Festivals',
];

export function CateringTeaser() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light lg:grid-cols-2">
          <div className="relative h-64 w-full lg:h-full">
            <Image
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1000&q=80"
              alt="Catering setup with premium shakes at an event"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <FadeIn className="p-8 sm:p-10">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-tbc-gold-400">
              Catering Services
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Bring The Blenders Club To Your Event</h2>
            <p className="mt-4 text-tbc-cream-muted">
              From intimate house parties to large corporate events, our catering team crafts a
              premium shake and cold coffee experience your guests will remember.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {occasions.map((occasion) => (
                <li
                  key={occasion}
                  className="rounded-full border border-tbc-charcoal-border px-3 py-1 text-xs text-tbc-cream-muted"
                >
                  {occasion}
                </li>
              ))}
            </ul>
            <Link href="/catering" className={`${buttonClasses('outline', 'lg')} mt-8`}>
              Explore Catering
            </Link>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
