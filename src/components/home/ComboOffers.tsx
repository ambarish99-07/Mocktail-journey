'use client';

import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { Button } from '@/components/ui/Button';
import { fixedCombos } from '@/data/combos';
import { getMenuItemById } from '@/data/menu';
import { useCartStore } from '@/lib/store/cart-store';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';

export function ComboOffers() {
  const addItem = useCartStore((s) => s.addItem);

  const addComboToCart = (itemIds: string[]) => {
    itemIds.forEach((id) => {
      const menuItem = getMenuItemById(id);
      if (menuItem) addItem(menuItem, 1, DEFAULT_CUSTOMIZATION);
    });
  };

  return (
    <section className="bg-tbc-charcoal/40 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Better Together"
            title="Combo Offers"
            description="Curated pairings at a bundled price — or build your own with Choose Any Two, Four, or Six."
          />
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fixedCombos.map((combo, i) => (
            <FadeIn key={combo.id} delay={i * 0.08}>
              <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light">
                <div className="relative h-40 w-full">
                  <Image src={combo.image} alt={combo.name} fill sizes="400px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-semibold">{combo.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-tbc-cream-muted">{combo.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-tbc-gold-400">
                      {formatCurrency(combo.comboPrice)}
                    </span>
                    <Button variant="emerald" size="sm" onClick={() => addComboToCart(combo.itemIds)}>
                      Add Combo
                    </Button>
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
