import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-tbc-gold-400">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base text-tbc-cream-muted sm:text-lg">{description}</p>}
    </div>
  );
}
