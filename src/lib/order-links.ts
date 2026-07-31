import { orderingConfig } from '@/lib/config';

/**
 * Attempts to open a native app via its deep-link scheme; if the app isn't
 * installed (or the deep link fails to resolve within the timeout), falls
 * back to the web URL in a new tab. This is a best-effort pattern — mobile
 * OSes don't expose a reliable "is app installed" check to the browser.
 */
function openWithAppFallback(appScheme: string, webUrl: string) {
  if (typeof window === 'undefined') return;

  if (!appScheme) {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const fallbackTimer = window.setTimeout(() => {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }, 1200);

  const clearFallback = () => window.clearTimeout(fallbackTimer);
  window.addEventListener('blur', clearFallback, { once: true });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) clearFallback();
    },
    { once: true }
  );

  window.location.href = appScheme;
}

export function openZomato() {
  openWithAppFallback(orderingConfig.zomatoAppScheme, orderingConfig.zomatoUrl);
}

export function openSwiggy() {
  openWithAppFallback(orderingConfig.swiggyAppScheme, orderingConfig.swiggyUrl);
}
