'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DeliveryNoteBoxProps {
  orderId: string;
  initialNote: string;
  disabled: boolean;
  onSaved: (note: string) => void;
}

/** Post-order note to the rider — separate from the pre-order "special instructions" at checkout, this is for anything that comes to mind after the order's already placed. */
export function DeliveryNoteBox({ orderId, initialNote, disabled, onSaved }: DeliveryNoteBoxProps) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? 'Could not save your note.');
        return;
      }
      onSaved(note);
      toast.success('Note sent to your rider.');
    } catch {
      toast.error('Could not save your note. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-5">
      <label htmlFor="delivery-note" className="text-sm font-semibold">
        Anything specific for your delivery?
      </label>
      <p className="mt-0.5 text-xs text-tbc-cream-dim">E.g. call before arriving, leave at the gate, floor/flat number.</p>
      <textarea
        id="delivery-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={disabled}
        maxLength={300}
        className={cn(
          'mt-3 min-h-[80px] w-full resize-y rounded-xl2 border border-tbc-charcoal-border bg-tbc-black px-4 py-2.5 text-sm text-tbc-cream placeholder:text-tbc-cream-dim focus:border-tbc-gold-400 focus:outline-none disabled:opacity-60'
        )}
        placeholder="Leave a note for your rider..."
      />
      <Button variant="outline" size="sm" className="mt-3" disabled={disabled || saving} onClick={handleSave}>
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
        {saving ? 'Saving…' : 'Save Note'}
      </Button>
    </div>
  );
}
