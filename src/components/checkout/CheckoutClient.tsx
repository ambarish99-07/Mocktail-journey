'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LocateFixed, MessageCircle, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button, buttonClasses } from '@/components/ui/Button';
import { CartSummary } from '@/components/cart/CartSummary';
import { StoreClosedBanner } from '@/components/shared/StoreClosedBanner';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrderStore } from '@/lib/store/order-store';
import { computeOrderTotals, cartSubtotal, ESTIMATED_DELIVERY_MINUTES } from '@/lib/pricing';
import {
  isColdCoffeeRewardOrder,
  isFreeItemRewardOrder,
  isPremiumEligible,
  isFirstOrderBogoEligible,
} from '@/lib/rewards-eligibility';
import { findUsableCoupon } from '@/lib/coupons';
import { pricingConfig } from '@/lib/config';
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validation';
import { shareCurrentLocation, buildWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { loadRazorpayScript } from '@/lib/razorpay-client';
import { cn } from '@/lib/utils';
import { FormField, inputClass } from '@/components/ui/FormField';
import type { PlacedOrder } from '@/types/order';

type PaymentMethod = 'cod' | 'razorpay';

export function CheckoutClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const authUser = useAuthStore((s) => s.user);
  const setLastOrder = useOrderStore((s) => s.setLastOrder);

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPaying, setIsPaying] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; amountRupees: number } | null>(null);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'error'>('idle');
  const [promoError, setPromoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  // Prefill from the customer's saved profile once it loads — once only, so
  // it never overwrites something they've already started typing. Guests and
  // first-time customers with no saved address just see an empty form.
  const hasPrefilled = useRef(false);
  useEffect(() => {
    if (hasPrefilled.current || !authUser) return;
    hasPrefilled.current = true;
    reset({
      fullName: authUser.fullName,
      phone: authUser.phone,
      address: authUser.defaultAddress?.address ?? '',
      city: authUser.defaultAddress?.city ?? '',
      pincode: authUser.defaultAddress?.pincode ?? '',
      mapsLink: authUser.defaultAddress?.mapsLink ?? '',
    });
  }, [authUser, reset]);

  // The quantity discount is purely based on what's in THIS cart, so guests get
  // it too. Premium/milestone rewards are registered-accounts-only. Note: this
  // preview can't check the Premium free-delivery radius (that needs server-side
  // geocoding of the typed address) — the final total on the confirmation page
  // is always the authoritative one.
  const isPremiumMember = authUser?.premium.isMember ?? false;
  const coldCoffeeReward = authUser ? isColdCoffeeRewardOrder(authUser.rewards.coldCoffeeCounter) : false;
  const freeItemReward = authUser ? isFreeItemRewardOrder(authUser.rewards.freeItemCounter) : false;
  const firstOrderBogo = authUser ? isFirstOrderBogoEligible(authUser.loyalty.completedOrderCount) : false;
  const usableCoupon = authUser ? findUsableCoupon(authUser.coupons) : null;
  // A compensation coupon (already owed) always wins over a typed promo code —
  // mirrors the mutually-exclusive precedence enforced server-side in POST /api/orders.
  const totals = computeOrderTotals(items, {
    isPremiumMember,
    coldCoffeeReward,
    freeItemReward,
    firstOrderBogo,
    couponAmountRupees: usableCoupon?.amountRupees ?? appliedPromo?.amountRupees,
    couponLabel: usableCoupon ? undefined : appliedPromo ? `Coupon (${appliedPromo.code})` : undefined,
  });

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoStatus('checking');
    setPromoError(null);
    try {
      const res = await fetch('/api/promo/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), subtotal: cartSubtotal(items) }),
      });
      const body = await res.json();
      if (!res.ok) {
        setPromoStatus('error');
        setPromoError(body.error ?? 'That code isn’t valid.');
        return;
      }
      setAppliedPromo(body.promo);
      setPromoStatus('idle');
      toast.success(`Coupon ${body.promo.code} applied.`);
    } catch {
      setPromoStatus('error');
      setPromoError('Could not check that code. Please try again.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
    setPromoStatus('idle');
  };

  const handleShareLocation = async () => {
    setLocationStatus('loading');
    setLocationError(null);
    try {
      const { mapsLink } = await shareCurrentLocation();
      setValue('mapsLink', mapsLink, { shouldValidate: true });
      setLocationStatus('idle');
    } catch {
      setLocationStatus('error');
      setLocationError('Location permission denied. Please paste a Google Maps link manually below.');
    }
  };

  const completeOrder = (order: PlacedOrder) => {
    setLastOrder(order);
    clearCart();
    router.push(`/checkout/confirmation?order=${order.id}`);
  };

  const onPlaceOrder = async (data: CheckoutFormValues) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          delivery: data,
          paymentMethod,
          promoCode: !usableCoupon ? appliedPromo?.code : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not place your order. Please try again.');
        return;
      }

      if (paymentMethod === 'cod') {
        completeOrder(body.order as PlacedOrder);
        return;
      }

      // Razorpay path: order is created but pending — open the payment sheet,
      // and only complete the order (clear cart, navigate) once the server
      // has verified the payment signature. Cart stays intact until then.
      setIsPaying(true);
      try {
        await loadRazorpayScript();
      } catch {
        toast.error('Could not load the payment gateway. Please try again.');
        return;
      }

      const pendingOrder: PlacedOrder = body.order;
      const razorpay = new window.Razorpay!({
        key: body.razorpay.keyId,
        amount: body.razorpay.amount,
        currency: body.razorpay.currency,
        order_id: body.razorpay.orderId,
        name: 'The Blenders Club',
        description: `Order ${pendingOrder.orderNumber}`,
        prefill: { name: data.fullName, contact: data.phone },
        theme: { color: '#D4AF37' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`/api/orders/${pendingOrder.id}/verify-payment`, {
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
              toast.error(verifyBody.error ?? 'Payment could not be verified. Please contact us with your order ID.');
              return;
            }
            completeOrder(verifyBody.order as PlacedOrder);
          } catch {
            toast.error('Payment succeeded but verification failed. Please contact us with your order ID.');
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            toast.error('Payment cancelled. Your cart has been kept — you can try again.');
          },
        },
      });
      razorpay.open();
    } catch {
      toast.error('Could not place your order. Please check your connection and try again.');
      setIsPaying(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    const valid = await trigger(['fullName', 'phone', 'address']);
    if (!valid) return;
    const data = getValues();
    const fullAddress = [data.address, data.city, data.pincode].filter(Boolean).join(', ');
    const message = buildWhatsAppMessage({
      customerName: data.fullName,
      phone: data.phone,
      address: fullAddress,
      mapsLink: data.mapsLink || undefined,
      specialInstructions: data.specialInstructions || undefined,
      items,
      total: totals.total,
    });
    window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer');
  };

  if (items.length === 0) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-tbc-cream-dim" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-tbc-cream-muted">Add a few drinks to your cart before checking out.</p>
        <Link href="/menu" className={buttonClasses('gold', 'md')}>
          Browse Menu
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Checkout</h1>

      <div className="mt-6">
        <StoreClosedBanner />
      </div>

      <form
        onSubmit={handleSubmit(onPlaceOrder)}
        className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]"
        noValidate
      >
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tbc-gold-400">
              Delivery Details
            </h2>
            <p className="mb-4 text-xs text-tbc-cream-dim">
              The Blenders Club is a delivery-only cloud kitchen — every order is freshly blended
              and delivered to your door.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="checkout-full-name" label="Full Name" error={errors.fullName?.message}>
                <input
                  id="checkout-full-name"
                  {...register('fullName')}
                  className={inputClass}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </FormField>
              <FormField id="checkout-phone" label="Phone Number" error={errors.phone?.message}>
                <input
                  id="checkout-phone"
                  {...register('phone')}
                  className={inputClass}
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="checkout-address"
                label="Delivery Address"
                error={errors.address?.message}
                className="sm:col-span-2"
              >
                <input
                  id="checkout-address"
                  {...register('address')}
                  className={inputClass}
                  autoComplete="street-address"
                  placeholder="House / street / landmark"
                />
              </FormField>
              <FormField id="checkout-city" label="City" error={errors.city?.message}>
                <input
                  id="checkout-city"
                  {...register('city')}
                  className={inputClass}
                  autoComplete="address-level2"
                />
              </FormField>
              <FormField id="checkout-pincode" label="Pincode" error={errors.pincode?.message}>
                <input
                  id="checkout-pincode"
                  {...register('pincode')}
                  className={inputClass}
                  autoComplete="postal-code"
                />
              </FormField>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={locationStatus === 'loading'}
                  className="flex items-center gap-2 text-sm font-medium text-tbc-emerald-400 hover:underline disabled:opacity-60"
                >
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  {locationStatus === 'loading' ? 'Getting your location…' : 'Share Delivery Location'}
                </button>
                {locationError && <p className="mt-1.5 text-xs text-amber-400">{locationError}</p>}
                <FormField
                  id="checkout-maps-link"
                  label="Google Maps Link (optional)"
                  error={errors.mapsLink?.message}
                  className="mt-2"
                >
                  <input
                    id="checkout-maps-link"
                    {...register('mapsLink')}
                    className={inputClass}
                    placeholder="https://maps.google.com/?q=..."
                  />
                </FormField>
              </div>

              <FormField
                id="checkout-instructions"
                label="Special Instructions (optional)"
                error={errors.specialInstructions?.message}
                className="sm:col-span-2"
              >
                <textarea
                  id="checkout-instructions"
                  {...register('specialInstructions')}
                  className={cn(inputClass, 'min-h-[80px] resize-y')}
                  placeholder="E.g. less sugar, ring the bell twice..."
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tbc-gold-400">
              Payment Method
            </h2>
            <div className="space-y-2">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl2 border p-4 text-sm transition-colors',
                  paymentMethod === 'cod'
                    ? 'border-tbc-gold-400 bg-tbc-charcoal-light'
                    : 'border-tbc-charcoal-border bg-tbc-charcoal-light/50 hover:border-tbc-gold-400/40'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 accent-tbc-gold-400"
                />
                <span>
                  Pay on Delivery
                  <span className="block text-xs text-tbc-cream-dim">Cash or UPI at your door.</span>
                </span>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl2 border p-4 text-sm transition-colors',
                  paymentMethod === 'razorpay'
                    ? 'border-tbc-gold-400 bg-tbc-charcoal-light'
                    : 'border-tbc-charcoal-border bg-tbc-charcoal-light/50 hover:border-tbc-gold-400/40'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="h-4 w-4 accent-tbc-gold-400"
                />
                <span>
                  Pay Online
                  <span className="block text-xs text-tbc-cream-dim">Cards, UPI, netbanking &amp; wallets via Razorpay.</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <ul className="mb-4 space-y-3 border-b border-tbc-charcoal-border pb-4">
            {items.map((item) => (
              <li key={item.lineId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{item.signatureName}</p>
                  <p className="text-xs text-tbc-cream-dim">Qty {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>

          {usableCoupon ? (
            <p className="mb-4 text-xs text-tbc-cream-dim">
              Your ₹{usableCoupon.amountRupees} compensation credit will be applied automatically at checkout.
            </p>
          ) : (
            <div className="mb-4">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-xl2 border border-tbc-gold-400/40 bg-tbc-gold-400/10 px-3 py-2 text-sm">
                  <span className="text-tbc-gold-400">
                    Coupon <strong>{appliedPromo.code}</strong> applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs font-medium text-tbc-cream-muted hover:text-tbc-cream"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Have a coupon code?"
                    className={cn(inputClass, 'flex-1 text-sm')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={promoStatus === 'checking'}
                    onClick={handleApplyPromo}
                  >
                    {promoStatus === 'checking' ? 'Checking…' : 'Apply'}
                  </Button>
                </div>
              )}
              {promoError && <p className="mt-1.5 text-xs text-red-400">{promoError}</p>}
              <Link href="/offers" className="mt-1.5 inline-block text-xs text-tbc-cream-dim hover:text-tbc-gold-400 hover:underline">
                See available offers
              </Link>
            </div>
          )}

          <CartSummary totals={totals} />

          {!authUser && (
            <p className="mt-3 text-xs text-tbc-gold-400">
              <Link href="/signup" className="underline">
                Create an account
              </Link>{' '}
              to get Buy 1 Get 1 Free on your first order (excludes combos).
            </p>
          )}

          {authUser && firstOrderBogo && totals.bogoDiscount === 0 && (
            <p className="mt-3 text-xs text-tbc-gold-400">
              Add one more eligible drink to unlock Buy 1 Get 1 Free on your first order.
            </p>
          )}

          {authUser && !isPremiumMember && (
            <div className="mt-3 space-y-1">
              {!coldCoffeeReward && (
                <p className="text-xs text-tbc-cream-dim">
                  {pricingConfig.milestoneRewards.coldCoffee.every - authUser.rewards.coldCoffeeCounter} more order
                  {pricingConfig.milestoneRewards.coldCoffee.every - authUser.rewards.coldCoffeeCounter === 1 ? '' : 's'}{' '}
                  until 50% off a cold coffee.
                </p>
              )}
              {!freeItemReward && (
                <p className="text-xs text-tbc-cream-dim">
                  {pricingConfig.milestoneRewards.freeItem.every - authUser.rewards.freeItemCounter} more order
                  {pricingConfig.milestoneRewards.freeItem.every - authUser.rewards.freeItemCounter === 1 ? '' : 's'}{' '}
                  until a free drink.
                </p>
              )}
              {isPremiumEligible(authUser.loyalty.completedOrderCount) && (
                <p className="text-xs text-tbc-gold-400">
                  You&apos;ve unlocked Premium Membership — join from your account for{' '}
                  {pricingConfig.premium.discountPercent}% off every order.
                </p>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-tbc-cream-dim">
            Estimated delivery time:{' '}
            <strong className="text-tbc-cream">{ESTIMATED_DELIVERY_MINUTES} minutes</strong>
          </p>

          <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={isSubmitting || isPaying}>
            {isPaying
              ? 'Waiting for Payment…'
              : isSubmitting
                ? 'Placing Order…'
                : paymentMethod === 'razorpay'
                  ? 'Proceed to Payment'
                  : 'Place Order Directly'}
          </Button>

          <Button
            type="button"
            variant="whatsapp"
            size="md"
            className="mt-3 w-full"
            onClick={handleWhatsAppOrder}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Send Order via WhatsApp Instead
          </Button>
        </aside>
      </form>
    </Container>
  );
}

