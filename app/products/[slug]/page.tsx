import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getSiteSettings } from '@/lib/data';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { SectionHeading } from '@/components/section-heading';
import { FittedImage } from '@/components/fitted-image';
import { createLead } from '@/app/actions';
import { getActiveSession, getSessionDisplayName } from '@/lib/active-session';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product' };
  return { title: product.seo_title || product.title, description: product.seo_description || product.subtitle };
}

export default async function ProductDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const [settings, product] = await Promise.all([getSiteSettings(), getProductBySlug(slug)]);
  const session = await getActiveSession();
  const displayName = getSessionDisplayName(session);
  const isLoggedIn = Boolean(session?.email);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={product.kind === 'current' ? 'Current product' : 'Upcoming product'} title={product.title} description={product.subtitle} />
      {submitted ? <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Interest registered. CRM updated.</div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="overflow-hidden rounded-3xl border">
            {product.image_url ? <FittedImage src={product.image_url} alt={product.title} aspectClassName="aspect-[5/4]" className="rounded-3xl border" /> : <div className="flex aspect-[5/4] items-center justify-center rounded-3xl border bg-slate-100 text-slate-500 dark:bg-slate-900">No image yet</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{product.kind === 'current' ? 'Live now' : 'Coming soon'}</Badge>
            {product.featured ? <Badge>Featured</Badge> : null}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
        </Card>

        <Card className="space-y-5">
          <div className="rounded-2xl border p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Account</div>
            <div className="mt-2 text-sm font-medium">{isLoggedIn ? `Signed in as ${displayName}` : 'Login required before interest can be sent'}</div>
          </div>
          {!isLoggedIn || !session ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Login required</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Verified sign-in is required before registering interest.</p>
              </div>
              <Link href={`/login?next=/products/${product.slug}`} className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Sign in to continue</Link>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-sm">
                  <tbody>
                    <tr className="border-b"><th className="w-40 bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Name</th><td className="px-4 py-3">{displayName}</td></tr>
                    <tr className="border-b"><th className="bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Email</th><td className="px-4 py-3">{session.email}</td></tr>
                    <tr><th className="bg-slate-50 px-4 py-3 font-medium dark:bg-slate-900">Role</th><td className="px-4 py-3">{session.role}</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Interested?</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Send your details. The team can respond through CRM within the operating SLA.</p>
              </div>
              <form action={createLead} className="space-y-4">
                <input type="hidden" name="leadType" value="interested" />
                <input type="hidden" name="website" value="" />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="productSlug" value={product.slug} />
                <input type="hidden" name="redirectTo" value={`/products/${product.slug}?submitted=1`} />
                <div><label className="mb-1 block text-sm">Name</label><Input name="name" defaultValue={displayName} minLength={2} required /></div>
                <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" defaultValue={session.email} required /></div>
                <div><label className="mb-1 block text-sm">Company</label><Input name="company" placeholder="Company name" /></div>
                <div><label className="mb-1 block text-sm">Phone</label><Input name="phone" placeholder="Phone number" /></div>
                <div><label className="mb-1 block text-sm">Message</label><Textarea name="message" rows={6} placeholder={`Tell us what interests you about ${product.title}.`} minLength={10} required /></div>
                <Button className="w-full">Send interest</Button>
              </form>
            </>
          )}
          <div className="rounded-2xl border bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">{settings.footer_text}</div>
        </Card>
      </div>
    </section>
  );
}
