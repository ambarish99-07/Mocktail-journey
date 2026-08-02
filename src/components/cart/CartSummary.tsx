import type { OrderTotals } from '@/types/order';
import { formatCurrency, cn } from '@/lib/utils';

interface CartSummaryProps {
  totals: OrderTotals;
  className?: string;
  showSavedBanner?: boolean;
}

export function CartSummary({ totals, className, showSavedBanner = true }: CartSummaryProps) {
  const totalDiscount = totals.punchCardDiscount + totals.websiteDiscount + totals.loyaltyDiscount;

  return (
    <div className={cn('space-y-3', className)}>
      {totals.punchCardDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm text-tbc-gold-400">
          🎉 Reward unlocked — 50% off your cheapest drink this order.
        </div>
      )}
      {showSavedBanner && totalDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-emerald-700/50 bg-tbc-emerald-900/30 px-4 py-3 text-sm text-tbc-emerald-200">
          You saved <strong>{formatCurrency(totalDiscount)}</strong> by ordering directly from The
          Blenders Club.
        </div>
      )}

      <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
      {totals.punchCardDiscount > 0 && (
        <Row
          label="Reward Discount"
          value={`- ${formatCurrency(totals.punchCardDiscount)}`}
          valueClassName="text-tbc-gold-400"
        />
      )}
      {totals.websiteDiscount > 0 && (
        <Row
          label="Website Discount"
          value={`- ${formatCurrency(totals.websiteDiscount)}`}
          valueClassName="text-tbc-emerald-400"
        />
      )}
      {totals.loyaltyDiscount > 0 && (
        <Row
          label="Loyalty Discount"
          value={`- ${formatCurrency(totals.loyaltyDiscount)}`}
          valueClassName="text-tbc-emerald-400"
        />
      )}
      <Row
        label="Delivery Charges"
        value={totals.deliveryFee === 0 ? 'Free' : formatCurrency(totals.deliveryFee)}
      />
      <Row label="Taxes" value={formatCurrency(totals.tax)} />

      <div className="my-2 h-px bg-tbc-charcoal-border" />

      <Row
        label="Total Payable"
        value={formatCurrency(totals.total)}
        labelClassName="text-base font-semibold text-tbc-cream"
        valueClassName="text-lg font-bold text-tbc-gold-400"
      />
    </div>
  );
}

function Row({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn('text-tbc-cream-muted', labelClassName)}>{label}</span>
      <span className={cn('font-medium text-tbc-cream', valueClassName)}>{value}</span>
    </div>
  );
}
