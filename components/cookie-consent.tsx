'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, SecondaryButton } from '@/components/ui';

const COOKIE_NAME = 'driftsai_cookie_consent';

type Consent = 'accepted' | 'denied';

function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : '';
  return value === 'accepted' || value === 'denied' ? value : null;
}

function writeConsent(value: Consent) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; samesite=lax`;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  function updateConsent(value: Consent) {
    writeConsent(value);
    setVisible(false);
    window.dispatchEvent(new Event('cookie-consent-change'));
    window.location.reload();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-4 py-4 backdrop-blur dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold">Cookie preferences</div>
          <div className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            We use essential cookies for login and session security. Optional cookies can support analytics and improve performance.
            <Link href="/cookies" className="ml-1 underline">Read the cookie policy</Link>.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton type="button" onClick={() => updateConsent('denied')}>Deny optional cookies</SecondaryButton>
          <Button type="button" onClick={() => updateConsent('accepted')}>Accept cookies</Button>
        </div>
      </div>
    </div>
  );
}
