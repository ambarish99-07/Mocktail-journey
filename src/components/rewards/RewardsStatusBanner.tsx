'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { isPremiumEligible, isFirstOrderBogoEligible } from '@/lib/rewards-eligibility';
import { pricingConfig } from '@/lib/config';

export function RewardsStatusBanner() {
  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    if (authStatus === 'loading') refresh();
  }, [authStatus, refresh]);

  if (authUser) {
    if (authUser.premium.isMember) {
      return (
        <div className="mt-12 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6 text-center text-sm">
          <strong className="text-tbc-gold-400">You&apos;re a Premium Member</strong> —{' '}
          {pricingConfig.premium.discountPercent}% off every order, plus free delivery within{' '}
          {pricingConfig.premium.freeDeliveryRadiusKm}km.
        </div>
      );
    }
    if (isFirstOrderBogoEligible(authUser.loyalty.completedOrderCount)) {
      return (
        <div className="mt-12 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 p-6 text-center text-sm">
          <strong className="text-tbc-gold-400">Your first order is Buy 1 Get 1 Free</strong> — the cheapest
          eligible drink is on us (excludes combos). Applied automatically at checkout.
        </div>
      );
    }
    return (
      <div className="mt-12 rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-6 text-center text-sm">
        Signed in as <strong className="text-tbc-cream">{authUser.fullName}</strong> —{' '}
        {authUser.loyalty.completedOrderCount} completed direct order
        {authUser.loyalty.completedOrderCount === 1 ? '' : 's'}.{' '}
        {isPremiumEligible(authUser.loyalty.completedOrderCount) ? (
          <>
            You&apos;ve unlocked Premium Membership —{' '}
            <Link href="/account" className="text-tbc-gold-400 hover:underline">
              join from your account
            </Link>
            .
          </>
        ) : (
          <>
            {pricingConfig.premium.unlockAfterOrders - authUser.loyalty.completedOrderCount} more order
            {pricingConfig.premium.unlockAfterOrders - authUser.loyalty.completedOrderCount === 1 ? '' : 's'} to unlock
            Premium Membership.
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 text-center text-sm text-tbc-cream-muted">
      Multi-shake discounts apply automatically as a guest.{' '}
      <Link href="/signup" className="text-tbc-gold-400 hover:underline">
        Create an account
      </Link>{' '}
      to get Buy 1 Get 1 Free on your first order, plus Premium Membership and repeat-order rewards that
      follow you anywhere.
    </div>
  );
}
