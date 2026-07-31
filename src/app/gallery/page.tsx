import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/shared/PageHero';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Shakes, cold coffees, store ambience, and behind-the-scenes moments from The Blenders Club.',
  alternates: { canonical: '/gallery' },
};

const galleryImages: { src: string; alt: string }[] = [
  { src: 'https://images.unsplash.com/photo-1653085315536-1379bc836161?w=800&q=80', alt: 'Rich chocolate shake' },
  { src: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80', alt: 'Chilled cold coffee' },
  { src: 'https://images.unsplash.com/photo-1623728720458-8c2f5a9dc13c?w=800&q=80', alt: 'Cookies and cream shake' },
  { src: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80', alt: 'Mixed berry shake' },
  { src: 'https://images.unsplash.com/photo-1459933083533-46381576caa9?w=800&q=80', alt: 'Saffron pistachio shake' },
  { src: 'https://images.unsplash.com/photo-1555411093-41f7864ed3a2?w=800&q=80', alt: 'Honey almond crunch shake' },
  { src: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80', alt: 'Store ambience' },
  { src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', alt: 'Catering event setup' },
  { src: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=800&q=80', alt: 'Caramel cold coffee' },
  { src: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80', alt: 'Fresh mango shake' },
  { src: 'https://images.unsplash.com/photo-1696487773677-c0c8061fe3d2?w=800&q=80', alt: 'Chocolate hazelnut shake' },
  { src: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&q=80', alt: 'Freshly brewed coffee beans' },
];

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A Look Inside The Blenders Club"
        description="Shakes, cold coffees, events, and the moments in between."
      />

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((img, i) => (
              <div key={img.src} className="relative aspect-square overflow-hidden rounded-xl2">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading={i < 4 ? 'eager' : 'lazy'}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
