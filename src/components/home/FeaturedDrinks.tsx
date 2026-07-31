'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/ui/FadeIn';
import { menuItems } from '@/data/menu';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';

const featured = menuItems.filter((item) => item.isPopular).slice(0, 4);

export function FeaturedDrinks() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Fan Favourites"
            title="Featured Drinks"
            description="The shakes and cold coffees our customers order again and again."
          />
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-xl2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl2">
                  <Image
                    src={item.image}
                    alt={`${item.signatureName} — ${item.commonName}`}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tbc-black via-tbc-black/20 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-heading text-base font-semibold sm:text-lg">
                    {item.signatureName}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-tbc-gold-400">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add ${item.signatureName} to cart`}
                      onClick={() => addItem(item, 1, DEFAULT_CUSTOMIZATION)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-tbc-gold-400 text-tbc-black transition-transform hover:scale-110"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
