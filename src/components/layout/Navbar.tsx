'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { buttonClasses } from '@/components/ui/Button';
import { navLinks } from '@/lib/config';
import { useCartCount, useCartStore } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartCount();
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        isScrolled ? 'bg-tbc-black/90 backdrop-blur-md shadow-premium' : 'bg-transparent'
      )}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Container>
        <nav
          aria-label="Primary"
          className="flex h-20 items-center justify-between border-b border-white/5"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              priority
              className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
            />
            <span className="font-heading text-xl font-semibold tracking-wide sm:text-2xl">
              The <span className="text-gold-gradient">Blenders</span> Club
            </span>
          </Link>

          <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'text-sm font-medium tracking-wide text-tbc-cream-muted transition-colors hover:text-tbc-gold-400',
                    pathname === link.href && 'text-tbc-gold-400'
                  )}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className={cn(buttonClasses('gold', 'sm'), 'hidden sm:inline-flex')}
            >
              Order Directly
            </Link>

            <button
              type="button"
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              onClick={openDrawer}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:bg-tbc-charcoal-light"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-tbc-emerald-500 px-1 text-[11px] font-bold text-white"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream lg:hidden"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {isMobileOpen && (
        <div className="border-b border-white/5 bg-tbc-black lg:hidden">
          <Container>
            <ul className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium text-tbc-cream-muted transition-colors hover:bg-tbc-charcoal-light hover:text-tbc-gold-400',
                      pathname === link.href && 'text-tbc-gold-400'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}
    </header>
  );
}
