'use client';

import { useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { MenuFilters } from '@/components/menu/MenuFilters';
import type { CategoryFilter, SortOption } from '@/components/menu/MenuFilters';
import { MenuCard } from '@/components/menu/MenuCard';
import { CustomizeModal } from '@/components/menu/CustomizeModal';
import { CreateYourOwnComboModal } from '@/components/menu/CreateYourOwnComboModal';
import { FadeIn } from '@/components/ui/FadeIn';
import { menuItems, getMenuItemById } from '@/data/menu';
import { fixedCombos, buildYourOwnCombo } from '@/data/combos';
import { useCartStore } from '@/lib/store/cart-store';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import type { MenuItem } from '@/types/menu';

export function MenuPageClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('popularity');
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [buildingCombo, setBuildingCombo] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const filtered = useMemo(() => {
    let list = menuItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.signatureName.toLowerCase().includes(search.toLowerCase()) ||
        item.commonName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'popularity':
        default:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
    });

    return list;
  }, [search, category, sort]);

  const staffPicks = menuItems.filter((m) => m.isStaffPick);
  const trending = menuItems.filter((m) => m.isPopular);

  // Added as ONE synthetic line at the combo's bundle price (not each real
  // item at full price) — see order-revalidation.ts for the server-side match.
  const addComboToCart = (combo: (typeof fixedCombos)[number]) => {
    const items = combo.itemIds.map((id) => getMenuItemById(id)).filter((i): i is MenuItem => Boolean(i));
    const first = items[0];
    if (!first) return;
    addItem(
      {
        id: `combo:fixed:${combo.id}`,
        signatureName: combo.name,
        commonName: items.map((i) => i.signatureName).join(' + '),
        description: combo.description,
        price: combo.comboPrice,
        category: first.category,
        image: first.image,
        flavorBadges: [],
      },
      1,
      DEFAULT_CUSTOMIZATION
    );
  };

  return (
    <>
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Our Menu"
            title="Signature Shakes & Cold Coffee"
            description="One consistent price across our website, Zomato, and Swiggy — order directly for an automatic discount."
            align="left"
            className="mx-0"
          />

          {(staffPicks.length > 0 || trending.length > 0) && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <RecommendationStrip title="Staff Picks" items={staffPicks} />
              <RecommendationStrip title="Trending Today" items={trending} />
            </div>
          )}

          <div className="mt-10">
            <MenuFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-tbc-cream-muted">
              No drinks match your search. Try a different keyword or category.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {filtered.map((item, i) => (
                <FadeIn key={item.id} delay={(i % 4) * 0.05} className="h-full">
                  <MenuCard item={item} onCustomize={setCustomizing} />
                </FadeIn>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-tbc-charcoal/40 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Better Together"
            title="Combo Offers"
            description="Curated two-shake pairings at a bundled price."
            align="left"
            className="mx-0"
          />

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fixedCombos.map((combo) => (
              <div
                key={combo.id}
                className="flex flex-col overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light"
              >
                <div className="grid h-36 w-full grid-cols-2 gap-0.5">
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
                    <Button variant="emerald" size="sm" onClick={() => addComboToCart(combo)}>
                      Add Combo
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col overflow-hidden rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-5">
              <h3 className="font-heading text-lg font-semibold">{buildYourOwnCombo.name}</h3>
              <p className="mt-1.5 flex-1 text-sm text-tbc-cream-muted">{buildYourOwnCombo.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-tbc-gold-400">
                  {formatCurrency(buildYourOwnCombo.comboPrice)}
                </span>
                <Button variant="gold" size="sm" onClick={() => setBuildingCombo(true)}>
                  Build Combo
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CustomizeModal item={customizing} onClose={() => setCustomizing(null)} />
      <CreateYourOwnComboModal open={buildingCombo} onClose={() => setBuildingCombo(false)} />
    </>
  );
}

function RecommendationStrip({ title, items }: { title: string; items: MenuItem[] }) {
  const addItem = useCartStore((s) => s.addItem);
  if (!items.length) return null;

  return (
    <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tbc-gold-400">{title}</p>
      <ul className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={item.id} className="flex w-32 shrink-0 flex-col gap-1.5">
            <div className="relative aspect-square overflow-hidden rounded-xl2">
              <Image src={item.image} alt="" fill sizes="128px" className="object-cover" />
            </div>
            <p className="line-clamp-1 text-xs font-medium">{item.signatureName}</p>
            <button
              type="button"
              onClick={() => addItem(item, 1, DEFAULT_CUSTOMIZATION)}
              className="rounded-full bg-tbc-gold-400 py-1 text-[11px] font-semibold text-black"
            >
              Quick Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
