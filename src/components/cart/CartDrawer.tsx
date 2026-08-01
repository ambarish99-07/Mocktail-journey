'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { computeOrderTotals } from '@/lib/pricing';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { RecommendedAddOns } from '@/components/cart/RecommendedAddOns';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeDrawer]);

  const totals = computeOrderTotals(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-tbc-charcoal shadow-premium"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex items-center justify-between border-b border-tbc-charcoal-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingCart className="h-5 w-5 text-tbc-gold-400" aria-hidden="true" />
                Your Cart
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close cart"
                onClick={closeDrawer}
                className="rounded-full p-2 text-tbc-cream-muted transition-colors hover:bg-tbc-charcoal-light"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                  <ShoppingCart className="h-10 w-10 text-tbc-cream-dim" aria-hidden="true" />
                  <p className="text-tbc-cream-muted">Your cart is empty.</p>
                  <Link href="/menu" className={buttonClasses('gold', 'sm')} onClick={closeDrawer}>
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-tbc-charcoal-border">
                    {items.map((item) => (
                      <CartLineItem key={item.lineId} item={item} />
                    ))}
                  </ul>
                  <div className="pb-4 pt-2">
                    <RecommendedAddOns />
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-tbc-charcoal-border px-5 py-5">
                <CartSummary totals={totals} showSavedBanner={false} className="mb-4" />
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className={cn(buttonClasses('gold', 'lg'), 'w-full')}
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
