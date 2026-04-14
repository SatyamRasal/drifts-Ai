'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

function getSafeNextPath(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

async function bootstrap(accessToken: string, nextPath: string) {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, next: nextPath }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Could not establish session');
  }

  const payload = await response.json();
  window.location.assign(typeof payload.next === 'string' ? payload.next : nextPath);
}

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const type = params.get('type') || '';
  const nextPath = getSafeNextPath(params.get('next') || (type === 'recovery' ? '/reset-password' : '/'));
  const [status, setStatus] = useState(type === 'recovery' ? 'Completing password recovery…' : 'Finalizing sign-in…');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const search = new URLSearchParams(window.location.search);
        const code = search.get('code') || search.get('auth_code') || '';
        const tokenHash = search.get('token_hash') || '';
        const typeParam = search.get('type') || type || '';

        let session: { access_token?: string } | null = null;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          session = data.session || null;
        } else if (tokenHash) {
          const { data, error } = await (supabase.auth as any).verifyOtp({
            token_hash: tokenHash,
            type: typeParam || 'signup',
          });
          if (error) throw error;
          session = data.session || null;
        }

        if (!session) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          session = refreshed.session || null;
        }

        if (!session) {
          const { data } = await supabase.auth.getSession();
          session = data.session || null;
        }

        const accessToken = session?.access_token;
        if (!accessToken) {
          throw new Error('Verification completed, but the session cookie was not created. Please sign in again.');
        }

        if (!cancelled) {
          await bootstrap(accessToken, nextPath);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [nextPath, type]);

  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-12">
      <div className="rounded-3xl border bg-white p-8 shadow-soft dark:bg-slate-950">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Authentication</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Processing sign-in</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{status}</p>
      </div>
    </section>
  );
}
