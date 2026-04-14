export function getConfiguredSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/$/, '');
}

export function getClientSiteUrl() {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '');
  return '';
}

export function buildAuthCallbackUrl(nextPath: string) {
  const base = getConfiguredSiteUrl();
  const url = base ? new URL('/auth/callback', base) : new URL('/auth/callback', 'http://localhost:3000');
  url.searchParams.set('next', nextPath);
  return url.toString();
}
