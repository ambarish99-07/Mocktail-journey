import { storeConfig } from '@/lib/config';

export interface StoreStatus {
  isOpen: boolean;
  /** Display label for when ordering resumes — matches storeConfig.openingHours. */
  opensAtLabel: string;
  reason?: 'manually-closed' | 'outside-hours';
}

/**
 * Pure — no I/O — so it's safe to call from both the API route (authoritative
 * check at order-creation time) and any client component that wants an
 * instant read without a round trip. `now` is injectable for tests.
 */
export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const opensAtLabel = '12:00 PM';

  if (storeConfig.manuallyClosed) {
    return { isOpen: false, opensAtLabel, reason: 'manually-closed' };
  }

  const { timezone, openHour, closeHour } = storeConfig.hours;
  // en-US + hour12:false can format midnight as "24" instead of "0" in some
  // ICU builds — normalize with %24 so the comparison below is never off by one.
  const hourLocal =
    Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }).format(now)) % 24;

  const isOpen = hourLocal >= openHour && hourLocal < closeHour;
  return { isOpen, opensAtLabel, reason: isOpen ? undefined : 'outside-hours' };
}
