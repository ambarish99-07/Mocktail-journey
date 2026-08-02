'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order';
import type { OrderStatusEvent } from '@/types/db';

interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  delivery: { fullName: string; phone: string; address: string; city: string; pincode: string };
  items: { signatureName: string; quantity: number }[];
  totals: { total: number };
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  payment: { method: PaymentMethod; status: PaymentStatus };
  isGuest: boolean;
  recommendationSentAt?: string;
}

const STATUS_FLOW: OrderStatus[] = ['received', 'preparing', 'out-for-delivery', 'delivered'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Received',
  preparing: 'Preparing',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const POLL_INTERVAL_MS = 20000;

export function AdminOrdersTable() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [recommendingId, setRecommendingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const url = statusFilter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${statusFilter}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const body = await res.json();
    setOrders(body.orders);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceStatus = async (order: AdminOrder, nextStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        toast.error('Could not update order status.');
        return;
      }
      toast.success(`${order.orderNumber} marked ${STATUS_LABELS[nextStatus]}.`);
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const sendRecommendation = async (order: AdminOrder) => {
    setRecommendingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/recommend`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not send recommendation.');
        return;
      }
      const names = (body.items as { signatureName: string }[]).map((i) => i.signatureName).join(', ');
      toast.success(`Sent ${order.delivery.fullName} a recommendation: ${names}.`);
      fetchOrders();
    } finally {
      setRecommendingId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', ...STATUS_FLOW, 'cancelled'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === status
                  ? 'border-tbc-gold-400 bg-tbc-gold-400/10 text-tbc-gold-400'
                  : 'border-tbc-charcoal-border text-tbc-cream-muted hover:border-tbc-gold-400/40'
              )}
            >
              {status === 'all' ? 'All' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => fetchOrders()}
          className="flex items-center gap-1.5 text-xs font-medium text-tbc-cream-muted hover:text-tbc-gold-400"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {orders === null ? (
        <p className="text-tbc-cream-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light py-12 text-center text-tbc-cream-muted">
          No orders in this view.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
            return (
              <li key={order.id} className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {order.orderNumber} {order.isGuest && <span className="ml-1 text-xs text-tbc-cream-dim">(guest)</span>}
                    </p>
                    <p className="text-xs text-tbc-cream-dim">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="mt-1 text-sm text-tbc-cream-muted">
                      {order.delivery.fullName} · {order.delivery.phone}
                    </p>
                    <p className="text-xs text-tbc-cream-dim">
                      {order.delivery.address}, {order.delivery.city} - {order.delivery.pincode}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-tbc-gold-400">{formatCurrency(order.totals.total)}</span>
                    <span className="text-xs text-tbc-cream-dim">
                      {order.payment.method === 'cod' ? 'COD' : `Razorpay (${order.payment.status})`}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-tbc-cream-muted">
                  {order.items.map((item) => `${item.signatureName} × ${item.quantity}`).join(', ')}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-tbc-charcoal-border pt-3">
                  <div>
                    <span className="text-sm font-semibold">{STATUS_LABELS[order.status]}</span>
                    {order.recommendationSentAt && (
                      <span className="ml-2 text-xs text-tbc-cream-dim">
                        Recommendation sent{' '}
                        {new Date(order.recommendationSentAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={recommendingId === order.id}
                      onClick={() => sendRecommendation(order)}
                      className="flex items-center gap-1.5 rounded-full border border-tbc-gold-400/50 px-4 py-1.5 text-xs font-semibold text-tbc-gold-400 transition-colors hover:bg-tbc-gold-400/10 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {recommendingId === order.id ? 'Sending…' : 'Send Recommendation'}
                    </button>
                    {nextStatus && (
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => advanceStatus(order, nextStatus)}
                        className="rounded-full bg-tbc-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-tbc-emerald-400 disabled:opacity-50"
                      >
                        Mark {STATUS_LABELS[nextStatus]}
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => advanceStatus(order, 'cancelled')}
                        className="rounded-full border border-red-400/50 px-4 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
