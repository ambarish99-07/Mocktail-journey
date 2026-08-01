import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { getSession } from '@/lib/auth/server';
import { toPlacedOrder } from '@/lib/order-mapping';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // params.id is the order's random accessToken, not the Mongo _id — plain
  // format sanity check, the real gate is the DB lookup matching a real token.
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ accessToken: params.id });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  // Guest orders (userId: null) are fetchable by token alone — the token is
  // cryptographically random and unguessable, so it functions as the access
  // credential for the confirmation page. Registered-user orders additionally
  // require session ownership as a second layer.
  if (order.userId) {
    const session = await getSession();
    if (!session || session.userId !== order.userId.toHexString()) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
  }

  return NextResponse.json({ order: toPlacedOrder(order) });
}
