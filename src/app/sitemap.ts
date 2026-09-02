import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { blogPosts } from '@/data/blog';

const staticRoutes = [
  '',
  '/menu',
  '/about',
  '/catering',
  '/franchise',
  '/rewards',
  '/gallery',
  '/faqs',
  '/contact',
  '/blog',
  '/privacy-policy',
  '/terms-and-conditions',
  '/refund-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/menu' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/menu' ? 0.9 : 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries];
}
