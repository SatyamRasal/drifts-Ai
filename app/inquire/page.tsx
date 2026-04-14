import Link from 'next/link';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { SectionHeading } from '@/components/section-heading';
import { createLead } from '@/app/actions';
import { getActiveSession, getSessionDisplayName } from '@/lib/active-session';

export default async function InquirePage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  const session = await getActiveSession();
  const displayName = getSessionDisplayName(session);
  const isLoggedIn = Boolean(session?.email);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Inquiry" title="Build your own product or website" description="Use this form for custom builds, partnerships, or high-value sales inquiries." />

      <Card className="mt-8 space-y-4">
        <div className="text-lg font-semibold">Inquiry workflow</div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Every submission is attached to a verified session. That keeps the CRM clean and makes follow-up faster.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</div>
            <div className="mt-2 text-sm font-medium">{isLoggedIn ? 'Signed in' : 'Login required'}</div>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Identity</div>
            <div className="mt-2 text-sm font-medium">{isLoggedIn ? displayName : 'No active session'}</div>
          </div>
        </div>
      </Card>

      {submitted ? <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Your inquiry was submitted. The team will review it in CRM.</div> : null}

      {!isLoggedIn || !session ? (
        <Card className="mt-8 space-y-4">
          <div className="text-lg font-semibold">Login required</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">You need a verified account before submitting an inquiry.</p>
          <Link href="/login?next=/inquire" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Sign in to continue</Link>
        </Card>
      ) : (
        <Card className="mt-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-left text-sm">
              <tbody>
                <tr className="border-b"><th className="w-40 bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Name</th><td className="px-4 py-3">{displayName}</td></tr>
                <tr className="border-b"><th className="bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Email</th><td className="px-4 py-3">{session.email}</td></tr>
                <tr><th className="bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Role</th><td className="px-4 py-3">{session.role}</td></tr>
              </tbody>
            </table>
          </div>

          <form action={createLead} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="leadType" value="inquiry" />
            <input type="hidden" name="website" value="" />
            <input type="hidden" name="redirectTo" value="/inquire?submitted=1" />
            <div><label className="mb-1 block text-sm">Name</label><Input name="name" defaultValue={displayName} minLength={2} required /></div>
            <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" defaultValue={session.email} required /></div>
            <div><label className="mb-1 block text-sm">Company</label><Input name="company" placeholder="Company name" /></div>
            <div><label className="mb-1 block text-sm">Phone</label><Input name="phone" placeholder="Phone number" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">Message</label><Textarea name="message" rows={8} placeholder="Tell us what you want to build, the budget range, and the timeline." minLength={10} required /></div>
            <div className="md:col-span-2"><Button>Submit inquiry</Button></div>
          </form>
        </Card>
      )}
    </section>
  );
}
