import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getActiveSession } from '@/lib/active-session';
import { AuthClient } from '@/components/auth-client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const session = await getActiveSession();
  const nextPath = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (session?.role === 'admin' && nextPath !== '/login') {
    redirect(nextPath);
  }

  if (session?.role === 'visitor' && nextPath !== '/login' && nextPath !== '/admin') {
    redirect(nextPath);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">DriftsAI login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Sign in, create an account, reset a password, or open the admin portal.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="rounded-2xl border px-4 py-3 font-medium hover:border-slate-950 hover:text-slate-950 dark:hover:border-white dark:hover:text-white">Back to site</Link>
          <Link href="/admin/login" className="rounded-2xl border px-4 py-3 font-medium hover:border-slate-950 hover:text-slate-950 dark:hover:border-white dark:hover:text-white">Admin login</Link>
        </div>
      </div>

      <AuthClient nextPath={nextPath} signedInEmail={session?.email} signedInRole={session?.role} />
    </section>
  );
}
