'use client';

import { create } from 'zustand';
import type { SafeUser } from '@/types/db';

interface AuthState {
  user: SafeUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  setUser: (user: SafeUser | null) => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'guest' }),
  refresh: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        set({ user: null, status: 'guest' });
        return;
      }
      const data = await res.json();
      set({ user: data.user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'guest' });
    }
  },
}));
