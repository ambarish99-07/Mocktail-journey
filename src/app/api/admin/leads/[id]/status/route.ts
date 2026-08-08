import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/server';
import { getLeadsCollection } from '@/lib/db/collections';
import type { LeadStatus } from '@/types/db';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const leads = await getLeadsCollection();
  const result = await leads.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { status: status as LeadStatus, updatedAt: new Date().toISOString() } }
  );
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
