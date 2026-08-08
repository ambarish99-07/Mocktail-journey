import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'gold' | 'emerald' | 'whatsapp' | 'zomato' | 'swiggy' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  gold: 'bg-gold-gradient text-black font-semibold shadow-gold-glow hover:brightness-110 active:brightness-95',
  emerald:
    'bg-tbc-emerald-500 text-tbc-cream font-semibold shadow-emerald-glow hover:bg-tbc-emerald-400 active:bg-tbc-emerald-600',
  whatsapp: 'bg-[#25D366] text-black font-semibold hover:brightness-105 active:brightness-95',
  // Official brand colors (Zomato red / Swiggy orange). White text on Swiggy's
  // orange fails contrast (~2.5:1), so it gets dark text instead — same
  // light-background pattern as the `gold` variant.
  zomato: 'bg-[#E23744] text-white font-semibold hover:brightness-110 active:brightness-95',
  swiggy: 'bg-[#FC8019] text-black font-semibold hover:brightness-105 active:brightness-95',
  outline:
    'border border-tbc-gold-400/60 text-tbc-cream hover:bg-tbc-gold-400/10 active:bg-tbc-gold-400/15',
  ghost: 'text-tbc-cream hover:bg-tbc-charcoal-light',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
};

/** Shared class builder so non-<button> elements (e.g. Next Link) can look identical to Button. */
export function buttonClasses(variant: ButtonVariant = 'gold', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center rounded-full transition-all duration-200',
    'disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', ...props }, ref) => {
    return <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />;
  }
);
Button.displayName = 'Button';
