import Script from 'next/script';
import { analyticsConfig } from '@/lib/config';

/** Renders nothing when NEXT_PUBLIC_GA4_ID is unset — keeps local/dev builds clean. */
export function GoogleAnalytics() {
  if (!analyticsConfig.ga4Id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsConfig.ga4Id}');
        `}
      </Script>
    </>
  );
}
