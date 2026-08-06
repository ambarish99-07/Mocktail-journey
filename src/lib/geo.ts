export interface LatLng {
  lat: number;
  lng: number;
}

/** Straight-line ("as the crow flies") distance in km — matches how a delivery "radius" is normally meant. */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius, km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Parses the `?q=lat,lng` pattern produced by shareCurrentLocation() (src/lib/whatsapp.ts) — real GPS, no geocoding needed. */
export function extractLatLngFromMapsLink(mapsLink: string | undefined): LatLng | null {
  if (!mapsLink) return null;
  const match = mapsLink.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

/**
 * Falls back to geocoding the typed address text (OpenStreetMap Nominatim —
 * free, no API key, but rate-limited to ~1 req/sec and less reliable for
 * informal/new addresses than a paid service like Google's Geocoding API).
 * Never throws — a customer's delivery must never fail because a geocoder
 * had a bad day; callers just treat null as "distance unknown."
 */
export async function geocodeAddress(addressText: string): Promise<LatLng | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TheBlendersClub/1.0 (order delivery distance check)' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    const first = results[0];
    if (!first) return null;
    return { lat: Number(first.lat), lng: Number(first.lon) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Best-effort delivery-address coordinates: real shared GPS first, geocoded address text as fallback. Never throws. */
export async function resolveDeliveryCoordinates(mapsLink: string | undefined, addressText: string): Promise<LatLng | null> {
  const fromLink = extractLatLngFromMapsLink(mapsLink);
  if (fromLink) return fromLink;
  return geocodeAddress(addressText);
}
