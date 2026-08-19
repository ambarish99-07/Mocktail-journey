'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, LogOut, Crown, Truck, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { FormField, inputClass } from '@/components/ui/FormField';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  isPremiumEligible,
  isPremiumCardActive,
  isPremiumCardExpired,
  isPremiumCardExpiringSoon,
  premiumCardDaysRemaining,
  isFirstOrderBogoEligible,
} from '@/lib/rewards-eligibility';
import { pricingConfig } from '@/lib/config';
import { loadRazorpayScript } from '@/lib/razorpay-client';
import { profileUpdateSchema, type ProfileUpdateFormValues } from '@/lib/validation';
import type { PlacedOrder, OrderStatus } from '@/types/order';
import type { SafeUser } from '@/types/db';

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
  const [enrolling, setEnrolling] = useState(false);
  const [buyingCard, setBuyingCard] = useState(false);

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

  const handleEnrollPremium = async () => {
    setEnrolling(true);
    try {
      const res = await fetch('/api/account/premium', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not enroll in Premium Membership.');
        return;
      }
      setUser(body.user);
      toast.success('Welcome to Premium Membership! 25% off every order from now on.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyPremiumCard = async () => {
    if (!authUser) return;
    setBuyingCard(true);
    try {
      const res = await fetch('/api/account/premium-card/purchase', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not start payment.');
        return;
      }

      try {
        await loadRazorpayScript();
      } catch {
        toast.error('Could not load the payment gateway. Please try again.');
        return;
      }

      const razorpay = new window.Razorpay!({
        key: body.razorpay.keyId,
        amount: body.razorpay.amount,
        currency: body.razorpay.currency,
        order_id: body.razorpay.orderId,
        name: 'The Blenders Club',
        description: `Premium Membership Card — ${pricingConfig.premiumCard.validDays} days`,
        prefill: { name: authUser.fullName, contact: authUser.phone },
        theme: { color: '#D4AF37' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/account/premium-card/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyBody = await verifyRes.json();
            if (!verifyRes.ok) {
              toast.error(verifyBody.error ?? 'Payment could not be verified. Please contact us if you were charged.');
              return;
            }
            setUser(verifyBody.user);
            toast.success(`Membership acquired. Validity for ${pricingConfig.premiumCard.validDays} days.`);
          } catch {
            toast.error('Payment succeeded but verification failed. Please contact us if you were charged.');
          } finally {
            setBuyingCard(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBuyingCard(false);
            toast.error('Payment cancelled.');
          },
        },
      });
      razorpay.open();
    } catch {
      toast.error('Could not start payment. Please check your connection and try again.');
      setBuyingCard(false);
    }
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
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 sm:grid-cols-2">
            <ProfileField label="Email" value={authUser.email} />
            <ProfileField label="Completed Orders" value={String(authUser.loyalty.completedOrderCount)} />
          </div>

          <ProfileSection user={authUser} onUpdated={setUser} />

          {isFirstOrderBogoEligible(authUser.loyalty.completedOrderCount) && (
            <div className="mt-4 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6 text-sm">
              <strong className="text-tbc-gold-400">Your first order is Buy 1 Get 1 Free</strong> — add 2+
              eligible drinks (combos excluded) and the cheapest one is free at checkout, automatically.
            </div>
          )}

          {authUser.premium.isMember ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6">
              <Crown className="h-6 w-6 shrink-0 text-tbc-gold-400" aria-hidden="true" />
              <div>
                <p className="font-semibold text-tbc-gold-400">Premium Member</p>
                <p className="text-sm text-tbc-cream-muted">
                  {pricingConfig.premium.discountPercent}% off every order, plus free delivery within{' '}
                  {pricingConfig.premium.freeDeliveryRadiusKm}km of our kitchen.
                </p>
              </div>
            </div>
          ) : isPremiumEligible(authUser.loyalty.completedOrderCount) ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6">
              <div>
                <p className="font-semibold text-tbc-gold-400">Premium Membership Unlocked!</p>
                <p className="text-sm text-tbc-cream-muted">
                  Join now for {pricingConfig.premium.discountPercent}% off every order and free delivery within{' '}
                  {pricingConfig.premium.freeDeliveryRadiusKm}km.
                </p>
              </div>
              <Button variant="gold" size="sm" disabled={enrolling} onClick={handleEnrollPremium}>
                {enrolling ? 'Joining…' : 'Join Premium'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
              <p className="text-xs uppercase tracking-wide text-tbc-cream-dim">Premium Membership</p>
              <p className="mt-1.5 text-sm text-tbc-cream-muted">
                {pricingConfig.premium.unlockAfterOrders - authUser.loyalty.completedOrderCount} more order
                {pricingConfig.premium.unlockAfterOrders - authUser.loyalty.completedOrderCount === 1 ? '' : 's'} to unlock
                — {pricingConfig.premium.discountPercent}% off every order plus free delivery within{' '}
                {pricingConfig.premium.freeDeliveryRadiusKm}km.
              </p>
            </div>
          )}

          <PremiumCardSection premiumCard={authUser.premiumCard} buying={buyingCard} onBuy={handleBuyPremiumCard} />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RewardProgress
              label="Cold Coffee Reward"
              helpText="50% off a cold coffee"
              current={authUser.rewards.coldCoffeeCounter}
              every={pricingConfig.milestoneRewards.coldCoffee.every}
            />
            <RewardProgress
              label="Free Drink Reward"
              helpText="a drink on the house"
              current={authUser.rewards.freeItemCounter}
              every={pricingConfig.milestoneRewards.freeItem.every}
            />
          </div>
        </>
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

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Link
                  href={`/checkout/confirmation?order=${order.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-tbc-gold-400 hover:underline"
                >
                  Track Order →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function ProfileSection({ user, onUpdated }: { user: SafeUser; onUpdated: (user: SafeUser) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({ resolver: zodResolver(profileUpdateSchema) });

  const startEditing = () => {
    reset({
      fullName: user.fullName,
      phone: user.phone,
      address: user.defaultAddress?.address ?? '',
      city: user.defaultAddress?.city ?? '',
      pincode: user.defaultAddress?.pincode ?? '',
      mapsLink: user.defaultAddress?.mapsLink ?? '',
    });
    setEditing(true);
  };

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not update your profile.');
        return;
      }
      onUpdated(body.user);
      toast.success('Profile updated.');
      setEditing(false);
    } catch {
      toast.error('Could not update your profile. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 space-y-4 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6"
        noValidate
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-tbc-cream-dim">Edit Profile</p>
          <button
            type="button"
            aria-label="Cancel editing"
            onClick={() => setEditing(false)}
            className="rounded-full p-1.5 text-tbc-cream-muted hover:bg-tbc-charcoal-border"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="profile-full-name" label="Full Name" error={errors.fullName?.message}>
            <input id="profile-full-name" {...register('fullName')} className={inputClass} autoComplete="name" />
          </FormField>
          <FormField id="profile-phone" label="Phone Number" error={errors.phone?.message}>
            <input id="profile-phone" {...register('phone')} className={inputClass} autoComplete="tel" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="profile-address"
            label="Delivery Address (optional)"
            error={errors.address?.message}
            className="sm:col-span-2"
          >
            <input id="profile-address" {...register('address')} className={inputClass} autoComplete="street-address" />
          </FormField>
          <FormField id="profile-city" label="City" error={errors.city?.message}>
            <input id="profile-city" {...register('city')} className={inputClass} autoComplete="address-level2" />
          </FormField>
          <FormField id="profile-pincode" label="Pincode" error={errors.pincode?.message}>
            <input id="profile-pincode" {...register('pincode')} className={inputClass} autoComplete="postal-code" />
          </FormField>
          <FormField
            id="profile-maps-link"
            label="Google Maps Link (optional)"
            error={errors.mapsLink?.message}
            className="sm:col-span-2"
          >
            <input id="profile-maps-link" {...register('mapsLink')} className={inputClass} placeholder="https://maps.google.com/?q=..." />
          </FormField>
        </div>

        <Button type="submit" variant="gold" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </form>
    );
  }

  return (
    <div className="mt-4 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-tbc-cream-dim">Delivery Profile</p>
          <p className="mt-1.5 text-sm text-tbc-cream-muted">
            {user.fullName} · {user.phone}
          </p>
          <p className="mt-1 text-sm text-tbc-cream-muted">
            {user.defaultAddress
              ? `${user.defaultAddress.address}, ${user.defaultAddress.city} - ${user.defaultAddress.pincode}`
              : 'No saved address yet — add one, or it will be saved automatically after your next order.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={startEditing}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Button>
      </div>
    </div>
  );
}

function PremiumCardSection({
  premiumCard,
  buying,
  onBuy,
}: {
  premiumCard: SafeUser['premiumCard'];
  buying: boolean;
  onBuy: () => void;
}) {
  const active = isPremiumCardActive(premiumCard);
  const expiringSoon = isPremiumCardExpiringSoon(premiumCard);
  const expired = isPremiumCardExpired(premiumCard);
  const daysRemaining = premiumCardDaysRemaining(premiumCard);

  const buttonLabel = buying ? 'Opening…' : expired || expiringSoon ? 'Renew Now' : active ? 'Active' : 'Join the Club';

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6">
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-6 w-6 shrink-0 text-tbc-gold-400" aria-hidden="true" />
        <div>
          <p className="font-semibold text-tbc-gold-400">Premium Membership</p>
          <p className="text-sm text-tbc-cream-muted">
            {active
              ? `Free delivery eligibility within ${pricingConfig.premium.freeDeliveryRadiusKm}km, active until ${
                  premiumCard.expiresAt &&
                  new Date(premiumCard.expiresAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                }.`
              : `₹${pricingConfig.premiumCard.priceRupees} for ${pricingConfig.premiumCard.validDays} days of free delivery eligibility within ${pricingConfig.premium.freeDeliveryRadiusKm}km — no order-count requirement.`}
          </p>
          {expiringSoon && (
            <p className="mt-1.5 text-xs font-semibold text-amber-400">
              Expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'} — renew now to keep free delivery
              eligibility.
            </p>
          )}
          {expired && (
            <p className="mt-1.5 text-xs font-semibold text-amber-400">
              Your membership has expired — renew now to restore free delivery eligibility.
            </p>
          )}
        </div>
      </div>
      <Button
        variant={active && !expiringSoon ? 'outline' : 'gold'}
        size="sm"
        disabled={buying || (active && !expiringSoon)}
        onClick={onBuy}
      >
        {buttonLabel}
      </Button>
    </div>
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

function RewardProgress({
  label,
  helpText,
  current,
  every,
}: {
  label: string;
  helpText: string;
  current: number;
  every: number;
}) {
  // Matches the backend check (src/lib/rewards-eligibility.ts) — the counter
  // never actually reaches `every` since the reward fires (and resets it) one
  // order sooner than that.
  const unlocked = current >= every - 1;
  return (
    <div className="rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-6">
      <p className="text-xs uppercase tracking-wide text-tbc-cream-dim">{label}</p>
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({ length: every }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-5 w-5 rounded-full border-2',
              i < current ? 'border-tbc-gold-400 bg-tbc-gold-400' : 'border-tbc-charcoal-border'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-tbc-cream-muted">
        {unlocked ? `🎉 Your next order gets ${helpText}!` : `${every - current} more order${every - current === 1 ? '' : 's'} to unlock ${helpText}.`}
      </p>
    </div>
  );
}
