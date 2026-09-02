import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Badge';
import { LegalContent } from '@/components/shared/LegalContent';
import { blogPosts, getBlogPostBySlug } from '@/data/blog';
import { formatBlogDate } from '@/lib/utils';
import { siteConfig } from '@/lib/config';

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage }],
    },
  };
}

function BlogPostingJsonLd({ post }: { post: NonNullable<ReturnType<typeof getBlogPostBySlug>> }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    author: { '@type': 'Organization', name: post.author },
    datePublished: post.publishedAt,
    publisher: { '@type': 'Organization', name: siteConfig.brandName },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <>
      <BlogPostingJsonLd post={post} />
      <section className="border-b border-tbc-cream/5 bg-tbc-charcoal/40 py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-tbc-cream-muted transition-colors hover:text-tbc-gold-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Blog
          </Link>
          <Tag>{post.category}</Tag>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">{post.title}</h1>
          <p className="mt-4 text-sm text-tbc-cream-dim">
            {post.author} · {formatBlogDate(post.publishedAt)} · {post.readTimeMinutes} min read
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-xl2">
            <Image src={post.coverImage} alt={post.coverImageAlt} fill priority sizes="100vw" className="object-cover" />
          </div>

          <LegalContent>
            {post.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </LegalContent>

          <div className="mt-12 border-t border-tbc-cream/5 pt-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-tbc-gold-400 hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to all posts
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
