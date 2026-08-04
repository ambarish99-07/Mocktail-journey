# Master prompt: The Blenders Club app (standalone — new backend from scratch)

Paste this whole document into a new AI coding session as the opening message when you start the app project. It's written to be self-contained — no access to the original website's codebase is assumed or needed.

---

## 1. What this is

**The Blenders Club** is a premium, delivery-only cloud kitchen (shakes and cold coffee) based in Patna, Bihar, India. Tagline: *"Crafted to Refresh. Blended to Impress."* No dine-in or pickup — every order is delivered to the customer.

A website already exists with this exact business logic (Next.js/TypeScript/MongoDB), built and validated over an extended build process. **This app is a completely separate project** — its own backend, its own database, no code shared with the website. This document exists so the app doesn't have to re-derive decisions the website already made and tested; treat the rules below as the specification, not as suggestions to redesign from zero.

**Before writing any code**, ask the user to confirm or override:
- Target platform: iOS, Android, or cross-platform (React Native, Flutter, etc.)?
- Backend stack preference, or should you recommend one? (A working recommendation is in §7.)
- Does "app" mean customer-facing only, or does it also need the admin/staff order-management side?
- Where will this be hosted/deployed?

Don't guess these — they materially change the plan. This mirrors how the website itself was scoped: every major backend decision (database choice, auth mechanism, payment gateway, notification channel) was confirmed with the business owner via explicit questions before implementation, not assumed.

## 2. Full feature list

**Customer-facing:**
- Browse menu: signature shakes + cold coffee, filterable/searchable, with "staff pick" and "trending/popular" badges
- Item customization: sugar level, ice level, optional add-ons (each add-on has its own flat price)
- Fixed curated combos (e.g. "Chocolate Duo") priced as a bundle of specific items
- "Choose N" build-your-own combos (e.g. "pick any 2 for ₹379") — customer selects any N eligible items at a flat bundle price
- Cart with live price preview (must match server-computed totals exactly — see §4)
- Guest checkout (no account required) AND registered accounts, side by side
- Checkout: delivery details form, choice of Pay on Delivery (COD) or online payment (Razorpay: cards/UPI/netbanking/wallets)
- Order confirmation + order history (registered accounts) with live status: received → preparing → out for delivery → delivered (or cancelled)
- Loyalty: percentage discount tiers based on order count, PLUS a separate "order 5, get 50% off your 6th" punch card — both detailed exactly in §4
- A secondary "order via WhatsApp instead" path that just opens a pre-filled WhatsApp chat to the business's number (no backend involved, pure convenience feature)

**Admin/staff-facing** (if in scope):
- Order list with status filters, ability to advance/cancel order status
- Sending a WhatsApp-based product recommendation to a customer, generated from their own purchase history (see §6)

**Out of scope / known gaps** — the original website has these as unfinished, don't assume the app needs to match unfinished work: a contact form, catering enquiry form, and franchise application form that don't actually submit anywhere yet; live WhatsApp messaging (built against Meta's Cloud API but no real business account connected yet); live Razorpay payments (coded, never tested with real keys).

## 3. Data model

Written as language-agnostic shapes — adapt to whatever backend/ORM you choose.

**MenuItem** (static catalog data — 15 items in the original: 12 shakes, 3 cold coffees; ask the user for the real current menu rather than inventing one):
```
id: string
signatureName: string        // e.g. "Choco Crush"
commonName: string           // e.g. "Rich Chocolate Shake"
description: string
price: number                 // INR
category: 'signature-shakes' | 'cold-coffee'
image: string (URL)
flavorBadges: string[]        // e.g. "Chocolate Lover", "Fruity", "Classic", "Nutty", "Coffee Favorite"
isPopular / isNew / isStaffPick: boolean (optional)
pairsWith: string[] (optional) // other menu item ids this goes well with — powers "frequently bought together" and the recommendation engine (§6)
```

**Add-ons** (flat-priced, apply to any item): Whipped Cream ₹30, Extra Chocolate Syrup ₹25, Oreo Crumbs ₹35, KitKat Crumbs ₹40, Dry Fruits ₹45. (Confirm these are still current with the user.)

**CartItem / order line:**
```
lineId: string
menuItemId: string           // real item id, or a combo marker (see below)
signatureName, commonName, image: string  // snapshotted for display
unitPrice: number             // NEVER trust a client-submitted value for this at order time — always re-derive server-side from the current menu (see §5)
quantity: number (1-20 is a sane cap)
customization: { sugarLevel, iceLevel, addOnIds: string[] }
```
"Choose N" combo lines use a synthetic id like `combo:<comboId>:<anything>` instead of a real menu item id, priced at the combo's flat price with no add-ons allowed. Fixed/curated combos instead just add each real constituent item individually at full price — no special ID needed for those.

**User account:**
```
id, email (unique), passwordHash, fullName, phone, role: 'customer' | 'admin'
loyalty: { completedOrderCount: number, isGoldMember: boolean }
punchCard: { ordersSinceReward: number }
```

**Order:**
```
id / accessToken: a separate, cryptographically random public identifier —
  do NOT expose the database's own primary key/auto-increment ID for order
  lookups a guest might use (e.g. a confirmation page URL). Sequential or
  partially-random DB IDs (Mongo ObjectIds, auto-increment ints) are guessable
  enough that someone could enumerate other customers' orders. Generate a
  separate random token (24+ bytes) specifically for this purpose.
orderNumber: human-facing string, e.g. "TBC-XXXXXXXX-XXXX"
userId: nullable (null = guest order)
items: CartItem[]
delivery: { fullName, phone, address, city, pincode, mapsLink?, specialInstructions? }
totals: { subtotal, punchCardDiscount, websiteDiscount, loyaltyDiscount, deliveryFee, tax, total }
loyaltyTierAtOrder: snapshot of tier used for pricing (tiers can change later; a past order's charged amount must not)
estimatedMinutes: number (35 flat, in the original — no real-time ETA logic exists)
status: 'received' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
statusHistory: [{ status, at: timestamp, note? }]
payment: { method: 'cod' | 'razorpay', status: 'pending' | 'paid' | 'failed' | 'refunded', + gateway-specific fields on success }
createdAt, updatedAt
```

## 4. Business/pricing rules — exact, don't approximate

```
subtotal = sum over cart lines of (unitPrice + sum of selected add-on prices) × quantity

punchCardDiscount =
  if user is logged in AND user.punchCard.ordersSinceReward >= 5:
    round(0.5 × unitPrice of the single cheapest non-combo line in the cart)
  else: 0
  // "Order 5, get 50% off your 6th" — registered accounts only, guests never
  // get this. It's a repeating cycle: ordersSinceReward increments by 1 after
  // every completed order and resets to 0 the moment it triggers a reward, so
  // it fires again on order 12, 18, 24... It applies to ONE unit of the
  // cheapest eligible drink, not the whole line if quantity > 1.

websiteDiscountAmount = round(subtotal × 10%)     // flat, always-on, applies to every direct order regardless of account status — this is the incentive for ordering direct instead of via a delivery marketplace
loyaltyDiscountAmount = round(subtotal × loyaltyPercent(tier))
  loyaltyPercent: first-order → 10%, returning → 15%, gold → 20%
  tier derivation (registered users only): 0 completed orders → 'first-order',
    1-4 → 'returning', isGoldMember flag OR ≥5 completed orders → 'gold'
  guests: tier is always null → loyaltyDiscountAmount = 0

bestPercentDiscount = max(websiteDiscountAmount, loyaltyDiscountAmount)
// Website discount and loyalty discount are MUTUALLY EXCLUSIVE — the customer
// gets whichever is larger, never both stacked. This keeps the incentive
// structure simple: ordering direct always saves at least 10%, and loyal
// registered customers eventually do better than a first-time guest.

deliveryFee = subtotal >= ₹499 ? 0 : ₹39
taxableAmount = subtotal − bestPercentDiscount − punchCardDiscount
tax = round(taxableAmount × 5%)
total = taxableAmount + tax + deliveryFee
```

The punch card discount stacks additively with the website/loyalty discount (they operate at different layers — one on a single item, one on the whole subtotal) — this is intentional, not an oversight to "fix."

**Loyalty counters only advance on a genuinely completed order**: for pay-on-delivery, that's immediately at order creation (COD orders are trusted at face value). For online payment, counters must only advance *after* the payment gateway confirms the charge succeeded — never at the moment the order record is first created, since an abandoned/failed payment must not count. (The original build initially missed wiring up counter-incrementing for registered users at all — a real bug found during testing — so build a specific test that places several orders as a logged-in user and confirms both the loyalty tier and punch-card counters visibly move.)

## 5. Security practices worth replicating

These were deliberately hardened after review — carry them over rather than starting looser:

- **Never trust client-submitted prices.** Every order-creation request must re-derive `unitPrice` for every line from the server's own current menu/combo data, re-validate every `addOnId` against the real add-on list, and discard any client-sent total — recompute it from scratch using the formula in §4. Test this explicitly: submit a cart with a tampered price and confirm the server ignores it.
- **Payment verification must be server-side and cryptographic**, never a trusted client callback. For Razorpay specifically: the gateway returns an order ID, payment ID, and signature to the client on success; the server must independently recompute the expected signature (HMAC-SHA256 of `orderId|paymentId` using the account's secret key) and compare with a constant-time comparison before marking anything paid.
- **Password auth**: hash with bcrypt (cost factor ~10), never store plaintext. Login should take the same amount of time whether or not the email exists (compare against a dummy hash when the user isn't found) to avoid leaking valid emails via response timing. Rate-limit login/signup per IP (the original used 10 attempts/5min for login, 5/15min for signup — reasonable starting points).
- **Guest order lookup tokens must be unguessable** — see the `accessToken` note in §3. Don't let a customer's order confirmation page be reachable via a predictable or enumerable ID.
- **Enforce a unique index on the account email field at the database level**, not just an application-level "does this email exist" check before insert — otherwise two concurrent signups with the same email can both race past the check.
- **Cap payload sizes sensibly** — e.g. max ~50 line items per order, max ~20 quantity per line — to avoid a trivially abusive order payload.
- Send real security headers if this has any web-facing component (CSP restricted to only the domains actually needed, X-Frame-Options/frame-ancestors to prevent clickjacking, HSTS, nosniff, a sane Permissions-Policy). If using a strict CSP during **development** with a framework that hot-reloads via `eval()` (many do), make sure the dev-only CSP allows `unsafe-eval` — a production-only CSP that's too strict for the dev server is a known, confusing way to make an app "just stop rendering" with no obvious error.

## 6. Notifications (WhatsApp) — architecture, even if not implemented yet

The original design point worth keeping even if you don't build this immediately: **any server-initiated message to a customer via WhatsApp requires the official WhatsApp Business Platform (Cloud API) with pre-approved message templates** — there is no unofficial-but-safe way to have a server proactively message someone on WhatsApp without this, and attempting one risks the business's number getting banned. Budget real lead time for this (Meta Business verification + template approval), separate from the rest of the build.

Two message types worth planning for:
1. **New-order alert to the business owner** — fires once an order is genuinely confirmed (COD: immediately; online payment: only after payment verification succeeds).
2. **Purchase-history-based product recommendation** — look at everything a customer has ordered, score un-ordered menu items by how often they appear in the `pairsWith` list of items the customer already likes (see §3), and suggest up to 3. Fall back to generally popular items if there's not enough order history to score anything meaningfully. Whether this fires automatically (e.g. a few days after delivery) or is manually triggered by an admin is a product decision to confirm with the user — the original shipped the manual version first and structured the scoring logic as a pure, side-effect-free function specifically so an automatic/scheduled version could reuse it later without a rewrite. Consider the same separation here.

Build any outbound-message function to **fail silently and log**, never throw or block the order/action it's attached to, if the messaging credentials aren't configured yet — the rest of the app must keep working with zero live notification setup.

## 7. Suggested architecture (a reasonable default, not mandatory)

If the user has no strong opinion, this combination worked well for the website and is a sensible starting point for the app's backend too:
- **Database**: MongoDB (Atlas-hosted) — document shape maps naturally onto the models in §3.
- **Auth**: hashed passwords (bcrypt) + signed JWT sessions. For a *mobile* app specifically, don't reach for cookie-based sessions the way a website would — issue the token in the response body and have the app store it in secure device storage (Keychain/Keystore), sent as an `Authorization: Bearer` header on subsequent requests.
- **Payments**: Razorpay — the dominant gateway for Indian small businesses, supports UPI/cards/netbanking/wallets, has a straightforward test mode.
- **Notifications**: WhatsApp Business Cloud API (see §6) for order alerts/recommendations.
- Whatever mobile framework is chosen, keep all pricing/loyalty/punch-card math in one shared, pure, framework-agnostic module (no I/O, no framework imports) that both the live cart-preview UI and the final order-creation endpoint import — this is what let the original catch and fix pricing bugs by testing the function directly, and prevents the UI preview ever silently drifting from what the server actually charges.

## 8. A note on content

The original website's menu photography is stock imagery (Unsplash), explicitly marked in its own code as "swap for real product photography before launch," and its testimonials are fabricated placeholder examples pending a real Google Reviews integration. Don't treat either as real data to carry forward — ask the user for actual photos/reviews, or clearly flag placeholder content as such in the app too.
