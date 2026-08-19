import { CheckCircle2, ChefHat, PackageCheck, Truck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus, OrderStatusEvent } from '@/types/order';

const STEPS: { status: OrderStatus; label: string; icon: typeof ChefHat }[] = [
  { status: 'received', label: 'Received', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: PackageCheck },
];

interface OrderStatusTrackerProps {
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
}

/** Amazon/BlueDart-style step tracker, adapted for a food order's lifecycle. */
export function OrderStatusTracker({ status, statusHistory: statusHistoryProp }: OrderStatusTrackerProps) {
  // Defensive: sessionStorage can hold an order object cached before this
  // field existed (e.g. from earlier in the same browser session, pre-dating
  // this feature) — never crash the page over stale local data.
  const statusHistory = Array.isArray(statusHistoryProp) ? statusHistoryProp : [];

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-xl2 border border-red-500/40 bg-red-500/10 p-5">
        <XCircle className="h-6 w-6 shrink-0 text-red-400" aria-hidden="true" />
        <div>
          <p className="font-semibold text-red-400">Order Cancelled</p>
          <p className="text-sm text-tbc-cream-muted">Contact us if this wasn&apos;t expected.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);
  const timeFor = (s: OrderStatus) =>
    statusHistory.find((e) => e.status === s)?.at;

  return (
    <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5 sm:p-6">
      <ol className="flex items-start justify-between">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          const at = timeFor(step.status);
          return (
            <li key={step.status} className="flex flex-1 flex-col items-center text-center last:flex-none">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10',
                    done
                      ? 'border-tbc-emerald-500 bg-tbc-emerald-500 text-white'
                      : 'border-tbc-charcoal-border text-tbc-cream-dim'
                  )}
                >
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn('h-0.5 flex-1', i < currentIndex ? 'bg-tbc-emerald-500' : 'bg-tbc-charcoal-border')}
                    aria-hidden="true"
                  />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs font-semibold sm:text-sm',
                  active ? 'text-tbc-gold-400' : done ? 'text-tbc-emerald-400' : 'text-tbc-cream-dim'
                )}
              >
                {step.label}
              </p>
              {at && (
                <p className="mt-0.5 text-[10px] text-tbc-cream-dim sm:text-xs">
                  {new Date(at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
