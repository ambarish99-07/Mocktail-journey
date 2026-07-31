import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

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
  '/privacy-policy',
  '/terms-and-conditions',
  '/refund-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/menu' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/menu' ? 0.9 : 0.6,
  }));
}
