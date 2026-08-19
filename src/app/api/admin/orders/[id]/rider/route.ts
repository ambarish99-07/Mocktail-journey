import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import crypto from 'node:crypto';
import { requireAdmin } from '@/lib/auth/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { resolveDeliveryCoordinates } from '@/lib/geo';
import { siteConfig } from '@/lib/config';
import type { RiderInfo } from '@/types/db';

/** Admin assigns a delivery rider (name + phone) — generates the unguessable link the admin sends the rider (e.g. via WhatsApp) so they can start sharing their live location. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  if (name.length < 2 || !/^[+]?[0-9]{10,13}$/.test(phone)) {
    return NextResponse.json({ error: 'Enter a valid rider name and phone number.' }, { status: 400 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ _id: new ObjectId(params.id) });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const rider: RiderInfo = {
    name,
    phone,
    // Reuse the existing rider's token on reassignment so an already-shared
    // link keeps working, rather than silently breaking it.
    trackingToken: order.rider?.trackingToken ?? crypto.randomBytes(24).toString('base64url'),
    location: order.rider?.location ?? null,
    sharingActive: order.rider?.sharingActive ?? false,
  };

  // Best-effort — resolves the customer's pin for the map if it isn't
  // already known (e.g. this wasn't a Premium order, which resolves it at
  // checkout). Never blocks assigning the rider if geocoding fails.
  let deliveryCoordinates = order.deliveryCoordinates;
  if (!deliveryCoordinates) {
    const fullAddress = [order.delivery.address, order.delivery.city, order.delivery.pincode].filter(Boolean).join(', ');
    deliveryCoordinates = await resolveDeliveryCoordinates(order.delivery.mapsLink, fullAddress);
  }

  await orders.updateOne(
    { _id: order._id },
    { $set: { rider, deliveryCoordinates, updatedAt: new Date().toISOString() } }
  );

  return NextResponse.json({
    rider: { name: rider.name, phone: rider.phone },
    trackingLink: `${siteConfig.url}/rider/${rider.trackingToken}`,
  });
}
