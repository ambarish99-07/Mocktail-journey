'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure context) —
      // the code is already visible on the button, so this is a soft failure.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition-colors',
        copied
          ? 'border-tbc-emerald-500/50 bg-tbc-emerald-500/10 text-tbc-emerald-400'
          : 'border-tbc-gold-400/50 bg-tbc-gold-400/10 text-tbc-gold-400 hover:bg-tbc-gold-400/20'
      )}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {code}
    </button>
  );
}
