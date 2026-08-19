'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { OrderStatusTracker } from './OrderStatusTracker';
import { RiderContactCard } from './RiderContactCard';
import { DeliveryNoteBox } from './DeliveryNoteBox';
import { isRiderLive } from '@/lib/rider-tracking';
import { getRoadRoute } from '@/lib/osrm';
import { haversineDistanceKm } from '@/lib/geo';
import { storeConfig } from '@/lib/config';
import type { PlacedOrder } from '@/types/order';

// Leaflet touches `window` on import — must never run during SSR.
const DeliveryMap = dynamic(() => import('./DeliveryMap').then((m) => m.DeliveryMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-tbc-cream-dim">Loading map…</div>
  ),
});

interface DeliveryTrackingSectionProps {
  order: PlacedOrder;
  onNoteSaved: (note: string) => void;
}

export function DeliveryTrackingSection({ order, onNoteSaved }: DeliveryTrackingSectionProps) {
  const [route, setRoute] = useState<{ distanceKm: number; durationMinutes: number; path: [number, number][] } | null>(null);

  const rider = order.rider;
  const live = isRiderLive(rider);
  const kitchen = { lat: storeConfig.latitude, lng: storeConfig.longitude };

  useEffect(() => {
    if (!live || !rider?.location || !order.deliveryCoordinates) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    getRoadRoute(rider.location, order.deliveryCoordinates).then((r) => {
      if (!cancelled) setRoute(r);
    });
    return () => {
      cancelled = true;
    };
    // Re-run whenever the rider's last-known position actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, rider?.location?.lat, rider?.location?.lng, order.deliveryCoordinates]);

  const showMap = order.status === 'out-for-delivery' && order.deliveryCoordinates && (live || rider);

  return (
    <div className="space-y-4">
      <OrderStatusTracker status={order.status} statusHistory={order.statusHistory} />

      {order.status !== 'cancelled' && <RiderContactCard rider={rider} />}

      {showMap && order.deliveryCoordinates && (
        <div className="overflow-hidden rounded-xl2 border border-tbc-charcoal-border">
          <div className="h-72 sm:h-96">
            <DeliveryMap
              kitchen={kitchen}
              customer={order.deliveryCoordinates}
              rider={live ? rider!.location : null}
              routePath={route?.path ?? null}
            />
          </div>
          <div className="flex items-center justify-between bg-tbc-charcoal-light px-4 py-2.5 text-xs text-tbc-cream-muted">
            {live ? (
              route ? (
                <span>
                  {route.distanceKm.toFixed(1)} km away · ~{Math.round(route.durationMinutes)} min
                </span>
              ) : (
                <span>Calculating route…</span>
              )
            ) : (
              <span>
                Rider isn&apos;t sharing live location right now
                {rider?.location &&
                  ` — last seen ${new Date(rider.location.updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`}
                .
              </span>
            )}
            {!live && order.deliveryCoordinates && (
              <span>
                {haversineDistanceKm(kitchen, order.deliveryCoordinates).toFixed(1)} km from kitchen (straight-line)
              </span>
            )}
          </div>
        </div>
      )}

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <DeliveryNoteBox
          orderId={order.id}
          initialNote={order.delivery.specialInstructions ?? ''}
          disabled={false}
          onSaved={onNoteSaved}
        />
      )}
    </div>
  );
}
