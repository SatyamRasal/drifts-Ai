import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { Button, Card, Input, Badge } from '@/components/ui';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

export default async function AdminLoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const { error } = (await searchParams) || {};
  const session = await getAdminSession();
  if (session?.email) {
    redirect('/admin');
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border bg-white p-6 shadow-soft dark:bg-slate-950 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-6 text-white dark:bg-[linear-gradient(135deg,rgba(241,245,249,0.98),rgba(226,232,240,0.92))] dark:text-slate-950 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 dark:border-slate-300 dark:bg-white/70 dark:text-slate-700">
              Admin access
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in to CRM</h1>
              <p className="text-sm leading-6 text-white/75 dark:text-slate-700">
                Use the allowlisted admin email and password. This page is separate from the public login flow.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Allowlisted accounts only',
                'Audit-ready session handling',
                'Fast access to products, leads, and pages',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 text-white/80 dark:border-slate-200 dark:bg-white/70 dark:text-slate-700">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure CRM
              </Badge>
            </div>
          </div>

          <Card className="flex-1 space-y-6">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                Login failed. Confirm the admin email, password, and session secret, then try again.
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                If login fails, verify ADMIN_EMAIL, ADMIN_PASSWORD or ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET in your environment.
              </div>
            )}

            <form action="/api/admin/login" method="post" className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">Admin email</label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="admin@yourcompany.com" required />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
                <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter admin password" required />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
            </form>

            <div className="flex items-center justify-between gap-3 text-sm">
              <Link href="/login" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Public login</Link>
              <Link href="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Back to site <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
