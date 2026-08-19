'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

interface NavMoreDropdownProps {
  label: string;
  links: readonly NavLink[];
}

/** Desktop-only overflow menu for secondary nav links — click-to-open, closes on outside click, link click, or route change. */
export function NavMoreDropdown({ label, links }: NavMoreDropdownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const isActive = links.some((link) => link.href === pathname);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 text-sm font-medium tracking-wide text-tbc-cream-muted transition-colors hover:text-tbc-gold-400',
          isActive && 'text-tbc-gold-400'
        )}
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-3 w-48 overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light py-1.5 shadow-premium"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className={cn(
                'block px-4 py-2 text-sm font-medium text-tbc-cream-muted transition-colors hover:bg-tbc-charcoal-border hover:text-tbc-gold-400',
                pathname === link.href && 'text-tbc-gold-400'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
