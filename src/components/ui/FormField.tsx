import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-xl2 border border-tbc-charcoal-border bg-tbc-black px-4 py-2.5 text-sm text-tbc-cream placeholder:text-tbc-cream-dim focus:border-tbc-gold-400';

interface FormFieldProps {
  /** Must match the `id` on the field's input/select/textarea so the label is programmatically associated (screen readers, `getByLabel`). */
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ id, label, error, children, className }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-tbc-cream-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
