# Master prompt: The Blenders Club app (shares the existing website backend)

Paste this whole document into a new AI coding session as the opening message when you start the app project. It briefs a fresh session with no memory of the website work on everything it needs to know.

---

## 1. What this is

**The Blenders Club** is a premium, delivery-only cloud kitchen (shakes and cold coffee) based in Patna, Bihar, India. Tagline: *"Crafted to Refresh. Blended to Impress."* No dine-in or pickup — every order is delivered.

A website already exists (Next.js/TypeScript/MongoDB) with a full backend: menu, cart, guest + registered checkout, Razorpay payments, order tracking, an admin dashboard, WhatsApp notifications, and a loyalty program. **The app you're building is a new client for that same backend** — it is not rebuilding the backend from scratch. Treat the API described below as a fixed contract to build against, not something to redesign.

## 2. Important: auth needs adapting for a mobile client

The existing backend authenticates via an **httpOnly session cookie** (`tbc_session`, a signed JWT) set by `/api/auth/login` and `/api/auth/signup`. That works naturally for a browser but **does not work cleanly for a native mobile app** — most mobile HTTP clients don't automatically persist and resend cookies the way a browser does, and httpOnly cookies can't be read by JS anyway (that's the point of httpOnly).

Two ways to handle this — **decide with the user before writing code**:
1. **Cookie-jar approach**: use an HTTP client library that persists cookies across requests (e.g. platform equivalents of `axios` with a cookie jar, or a `URLSession`/`OkHttp` cookie store). Zero backend changes needed. Simplest if the backend is otherwise off-limits to modify.
2. **Token-in-body approach (recommended)**: add a small, additive change to the existing `/api/auth/login` and `/api/auth/signup` routes so they *also* return the signed JWT in the JSON response body (not just the cookie), and add a way for API routes to accept `Authorization: Bearer <token>` as an alternative to the cookie. The app then stores the token in secure device storage (Keychain/Keystore) and sends it as a header. This is the more standard mobile pattern and doesn't break the existing website, which keeps using cookies as before.

Don't guess which one — ask the user, since it affects whether you also need to touch the website's backend code.

## 3. Full API reference

Base URL: wherever the Next.js site is deployed (confirm with the user — as of this writing it has only run locally, never been deployed).

All request/response bodies are JSON. All money values are in INR, plain numbers (no paise conversion except right at the Razorpay SDK boundary, see below).

### Auth

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/signup` | none | `{ fullName, email, phone, password }` (password ≥ 8 chars) | `201` `{ user: SafeUser }` + sets session cookie. `409` if email taken. Rate-limited: 5 per 15 min per IP. |
| POST | `/api/auth/login` | none | `{ email, password }` | `200` `{ user: SafeUser }` + sets session cookie. `401` "Invalid email or password" (deliberately generic — timing-safe, doesn't reveal whether the email exists). Rate-limited: 10 per 5 min per IP. |
| POST | `/api/auth/logout` | cookie | none | `200` `{ ok: true }`, clears cookie |
| GET | `/api/auth/me` | cookie | — | `200` `{ user: SafeUser }` or `401` if not signed in |

`SafeUser` shape:
```ts
{
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  loyalty: { completedOrderCount: number; isGoldMember: boolean };
  punchCard: { ordersSinceReward: number };
}
```

### Orders

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/orders` | optional (guest checkout supported) | Creates an order. See body shape below. Rate-limited: 20 per 10 min per IP. |
| GET | `/api/orders` | required | Returns the signed-in user's own order history, newest first: `{ orders: PlacedOrder[] }` |
| GET | `/api/orders/[id]` | conditional | `id` is a random access token (NOT a database ID — see §5). Guest orders are fetchable by token alone; orders belonging to a registered user additionally require that user's session. |
| POST | `/api/orders/[id]/verify-payment` | none (protected by cryptographic signature, not auth) | Body: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }`. This is the only thing that marks a Razorpay order as paid — never trust a client-side "payment succeeded" callback alone. |

**`POST /api/orders` request body:**
```ts
{
  items: CartItem[];        // see §5 for shape — server re-validates every price, never trusts these
  delivery: {
    fullName: string; phone: string; address: string; city: string; pincode: string;
    mapsLink?: string; specialInstructions?: string;
  };
  paymentMethod: 'cod' | 'razorpay';
}
```

**Response (COD):** `201 { order: PlacedOrder }`

**Response (Razorpay):** `201 { order: PlacedOrder, razorpay: { orderId, amount, currency, keyId } }` — the app then opens Razorpay's Checkout SDK with these values; on success, POST the three returned fields to `/api/orders/[id]/verify-payment`.

`PlacedOrder` shape:
```ts
{
  id: string;              // the random access token, use this for all subsequent lookups
  orderNumber: string;     // human-facing, e.g. "TBC-MSAKG1WD-MAZV"
  createdAt: string;       // ISO date
  delivery: { fullName, phone, address, city, pincode, mapsLink?, specialInstructions? };
  items: CartItem[];
  totals: {
    subtotal: number;
    punchCardDiscount: number;
    websiteDiscount: number;
    loyaltyDiscount: number;
    deliveryFee: number;
    tax: number;
    total: number;
  };
  estimatedMinutes: number;   // currently a flat 35
  status: 'received' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  payment: { method: 'cod' | 'razorpay'; status: 'pending' | 'paid' | 'failed' | 'refunded' };
}
```

### Admin (role must be `'admin'` — most real accounts are `'customer'` by default; the business owner's account was manually promoted directly in MongoDB, there's no self-serve admin signup)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/admin/orders?status=<optional>` | — | Up to 200 most recent orders, optionally filtered by status |
| PATCH | `/api/admin/orders/[id]/status` | `{ status, note? }` | `id` here IS the Mongo `_id` (admin-only surface, different from the customer-facing access token) |
| POST | `/api/admin/orders/[id]/recommend` | none | Sends a WhatsApp product recommendation to that customer based on their order history. Currently a no-op (returns a clear "not configured" error) until WhatsApp Cloud API credentials exist — see §6. |

If the app includes an admin/staff view, reuse these as-is.

## 4. Business rules the app must replicate for any client-side preview math

The server is always authoritative — it re-derives every total from scratch and ignores anything the client sends for pricing. But if the app shows a live cart total before submitting (which it should, for good UX), replicate this exact formula so the preview matches what the server will actually charge:

```
subtotal = sum over cart lines of (unitPrice + sum of selected add-on prices) × quantity

punchCardDiscount =
  if user is logged in AND user.punchCard.ordersSinceReward >= 5:
    round(0.5 × unitPrice of the single cheapest non-combo line in the cart)
  else: 0

websiteDiscountAmount = round(subtotal × 10%)          // always-on, everyone
loyaltyDiscountAmount = round(subtotal × loyaltyPercent(tier))
  where loyaltyPercent = first-order: 10%, returning: 15%, gold: 20%
  tier is derived from the LOGGED-IN user's loyalty.completedOrderCount:
    0 orders → 'first-order', 1-4 → 'returning', isGoldMember OR ≥5 → 'gold'
  guests always get tier = null → loyaltyDiscountAmount = 0

bestPercentDiscount = max(websiteDiscountAmount, loyaltyDiscountAmount)
// website and loyalty discounts are mutually exclusive — never both applied,
// customer gets whichever is bigger. Ties go to "website discount" in the
// returned breakdown (cosmetic only, same amount either way).

deliveryFee = subtotal >= ₹499 ? 0 : ₹39
taxableAmount = subtotal − bestPercentDiscount − punchCardDiscount
tax = round(taxableAmount × 5%)
total = taxableAmount + tax + deliveryFee
```

**The loyalty punch card** ("order 5, get 50% off your 6th"): registered accounts only, not available to guests. It's a repeating cycle, not a one-time perk — `ordersSinceReward` increments by 1 after every completed order, and resets to 0 the moment it triggers a reward (i.e. it fires on order 6, 12, 18, …). It stacks with the website/loyalty percentage discount rather than competing with it, because it operates on a single item's price, not the whole subtotal.

**Combo lines**: menu items ordered as part of a "choose 2/4/6" combo carry a synthetic `menuItemId` like `combo:choose-any-two:<timestamp>` instead of a real menu item ID — the server prices these against a fixed combo price and strips any add-ons (combos don't support add-ons). Fixed/curated combos, by contrast, add each real constituent item at full individual price (no special ID pattern). If the app needs to build a cart that includes combos, match this exact ID convention or the server will reject the line as "no longer available."

## 5. Data shapes referenced above

```ts
interface CartItem {
  lineId: string;              // client-generated, any unique string is fine
  menuItemId: string;          // a real menu item's id, or "combo:<comboId>:<anything>"
  signatureName: string;
  commonName: string;
  image: string;
  unitPrice: number;           // client-sent value is IGNORED by the server and recomputed
  quantity: number;            // 1-20
  customization: {
    sugarLevel: 'No Sugar' | 'Less Sugar' | 'Regular' | 'Extra Sweet';
    iceLevel: 'No Ice' | 'Less Ice' | 'Regular' | 'Extra Ice';
    addOnIds: string[];        // see add-on list below
  };
}
```

Add-ons (flat price, independent of item): Whipped Cream ₹30, Extra Chocolate Syrup ₹25, Oreo Crumbs ₹35, KitKat Crumbs ₹40, Dry Fruits ₹45.

Menu: 15 items total (12 signature shakes, 3 cold coffees) — get the current live list from the website's `src/data/menu.ts` rather than hardcoding a copy here, since it will drift. Each item has: id, signatureName, commonName, description, price, category, image, flavorBadges, and optional isPopular/isNew/isStaffPick/pairsWith flags.

## 6. What's NOT finished yet on the backend — don't assume these work

- **Razorpay**: fully coded (order creation + signature verification) but never live-tested — no real API keys exist yet. Test-mode keys are cheap/instant to get from the Razorpay dashboard if you need to validate the payment flow.
- **WhatsApp Cloud API**: fully coded (admin new-order alerts, customer status updates, purchase-history recommendations) but currently a safe no-op — no Meta Business Manager credentials or approved message templates exist yet. Don't build app features that assume a customer will actually receive a WhatsApp message right now.
- **Contact form, catering enquiry form, franchise application form**: these exist on the website but submissions currently go nowhere (console.log placeholders) — there's no `/api/contact` or similar endpoint. If the app needs these, they need building first.
- The whole backend has only ever run locally — nothing is deployed. Confirm a hosting plan before assuming the API is reachable from a real device.

## 7. Before you start building

Ask the user (don't assume):
- Which platform — iOS, Android, or cross-platform (React Native/Flutter/etc.)?
- Cookie-jar vs. token-based auth (§2) — this may require a small, additive backend change.
- Does the app need the admin/staff features, or customer-facing only?
- Where will the API actually be hosted/reachable from the app during development?
