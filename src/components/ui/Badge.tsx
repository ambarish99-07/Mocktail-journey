import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { FlavorBadge } from '@/types/menu';

const flavorColors: Record<FlavorBadge, string> = {
  'Chocolate Lover': 'bg-[#4A2E1E]/60 text-[#E8C7A5] border-[#8A5A34]/50',
  Fruity: 'bg-tbc-emerald-900/60 text-tbc-emerald-200 border-tbc-emerald-700/50',
  Classic: 'bg-tbc-charcoal-light text-tbc-cream-muted border-tbc-charcoal-border',
  Nutty: 'bg-[#3D2E15]/60 text-tbc-gold-200 border-tbc-gold-700/50',
  'Coffee Favorite': 'bg-[#2B1E16]/60 text-[#D9B48F] border-[#6B4A32]/50',
};

interface FlavorBadgePillProps extends HTMLAttributes<HTMLSpanElement> {
  flavor: FlavorBadge;
}

export function FlavorBadgePill({ flavor, className, ...props }: FlavorBadgePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        flavorColors[flavor],
        className
      )}
      {...props}
    >
      {flavor}
    </span>
  );
}

export function Tag({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-tbc-gold-400 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-black',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
