'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import type { PlacedOrder } from '@/types/order';

const REFUND_METHOD_LABELS = {
  razorpay: 'refunded to your original payment method',
  coupon: '₹100 coupon added to your account for your next order',
  none: 'no refund — nothing had been collected yet',
} as const;

interface CancelOrderSectionProps {
  order: PlacedOrder;
  onUpdated: (order: PlacedOrder) => void;
}

export function CancelOrderSection({ order, onUpdated }: CancelOrderSectionProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not cancel your order.');
        return;
      }
      onUpdated(body.order);
      const c = body.order.cancellation;
      toast.success(
        c
          ? `Order cancelled — ${c.refundType} refund, ${c.refundMethod === 'razorpay' ? formatCurrency(c.refundAmount) + ' ' : ''}${REFUND_METHOD_LABELS[c.refundMethod as keyof typeof REFUND_METHOD_LABELS]}.`
          : 'Order cancelled.'
      );
    } catch {
      toast.error('Could not cancel your order. Please check your connection.');
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  };

  const submitClaim = async () => {
    if (claimReason.trim().length < 10) {
      toast.error('Please describe what went wrong (at least 10 characters).');
      return;
    }
    setSubmittingClaim(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/refund-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: claimReason }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not submit your request.');
        return;
      }
      onUpdated(body.order);
      toast.success('Refund request submitted — we’ll review it shortly.');
    } catch {
      toast.error('Could not submit your request. Please check your connection.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (order.cancellation) {
    return (
      <div className="rounded-xl2 border border-red-500/30 bg-red-500/5 p-5 text-sm">
        <p className="font-semibold text-red-400">Order Cancelled</p>
        <p className="mt-1 text-tbc-cream-muted">
          {order.cancellation.refundType === 'full' ? 'Full' : 'Half'} refund —{' '}
          {order.cancellation.refundMethod === 'none'
            ? REFUND_METHOD_LABELS.none
            : `${formatCurrency(order.cancellation.refundAmount)} ${REFUND_METHOD_LABELS[order.cancellation.refundMethod]}`}
          .
        </p>
      </div>
    );
  }

  if (order.refundClaim) {
    const claim = order.refundClaim;
    return (
      <div
        className={cn(
          'rounded-xl2 border p-5 text-sm',
          claim.status === 'pending'
            ? 'border-amber-400/40 bg-amber-400/5'
            : claim.status === 'approved'
              ? 'border-tbc-emerald-500/40 bg-tbc-emerald-500/5'
              : 'border-red-500/30 bg-red-500/5'
        )}
      >
        <p
          className={cn(
            'font-semibold',
            claim.status === 'pending' ? 'text-amber-400' : claim.status === 'approved' ? 'text-tbc-emerald-400' : 'text-red-400'
          )}
        >
          Refund Request — {claim.status === 'pending' ? 'Under Review' : claim.status === 'approved' ? 'Approved' : 'Not Approved'}
        </p>
        <p className="mt-1 text-tbc-cream-muted">&ldquo;{claim.reason}&rdquo;</p>
        {claim.status === 'approved' && (
          <p className="mt-1 text-tbc-cream-muted">
            {claim.refundMethod === 'none'
              ? 'No refund was issued.'
              : `${formatCurrency(claim.refundAmount)} ${REFUND_METHOD_LABELS[claim.refundMethod]}.`}
          </p>
        )}
        {claim.status === 'rejected' && (
          <p className="mt-1 text-tbc-cream-muted">Contact us if you&apos;d like to discuss this.</p>
        )}
      </div>
    );
  }

  if (order.status === 'delivered') {
    return (
      <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
        {!showClaimForm ? (
          <button
            type="button"
            onClick={() => setShowClaimForm(true)}
            className="flex items-center gap-2 text-sm font-semibold text-tbc-cream-muted hover:text-tbc-gold-400"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Something wrong with this order? Request a refund
          </button>
        ) : (
          <>
            <label htmlFor="refund-claim-reason" className="text-sm font-semibold">
              What went wrong?
            </label>
            <p className="mt-0.5 text-xs text-tbc-cream-dim">
              E.g. spilled in transit, wrong item, missing item. Reviewed by our team before any refund/coupon is issued.
            </p>
            <textarea
              id="refund-claim-reason"
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              maxLength={500}
              className="mt-3 min-h-[80px] w-full resize-y rounded-xl2 border border-tbc-charcoal-border bg-tbc-black px-4 py-2.5 text-sm text-tbc-cream placeholder:text-tbc-cream-dim focus:border-tbc-gold-400 focus:outline-none"
              placeholder="Describe the issue..."
            />
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" disabled={submittingClaim} onClick={submitClaim}>
                {submittingClaim ? 'Submitting…' : 'Submit Request'}
              </Button>
              <button
                type="button"
                onClick={() => setShowClaimForm(false)}
                className="px-3 text-xs font-medium text-tbc-cream-muted hover:text-tbc-cream"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (order.status === 'cancelled') return null;

  return (
    <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
      {!confirmingCancel ? (
        <button
          type="button"
          onClick={() => setConfirmingCancel(true)}
          className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:underline"
        >
          <Ban className="h-4 w-4" aria-hidden="true" />
          Cancel Order
        </button>
      ) : (
        <div>
          <p className="text-sm">
            {order.status === 'out-for-delivery'
              ? 'Your order is already out for delivery — cancelling now refunds half the order value.'
              : 'Cancelling now refunds the full order value.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" disabled={cancelling} onClick={cancelOrder} className="border-red-400/50 text-red-400 hover:bg-red-400/10">
              {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
            </Button>
            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              className="px-3 text-xs font-medium text-tbc-cream-muted hover:text-tbc-cream"
            >
              Never mind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
