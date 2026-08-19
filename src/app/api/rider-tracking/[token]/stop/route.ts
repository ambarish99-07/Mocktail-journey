import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';

/** Rider explicitly ends sharing (e.g. delivery complete) — the customer's map then falls back to "last known position" messaging instead of a live dot. */
export async function POST(_request: Request, { params }: { params: { token: string } }) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.token)) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  const orders = await getOrdersCollection();
  const result = await orders.updateOne(
    { 'rider.trackingToken': params.token },
    { $set: { 'rider.sharingActive': false, updatedAt: new Date().toISOString() } }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
