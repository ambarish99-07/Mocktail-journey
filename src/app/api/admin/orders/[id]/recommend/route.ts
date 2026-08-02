import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/server';
import { getOrdersCollection } from '@/lib/db/collections';
import { recommendItemsForCustomer } from '@/lib/recommendations';
import { sendRecommendationMessage } from '@/lib/whatsapp-server';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const orders = await getOrdersCollection();
  const order = await orders.findOne({ _id: new ObjectId(params.id) });
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  // Phone, not userId, is the shared identifier across both guest and registered
  // orders — this is what lets recommendations work for guests too.
  const pastOrders = await orders.find({ 'delivery.phone': order.delivery.phone }).toArray();
  const items = recommendItemsForCustomer(pastOrders);

  if (items.length === 0) {
    return NextResponse.json({ error: 'Not enough order history to generate a recommendation.' }, { status: 400 });
  }

  const result = await sendRecommendationMessage(order.delivery.phone, order.delivery.fullName, items);
  if (!result.ok) {
    const message =
      result.error === 'not-configured'
        ? 'WhatsApp recommendations aren’t configured yet (missing Cloud API credentials or template).'
        : 'Could not send the recommendation message.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await orders.updateOne(
    { _id: order._id },
    { $set: { 'whatsapp.recommendationSentAt': new Date().toISOString() } }
  );

  return NextResponse.json({
    items: items.map((item) => ({ id: item.id, signatureName: item.signatureName })),
  });
}
