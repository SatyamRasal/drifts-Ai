import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getActiveSession } from '@/lib/active-session';
import { AuthClient } from '@/components/auth-client';
import { Badge, Card } from '@/components/ui';
import { ArrowRight, LifeBuoy, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(51,65,85,0.92))] p-8 text-white shadow-soft dark:bg-[linear-gradient(135deg,rgba(241,245,249,0.98),rgba(226,232,240,0.92))] dark:text-slate-950">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 dark:border-slate-300 dark:bg-white/70 dark:text-slate-700">
              DriftsAI Portal
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Welcome to Your DriftsAI Workspace
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/75 dark:text-slate-700">
              Sign in to manage products, leads, support requests, and your chatbot knowledge base from one control panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure access</Badge>
            <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><Sparkles className="mr-1 h-3.5 w-3.5" /> Fast workflows</Badge>
            <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><LifeBuoy className="mr-1 h-3.5 w-3.5" /> Built-in support</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AuthClient nextPath={nextPath} signedInEmail={session?.email} signedInRole={session?.role} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-950 dark:hover:text-white">
          Back to site <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/admin/login" className="hover:text-slate-950 dark:hover:text-white">
          Admin login
        </Link>
      </div>
    </section>
  );
}
