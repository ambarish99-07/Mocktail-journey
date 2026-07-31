'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { MenuItem } from '@/types/menu';
import { ADD_ON_OPTIONS, ICE_LEVELS, SUGAR_LEVELS } from '@/types/menu';
import type { CartCustomization } from '@/types/cart';
import { DEFAULT_CUSTOMIZATION } from '@/types/cart';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';

interface CustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

/** Full drink customization: sugar level, ice level, and premium add-ons — increases average order value. */
export function CustomizeModal({ item, onClose }: CustomizeModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CartCustomization>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setCustomization(DEFAULT_CUSTOMIZATION);
      closeButtonRef.current?.focus();
    }
  }, [item]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const addOnsTotal = customization.addOnIds.reduce((sum, id) => {
    const addOn = ADD_ON_OPTIONS.find((a) => a.id === id);
    return sum + (addOn?.price ?? 0);
  }, 0);
  const lineTotal = (item.price + addOnsTotal) * quantity;

  const toggleAddOn = (id: string) => {
    setCustomization((c) => ({
      ...c,
      addOnIds: c.addOnIds.includes(id) ? c.addOnIds.filter((a) => a !== id) : [...c.addOnIds, id],
    }));
  };

  const handleAddToCart = () => {
    addItem(item, quantity, customization);
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
          aria-labelledby="customize-title"
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-tbc-charcoal p-6 shadow-premium sm:rounded-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl2">
                <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <h2 id="customize-title" className="text-lg font-semibold">
                  {item.signatureName}
                </h2>
                <p className="text-xs text-tbc-cream-dim">{item.commonName}</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close customization"
              onClick={onClose}
              className="rounded-full p-1.5 text-tbc-cream-muted hover:bg-tbc-charcoal-light"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <fieldset className="mb-5">
            <legend className="mb-2 text-sm font-semibold text-tbc-gold-400">Sugar Level</legend>
            <div className="flex flex-wrap gap-2">
              {SUGAR_LEVELS.map((level) => (
                <ChoiceChip
                  key={level}
                  label={level}
                  selected={customization.sugarLevel === level}
                  onClick={() => setCustomization((c) => ({ ...c, sugarLevel: level }))}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-5">
            <legend className="mb-2 text-sm font-semibold text-tbc-gold-400">Ice Level</legend>
            <div className="flex flex-wrap gap-2">
              {ICE_LEVELS.map((level) => (
                <ChoiceChip
                  key={level}
                  label={level}
                  selected={customization.iceLevel === level}
                  onClick={() => setCustomization((c) => ({ ...c, iceLevel: level }))}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-semibold text-tbc-gold-400">
              Premium Add-ons
            </legend>
            <div className="space-y-2">
              {ADD_ON_OPTIONS.map((addOn) => (
                <label
                  key={addOn.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl2 border border-tbc-charcoal-border px-3 py-2.5 text-sm hover:border-tbc-gold-400/40"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customization.addOnIds.includes(addOn.id)}
                      onChange={() => toggleAddOn(addOn.id)}
                      className="h-4 w-4 rounded border-tbc-charcoal-border accent-tbc-gold-400"
                    />
                    {addOn.label}
                  </span>
                  <span className="text-tbc-cream-dim">+{formatCurrency(addOn.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <span className="text-lg font-bold text-tbc-gold-400">{formatCurrency(lineTotal)}</span>
          </div>

          <Button variant="gold" size="lg" className="mt-5 w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? 'border-tbc-gold-400 bg-tbc-gold-400 text-tbc-black'
          : 'border-tbc-charcoal-border text-tbc-cream-muted hover:border-tbc-gold-400/50'
      }`}
    >
      {label}
    </button>
  );
}
