# Agent Handoff — The Blenders Club Website

This file is a working-context handoff for any AI model/agent picking up this
project. It summarizes what has been built, how it was verified, decisions
made along the way, and what's still outstanding. Read this before making
changes so you don't redo work or re-introduce fixed bugs.

For end-user setup instructions, see [README.md](README.md) instead — this
file is about *process and state*, not "how to run the app."

## Project

Official website for **The Blenders Club**, a premium shake & cold coffee
brand. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer
Motion, React Hook Form + Zod, Zustand. Full requirements came from a single
large master prompt (premium shake bar site, direct ordering as the primary
conversion path, WhatsApp/Zomato/Swiggy as secondary channels, loyalty
rewards, catering/franchise pages, SEO, accessibility, future-ready
architecture for payments/accounts/admin).

## Status: core site complete, verified, committed

One commit exists on `main`: `74a2bb1` — "Initial build: The Blenders Club
website (Next.js/TS/Tailwind)". Working tree was clean as of the last check.
**The user said they will handle commits themselves going forward — do not
commit without being explicitly asked again.**

## How this was built (phasing)

The master prompt was too large to build well in one shot, so it was
explicitly phased with the user's agreement:

1. **Phase 1 (core flagship)**: design system, Home, Menu, Cart, Checkout,
   WhatsApp/Zomato/Swiggy ordering.
2. **Phase 2 (remaining pages)**: About, Catering, Franchise, Rewards,
   Gallery, FAQs, Contact, legal pages (Privacy/Terms/Refund) — these ended
   up being built out fully (not just placeholders) in the same pass as
   Phase 1, since the incremental cost was low once the design system and
   shared components existed.
3. **Verification pass**: Node.js wasn't installed in the environment —
   installed Node 24 LTS via `winget`, then `npm install`, `tsc --noEmit`,
   `next lint`, `next build`, and a full headless-Chromium (Playwright)
   pass driving the actual app through every major flow. This caught real
   bugs that static review missed (see "Bugs found via browser testing"
   below).
4. **Post-launch polish**: user reported the layout looked cramped/empty on
   a wide desktop monitor; root-caused and fixed (see "Layout fix" below).

## Architecture map

- `src/app/` — App Router pages. Each route is a thin server component
  (metadata + JSON-LD where relevant) wrapping a client component that does
  the actual work.
- `src/components/home/` — Home page sections (Hero, FeaturedDrinks,
  ComboOffers, etc.), one component per section, assembled in
  `src/app/page.tsx`.
- `src/components/menu/`, `cart/`, `checkout/`, `catering/`, `franchise/`,
  `contact/` — feature-specific components.
- `src/components/ui/` — shared primitives (Button, FormField, Container,
  QuantitySelector, FadeIn, SectionHeading, Badge).
- `src/components/shared/` — cross-page shared pieces (PageHero,
  OrderChannelButtons, LegalContent).
- `src/data/` — static content as typed data (menu items, combos, catering
  packages, franchise models, FAQs, testimonials). **This is the single
  source of truth for menu pricing** — see the comment at the top of
  `src/data/menu.ts`.
- `src/lib/` — business logic: `config.ts` (env-driven site config),
  `pricing.ts` (discount/tax/total math), `whatsapp.ts` (message builder +
  geolocation), `order-links.ts` (Zomato/Swiggy app-then-web-fallback),
  `validation.ts` (all Zod schemas), `store/` (Zustand stores: cart,
  loyalty, last-order — all `persist`ed to localStorage/sessionStorage).
- `src/types/` — shared TS types (menu, cart, order).

Cart/checkout/loyalty state is currently device-local (Zustand + browser
storage) since there's no backend yet. The `PlacedOrder` type and loyalty
tier derivation are written to be an easy swap-in point for a real
accounts/orders API later — see the "Architected for what's next" section
of the README.

## Bugs found via browser testing (fixed)

Static review (`tsc`, `eslint`, manual reading) found nothing. Actually
driving the app with Playwright found two real, non-obvious bugs:

1. **Wrong/broken placeholder images.** Several Unsplash photo IDs picked
   from memory turned out to show the wrong thing entirely — onions for
   "Saffron Gold," a burger-and-fries platter for the hero and "Choco
   Crush," a plain chocolate bar for "Wafer Wonder," one outright 404
   ("Caramel Bliss"). Fixed by downloading and visually verifying ~20
   replacement candidates (via `curl` + the Read tool's image support)
   before swapping them into `data/menu.ts`, `data/combos.ts`, `Hero.tsx`,
   `gallery/page.tsx`, `catering/page.tsx`, `InstagramGallery.tsx`.
   **Lesson: never trust a from-memory Unsplash photo ID — always fetch and
   look at it before using it.**
2. **Form labels not programmatically associated with inputs.** The shared
   `FormField` component (and a duplicated local copy in
   `CheckoutClient.tsx`) rendered a `<label>` with no `htmlFor`/`id` pairing
   to its input. Playwright's `getByLabel` couldn't find fields by label —
   which is the same failure mode a screen reader hits. Fixed by adding an
   `id` prop threaded through `FormField` and every call site
   (`ContactForm`, `CateringEnquiryForm`, `FranchiseApplicationForm`,
   `CheckoutClient`), and deleted the duplicate local `Field` in
   `CheckoutClient.tsx` in favor of the shared one.

Both were re-verified with a full build + lint + browser pass afterward.

## Environment notes

- Node.js was **not** pre-installed on this Windows machine. Installed via
  `winget install --id OpenJS.NodeJS.LTS --source winget
  --accept-source-agreements --accept-package-agreements --silent` →
  landed at Node 24 LTS (`C:\Program Files\nodejs`). If a fresh shell can't
  find `node`/`npm`, the PATH env var needs a manual refresh in that
  session (`$env:Path = [System.Environment]::GetEnvironmentVariable(...)`
  in PowerShell, or `export PATH="$PATH:/c/Program Files/nodejs"` in Bash)
  since the tool-launching process's own environment predates the install.
- Bumped `next` from `14.2.5` → `14.2.35` at install time because npm
  flagged a critical CVE on the original pinned version. Did **not** jump
  to Next 15/16 despite `npm audit --force` suggesting it — that's a major
  version with breaking App Router API changes (async `params`/`cookies()`,
  etc.) that shouldn't be forced through without dedicated testing. This is
  a known, deliberate deferral, not an oversight.
- No `chromium-cli` tool available in this environment for the `run` skill's
  usual browser-driving path — fell back to a plain Playwright script
  (`chromium.launch()`) per that skill's documented fallback. Playwright
  and its Chromium binary were installed into a **scratch npm project
  outside the repo** (not added to this project's `package.json` — it's a
  throwaway verification tool, not a project dependency).
- Git had no identity configured on this machine. Set locally (repo-scoped,
  not `--global`) as `Ambarish Sonbhadra <ambarish.sonbhadra@gmail.com>`
  per the user's explicit correction (an initial guess using a different
  email from system context was wrong and got amended).

## Layout fix (most recent change)

User reported the site felt cramped in the middle with dead space on the
sides on a wide desktop monitor. Root cause: `.container-tbc` in
`src/app/globals.css` was applying `max-w-7xl` (1280px) **on top of**
Tailwind's `container` utility, capping every section's content width to
1280px regardless of viewport — on a 1920px+ monitor that leaves ~320px of
unused margin on each side. Fixed by replacing it with a custom class that
scales up to 1680px instead of piggybacking on the `container` utility's
breakpoint-locked max-width:

```css
.container-tbc {
  @apply mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-16 xl:px-20;
}
```

Also widened nav link gaps at `xl:` and bumped the hero headline/description
max-width and font size at large breakpoints. Removed the now-dead
`container` key from `tailwind.config.ts` theme.extend (nothing references
the core `.container` utility anymore — confirmed via grep before removing).

**Gotcha hit while verifying this**: a fresh `next dev` request right after
editing several files can render with Framer Motion elements stuck near
their `initial` (near-invisible) opacity state — this is a dev-mode
on-demand-compile/hydration-timing artifact, not a real bug. If a
screenshot looks washed out/ghostly right after an edit, reload the page
once more before concluding something's broken.

## What's explicitly deferred (not bugs, not forgotten)

- Real payments (Razorpay/UPI) — checkout has a "Pay on Delivery/Pickup"
  placeholder and computes a final payable amount; architecture is ready
  for a payment step to slot in.
- Customer accounts / order history / live tracking — loyalty tier and
  `PlacedOrder` are currently device-local approximations.
- Admin dashboard, inventory, CRM — all form submissions (checkout,
  contact, catering enquiry, franchise application) currently
  `console.log` a structured payload with a `// TODO` marking where a real
  API call goes.
- PWA / service worker — not started.
- Real product photography — every image is Unsplash stock, now at least
  verified to depict the right thing, but still placeholder. See
  `public/README.md` for the pre-launch asset checklist (favicon, OG image,
  real photos).
- Legal page content (Privacy/Terms/Refund) is a reasonable starting
  template, explicitly labeled on-page as needing legal review — not
  finished legal copy.
- Next.js major-version upgrade (14 → 15/16) — deferred, see Environment
  notes above.

## If you're picking this up next

- Run `npm install` then `npm run dev` (see README for full setup).
- Before claiming any change works, actually run it — `npm run typecheck`,
  `npm run lint`, `npm run build`, and ideally a real browser check. Static
  review alone missed both real bugs found so far in this project.
- Don't re-guess stock photo IDs from memory; fetch and look before using.
- The user configures git identity and commits themselves now — don't `git
  commit` unless asked again.
