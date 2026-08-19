import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/** Rider's device posts its current position here every ~10s while sharing is active. Auth is the unguessable trackingToken itself — same model as the customer's order accessToken. */
export async function POST(request: Request, { params }: { params: { token: string } }) {
  const ip = getClientIp(request);
  // Generous limit — a rider's phone posting every ~10s for a 30+ minute
  // delivery is normal, legitimate traffic, not abuse.
  if (!checkRateLimit('rider-location', ip, 60, 5 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many updates. Please slow down.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.token)) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'Invalid location.' }, { status: 400 });
  }

  const orders = await getOrdersCollection();
  const result = await orders.updateOne(
    { 'rider.trackingToken': params.token },
    {
      $set: {
        'rider.location': { lat, lng, updatedAt: new Date().toISOString() },
        'rider.sharingActive': true,
        updatedAt: new Date().toISOString(),
      },
    }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
