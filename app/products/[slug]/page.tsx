import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getSiteSettings } from '@/lib/data';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';
import { SectionHeading } from '@/components/section-heading';
import { createLead } from '@/app/actions';

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
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={product.kind === 'current' ? 'Current product' : 'Upcoming product'} title={product.title} description={product.subtitle} />
      {submitted ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Interest registered. CRM updated.</div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="overflow-hidden rounded-3xl border">
            {product.image_url ? <img src={product.image_url} alt={product.title} className="h-[420px] w-full object-cover" /> : <div className="flex h-[420px] items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">No image yet</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{product.kind === 'current' ? 'Live now' : 'Coming soon'}</Badge>
            {product.featured ? <Badge>Featured</Badge> : null}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
        </Card>

        <Card className="space-y-5">
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
            <div><label className="mb-1 block text-sm">Name</label><Input name="name" required /></div>
            <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" required /></div>
            <div><label className="mb-1 block text-sm">Company</label><Input name="company" /></div>
            <div><label className="mb-1 block text-sm">Phone</label><Input name="phone" /></div>
            <div><label className="mb-1 block text-sm">Message</label><Textarea name="message" rows={6} placeholder={`Tell us what interests you about ${product.title}.`} required /></div>
            <Button className="w-full">Send interest</Button>
          </form>
          <div className="rounded-2xl border bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {settings.footer_text}
          </div>
        </Card>
      </div>
    </section>
  );
}
