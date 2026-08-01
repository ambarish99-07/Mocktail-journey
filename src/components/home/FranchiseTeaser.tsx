'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, Users, ChefHat } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/ui/FadeIn';
import { buttonClasses } from '@/components/ui/Button';

const highlights = [
  { icon: ChefHat, label: 'Proven cloud kitchen format' },
  { icon: TrendingUp, label: 'Growing brand demand' },
  { icon: Users, label: 'Full operational support' },
];

export function FranchiseTeaser() {
  return (
    <section className="bg-tbc-charcoal/40 py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-xl2 border border-tbc-gold-400/20 bg-tbc-charcoal-light lg:grid-cols-2">
          <FadeIn className="order-2 p-8 sm:p-10 lg:order-1">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-tbc-gold-400">
              Franchise Opportunities
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Own a Blenders Club Cloud Kitchen</h2>
            <p className="mt-4 text-tbc-cream-muted">
              Join our growing network of delivery-only cloud kitchens. We provide the brand, the
              recipes, and the support — you bring the ambition.
            </p>
            <ul className="mt-5 space-y-2">
              {highlights.map((h) => (
                <li key={h.label} className="flex items-center gap-2 text-sm text-tbc-cream-muted">
                  <h.icon className="h-4 w-4 text-tbc-gold-400" aria-hidden="true" />
                  {h.label}
                </li>
              ))}
            </ul>
            <Link href="/franchise" className={`${buttonClasses('gold', 'lg')} mt-8`}>
              Franchise With Us
            </Link>
          </FadeIn>

          <div className="relative order-1 h-64 w-full lg:order-2 lg:h-full">
            <Image
              src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1000&q=80"
              alt="Behind the scenes at The Blenders Club"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
