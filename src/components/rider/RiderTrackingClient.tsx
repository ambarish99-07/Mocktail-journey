'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface RiderOrderSummary {
  orderNumber: string;
  status: string;
  riderName: string;
  customerName: string;
  address: string;
  sharingActive: boolean;
}

/** Minimum time between location POSTs — watchPosition can fire much more often than that; no need to hammer the server on every tiny GPS jitter. */
const MIN_POST_INTERVAL_MS = 8000;

export function RiderTrackingClient({ token }: { token: string }) {
  const [summary, setSummary] = useState<RiderOrderSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPostRef = useRef(0);

  useEffect(() => {
    fetch(`/api/rider-tracking/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: RiderOrderSummary) => setSummary(body))
      .catch(() => setNotFound(true));
  }, [token]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const startSharing = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Location isn’t available on this device/browser.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastPostRef.current < MIN_POST_INTERVAL_MS) return;
        lastPostRef.current = now;
        fetch(`/api/rider-tracking/${token}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        })
          .then((res) => {
            if (res.ok) setLastSentAt(new Date());
          })
          .catch(() => {
            // Transient network hiccup — the next watchPosition tick will retry.
          });
      },
      () => {
        toast.error('Location permission denied. Enable it to share your position with the customer.');
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchIdRef.current = id;
    setSharing(true);
    toast.success('Sharing your live location.');
  };

  const stopSharing = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    try {
      await fetch(`/api/rider-tracking/${token}/stop`, { method: 'POST' });
    } catch {
      // Best-effort — the customer's map will show it as stale within a few minutes regardless.
    }
    toast.success('Stopped sharing your location.');
  };

  if (notFound) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-24 text-center">
        <Package className="h-10 w-10 text-tbc-cream-dim" aria-hidden="true" />
        <h1 className="text-xl font-semibold">Tracking link not found</h1>
        <p className="text-sm text-tbc-cream-muted">This link may have expired or is no longer valid.</p>
      </Container>
    );
  }

  if (!summary) {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-24 text-tbc-cream-muted">
        Loading…
      </Container>
    );
  }

  return (
    <Container className="max-w-md py-16">
      <h1 className="text-2xl font-semibold">Delivery: {summary.orderNumber}</h1>
      <p className="mt-1 text-sm text-tbc-cream-muted">Hi {summary.riderName}, thanks for delivering this one.</p>

      <div className="mt-6 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-tbc-gold-400" aria-hidden="true" />
          <div>
            <p className="font-medium">{summary.customerName}</p>
            <p className="text-sm text-tbc-cream-muted">{summary.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-6 text-center">
        <div
          className={cn(
            'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
            sharing ? 'bg-tbc-emerald-500/20 text-tbc-emerald-400' : 'bg-tbc-charcoal-border text-tbc-cream-dim'
          )}
        >
          <Navigation className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-3 font-semibold">{sharing ? 'Sharing your live location' : 'Location sharing is off'}</p>
        <p className="mt-1 text-xs text-tbc-cream-dim">
          {sharing
            ? lastSentAt
              ? `Last sent ${lastSentAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
              : 'Waiting for GPS…'
            : 'The customer can see your live position on their tracking page once you start.'}
        </p>
        <Button
          variant={sharing ? 'outline' : 'gold'}
          size="md"
          className="mt-4 w-full"
          onClick={sharing ? stopSharing : startSharing}
        >
          {sharing ? 'Stop Sharing' : 'Start Sharing Location'}
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-tbc-cream-dim">
        Keep this page open in your browser while you deliver — closing it stops the location updates.
      </p>
    </Container>
  );
}
