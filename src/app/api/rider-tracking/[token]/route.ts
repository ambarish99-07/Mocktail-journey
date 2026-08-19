import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';

/** Minimal order summary for the rider-facing page — reachable by the unguessable trackingToken alone, no login. Never includes payment/pricing details. */
export async function GET(_request: Request, { params }: { params: { token: string } }) {
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.token)) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ 'rider.trackingToken': params.token });
  if (!order || !order.rider) {
    return NextResponse.json({ error: 'Tracking link not found.' }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    riderName: order.rider.name,
    customerName: order.delivery.fullName,
    address: `${order.delivery.address}, ${order.delivery.city} - ${order.delivery.pincode}`,
    sharingActive: order.rider.sharingActive,
  });
}
