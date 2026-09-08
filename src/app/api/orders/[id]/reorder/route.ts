import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { getSession } from '@/lib/auth/server';
import { revalidateCartItemsLenient } from '@/lib/order-revalidation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Re-prices a past delivered order's lines against the CURRENT menu — never
 * reuses the stored (potentially stale) unitPrice, same principle as every
 * other price in this app. Read-only: doesn't touch the order or the cart,
 * just returns cart-ready lines for the client to add.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!checkRateLimit('order-reorder', ip, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  if (!/^[A-Za-z0-9_-]{10,64}$/.test(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ accessToken: params.id });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  // Reorder is only offered from Account order history, so require the
  // account it belongs to — unlike guest-friendly cancel/refund-claim, there's
  // no guest reorder entry point to support.
  const session = await getSession();
  if (!order.userId || !session || session.userId !== order.userId.toHexString()) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'Only delivered orders can be reordered.' }, { status: 400 });
  }

  const { items, skipped } = revalidateCartItemsLenient(order.items);
  if (items.length === 0) {
    return NextResponse.json(
      { error: 'None of the items in this order are still available.' },
      { status: 400 }
    );
  }

  const priceChanged = items.some((item) => {
    const original = order.items.find((o) => o.menuItemId === item.menuItemId);
    return original && original.unitPrice !== item.unitPrice;
  });

  return NextResponse.json({ items, skipped, priceChanged });
}
