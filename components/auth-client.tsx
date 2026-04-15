'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { getClientSiteUrl } from '@/lib/site-url';
import { Button, Card, Input, SecondaryButton } from '@/components/ui';
import { LockKeyhole, Mail, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { formatAuthMessage } from '@/lib/messages';

type Mode = 'signin' | 'signup' | 'reset';

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_OAUTH_ENABLED === 'true';

function getAuthCallbackUrl(nextPath: string) {
  const base = getClientSiteUrl() || 'http://localhost:3000';
  const url = new URL('/auth/callback', base);
  url.searchParams.set('next', nextPath);
  return url.toString();
}

async function bootstrapSession(accessToken: string, nextPath: string) {
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

async function sendPasswordReset(email: string, nextPath: string) {
  const response = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, next: nextPath }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Could not send password reset email');
  }

  return payload as { message?: string };
}

export function AuthClient({ nextPath, signedInEmail, signedInRole }: { nextPath: string; signedInEmail?: string; signedInRole?: 'visitor' | 'admin' }) {
  const router = useRouter();
  const canOpenCrm = signedInRole === 'admin';
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState<'password' | 'google' | 'logout' | null>(null);
  const [message, setMessage] = useState<string>('');

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy('password');

    try {
      if (mode === 'reset') {
        await sendPasswordReset(email, '/reset-password');
        setMessage('Password reset email sent. Check your inbox and continue from the recovery link.');
        return;
      }

      if (mode === 'signup') {
        if (!acceptedTerms) {
          throw new Error('You must accept the privacy, terms, and cookie notice before creating an account.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: fullName ? { full_name: fullName } : undefined,
            emailRedirectTo: getAuthCallbackUrl(nextPath),
          },
        });
        if (error) throw error;
        const accessToken = data.session?.access_token;
        if (accessToken) {
          await bootstrapSession(accessToken, nextPath);
          return;
        }

        setMessage('Account created. Check your inbox to verify your email before signing in.');
        setMode('signin');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Login succeeded but no access token was returned.');
      await bootstrapSession(accessToken, nextPath);
    } catch (error) {
      setMessage(formatAuthMessage(error));
    } finally {
      setBusy(null);
    }
  }

  async function handleGoogle() {
    setMessage('');
    setBusy('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthCallbackUrl(nextPath),
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(formatAuthMessage(error));
      setBusy(null);
    }
  }

  async function handleLogout() {
    setBusy('logout');
    setMessage('');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut();
      router.refresh();
      window.location.assign('/');
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure login
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">Access the CRM-controlled experience</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Use one form for customers and administrators. When your email is on the admin allowlist, CRM access is unlocked automatically.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SecondaryButton type="button" onClick={() => setMode('signin')} className={mode === 'signin' ? 'border-slate-950 bg-slate-100 dark:border-white dark:bg-slate-800' : ''}>
          <LockKeyhole className="mr-2 h-4 w-4" /> Sign in
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => setMode('signup')} className={mode === 'signup' ? 'border-slate-950 bg-slate-100 dark:border-white dark:bg-slate-800' : ''}>
          <Sparkles className="mr-2 h-4 w-4" /> Create account
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => setMode('reset')} className={mode === 'reset' ? 'border-slate-950 bg-slate-100 dark:border-white dark:bg-slate-800' : ''}>
          <KeyRound className="mr-2 h-4 w-4" /> Reset password
        </SecondaryButton>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        {mode === 'signup' ? (
          <div>
            <label className="mb-1 block text-sm">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" />
          </div>
        ) : null}
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
        </div>
        {mode !== 'reset' ? (
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} required />
          </div>
        ) : null}

        {mode === 'signup' ? (
          <label className="flex items-start gap-3 rounded-2xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
              required
            />
            <span>
              I accept the <Link href="/privacy" className="font-medium text-slate-950 underline dark:text-white">Privacy Policy</Link>,{' '}
              <Link href="/terms" className="font-medium text-slate-950 underline dark:text-white">Terms</Link>, and{' '}
              <Link href="/cookies" className="font-medium text-slate-950 underline dark:text-white">Cookie Policy</Link>.
            </span>
          </label>
        ) : null}

        <Button type="submit" className="w-full" disabled={busy !== null || (mode === 'signup' && !acceptedTerms)}>{busy === 'password' ? 'Working…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Sign in'}</Button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          {mode !== 'reset' ? (
            <button type="button" onClick={() => setMode('reset')} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Forgot password?
            </button>
          ) : (
            <button type="button" onClick={() => setMode('signin')} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Back to sign in
            </button>
          )}
          {mode !== 'signup' ? (
            <button type="button" onClick={() => setMode('signup')} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Create a new account
            </button>
          ) : (
            <button type="button" onClick={() => setMode('signin')} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Already have an account?
            </button>
          )}
        </div>
      </form>

      {GOOGLE_ENABLED ? (
        <>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            or
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <Button type="button" onClick={handleGoogle} disabled={busy !== null} className="w-full gap-2 bg-white text-slate-950 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
            <Mail className="h-4 w-4" /> Continue with Google
          </Button>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-300">
          Google OAuth is currently disabled. Enable it in Supabase if you want social login.
        </div>
      )}

      {message ? <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{message}</div> : null}

      {signedInEmail ? (
        <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Signed in as {signedInEmail}. {canOpenCrm || nextPath !== '/admin' ? 'Continue to your destination or sign out.' : 'This account does not have administrative access.'}
        </div>
      ) : null}
    </Card>
  );
}
