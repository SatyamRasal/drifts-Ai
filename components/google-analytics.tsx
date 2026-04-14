'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const COOKIE_NAME = 'driftsai_cookie_consent';

function hasAnalyticsConsent() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((entry) => entry.startsWith(`${COOKIE_NAME}=accepted`));
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());
    const handler = () => setEnabled(hasAnalyticsConsent());
    window.addEventListener('cookie-consent-change', handler);
    return () => window.removeEventListener('cookie-consent-change', handler);
  }, []);

  useEffect(() => {
    if (!enabled || !measurementId || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag('config', measurementId, { page_path: pagePath });
  }, [enabled, measurementId, pathname, searchParams]);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${measurementId}', { page_path: window.location.pathname + window.location.search });
      `}</Script>
    </>
  );
}
