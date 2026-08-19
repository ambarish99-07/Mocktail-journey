'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** Simple colored-dot markers via inline SVG data URIs — avoids Leaflet's classic "default marker icon 404s under webpack" bundler issue entirely, and lets each marker carry its own brand color. */
function dotIcon(colorHex: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="10" fill="${colorHex}" stroke="white" stroke-width="3"/></svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(svg) : ''}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const kitchenIcon = dotIcon('#D4AF37');
const customerIcon = dotIcon('#0E8F5D');
const riderIcon = dotIcon('#E23744');

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

interface DeliveryMapProps {
  kitchen: { lat: number; lng: number };
  customer: { lat: number; lng: number };
  rider: { lat: number; lng: number } | null;
  routePath: [number, number][] | null;
}

export function DeliveryMap({ kitchen, customer, rider, routePath }: DeliveryMapProps) {
  const boundsPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [[kitchen.lat, kitchen.lng], [customer.lat, customer.lng]];
    if (rider) pts.push([rider.lat, rider.lng]);
    return pts;
  }, [kitchen, customer, rider]);

  return (
    <MapContainer
      center={[customer.lat, customer.lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: '#18191C' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={boundsPoints} />

      <Marker position={[kitchen.lat, kitchen.lng]} icon={kitchenIcon}>
        <Popup>The Blenders Club kitchen</Popup>
      </Marker>
      <Marker position={[customer.lat, customer.lng]} icon={customerIcon}>
        <Popup>Your delivery address</Popup>
      </Marker>
      {rider && (
        <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
          <Popup>Your rider</Popup>
        </Marker>
      )}
      {routePath && routePath.length > 1 && (
        <Polyline positions={routePath} pathOptions={{ color: '#D4AF37', weight: 4, opacity: 0.8 }} />
      )}
    </MapContainer>
  );
}
