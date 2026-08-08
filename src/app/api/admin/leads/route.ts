import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { getLeadsCollection } from '@/lib/db/collections';
import type { LeadDoc, LeadStatus, LeadType } from '@/types/db';

interface AdminLead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string;
  message?: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  city?: string;
  investmentBudget?: string;
  experience?: string;
  createdAt: string;
  updatedAt: string;
}

function toAdminLead(doc: LeadDoc): AdminLead {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    status: doc.status,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    message: doc.message,
    eventType: doc.eventType,
    eventDate: doc.eventDate,
    guestCount: doc.guestCount,
    city: doc.city,
    investmentBudget: doc.investmentBudget,
    experience: doc.experience,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  const query: Partial<Pick<LeadDoc, 'type' | 'status'>> = {};
  if (type) query.type = type as LeadType;
  if (status) query.status = status as LeadStatus;

  const leads = await getLeadsCollection();
  const docs = await leads.find(query).sort({ createdAt: -1 }).limit(200).toArray();

  return NextResponse.json({ leads: docs.map(toAdminLead) });
}
