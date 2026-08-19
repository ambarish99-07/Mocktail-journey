import { Phone, MessageCircle, Bike } from 'lucide-react';
import type { SafeRiderInfo } from '@/types/order';
import { isRiderLive } from '@/lib/rider-tracking';
import { cn } from '@/lib/utils';

interface RiderContactCardProps {
  rider: SafeRiderInfo | null;
}

export function RiderContactCard({ rider }: RiderContactCardProps) {
  if (!rider) {
    return (
      <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5 text-sm text-tbc-cream-muted">
        A delivery rider will be assigned once your order is out for delivery.
      </div>
    );
  }

  const live = isRiderLive(rider);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/10 text-tbc-gold-400">
          <Bike className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold">{rider.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-tbc-cream-dim">
            <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-tbc-emerald-400' : 'bg-tbc-cream-dim')} aria-hidden="true" />
            {live ? 'Live location sharing' : 'Your delivery rider'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={`tel:${rider.phone}`}
          aria-label={`Call ${rider.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:bg-tbc-charcoal-border"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href={`sms:${rider.phone}`}
          aria-label={`Text ${rider.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:bg-tbc-charcoal-border"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
