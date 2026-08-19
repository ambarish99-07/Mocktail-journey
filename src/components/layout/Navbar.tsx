'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal, ShoppingCart, User, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { buttonClasses } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NavMoreDropdown } from '@/components/layout/NavMoreDropdown';
import { navLinks, primaryNavLinks, moreNavLinks } from '@/lib/config';
import { useCartCount, useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartCount();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const authUser = useAuthStore((s) => s.user);
  const refreshAuth = useAuthStore((s) => s.refresh);

  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          className="flex h-20 items-center justify-between border-b border-tbc-cream/5"
        >
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              priority
              className="h-9 w-9 shrink-0 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
            />
            <span className="whitespace-nowrap font-heading text-base font-semibold tracking-wide sm:text-xl lg:text-2xl">
              The <span className="text-gold-gradient">Blenders</span> Club
            </span>
          </Link>

          {/* Nav links live in the same right-hand cluster as the action
              buttons (instead of being spread across the middle by
              justify-between on their own) so they sit close to Order
              Directly rather than floating in a wide gap. */}
          <div className="flex items-center gap-8 xl:gap-10">
            <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
              {primaryNavLinks.map((link) => (
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
              <li>
                <NavMoreDropdown label="More" links={moreNavLinks} />
              </li>
            </ul>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link href="/menu" className={cn(buttonClasses('gold', 'sm'), 'hidden lg:inline-flex')}>
                Order Directly
              </Link>

              <button
                type="button"
                aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
                onClick={openDrawer}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:bg-tbc-charcoal-light lg:flex"
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

              <ThemeToggle className="hidden lg:flex" />

              <Link
                href={authUser ? '/account' : '/login'}
                aria-label={authUser ? `Account, signed in as ${authUser.fullName}` : 'Sign in'}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream transition-colors hover:bg-tbc-charcoal-light"
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </Link>

              {/* Below lg, everything else (order CTA, cart, nav links, theme)
                  collapses into this single dropdown — keeps the header to just
                  logo + user + one more button instead of a crowded icon row. */}
              <button
                type="button"
                aria-label={isMobileOpen ? 'Close menu' : 'More options'}
                aria-expanded={isMobileOpen}
                onClick={() => setIsMobileOpen((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-tbc-charcoal-border text-tbc-cream lg:hidden"
              >
                {isMobileOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
                {!isMobileOpen && cartCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-tbc-emerald-500 px-1 text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </Container>

      {isMobileOpen && (
        <div className="border-b border-tbc-cream/5 bg-tbc-black lg:hidden">
          <Container>
            <div className="flex gap-3 pt-4">
              <Link href="/menu" className={cn(buttonClasses('gold', 'md'), 'flex-1')}>
                Order Now
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  openDrawer();
                }}
                className="relative flex items-center gap-2 rounded-full border border-tbc-charcoal-border px-5 text-sm font-medium text-tbc-cream transition-colors hover:bg-tbc-charcoal-light"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Cart
                {cartCount > 0 && (
                  <span
                    className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-tbc-emerald-500 px-1 text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
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
            <div className="flex items-center justify-between border-t border-tbc-cream/5 py-4">
              <span className="text-sm font-medium text-tbc-cream-muted">Appearance</span>
              <ThemeToggle />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
