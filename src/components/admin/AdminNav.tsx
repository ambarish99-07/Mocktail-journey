'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin', label: 'Orders' },
  { href: '/admin/leads', label: 'Enquiries' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-2 border-b border-tbc-charcoal-border">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'border-b-2 px-3 pb-3 text-sm font-medium transition-colors',
            pathname === tab.href
              ? 'border-tbc-gold-400 text-tbc-gold-400'
              : 'border-transparent text-tbc-cream-muted hover:text-tbc-gold-400'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
