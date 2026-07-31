# The Blenders Club — Official Website

Premium shake & cold coffee brand website built with Next.js 14 (App Router), TypeScript, and
Tailwind CSS. This README covers local setup, configuration, and what's implemented vs. planned.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — brand design tokens in `tailwind.config.ts`
- **Framer Motion** — scroll and interaction animations
- **React Hook Form + Zod** — all forms (checkout, contact, catering enquiry, franchise application)
- **Zustand** (`persist` middleware) — cart, loyalty tracking, and last-order state, backed by
  `localStorage`/`sessionStorage` until real accounts/a backend exist
- **Lucide Icons**

## Getting Started

Requires Node.js 18.17+.

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Configuration

All environment-driven config lives in `.env.example` → copy to `.env.local`. Key groups:

- **Ordering channels** — WhatsApp number, Zomato/Swiggy web URLs and (optional) native app
  deep-link schemes (`src/lib/order-links.ts` tries the app first, falls back to the web URL).
- **Store details** — address, phone, email, Maps URL, used across the footer, contact page, and
  WhatsApp messages.
- **Analytics** — `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_CLARITY_ID`. Leave blank in development;
  the analytics components (`src/components/analytics/*`) render nothing when unset.

Pricing, discount percentages, tax rate, and delivery fee are **not** environment variables — they
live in `src/lib/config.ts` (`pricingConfig`) since they're business logic, not per-environment
secrets. Menu items and prices are in `src/data/menu.ts` — this is the single source of truth for
pricing shown on the website, Zomato, and Swiggy (see the comment at the top of that file).

## What's Implemented (Phase 1 — core ordering flagship)

- Full design system (colors, type, spacing) matching the brand brief: matte black / charcoal /
  emerald / gold / warm cream.
- **Home** page with all requested sections (hero, featured drinks, why-choose-us, menu preview,
  combos, direct-ordering benefits, testimonials, catering/franchise teasers, Instagram gallery,
  FAQ preview).
- **Menu** page: search, category filter, sort (popularity/price/newest), Staff Picks & Trending
  strips, per-drink customization (sugar level, ice level, premium add-ons), favorites, fixed
  combos, and dynamic "Choose Any 2/4/6" combo builder.
- **Cart** (slide-over drawer, persisted) with upsell recommendations ("Customers Also Loved")
  driven by each item's `pairsWith` data.
- **Checkout**: delivery/pickup toggle, form validation, automatic 10% website discount (or the
  better loyalty-tier discount — never both stacked), tax, delivery fee, order summary, and an
  order confirmation screen with a generated Order ID.
- **WhatsApp ordering**: structured message builder (`src/lib/whatsapp.ts`) including items,
  customizations, and a Google Maps link generated via the Geolocation API (falls back to manual
  Maps-link entry if permission is denied).
- **Zomato / Swiggy** buttons: attempt to open the native app via deep link, fall back to the web
  URL if the app isn't installed or doesn't respond.
- **Rewards**: first-order / returning / Gold Member tiers, tracked locally per device.
- Remaining marketing pages: About, Catering (packages + enquiry form), Franchise (models +
  application form), Gallery, FAQs (+ FAQ schema), Contact (+ form), and legal pages (Privacy,
  Terms, Refund & Cancellation — **template content, needs legal review before publishing**).
- Baseline SEO: per-page metadata, Open Graph/Twitter tags, `sitemap.xml`, `robots.txt`,
  LocalBusiness / Product / FAQ JSON-LD structured data.
- Accessibility: skip-to-content link, semantic landmarks, ARIA labels on icon-only controls,
  visible focus states, `prefers-reduced-motion` support, keyboard-operable cart/modals (Escape to
  close, focus management).

## Architected for What's Next

These are intentionally **not** built yet, but the code is structured so they slot in without a
rewrite:

- **Online payments** — checkout already computes a final payable amount and shows "Payment
  Method"; swap the "Pay on Delivery/Pickup" block for a Razorpay/UPI flow.
- **Order history / live tracking / customer accounts** — `PlacedOrder` (`src/types/order.ts`) and
  the loyalty tier logic (`src/lib/store/loyalty-store.ts`) are already device-local approximations
  of what a real accounts system would track server-side; swap the Zustand stores for API calls.
- **Admin dashboard, inventory, CRM** — all "place order" / enquiry form submissions currently
  `console.log` a structured payload with a `// TODO` marking the spot to wire a real API.
- **PWA** — no service worker yet; the component structure (route-based pages, persisted client
  state) is compatible with adding one later.

## Notes on Placeholder Content

- Menu, gallery, and marketing images use Unsplash stock photography — replace with real product
  photography before launch (see `public/README.md`).
- Franchise investment figures and catering package pricing are indicative placeholders, clearly
  labeled as such on their pages.
- Legal pages are a reasonable starting template, not legal advice — have them reviewed before
  publishing.
