'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button, Card, Input } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Enter a new password to finish account recovery.');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('Updating your password…');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage('Password updated successfully. You can now sign in with the new password.');
      window.setTimeout(() => router.push('/login?next=/'), 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-120px)] max-w-3xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Account recovery</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use the recovery session from your email link to set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">New password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div>
            <label className="mb-1 block text-sm">Confirm new password</label>
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
        </form>

        {message ? <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{message}</div> : null}

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/login" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Back to login</Link>
          <Link href="/support" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Open support</Link>
        </div>
      </Card>
    </section>
  );
}
