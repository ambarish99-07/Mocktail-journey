import type { OrderTotals } from '@/types/order';
import { formatCurrency, cn } from '@/lib/utils';

interface CartSummaryProps {
  totals: OrderTotals;
  className?: string;
  showSavedBanner?: boolean;
}

export function CartSummary({ totals, className, showSavedBanner = true }: CartSummaryProps) {
  const totalDiscount =
    totals.orderDiscount +
    totals.comboDiscount +
    totals.coldCoffeeDiscount +
    totals.freeItemDiscount +
    totals.bogoDiscount +
    totals.couponDiscount;

  return (
    <div className={cn('space-y-3', className)}>
      {totals.couponDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm text-tbc-gold-400">
          🎉 Compensation coupon applied — {formatCurrency(totals.couponDiscount)} off.
        </div>
      )}
      {totals.bogoDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm text-tbc-gold-400">
          🎉 Buy 1 Get 1 Free applied — your first order.
        </div>
      )}
      {totals.freeItemDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm text-tbc-gold-400">
          🎉 Reward unlocked — one drink is free this order.
        </div>
      )}
      {totals.coldCoffeeDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm text-tbc-gold-400">
          🎉 Reward unlocked — 50% off a cold coffee this order.
        </div>
      )}
      {showSavedBanner && totalDiscount > 0 && (
        <div className="rounded-xl2 border border-tbc-emerald-700/50 bg-tbc-emerald-900/30 px-4 py-3 text-sm text-tbc-emerald-200">
          You saved <strong>{formatCurrency(totalDiscount)}</strong> by ordering directly from The
          Blenders Club.
        </div>
      )}

      <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
      {totals.orderDiscount > 0 && (
        <Row
          label={totals.orderDiscountLabel || 'Discount'}
          value={`- ${formatCurrency(totals.orderDiscount)}`}
          valueClassName="text-tbc-emerald-400"
        />
      )}
      {totals.comboDiscount > 0 && (
        <Row
          label="Combo Discount (15%)"
          value={`- ${formatCurrency(totals.comboDiscount)}`}
          valueClassName="text-tbc-emerald-400"
        />
      )}
      {totals.coldCoffeeDiscount > 0 && (
        <Row
          label="Cold Coffee Reward"
          value={`- ${formatCurrency(totals.coldCoffeeDiscount)}`}
          valueClassName="text-tbc-gold-400"
        />
      )}
      {totals.freeItemDiscount > 0 && (
        <Row
          label="Free Drink Reward"
          value={`- ${formatCurrency(totals.freeItemDiscount)}`}
          valueClassName="text-tbc-gold-400"
        />
      )}
      {totals.bogoDiscount > 0 && (
        <Row
          label="Buy 1 Get 1 Free"
          value={`- ${formatCurrency(totals.bogoDiscount)}`}
          valueClassName="text-tbc-gold-400"
        />
      )}
      {totals.couponDiscount > 0 && (
        <Row
          label="Compensation Coupon"
          value={`- ${formatCurrency(totals.couponDiscount)}`}
          valueClassName="text-tbc-gold-400"
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
