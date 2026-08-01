'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import type { PlacedOrder, OrderStatus } from '@/types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'text-tbc-gold-400',
  preparing: 'text-amber-400',
  'out-for-delivery': 'text-tbc-emerald-400',
  delivered: 'text-tbc-emerald-400',
  cancelled: 'text-red-400',
};

export function AccountClient() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const [orders, setOrders] = useState<PlacedOrder[] | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { orders: PlacedOrder[] }) => setOrders(body.orders))
      .catch(() => setOrders([]));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    toast.success('Signed out.');
    router.push('/');
  };

  if (authStatus === 'guest') {
    // Middleware already redirects unauthenticated visits, but this covers the
    // moment right after a client-side logout before the redirect completes.
    return null;
  }

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">My Account</h1>
          {authUser && <p className="mt-1 text-tbc-cream-muted">{authUser.fullName}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out
        </Button>
      </div>

      {authUser && (
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 sm:grid-cols-3">
          <ProfileField label="Email" value={authUser.email} />
          <ProfileField label="Phone" value={authUser.phone} />
          <ProfileField
            label="Loyalty Tier"
            value={authUser.loyalty.isGoldMember || authUser.loyalty.completedOrderCount >= 5 ? 'Gold' : authUser.loyalty.completedOrderCount >= 1 ? 'Returning' : 'First Order'}
          />
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-semibold">Order History</h2>

      {orders === null ? (
        <p className="text-tbc-cream-muted">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light py-16 text-center">
          <Package className="h-8 w-8 text-tbc-cream-dim" aria-hidden="true" />
          <p className="text-tbc-cream-muted">No orders yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-tbc-cream-dim">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span className={cn('text-sm font-semibold', STATUS_COLORS[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              <p className="mt-3 text-sm text-tbc-cream-muted">
                {order.items.map((item) => `${item.signatureName} × ${item.quantity}`).join(', ')}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-tbc-charcoal-border pt-3 text-sm">
                <span className="text-tbc-cream-muted">
                  {order.payment.method === 'cod' ? 'Pay on Delivery' : `Paid Online`}
                  {order.payment.status === 'pending' && order.payment.method === 'razorpay' && ' (pending)'}
                  {order.payment.status === 'failed' && ' (failed)'}
                </span>
                <span className="font-bold text-tbc-gold-400">{formatCurrency(order.totals.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-tbc-cream-dim">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
