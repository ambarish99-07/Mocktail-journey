'use client';

import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FadeIn } from '@/components/ui/FadeIn';

const galleryImages = [
  'https://images.unsplash.com/photo-1653085315536-1379bc836161?w=600&q=80',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
  'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80',
  'https://images.unsplash.com/photo-1459933083533-46381576caa9?w=600&q=80',
  'https://images.unsplash.com/photo-1555411093-41f7864ed3a2?w=600&q=80',
];

export function InstagramGallery() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading eyebrow="@theblendersclub" title="Follow The Journey" />
        </FadeIn>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((src, i) => (
            <FadeIn key={src} delay={i * 0.05}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl2"
                aria-label="View on Instagram"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-tbc-black/0 transition-colors group-hover:bg-tbc-black/40">
                  <Instagram
                    className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
