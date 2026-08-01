'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export { deriveLoyaltyTier } from '@/lib/loyalty';

interface LoyaltyState {
  completedOrderCount: number;
  isGoldMember: boolean;
  recordOrderCompleted: () => void;
}

/**
 * Local, device-based loyalty tracking until full customer accounts ship.
 * Tier derivation: 0 prior orders -> first-order, 1-4 -> returning, 5+ or
 * flagged Gold -> gold. Swap `currentTier` for a server-derived value once
 * accounts/auth exist — the checkout call site (lib/pricing.ts) only needs
 * a LoyaltyTier | null, so that swap is isolated to this file.
 */
export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      completedOrderCount: 0,
      isGoldMember: false,
      recordOrderCompleted: () => set({ completedOrderCount: get().completedOrderCount + 1 }),
    }),
    { name: 'tbc-loyalty-storage' }
  )
);
