'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package } from 'lucide-react';
import { useOrderStore } from '@/lib/store/order-store';
import { useAuthStore } from '@/lib/store/auth-store';
import type { OrderStatus, PlacedOrder } from '@/types/order';

const ACTIVE_STATUSES: OrderStatus[] = ['received', 'preparing', 'out-for-delivery'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Order Received',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Hidden wherever an active-order chip would be redundant or in the way —
// the checkout/confirmation/rider flows already show live status themselves.
const HIDDEN_PREFIXES = ['/checkout', '/admin', '/rider', '/login', '/signup'];

/** A small floating chip so an in-flight order stays reachable from anywhere on the site, not just the confirmation page you land on right after placing it. */
export function ActiveOrderWidget() {
  const pathname = usePathname();
  const lastOrder = useOrderStore((s) => s.lastOrder);
  const authUser = useAuthStore((s) => s.user);
  const [activeOrders, setActiveOrders] = useState<PlacedOrder[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Logged-in: check the account's full order history for anything in flight —
      // covers orders placed on another device/session too, not just this browser's.
      if (authUser) {
        try {
          const res = await fetch('/api/orders');
          if (res.ok) {
            const body: { orders: PlacedOrder[] } = await res.json();
            if (!cancelled) {
              setActiveOrders(body.orders.filter((o) => ACTIVE_STATUSES.includes(o.status)));
            }
            return;
          }
        } catch {
          // fall through to the guest check below
        }
      }

      // Guest (or the fetch above failed): fall back to this browser's most
      // recent order, refreshed from the server rather than trusting the
      // possibly-stale sessionStorage copy.
      if (lastOrder && ACTIVE_STATUSES.includes(lastOrder.status)) {
        try {
          const res = await fetch(`/api/orders/${lastOrder.id}`);
          if (res.ok) {
            const body: { order: PlacedOrder } = await res.json();
            if (!cancelled && ACTIVE_STATUSES.includes(body.order.status)) {
              setActiveOrders([body.order]);
            } else if (!cancelled) {
              setActiveOrders([]);
            }
          }
        } catch {
          if (!cancelled) setActiveOrders([lastOrder]);
        }
      } else if (!cancelled) {
        setActiveOrders([]);
      }
    }

    load();
    const interval = setInterval(load, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [authUser, lastOrder]);

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (activeOrders.length === 0) return null;

  const only = activeOrders.length === 1 ? activeOrders[0] : undefined;
  const href = only ? `/checkout/confirmation?order=${only.id}` : '/account';
  const label = only ? STATUS_LABELS[only.status] : `${activeOrders.length} active orders`;

  return (
    <Link
      href={href}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-tbc-gold-400/40 bg-tbc-charcoal-light px-4 py-2.5 text-sm font-semibold text-tbc-cream shadow-premium backdrop-blur-sm transition-transform hover:scale-105"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tbc-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-tbc-emerald-500" />
      </span>
      <Package className="h-4 w-4 text-tbc-gold-400" aria-hidden="true" />
      {label}
    </Link>
  );
}
