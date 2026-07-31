import Script from 'next/script';
import { analyticsConfig } from '@/lib/config';

/** Renders nothing when NEXT_PUBLIC_CLARITY_ID is unset — keeps local/dev builds clean. */
export function MicrosoftClarity() {
  if (!analyticsConfig.clarityId) return null;

  return (
    <Script id="ms-clarity-init" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${analyticsConfig.clarityId}");
      `}
    </Script>
  );
}
