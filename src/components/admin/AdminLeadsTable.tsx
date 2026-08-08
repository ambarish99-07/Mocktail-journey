'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { LeadStatus, LeadType } from '@/types/db';

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
}

const TYPE_LABELS: Record<LeadType, string> = {
  contact: 'Contact',
  catering: 'Catering',
  franchise: 'Franchise',
};

const STATUS_FLOW: LeadStatus[] = ['new', 'contacted', 'closed'];
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

const POLL_INTERVAL_MS = 20000;

export function AdminLeadsTable() {
  const [leads, setLeads] = useState<AdminLead[] | null>(null);
  const [typeFilter, setTypeFilter] = useState<LeadType | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const url = typeFilter === 'all' ? '/api/admin/leads' : `/api/admin/leads?type=${typeFilter}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const body = await res.json();
    setLeads(body.leads);
  }, [typeFilter]);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const advanceStatus = async (lead: AdminLead, nextStatus: LeadStatus) => {
    setUpdatingId(lead.id);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        toast.error('Could not update lead status.');
        return;
      }
      toast.success(`${lead.name} marked ${STATUS_LABELS[nextStatus]}.`);
      fetchLeads();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'contact', 'catering', 'franchise'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === type
                  ? 'border-tbc-gold-400 bg-tbc-gold-400/10 text-tbc-gold-400'
                  : 'border-tbc-charcoal-border text-tbc-cream-muted hover:border-tbc-gold-400/40'
              )}
            >
              {type === 'all' ? 'All' : TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => fetchLeads()}
          className="flex items-center gap-1.5 text-xs font-medium text-tbc-cream-muted hover:text-tbc-gold-400"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {leads === null ? (
        <p className="text-tbc-cream-muted">Loading enquiries…</p>
      ) : leads.length === 0 ? (
        <p className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light py-12 text-center text-tbc-cream-muted">
          No enquiries in this view.
        </p>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => {
            const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(lead.status) + 1];
            return (
              <li key={lead.id} className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {lead.name}{' '}
                      <span className="ml-1 rounded-full border border-tbc-charcoal-border px-2 py-0.5 text-[11px] font-medium text-tbc-cream-dim">
                        {TYPE_LABELS[lead.type]}
                      </span>
                    </p>
                    <p className="text-xs text-tbc-cream-dim">
                      {new Date(lead.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="mt-1 text-sm text-tbc-cream-muted">
                      {lead.email} · {lead.phone}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{STATUS_LABELS[lead.status]}</span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-tbc-cream-muted">
                  {lead.type === 'catering' && (
                    <p>
                      {lead.eventType} · {lead.eventDate} · {lead.guestCount} guests
                    </p>
                  )}
                  {lead.type === 'franchise' && (
                    <p>
                      {lead.city} · {lead.investmentBudget}
                      {lead.experience ? ` · ${lead.experience}` : ''}
                    </p>
                  )}
                  {lead.message && <p>{lead.message}</p>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-tbc-charcoal-border pt-3">
                  {nextStatus && (
                    <button
                      type="button"
                      disabled={updatingId === lead.id}
                      onClick={() => advanceStatus(lead, nextStatus)}
                      className="rounded-full bg-tbc-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-tbc-emerald-400 disabled:opacity-50"
                    >
                      Mark {STATUS_LABELS[nextStatus]}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
