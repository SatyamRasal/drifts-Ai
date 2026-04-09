import { Button, Card, Input, Textarea } from '@/components/ui';
import { SectionHeading } from '@/components/section-heading';
import { createLead } from '@/app/actions';

export default async function InquirePage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const { submitted } = await searchParams;
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Inquiry" title="Build your own product or website" description="Use this form for custom builds, partnerships, or high-value sales inquiries." />
      {submitted ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Your inquiry was submitted. The team will review it in CRM.</div> : null}
      <Card className="mt-8">
        <form action={createLead} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="leadType" value="inquiry" />
          <input type="hidden" name="website" value="" />
          <input type="hidden" name="redirectTo" value="/inquire?submitted=1" />
          <div><label className="mb-1 block text-sm">Name</label><Input name="name" required /></div>
          <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" required /></div>
          <div><label className="mb-1 block text-sm">Company</label><Input name="company" /></div>
          <div><label className="mb-1 block text-sm">Phone</label><Input name="phone" /></div>
          <div className="md:col-span-2"><label className="mb-1 block text-sm">Message</label><Textarea name="message" rows={8} placeholder="Tell us what you want to build, the budget range, and the timeline." required /></div>
          <div className="md:col-span-2"><Button>Submit inquiry</Button></div>
        </form>
      </Card>
    </section>
  );
}
