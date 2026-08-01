// Third-party origins the app legitimately loads scripts/frames/connects to —
// keep this list exact rather than using wildcards, so the CSP actually constrains something.
const CSP_SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'", // required by next/script inline snippets (GA4/Clarity init) and Next's own hydration scripts
  'https://www.googletagmanager.com',
  'https://www.clarity.ms',
  'https://checkout.razorpay.com',
];
const CSP_CONNECT_SRC = [
  "'self'",
  'https://www.google-analytics.com',
  'https://www.clarity.ms',
  'https://api.razorpay.com',
];
const CSP_FRAME_SRC = ["'self'", 'https://checkout.razorpay.com', 'https://api.razorpay.com'];

const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src ${CSP_SCRIPT_SRC.join(' ')}`,
  `style-src 'self' 'unsafe-inline'`, // Tailwind/framer-motion inject inline styles at runtime
  `img-src 'self' data: https://images.unsplash.com`,
  `font-src 'self' data:`,
  `connect-src ${CSP_CONNECT_SRC.join(' ')}`,
  `frame-src ${CSP_FRAME_SRC.join(' ')}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // geolocation=(self) — the checkout page's "Share Delivery Location" feature needs it.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Add real remote image hosts (CDN, CMS) here once product photography is finalized.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
