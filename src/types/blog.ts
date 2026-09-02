export type BlogCategory = 'Recipes' | 'Behind the Scenes' | 'Rewards & Offers' | 'Catering Tips' | 'Company News';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  category: BlogCategory;
  author: string;
  publishedAt: string; // ISO date
  readTimeMinutes: number;
  /** Paragraphs of body copy — kept as plain strings (no MDX) for a simple v1 renderer. */
  content: string[];
}
