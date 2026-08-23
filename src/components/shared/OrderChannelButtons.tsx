'use client';

import Link from 'next/link';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface OrderChannelButtonsProps {
  className?: string;
  /** Compact mode drops labels down to icon-only on small screens — used in the sticky nav. */
  compact?: boolean;
}

/**
 * The two ordering entry points used across the site (hero, nav, footer).
 * "Order Directly" is always visually primary per brand direction — it must
 * out-weigh WhatsApp in every placement.
 */
export function OrderChannelButtons({ className, compact = false }: OrderChannelButtonsProps) {
  const genericWhatsAppLink = buildWhatsAppLink(
    "Hi! I'd like to place an order with The Blenders Club."
  );

  // Both modes render at Button's smallest built-in size ('sm') as the
  // mobile-first base — the fixed 'lg'/'md' sizes read oversized on phones
  // (buttons wrapping into a bulky stack). Non-compact then grows back
  // up to its original larger look via `sm:`-prefixed classes, which only
  // take effect at the sm breakpoint and up and so never conflict with the
  // unprefixed base. Compact stays small at every breakpoint.
  const primaryResponsive = compact ? '' : 'sm:px-8 sm:py-4 sm:text-lg sm:gap-2.5';
  const secondaryResponsive = compact ? '' : 'sm:px-6 sm:py-3 sm:text-base sm:gap-2';
  const iconClass = compact ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5';

  return (
    <div className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      <Link href="/menu" className={cn(buttonClasses('gold', 'sm'), primaryResponsive)}>
        <ShoppingBag className={iconClass} aria-hidden="true" />
        Order Directly
      </Link>

      <Button
        variant="whatsapp"
        size="sm"
        className={secondaryResponsive}
        onClick={() => window.open(genericWhatsAppLink, '_blank', 'noopener,noreferrer')}
      >
        <MessageCircle className={iconClass} aria-hidden="true" />
        WhatsApp
      </Button>
    </div>
  );
}
