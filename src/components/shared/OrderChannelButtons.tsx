'use client';

import Link from 'next/link';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ZomatoIcon, SwiggyIcon } from '@/components/icons/BrandIcons';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { openSwiggy, openZomato } from '@/lib/order-links';
import { cn } from '@/lib/utils';

interface OrderChannelButtonsProps {
  className?: string;
  /** Compact mode drops labels down to icon-only on small screens — used in the sticky nav. */
  compact?: boolean;
}

/**
 * The four ordering entry points used across the site (hero, nav, footer).
 * "Order Directly" is always visually primary per brand direction — it must
 * out-weigh WhatsApp/Zomato/Swiggy in every placement.
 */
export function OrderChannelButtons({ className, compact = false }: OrderChannelButtonsProps) {
  const genericWhatsAppLink = buildWhatsAppLink(
    "Hi! I'd like to place an order with The Blenders Club."
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Link
        href="/menu"
        className={cn(buttonClasses('gold', compact ? 'sm' : 'lg'), 'order-1')}
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        Order Directly
      </Link>

      <Button
        variant="whatsapp"
        size={compact ? 'sm' : 'md'}
        className="order-2"
        onClick={() => window.open(genericWhatsAppLink, '_blank', 'noopener,noreferrer')}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        WhatsApp
      </Button>

      <Button variant="zomato" size={compact ? 'sm' : 'md'} className="order-3" onClick={openZomato}>
        <ZomatoIcon className="h-5 w-5" aria-hidden="true" />
        Zomato
      </Button>

      <Button variant="swiggy" size={compact ? 'sm' : 'md'} className="order-4" onClick={openSwiggy}>
        <SwiggyIcon className="h-5 w-5" aria-hidden="true" />
        Swiggy
      </Button>
    </div>
  );
}
