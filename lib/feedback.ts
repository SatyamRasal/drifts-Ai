export type FlashKind = 'success' | 'error' | 'info';

const DEFAULT_MESSAGES: Record<string, { kind: FlashKind; title: string; message: string }> = {
  lead_submitted: {
    kind: 'success',
    title: 'Submitted',
    message: 'Your request was sent to CRM.',
  },
  inquiry_saved: {
    kind: 'success',
    title: 'Inquiry saved',
    message: 'Your inquiry has been recorded.',
  },
  support_saved: {
    kind: 'success',
    title: 'Support saved',
    message: 'Your support request has been recorded.',
  },
  product_saved: {
    kind: 'success',
    title: 'Saved',
    message: 'Product changes were saved.',
  },
  product_deleted: {
    kind: 'success',
    title: 'Deleted',
    message: 'Product removed from the catalog.',
  },
  settings_saved: {
    kind: 'success',
    title: 'Saved',
    message: 'Site settings were updated.',
  },
  page_saved: {
    kind: 'success',
    title: 'Saved',
    message: 'Page content was updated.',
  },
  landing_saved: {
    kind: 'success',
    title: 'Saved',
    message: 'Landing page sections were updated.',
  },
  lead_updated: {
    kind: 'success',
    title: 'Updated',
    message: 'Lead status was updated.',
  },
  admin_signed_in: {
    kind: 'success',
    title: 'Welcome back',
    message: 'Admin access is active.',
  },
  signed_in: {
    kind: 'success',
    title: 'Signed in',
    message: 'Your session is active.',
  },
  password_reset_sent: {
    kind: 'info',
    title: 'Password reset sent',
    message: 'Check your inbox for a reset link.',
  },
  password_reset_ready: {
    kind: 'info',
    title: 'Set a new password',
    message: 'Enter your new password below to finish recovery.',
  },
  verification_complete: {
    kind: 'success',
    title: 'Verification complete',
    message: 'Your email verification link worked. You are signed in.',
  },
};

export function resolveFlashMessage(value?: string | string[] | null, fallbackKind: FlashKind = 'info') {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const mapped = DEFAULT_MESSAGES[raw];
  if (mapped) return mapped;

  try {
    return {
      kind: fallbackKind,
      title: fallbackKind === 'error' ? 'Action failed' : 'Notice',
      message: decodeURIComponent(raw.replace(/\+/g, ' ')),
    };
  } catch {
    return {
      kind: fallbackKind,
      title: fallbackKind === 'error' ? 'Action failed' : 'Notice',
      message: raw,
    };
  }
}

export function buildRedirectWithNotice(path: string, kind: 'notice' | 'error', message: string) {
  const [base, hash = ''] = path.split('#');
  const [pathname, query = ''] = base.split('?');
  const params = new URLSearchParams(query);
  params.set(kind, message);
  const next = `${pathname}?${params.toString()}${hash ? `#${hash}` : ''}`;
  return next.endsWith('?') ? pathname : next;
}
