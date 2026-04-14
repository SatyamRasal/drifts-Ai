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
      <div className="mb-8 rounded-[2rem] border bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(51,65,85,0.92))] p-8 text-white shadow-soft dark:bg-[linear-gradient(135deg,rgba(241,245,249,0.98),rgba(226,232,240,0.92))] dark:text-slate-950">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 dark:border-slate-300 dark:bg-white/70 dark:text-slate-700">
              DriftsAI Portal
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Welcome to Your DriftsAI Workspace
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/75 dark:text-slate-700">
              Sign in to manage your custom software projects, submit new enterprise development inquiries, and collaborate directly with our engineering team.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Enterprise-Grade Security', 'Your project requirements and organizational data are protected with industry-standard encryption.'],
              ['Direct Developer Access', 'Seamlessly collaborate with our engineering team and track the progress of your custom builds.'],
              ['Scalable Solutions', 'From ready-made tools to custom mobile applications for thousands of employees, manage everything securely.'],
            ].map(([title, body]) => (
              <Card key={title} className="border-white/10 bg-white/10 p-4 text-white shadow-none dark:border-slate-200 dark:bg-white/70 dark:text-slate-950">
                <div className="text-sm font-medium">{title}</div>
                <div className="mt-1 text-sm leading-6 text-white/75 dark:text-slate-700">{body}</div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Enterprise Security</Badge>
          <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><Sparkles className="mr-1 h-3.5 w-3.5" /> Custom Engineering</Badge>
          <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700"><LifeBuoy className="mr-1 h-3.5 w-3.5" /> Workflow Automation</Badge>
        </div>
      </div>

      <AuthClient nextPath={nextPath} signedInEmail={session?.email} signedInRole={session?.role} />

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