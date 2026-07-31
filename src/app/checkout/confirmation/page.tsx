'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { buttonClasses } from '@/components/ui/Button';
import { CartSummary } from '@/components/cart/CartSummary';
import { useOrderStore } from '@/lib/store/order-store';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const lastOrder = useOrderStore((s) => s.lastOrder);

  useEffect(() => {
    if (!lastOrder) router.replace('/');
  }, [lastOrder, router]);

  if (!lastOrder) return null;

  return (
    <Container className="flex flex-col items-center py-20 text-center">
      <CheckCircle2 className="h-14 w-14 text-tbc-emerald-400" aria-hidden="true" />
      <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Order Confirmed!</h1>
      <p className="mt-2 max-w-md text-tbc-cream-muted">
        Thank you for ordering directly from The Blenders Club. Your order has been received and
        the restaurant has been notified.
      </p>

      <div className="mt-8 w-full max-w-md rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="text-tbc-cream-muted">Order ID</span>
          <span className="font-semibold">{lastOrder.id}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-tbc-cream-muted">Fulfilment</span>
          <span className="font-semibold capitalize">{lastOrder.fulfilment}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-tbc-cream-muted">Estimated Time</span>
          <span className="font-semibold">{lastOrder.estimatedMinutes} minutes</span>
        </div>

        {lastOrder.delivery && (
          <div className="mt-3 border-t border-tbc-charcoal-border pt-3 text-sm text-tbc-cream-muted">
            <p>{lastOrder.delivery.fullName}</p>
            <p>{lastOrder.delivery.address}, {lastOrder.delivery.city} - {lastOrder.delivery.pincode}</p>
            <p>{lastOrder.delivery.phone}</p>
          </div>
        )}

        <div className="mt-4 border-t border-tbc-charcoal-border pt-4">
          <CartSummary totals={lastOrder.totals} showSavedBanner={false} />
        </div>
      </div>

      <p className="mt-6 text-xs text-tbc-cream-dim">
        Order history, live tracking, and account sign-in are coming soon — save your Order ID for
        reference.
      </p>

      <Link href="/menu" className={`${buttonClasses('gold', 'lg')} mt-8`}>
        Order More
      </Link>
    </Container>
  );
}
