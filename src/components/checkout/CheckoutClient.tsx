'use client';

import { useState } from 'react';
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
import { useCartStore } from '@/lib/store/cart-store';
import { useLoyaltyStore, deriveLoyaltyTier } from '@/lib/store/loyalty-store';
import { useOrderStore } from '@/lib/store/order-store';
import { computeOrderTotals, ESTIMATED_DELIVERY_MINUTES } from '@/lib/pricing';
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
  const { completedOrderCount, isGoldMember, recordOrderCompleted } = useLoyaltyStore();
  const setLastOrder = useOrderStore((s) => s.setLastOrder);

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPaying, setIsPaying] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const loyaltyTier = deriveLoyaltyTier(completedOrderCount, isGoldMember);
  const totals = computeOrderTotals(items, { loyaltyTier });

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
    recordOrderCompleted();
    clearCart();
    router.push(`/checkout/confirmation?order=${order.id}`);
  };

  const onPlaceOrder = async (data: CheckoutFormValues) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, delivery: data, paymentMethod }),
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

          <CartSummary totals={totals} />

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

