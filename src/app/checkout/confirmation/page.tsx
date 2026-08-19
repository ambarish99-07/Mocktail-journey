'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { buttonClasses } from '@/components/ui/Button';
import { CartSummary } from '@/components/cart/CartSummary';
import { DeliveryTrackingSection } from '@/components/checkout/DeliveryTrackingSection';
import { useOrderStore } from '@/lib/store/order-store';
import type { PlacedOrder } from '@/types/order';

const TRACKING_POLL_MS = 12000;

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastOrder = useOrderStore((s) => s.lastOrder);
  const setLastOrder = useOrderStore((s) => s.setLastOrder);
  const [fetchFailed, setFetchFailed] = useState(false);

  const orderId = searchParams.get('order') ?? lastOrder?.id ?? null;

  useEffect(() => {
    if (!orderId) {
      // No cached order and nothing to look up by — nothing to show.
      if (!lastOrder) router.replace('/');
      return;
    }

    // Cached sessionStorage data (from right after checkout, or from a
    // browser tab open since before this order last changed) is only ever
    // used for the instant first paint — it can be stale the moment a live
    // order's status or rider updates, or even structurally out of date if
    // it was cached before a field like statusHistory existed. So this
    // always re-fetches the authoritative version immediately, then keeps
    // polling while the order is still moving. Stops once it's in a final
    // state — no point hammering the endpoint for an order that will never
    // change again.
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refresh = () =>
      fetch(`/api/orders/${orderId}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((body: { order: PlacedOrder }) => {
          if (cancelled) return;
          setLastOrder(body.order);
          if (body.order.status === 'delivered' || body.order.status === 'cancelled') {
            clearInterval(interval);
          }
        })
        .catch(() => {
          // If we have nothing cached at all, this is a real failure (bad/expired
          // link) — bounce home. Otherwise it's a transient hiccup; keep showing
          // what we have and let the next poll tick retry.
          if (!cancelled && !lastOrder) setFetchFailed(true);
        });

    refresh();
    interval = setInterval(refresh, TRACKING_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Deliberately keyed on orderId alone — this effect owns its own refresh
    // cycle and shouldn't restart every time setLastOrder fires from within it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (fetchFailed) router.replace('/');
  }, [fetchFailed, router]);

  if (!lastOrder) return null;

  return (
    <Container className="flex flex-col items-center py-20 text-center">
      <CheckCircle2 className="h-14 w-14 text-tbc-emerald-400" aria-hidden="true" />
      <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Order Confirmed!</h1>
      <p className="mt-2 max-w-md text-tbc-cream-muted">
        Thank you for ordering directly from The Blenders Club. Your order has been received and
        our kitchen has been notified — it will be freshly blended and delivered to your door.
      </p>

      <div className="mt-8 w-full max-w-2xl text-left">
        <DeliveryTrackingSection order={lastOrder} onNoteSaved={(note) => setLastOrder({ ...lastOrder, delivery: { ...lastOrder.delivery, specialInstructions: note || undefined } })} />

        <div className="mt-6 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tbc-cream-muted">Order ID</span>
            <span className="font-semibold">{lastOrder.orderNumber}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-tbc-cream-muted">Estimated Delivery Time</span>
            <span className="font-semibold">{lastOrder.estimatedMinutes} minutes</span>
          </div>

          <div className="mt-3 border-t border-tbc-charcoal-border pt-3 text-sm text-tbc-cream-muted">
            <p>{lastOrder.delivery.fullName}</p>
            <p>
              {lastOrder.delivery.address}, {lastOrder.delivery.city} - {lastOrder.delivery.pincode}
            </p>
            <p>{lastOrder.delivery.phone}</p>
          </div>

          <div className="mt-4 border-t border-tbc-charcoal-border pt-4">
            <CartSummary totals={lastOrder.totals} showSavedBanner={false} />
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-tbc-cream-dim">
        Save your Order ID for reference. Signed-in customers can also view order history under{' '}
        <Link href="/account" className="text-tbc-gold-400 hover:underline">
          My Account
        </Link>
        .
      </p>

      <Link href="/menu" className={`${buttonClasses('gold', 'lg')} mt-8`}>
        Order More
      </Link>
    </Container>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
