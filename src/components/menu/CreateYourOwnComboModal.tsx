'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { buildYourOwnCombo } from '@/data/combos';
import { menuItems } from '@/data/menu';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency, cn } from '@/lib/utils';

interface CreateYourOwnComboModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Lets a customer pick 2 drinks to build their own combo. Added to the cart
 * as a single synthetic line (id-prefixed `combo:custom:`) at the flat
 * bundle price — the server re-validates and re-prices this against
 * buildYourOwnCombo regardless of which items are named in the display text
 * (the price doesn't depend on the exact selection, see order-revalidation.ts).
 */
export function CreateYourOwnComboModal({ open, onClose }: CreateYourOwnComboModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelectedIds([]);
  }, [open]);

  if (!open) return null;

  const eligibleItems = buildYourOwnCombo.eligibleCategory
    ? menuItems.filter((m) => m.category === buildYourOwnCombo.eligibleCategory)
    : menuItems;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= buildYourOwnCombo.chooseCount) return prev;
      return [...prev, id];
    });
  };

  const isComplete = selectedIds.length === buildYourOwnCombo.chooseCount;

  const handleConfirm = () => {
    if (!isComplete) return;
    const chosen = selectedIds.map((id) => menuItems.find((m) => m.id === id)!);
    const syntheticItem = {
      id: `combo:custom:${Date.now()}`,
      signatureName: buildYourOwnCombo.name,
      commonName: chosen.map((c) => c.signatureName).join(' + '),
      description: buildYourOwnCombo.description,
      price: buildYourOwnCombo.comboPrice,
      category: chosen[0]?.category ?? 'signature-shakes',
      image: chosen[0]?.image ?? '',
      flavorBadges: [],
    };
    addItem(syntheticItem, 1, DEFAULT_CUSTOMIZATION);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-combo-title"
          className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-tbc-charcoal shadow-premium sm:rounded-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-tbc-charcoal-border px-6 py-4">
            <div>
              <h2 id="custom-combo-title" className="text-lg font-semibold">
                {buildYourOwnCombo.name}
              </h2>
              <p className="text-xs text-tbc-cream-dim">
                Select {buildYourOwnCombo.chooseCount} drinks — {selectedIds.length}/{buildYourOwnCombo.chooseCount} chosen
              </p>
            </div>
            <button
              type="button"
              aria-label="Close combo builder"
              onClick={onClose}
              className="rounded-full p-1.5 text-tbc-cream-muted hover:bg-tbc-charcoal-light"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {eligibleItems.map((item) => {
                const selected = selectedIds.includes(item.id);
                const disabled = !selected && selectedIds.length >= buildYourOwnCombo.chooseCount;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      'relative overflow-hidden rounded-xl2 border text-left transition-colors disabled:opacity-40',
                      selected ? 'border-tbc-gold-400' : 'border-tbc-charcoal-border hover:border-tbc-gold-400/40'
                    )}
                  >
                    <div className="relative aspect-square">
                      <Image src={item.image} alt="" fill sizes="150px" className="object-cover" />
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-tbc-gold-400 text-black">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <p className="px-2 py-2 text-xs font-medium leading-tight">{item.signatureName}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-tbc-charcoal-border px-6 py-4">
            <span className="text-lg font-bold text-tbc-gold-400">{formatCurrency(buildYourOwnCombo.comboPrice)}</span>
            <Button variant="gold" disabled={!isComplete} onClick={handleConfirm}>
              Add Combo to Cart
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
