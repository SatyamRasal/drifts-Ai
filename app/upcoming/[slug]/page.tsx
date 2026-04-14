import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { SectionHeading } from '@/components/section-heading';
import { FittedImage } from '@/components/fitted-image';
import { createLead } from '@/app/actions';
import { getVisitorSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/session';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Upcoming product' };
  return { title: product.seo_title || product.title, description: product.seo_description || product.subtitle };
}

export default async function UpcomingDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const product = await getProductBySlug(slug);
  const session = (await getVisitorSession()) || (await getAdminSession());
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Upcoming product" title={product.title} description={product.subtitle} />
      {submitted ? <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Interest registered. CRM updated.</div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="overflow-hidden rounded-3xl border">
            {product.image_url ? <FittedImage src={product.image_url} alt={product.title} aspectClassName="aspect-[5/4]" className="rounded-3xl border" /> : <div className="flex aspect-[5/4] items-center justify-center rounded-3xl border bg-slate-100 text-slate-500 dark:bg-slate-900">No image yet</div>}
          </div>
          <div className="flex flex-wrap gap-2"><Badge>Coming soon</Badge>{product.featured ? <Badge>Featured</Badge> : null}</div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
        </Card>

        <Card className="space-y-5">
          {!session ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Login required</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">You need a verified session before registering interest.</p>
              </div>
              <Link href={`/login?next=/upcoming/${product.slug}`} className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                Sign in to continue
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Register interest</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Capture demand before launch.</p>
              </div>
              <form action={createLead} className="space-y-4">
                <input type="hidden" name="leadType" value="interested" />
                <input type="hidden" name="website" value="" />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="productSlug" value={product.slug} />
                <input type="hidden" name="redirectTo" value={`/upcoming/${product.slug}?submitted=1`} />
                <div><label className="mb-1 block text-sm">Name</label><Input name="name" minLength={2} required /></div>
                <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" required /></div>
                <div><label className="mb-1 block text-sm">Company</label><Input name="company" /></div>
                <div><label className="mb-1 block text-sm">Message</label><Textarea name="message" rows={6} placeholder={`Tell us why ${product.title} matters to you.`} minLength={10} required /></div>
                <Button className="w-full">Register interest</Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
