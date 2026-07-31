'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import { ADD_ON_OPTIONS } from '@/types/menu';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { lineItemTotal } from '@/lib/pricing';

export function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  const addOnLabels = item.customization.addOnIds
    .map((id) => ADD_ON_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean);

  return (
    <li className="flex gap-3 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl2 bg-tbc-charcoal-light">
        <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium leading-tight text-tbc-cream">{item.signatureName}</p>
            <p className="text-xs text-tbc-cream-dim">{item.commonName}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.signatureName} from cart`}
            onClick={() => removeLine(item.lineId)}
            className="rounded-full p-1.5 text-tbc-cream-dim transition-colors hover:bg-tbc-charcoal-light hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-tbc-cream-dim">
          {item.customization.sugarLevel} sugar · {item.customization.iceLevel}
          {addOnLabels.length ? ` · ${addOnLabels.join(', ')}` : ''}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <QuantitySelector
            size="sm"
            quantity={item.quantity}
            onChange={(q) => updateQuantity(item.lineId, q)}
            label={`${item.signatureName} quantity`}
          />
          <span className="font-semibold text-tbc-gold-400">
            {formatCurrency(lineItemTotal(item))}
          </span>
        </div>
      </div>
    </li>
  );
}
