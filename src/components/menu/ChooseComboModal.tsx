'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import type { ChooseNCombo } from '@/data/combos';
import { menuItems } from '@/data/menu';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency, cn } from '@/lib/utils';

interface ChooseComboModalProps {
  combo: ChooseNCombo | null;
  onClose: () => void;
}

/**
 * Lets a customer pick N drinks to build a dynamic combo. The bundle is
 * added to the cart as a single synthetic line (id-prefixed `combo:`) at
 * the fixed combo price — per-drink customization isn't supported for
 * bundles in v1; customers who want that should add drinks individually.
 */
export function ChooseComboModal({ combo, onClose }: ChooseComboModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (combo) setSelectedIds([]);
  }, [combo]);

  if (!combo) return null;

  const eligibleItems = combo.eligibleCategory
    ? menuItems.filter((m) => m.category === combo.eligibleCategory)
    : menuItems;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= combo.chooseCount) return prev;
      return [...prev, id];
    });
  };

  const isComplete = selectedIds.length === combo.chooseCount;

  const handleConfirm = () => {
    if (!isComplete) return;
    const chosen = selectedIds.map((id) => menuItems.find((m) => m.id === id)!);
    const syntheticItem = {
      id: `combo:${combo.id}:${Date.now()}`,
      signatureName: `${combo.name} (${combo.chooseCount} drinks)`,
      commonName: chosen.map((c) => c.signatureName).join(' + '),
      description: combo.description,
      price: combo.comboPrice,
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
          aria-labelledby="combo-title"
          className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-tbc-charcoal shadow-premium sm:rounded-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-tbc-charcoal-border px-6 py-4">
            <div>
              <h2 id="combo-title" className="text-lg font-semibold">
                {combo.name}
              </h2>
              <p className="text-xs text-tbc-cream-dim">
                Select {combo.chooseCount} drinks — {selectedIds.length}/{combo.chooseCount} chosen
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
                const disabled = !selected && selectedIds.length >= combo.chooseCount;
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
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-tbc-gold-400 text-tbc-black">
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
            <span className="text-lg font-bold text-tbc-gold-400">{formatCurrency(combo.comboPrice)}</span>
            <Button variant="gold" disabled={!isComplete} onClick={handleConfirm}>
              Add Combo to Cart
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
