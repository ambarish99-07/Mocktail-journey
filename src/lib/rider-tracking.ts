import type { RiderLocation, SafeRiderInfo } from '@/types/order';

/** No location update in this long → treat the rider as offline even if sharingActive is still true (they may have lost signal, closed the tab, or the delivery finished without hitting "stop"). */
const STALE_AFTER_MS = 3 * 60 * 1000;

export function isRiderLocationFresh(location: RiderLocation | null): boolean {
  if (!location) return false;
  return Date.now() - new Date(location.updatedAt).getTime() < STALE_AFTER_MS;
}

/** Whether the map should currently show a live rider position. */
export function isRiderLive(rider: SafeRiderInfo | null): boolean {
  return !!rider?.sharingActive && isRiderLocationFresh(rider.location);
}
