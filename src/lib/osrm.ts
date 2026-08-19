import type { LatLng } from '@/lib/geo';

export interface RoadRoute {
  distanceKm: number;
  durationMinutes: number;
  /** [lat, lng] points along the route, ready for a map polyline. */
  path: [number, number][];
}

/**
 * Real road-distance/ETA/route-line between two points, via OSRM's free
 * public demo server (project-osrm.org) — no API key, but it's a shared,
 * rate-limited community service, not a paid SLA. Never throws — a missing
 * route line is a degraded map, not a broken order, so callers should treat
 * null as "show straight-line distance instead" (haversineDistanceKm).
 */
export async function getRoadRoute(from: LatLng, to: LatLng): Promise<RoadRoute | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      code: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const route = body.routes?.[0];
    if (body.code !== 'Ok' || !route) return null;

    return {
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
