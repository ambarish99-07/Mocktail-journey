# Static Assets Needed Before Launch

Add these files to this `public/` directory before deploying to production:

- `favicon.ico` (32×32) — browser tab icon
- `apple-touch-icon.png` (180×180) — iOS home-screen icon
- `og-image.jpg` (1200×630) — used for social sharing previews (referenced in `src/app/layout.tsx` metadata)

Once real product photography is available, also consider self-hosting menu/gallery
images here (or on a CDN) instead of the Unsplash placeholders used in `src/data/*`
and the marketing pages — update `next.config.mjs` `images.remotePatterns` accordingly.
