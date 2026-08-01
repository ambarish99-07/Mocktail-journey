'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { Button } from '@/components/ui/Button';
import { ChooseComboModal } from '@/components/menu/ChooseComboModal';
import { fixedCombos, chooseNCombos } from '@/data/combos';
import type { ChooseNCombo } from '@/data/combos';
import { getMenuItemById } from '@/data/menu';
import { useCartStore } from '@/lib/store/cart-store';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';

export function ComboOffers() {
  const addItem = useCartStore((s) => s.addItem);
  const [buildingCombo, setBuildingCombo] = useState<ChooseNCombo | null>(null);

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
                <div className="grid h-40 w-full grid-cols-2 gap-0.5">
                  {combo.itemIds.map((itemId) => {
                    const item = getMenuItemById(itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="relative h-full w-full">
                        <Image src={item.image} alt={item.signatureName} fill sizes="200px" className="object-cover" />
                      </div>
                    );
                  })}
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

          {chooseNCombos.map((combo, i) => (
            <FadeIn key={combo.id} delay={(fixedCombos.length + i) * 0.08}>
              <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-5">
                <h3 className="font-heading text-lg font-semibold">{combo.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-tbc-cream-muted">{combo.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-tbc-gold-400">
                    {formatCurrency(combo.comboPrice)}
                  </span>
                  <Button variant="gold" size="sm" onClick={() => setBuildingCombo(combo)}>
                    Build Combo
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>

      <ChooseComboModal combo={buildingCombo} onClose={() => setBuildingCombo(null)} />
    </section>
  );
}
