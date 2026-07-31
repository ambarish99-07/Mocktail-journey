'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
  label = 'Quantity',
  className,
}: QuantitySelectorProps) {
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-full border border-tbc-charcoal-border bg-tbc-charcoal-light',
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className={cn(
          dims,
          'flex items-center justify-center rounded-full text-tbc-cream transition-colors hover:bg-tbc-charcoal-border disabled:opacity-30'
        )}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className={cn(
          dims,
          'flex items-center justify-center rounded-full text-tbc-cream transition-colors hover:bg-tbc-charcoal-border disabled:opacity-30'
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
