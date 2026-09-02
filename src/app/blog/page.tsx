import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Badge';
import { FadeIn } from '@/components/ui/FadeIn';
import { PageHero } from '@/components/shared/PageHero';
import { getBlogPostsSortedByDate } from '@/data/blog';
import { formatBlogDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Recipes, behind-the-scenes stories, rewards guides, and news from The Blenders Club.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const posts = getBlogPostsSortedByDate();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Stories from The Blenders Club"
        description="Recipes, behind-the-scenes looks at our cloud kitchen, rewards guides, and the occasional bit of company news."
      />

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delay={(i % 3) * 0.1}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light transition-colors hover:border-tbc-gold-400/40"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.coverImageAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3">
                      <Tag>{post.category}</Tag>
                      <span className="text-xs text-tbc-cream-dim">{post.readTimeMinutes} min read</span>
                    </div>
                    <h2 className="mt-3 font-heading text-lg font-semibold leading-snug text-tbc-cream transition-colors group-hover:text-tbc-gold-400">
                      {post.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-tbc-cream-muted">{post.excerpt}</p>
                    <p className="mt-4 text-xs text-tbc-cream-dim">{formatBlogDate(post.publishedAt)}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
