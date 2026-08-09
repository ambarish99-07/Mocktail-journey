'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';
import { MenuCard } from '@/components/menu/MenuCard';
import { CustomizeModal } from '@/components/menu/CustomizeModal';
import { buttonClasses } from '@/components/ui/Button';
import { menuItems } from '@/data/menu';
import type { MenuItem } from '@/types/menu';

const preview = menuItems.slice(0, 8);

export function SignatureMenuPreview() {
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="The Menu"
            title="Signature Menu Preview"
            description="A taste of what's waiting for you — explore the full menu for all 15 drinks and customization options."
          />
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {preview.map((item, i) => (
            <FadeIn key={item.id} delay={(i % 4) * 0.06} className="h-full">
              <MenuCard item={item} onCustomize={setCustomizing} />
            </FadeIn>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/menu" className={buttonClasses('outline', 'lg')}>
            View Full Menu
          </Link>
        </div>
      </Container>

      <CustomizeModal item={customizing} onClose={() => setCustomizing(null)} />
    </section>
  );
}
