'use client';

import { Bike, Store } from 'lucide-react';
import type { FulfilmentType } from '@/types/order';
import { cn } from '@/lib/utils';

interface FulfilmentToggleProps {
  value: FulfilmentType;
  onChange: (value: FulfilmentType) => void;
}

export function FulfilmentToggle({ value, onChange }: FulfilmentToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Delivery or pickup"
      className="grid grid-cols-2 gap-3"
    >
      {(
        [
          { type: 'delivery' as const, label: 'Delivery', icon: Bike },
          { type: 'pickup' as const, label: 'Pickup', icon: Store },
        ]
      ).map((opt) => (
        <button
          key={opt.type}
          type="button"
          role="radio"
          aria-checked={value === opt.type}
          onClick={() => onChange(opt.type)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl2 border px-4 py-3 text-sm font-medium transition-colors',
            value === opt.type
              ? 'border-tbc-gold-400 bg-tbc-gold-400/10 text-tbc-gold-400'
              : 'border-tbc-charcoal-border text-tbc-cream-muted hover:border-tbc-gold-400/40'
          )}
        >
          <opt.icon className="h-4 w-4" aria-hidden="true" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
