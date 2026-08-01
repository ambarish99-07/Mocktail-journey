'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { deriveLoyaltyTier } from '@/lib/loyalty';

const TIER_LABELS = {
  'first-order': 'First Website Order',
  returning: 'Returning Customer',
  gold: 'Gold Member',
} as const;

export function RewardsStatusBanner() {
  const authUser = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const refresh = useAuthStore((s) => s.refresh);

  useEffect(() => {
    if (authStatus === 'loading') refresh();
  }, [authStatus, refresh]);

  if (authUser) {
    const tier = deriveLoyaltyTier(authUser.loyalty.completedOrderCount, authUser.loyalty.isGoldMember);
    return (
      <div className="mt-12 rounded-xl2 border border-tbc-gold-400/30 bg-tbc-charcoal-light p-6 text-center text-sm">
        Signed in as <strong className="text-tbc-cream">{authUser.fullName}</strong> — your current
        tier is <strong className="text-tbc-gold-400">{TIER_LABELS[tier]}</strong>, based on{' '}
        {authUser.loyalty.completedOrderCount} completed direct order
        {authUser.loyalty.completedOrderCount === 1 ? '' : 's'}.
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 text-center text-sm text-tbc-cream-muted">
      Rewards are tracked on this device as a guest.{' '}
      <Link href="/signup" className="text-tbc-gold-400 hover:underline">
        Create an account
      </Link>{' '}
      so your tier and order history follow you anywhere.
    </div>
  );
}
