import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation';
import { getLeadsCollection } from '@/lib/db/collections';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { LeadDoc } from '@/types/db';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit('contact', ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { name, email, phone, message } = parsed.data;

  const now = new Date().toISOString();
  const doc: Omit<LeadDoc, '_id'> = {
    type: 'contact',
    status: 'new',
    name,
    email,
    phone,
    message,
    createdAt: now,
    updatedAt: now,
  };

  const leads = await getLeadsCollection();
  await leads.insertOne(doc as LeadDoc);

  return NextResponse.json({ ok: true }, { status: 201 });
}
