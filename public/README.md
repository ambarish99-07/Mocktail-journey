# Static Assets

- `logo.png` — brand logo (transparent background), used in the navbar and
  footer. Generated from the client-supplied artwork by flood-filling the
  original white background to transparent.
- `src/app/icon.png` and `src/app/apple-icon.png` — favicon and iOS
  home-screen icon, cropped from the same logo. Next.js App Router
  auto-detects these files and wires up the `<link>` tags — no manual
  metadata needed.

## Still needed before launch

- `og-image.jpg` (1200×630) — used for social sharing previews (referenced
  in `src/app/layout.tsx` metadata). The logo is square and not a good fit
  for this landscape format as-is; needs a proper OG design.

Once real product photography is available, also consider self-hosting menu/gallery
images here (or on a CDN) instead of the Unsplash placeholders used in `src/data/*`
and the marketing pages — update `next.config.mjs` `images.remotePatterns` accordingly.
