'use client';

import { useEffect, useState } from 'react';
import { AlarmClock } from 'lucide-react';

interface StoreStatusResponse {
  isOpen: boolean;
  opensAtLabel: string;
  reason?: 'manually-closed' | 'outside-hours';
}

/**
 * Shown on the Menu and Checkout pages. Purely informational — the
 * authoritative block is server-side in POST /api/orders, so this never being
 * able to fetch (or being stale for a few minutes) never lets an order
 * through it shouldn't; it only ever risks under-warning, not under-blocking.
 */
export function StoreClosedBanner() {
  const [status, setStatus] = useState<StoreStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      fetch('/api/store-status')
        .then((res) => (res.ok ? res.json() : null))
        .then((body: StoreStatusResponse | null) => {
          if (!cancelled && body) setStatus(body);
        })
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!status || status.isOpen) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
      <AlarmClock className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>
        {status.reason === 'manually-closed'
          ? 'We’re temporarily not accepting orders right now. You can still browse the menu — please check back shortly.'
          : `We're closed right now — you can browse and add to cart, but ordering opens again at ${status.opensAtLabel}.`}
      </span>
    </div>
  );
}
