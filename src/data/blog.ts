import type { BlogPost } from '@/types/blog';

/**
 * Placeholder editorial content — swap in real posts (and real photography,
 * see gallery/page.tsx for the same Unsplash-placeholder pattern) before
 * launch. Sorted newest-first is handled by the consumer, not stored here.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-choose-the-right-shake-for-your-mood',
    title: 'How to Choose the Right Shake for Your Mood',
    excerpt:
      'From a rich Choco Crush after a long day to a light Vanilla Dream on a lazy afternoon — a quick guide to matching our menu to how you feel.',
    coverImage: 'https://images.unsplash.com/photo-1638176067000-9e0248a1de17?w=1200&q=80',
    coverImageAlt: 'A rich chocolate milkshake in a glass',
    category: 'Recipes',
    author: 'The Blenders Club Team',
    publishedAt: '2026-08-18',
    readTimeMinutes: 4,
    content: [
      'Not every shake is built for every moment — some are made for winding down, others for waking up. Here’s how we’d match our menu to your mood.',
      'Need comfort after a rough day? Choco Crush or Choco Crunch Blast lean into deep, velvety cocoa with real cream — the closest thing we serve to a hug in a glass.',
      'Craving something light and refreshing? Mango Magic or Berry Bloom bring fruit-forward sweetness without feeling heavy, perfect for a hot Patna afternoon.',
      'Want a little indulgence without going overboard? Caramel Bliss or Golden Crunch balance sweetness with a nutty, salted edge.',
      'And if you’re just craving the classics, Vanilla Dream and Banana Bliss are timeless for a reason — simple, smooth, and consistent every single time.',
      'Whatever you pick, remember every drink can be customized — dial the sugar and ice level to exactly how you like it, and add crushed Oreo, KitKat, or dry fruits on top.',
    ],
  },
  {
    slug: 'inside-our-cloud-kitchen',
    title: 'Inside Our Cloud Kitchen: What "Delivery-Only" Actually Means',
    excerpt:
      'No dine-in, no walk-in counter — just a production kitchen built entirely around getting a fresh shake to your door fast. Here’s how that changes what we do.',
    coverImage: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1200&q=80',
    coverImageAlt: 'Behind-the-scenes kitchen preparation',
    category: 'Behind the Scenes',
    author: 'The Blenders Club Team',
    publishedAt: '2026-08-05',
    readTimeMinutes: 5,
    content: [
      'A cloud kitchen is a restaurant with no dining room — every square foot is dedicated to prep, blending, and packing orders for delivery, not seating guests.',
      'For us, that means every shake is blended fresh the moment your order comes in, not batched ahead of time and left waiting.',
      'It also means our estimated delivery time isn’t a guess — it scales with how far you are from our kitchen, so an order 1km away and one 3km away get honestly different estimates instead of the same generic promise.',
      'The tradeoff is real: no walk-in counter to grab a shake on a whim. But it lets us focus entirely on consistency and speed for the orders we do take — every drink you get is made the same way, every time, whether it’s your first order or your fiftieth.',
    ],
  },
  {
    slug: 'a-guide-to-blenders-club-rewards',
    title: 'A Complete Guide to Blenders Club Rewards',
    excerpt:
      'Multi-shake discounts, first-order BOGO, milestone rewards, and Premium Membership — here’s exactly how every reward stacks, explained in one place.',
    coverImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=80',
    coverImageAlt: 'A chilled cold coffee with a frothy top',
    category: 'Rewards & Offers',
    author: 'The Blenders Club Team',
    publishedAt: '2026-07-22',
    readTimeMinutes: 6,
    content: [
      'Everything in our rewards program is automatic — no coupon codes to remember, no app to download.',
      'The Multi-Shake Discount kicks in the moment you add more drinks to one order: 10% off for 2+, 15% off for 3+, and 20% off for 4+. Combo bundles get their own flat 15% off, always.',
      'Create a free account and your very first order gets Buy 1 Get 1 Free automatically on the cheapest eligible drink in your cart.',
      'Keep ordering and two more rewards kick in on repeat: 50% off a cold coffee every 6th order, and a completely free drink every 10th order.',
      'Our most loyal customers unlock Premium Membership after 15 completed orders — 25% off every order plus free delivery within 3km of our kitchen. Not ready to wait that long? The Premium Membership Card gets you the free-delivery half of that for ₹21 for 60 days, no order history required.',
      'Full details and live numbers always live on our Rewards page and FAQs — this post is a plain-English walkthrough of how it all fits together.',
    ],
  },
  {
    slug: 'planning-a-shake-station-for-your-next-event',
    title: 'Planning a Shake Station for Your Next Event',
    excerpt:
      'Birthday, wedding, or office party — a few things to think about before you book catering, from guest count to service windows.',
    coverImage: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80',
    coverImageAlt: 'Catering event setup with drinks',
    category: 'Catering Tips',
    author: 'The Blenders Club Team',
    publishedAt: '2026-07-02',
    readTimeMinutes: 4,
    content: [
      'A live shake station tends to be one of the most talked-about parts of an event — but a little planning goes a long way toward making it run smoothly.',
      'Start with guest count. Our Starter package comfortably covers up to 30 guests, Classic scales to 75, and Premium is built for 75+ with a dedicated staff and custom flavour options.',
      'Think about your service window next — most events run their shake station for 2 to 4 hours depending on the package, timed around when guests are most likely to want a drink in hand (right after a meal is a popular slot).',
      'Finally, tell us the occasion. A birthday, a wedding, or a corporate event each shape flavour picks and setup differently, and our Premium package can build a custom flavour around the theme.',
      'Ready to plan yours? Head to the Catering page to see full package details or submit an enquiry directly with your date and guest count.',
    ],
  },
  {
    slug: 'why-we-moved-away-from-third-party-apps',
    title: 'Why We Moved Away from Third-Party Delivery Apps',
    excerpt:
      'We used to be listed on Zomato and Swiggy. Here’s why we pulled those integrations and now focus entirely on direct website and WhatsApp ordering.',
    coverImage: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1200&q=80',
    coverImageAlt: 'A fresh mixed berry shake',
    category: 'Company News',
    author: 'The Blenders Club Team',
    publishedAt: '2026-06-15',
    readTimeMinutes: 3,
    content: [
      'For a while, you could find us on Zomato and Swiggy alongside our own website. We’ve since removed both integrations to focus entirely on direct ordering.',
      'The honest reason: third-party commissions eat into the same margin that funds better ingredients and faster delivery, and those platforms couldn’t offer the same level of order customization or automatic rewards we’ve built directly into our own checkout.',
      'Ordering straight from our website (or WhatsApp, if you prefer a chat-based flow) means your sugar level, ice level, and add-ons are exactly as you asked, your order is tracked live from prep to delivery, and every discount and reward is applied automatically — no coupon hunting required.',
      'It’s a smaller footprint, but a better experience end to end — and it’s the one we’re going to keep investing in.',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Newest first — the order every listing/sitemap should use. */
export function getBlogPostsSortedByDate(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
