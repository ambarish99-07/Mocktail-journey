import type { Coupon } from '@/types/db';

/**
 * Pure/client-safe only — no Node built-ins, no DB access — so it can be
 * imported from client components (checkout's totals preview) as well as
 * server routes. Server-only coupon logic (generating codes, marking used)
 * lives in coupons-server.ts instead.
 */

/** Oldest unused, unexpired coupon — one redeemed per order, first-issued-first-used. */
export function findUsableCoupon(coupons: Coupon[]): Coupon | null {
  const now = Date.now();
  const usable = coupons.filter((c) => !c.usedAt && (!c.expiresAt || new Date(c.expiresAt).getTime() > now));
  if (usable.length === 0) return null;
  return usable.reduce((oldest, c) => (new Date(c.issuedAt) < new Date(oldest.issuedAt) ? c : oldest));
}
