'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, SlidersHorizontal } from 'lucide-react';
import type { MenuItem } from '@/types/menu';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { FlavorBadgePill, Tag } from '@/components/ui/Badge';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency, cn } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

export function MenuCard({ item, onCustomize }: MenuCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useCartStore((s) => s.favoriteIds.includes(item.id));
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);

  const badge = item.isPopular ? 'Popular' : item.isNew ? 'New' : item.isStaffPick ? 'Staff Pick' : null;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image}
          alt={`${item.signatureName} — ${item.commonName}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {badge && (
          <Tag className="absolute left-3 top-3">{badge}</Tag>
        )}
        <button
          type="button"
          aria-label={isFavorite ? `Remove ${item.signatureName} from favourites` : `Add ${item.signatureName} to favourites`}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(item.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <Heart
            className={cn('h-4 w-4', isFavorite && 'fill-tbc-gold-400 text-tbc-gold-400')}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {item.flavorBadges.map((flavor) => (
            <FlavorBadgePill key={flavor} flavor={flavor} />
          ))}
        </div>

        <h3 className="font-heading text-lg font-semibold leading-tight">{item.signatureName}</h3>
        <p className="text-xs text-tbc-cream-dim">{item.commonName}</p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-tbc-cream-muted">{item.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-tbc-gold-400">{formatCurrency(item.price)}</span>
          <button
            type="button"
            onClick={() => onCustomize(item)}
            className="flex items-center gap-1 text-xs font-medium text-tbc-cream-muted underline-offset-2 hover:text-tbc-gold-400 hover:underline"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Customize
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <QuantitySelector
            size="sm"
            quantity={quantity}
            onChange={setQuantity}
            label={`${item.signatureName} quantity`}
            className="w-full justify-center"
          />
          <Button
            variant="emerald"
            size="sm"
            className="w-full"
            onClick={() => addItem(item, quantity, DEFAULT_CUSTOMIZATION)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
