import type { ReactNode } from 'react';

export function LegalContent({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-tbc-cream-muted [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-tbc-cream [&_h2]:font-heading [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
      {children}
    </div>
  );
}
