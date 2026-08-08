'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 8000;

/** Morse code timing unit — short/fast reads as more urgent than a leisurely SOS. */
const DIT_MS = 120;
const DAH_MS = DIT_MS * 3;
const INTRA_LETTER_GAP_MS = DIT_MS;
const INTER_LETTER_GAP_MS = DIT_MS * 3;
const REPEAT_GAP_MS = DIT_MS * 7;

/** One full "· · · − − − · · ·" (SOS) cycle, as alternating tone-on/tone-off durations, then repeats. */
const SOS_PATTERN: { on: boolean; ms: number }[] = [
  // S
  { on: true, ms: DIT_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DIT_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DIT_MS }, { on: false, ms: INTER_LETTER_GAP_MS },
  // O
  { on: true, ms: DAH_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DAH_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DAH_MS }, { on: false, ms: INTER_LETTER_GAP_MS },
  // S
  { on: true, ms: DIT_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DIT_MS }, { on: false, ms: INTRA_LETTER_GAP_MS },
  { on: true, ms: DIT_MS }, { on: false, ms: REPEAT_GAP_MS },
];

interface IncomingOrder {
  id: string;
  orderNumber: string;
  totals: { total: number };
  delivery: { fullName: string };
}

/**
 * Loud, hard-to-miss alert for new orders on the admin dashboard — a
 * synthesized SOS/emergency alarm (Web Audio API, no external audio file —
 * avoids licensing an actual siren and keeps this dependency-free) plus a
 * full-screen flashing overlay that has to be explicitly acknowledged.
 *
 * Browsers block audio autoplay without a prior user gesture, so this can't
 * just start ringing the moment a poll detects an order — the admin has to
 * click "Enable Alerts" once per visit first, which also doubles as asking
 * for Notification permission (best-effort backup if the tab isn't focused).
 */
export function NewOrderAlertSystem() {
  const [armed, setArmed] = useState(false);
  const [activeAlert, setActiveAlert] = useState<IncomingOrder | null>(null);
  const [extraCount, setExtraCount] = useState(0);

  const knownOrderIds = useRef<Set<string> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const cadenceTimeoutRef = useRef<number | null>(null);
  const patternStepRef = useRef(0);
  const originalTitleRef = useRef('');

  const stopRingtone = useCallback(() => {
    if (cadenceTimeoutRef.current !== null) {
      window.clearTimeout(cadenceTimeoutRef.current);
      cadenceTimeoutRef.current = null;
    }
    try {
      oscillatorRef.current?.stop();
    } catch {
      // already stopped — fine
    }
    oscillatorRef.current = null;
    gainRef.current = null;
    patternStepRef.current = 0;
  }, []);

  const startRingtone = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== 'running') return;
    stopRingtone();

    // Single harsher tone (square wave, higher pitch) reads as an alarm/siren
    // rather than a warm phone ring — the on/off timing spells out "SOS" in
    // Morse code (· · · − − − · · ·), a globally recognizable emergency signal.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0;
    osc.start();

    oscillatorRef.current = osc;
    gainRef.current = gain;
    patternStepRef.current = 0;

    const step = () => {
      const g = gainRef.current;
      if (!g || !audioCtxRef.current) return;
      const beat = SOS_PATTERN[patternStepRef.current % SOS_PATTERN.length]!;
      g.gain.setTargetAtTime(beat.on ? 0.3 : 0, audioCtxRef.current.currentTime, 0.01);
      patternStepRef.current += 1;
      cadenceTimeoutRef.current = window.setTimeout(step, beat.ms);
    };
    step();
  }, [stopRingtone]);

  const handleEnableAlerts = async () => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    await ctx.resume();
    audioCtxRef.current = ctx;

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission().catch(() => undefined);
    }
    setArmed(true);
  };

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) return; // not signed in as admin — stay quiet
      const body: { orders: IncomingOrder[] } = await res.json();

      if (knownOrderIds.current === null) {
        // First load — record what's already there without alerting on it.
        knownOrderIds.current = new Set(body.orders.map((o) => o.id));
        return;
      }

      const fresh = body.orders.filter((o) => !knownOrderIds.current!.has(o.id));
      fresh.forEach((o) => knownOrderIds.current!.add(o.id));
      const firstFresh = fresh[0];
      if (!firstFresh) return;

      setActiveAlert((current) => {
        if (current) {
          setExtraCount((n) => n + fresh.length);
          return current;
        }
        setExtraCount(fresh.length - 1);
        return firstFresh;
      });

      if (armed) {
        startRingtone();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New order — The Blenders Club', {
            body: `${firstFresh.orderNumber} — ${firstFresh.delivery.fullName}`,
          });
        }
      }
    } catch {
      // network hiccup — never crash the admin page over this
    }
  }, [armed, startRingtone]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    if (!activeAlert) return;
    originalTitleRef.current = document.title;
    let flashOn = true;
    const titleInterval = setInterval(() => {
      document.title = flashOn ? '🔔 NEW ORDER!' : originalTitleRef.current;
      flashOn = !flashOn;
    }, 1000);
    return () => {
      clearInterval(titleInterval);
      document.title = originalTitleRef.current;
    };
  }, [activeAlert]);

  useEffect(() => stopRingtone, [stopRingtone]);

  const acknowledge = () => {
    stopRingtone();
    setActiveAlert(null);
    setExtraCount(0);
  };

  return (
    <>
      {!armed && (
        <button
          type="button"
          onClick={handleEnableAlerts}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl2 border border-tbc-gold-400/50 bg-tbc-gold-400/10 px-4 py-3 text-sm font-semibold text-tbc-gold-400 transition-colors hover:bg-tbc-gold-400/20"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          Enable Loud Order Alerts (required once per visit — your browser blocks sound until you click something)
        </button>
      )}

      {activeAlert && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          role="alertdialog"
          aria-live="assertive"
          aria-label="New order alert"
        >
          <div className={cn('w-full max-w-md rounded-2xl border-4 border-red-500 bg-tbc-charcoal p-8 text-center shadow-2xl', 'animate-pulse')}>
            <BellRing className="mx-auto h-16 w-16 text-red-500" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-red-500">New Order!</h2>
            <p className="mt-3 text-lg font-semibold">{activeAlert.orderNumber}</p>
            <p className="text-tbc-cream-muted">
              {activeAlert.delivery.fullName} — {formatCurrency(activeAlert.totals.total)}
            </p>
            {extraCount > 0 && (
              <p className="mt-2 text-sm text-tbc-gold-400">
                +{extraCount} more order{extraCount === 1 ? '' : 's'} waiting
              </p>
            )}
            {!armed && <p className="mt-3 text-xs text-tbc-cream-dim">(Sound is off — enable alerts above to hear it next time.)</p>}
            <Button variant="gold" size="lg" className="mt-6 w-full" onClick={acknowledge}>
              Acknowledge
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
