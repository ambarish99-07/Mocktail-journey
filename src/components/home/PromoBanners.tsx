'use client';

import Link from 'next/link';
import { Sparkles, MailOpen } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/ui/FadeIn';
import { buttonClasses } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  isFirstOrderBogoEligible,
  isPremiumCardActive,
  isPremiumCardExpired,
  isPremiumCardExpiringSoon,
  premiumCardDaysRemaining,
} from '@/lib/rewards-eligibility';
import { pricingConfig } from '@/lib/config';
import { cn } from '@/lib/utils';

/** Two top-of-page promo banners — BOGO on the first order, and the paid Premium Membership — so both are visible before a customer even starts browsing the menu. */
export function PromoBanners() {
  const authUser = useAuthStore((s) => s.user);

  const bogoEligible = authUser ? isFirstOrderBogoEligible(authUser.loyalty.completedOrderCount) : true;
  const cardActive = authUser ? isPremiumCardActive(authUser.premiumCard) : false;
  const cardExpiringSoon = authUser ? isPremiumCardExpiringSoon(authUser.premiumCard) : false;
  const cardExpired = authUser ? isPremiumCardExpired(authUser.premiumCard) : false;
  const cardDaysRemaining = authUser ? premiumCardDaysRemaining(authUser.premiumCard) : 0;
  // Once a signed-in customer's first order is behind them, the BOGO pitch is
  // no longer relevant to them — drop it entirely rather than show a stale
  // "already used" placeholder, and let Premium take the centered spot alone.
  const showBogo = !authUser || bogoEligible;

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className={cn('grid grid-cols-1 gap-6', showBogo && 'sm:grid-cols-2')}>
          {showBogo && (
            <FadeIn>
              <div className="glossy-card-gold relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-xl2 border border-tbc-gold-400/40 p-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tbc-gold-400/15 text-tbc-gold-500">
                  <Sparkles className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-tbc-gold-600">Buy 1 Get 1 Free</p>
                  <p className="mt-1.5 text-sm text-tbc-cream-muted">
                    {authUser
                      ? 'Your first order — add 2+ eligible drinks and the cheapest one is free at checkout. Excludes combos.'
                      : 'On your first order after signing up — the cheapest eligible drink is free, automatically. Excludes combos.'}
                  </p>
                </div>
                <Link href={authUser ? '/menu' : '/signup'} className={buttonClasses('gold', 'sm')}>
                  {authUser ? 'Start Your Order' : 'Create an Account'}
                </Link>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.1}>
            <div
              className={cn(
                'glossy-card-emerald relative mx-auto flex h-full max-w-md flex-col items-center gap-4 overflow-hidden rounded-xl2 border border-tbc-emerald-400/40 p-8 text-center',
                !showBogo && 'sm:max-w-lg'
              )}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tbc-emerald-400/15 text-tbc-emerald-600">
                <MailOpen className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-tbc-emerald-600">
                  Premium Membership — ₹{pricingConfig.premiumCard.priceRupees}/{pricingConfig.premiumCard.validDays} Days
                </p>
                <p className="mt-1.5 text-sm text-tbc-cream-muted">
                  {cardActive
                    ? 'Active — you have free delivery eligibility right now.'
                    : `Free delivery eligibility within ${pricingConfig.premium.freeDeliveryRadiusKm}km of our kitchen — no order-count wait, join anytime.`}
                </p>
                {cardExpiringSoon && (
                  <p className="mt-1.5 text-xs font-semibold text-amber-400">
                    Expires in {cardDaysRemaining} day{cardDaysRemaining === 1 ? '' : 's'} — renew now to keep free
                    delivery eligibility.
                  </p>
                )}
                {cardExpired && (
                  <p className="mt-1.5 text-xs font-semibold text-amber-400">
                    Your membership has expired — renew now to restore free delivery eligibility.
                  </p>
                )}
              </div>
              {!authUser && (
                <Link href="/signup" className={buttonClasses('emerald', 'sm')}>
                  Create an Account
                </Link>
              )}
              {authUser && (cardExpired || cardExpiringSoon) && (
                <Link href="/account" className={buttonClasses('emerald', 'sm')}>
                  Renew Now
                </Link>
              )}
              {authUser && cardActive && !cardExpiringSoon && (
                <span className={cn(buttonClasses('outline', 'sm'), 'pointer-events-none opacity-70')}>Active</span>
              )}
              {authUser && !cardActive && !cardExpired && (
                <Link href="/account" className={buttonClasses('emerald', 'sm')}>
                  Join the Club
                </Link>
              )}
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
