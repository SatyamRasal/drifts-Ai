import Link from 'next/link';
import { getProducts, getSiteSettings } from '@/lib/data';
import { Badge, Card, LinkButton } from '@/components/ui';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { LandingBlocks } from '@/components/landing-blocks';
import { ArrowRight, CheckCircle2, ShieldCheck, Gauge, MessageSquareQuote } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: settings.seo_title, description: settings.seo_description };
}

export default async function HomePage() {
  const [settings, current, upcoming] = await Promise.all([getSiteSettings(), getProducts('current'), getProducts('upcoming')]);
  const featured = current.filter((product) => product.featured).slice(0, 3);
  const highlights = [
    { icon: ShieldCheck, title: 'Secure CRM', text: 'Every lead is tracked centrally with audit logs and protected admin access.' },
    { icon: Gauge, title: 'Fast conversion paths', text: 'Interested, inquiry, and support flows are optimized for high-intent visitors.' },
    { icon: MessageSquareQuote, title: 'Quote-ready workflow', text: 'Admin can review leads, move status, and respond from one dashboard.' },
  ];

  return (
    <>
      {settings.landing_blocks.length ? <LandingBlocks blocks={settings.landing_blocks} /> : (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Badge className="border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">Enterprise-grade product presentation</Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">{settings.hero_title}</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{settings.hero_subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={settings.primary_cta_href} className="gap-2 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">{settings.primary_cta_label} <ArrowRight className="h-4 w-4" /></LinkButton>
                <LinkButton href={settings.secondary_cta_href} className="border border-slate-200 bg-white text-slate-950 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">{settings.secondary_cta_label}</LinkButton>
              </div>
              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="space-y-3 p-5">
                      <Icon className="h-5 w-5" />
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.text}</div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Card className="relative overflow-hidden p-0">
              <div className="grid h-full bg-grid-fine bg-[size:28px_28px] p-6 sm:p-8">
                <div className="rounded-[1.5rem] border bg-white/90 p-5 shadow-soft dark:bg-slate-950/90">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">CRM Snapshot</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Live lead intake</div>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">Secure</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border p-4">
                      <div className="text-2xl font-semibold">{current.length}</div>
                      <div className="text-xs text-slate-500">Current products</div>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <div className="text-2xl font-semibold">{upcoming.length}</div>
                      <div className="text-xs text-slate-500">Upcoming launches</div>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <div className="text-2xl font-semibold">12h</div>
                      <div className="text-xs text-slate-500">Target quote window</div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-300">
                    All form submissions enter the admin CRM. The admin area is not public and all mutations are server-side.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Featured" title="Priority products" description="These are the products that should get the strongest visibility on the homepage and in SEO." />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {featured.map((product) => <ProductCard key={product.id} product={product} basePath="/products" />)}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Current" title="Explore Our Premium Products" description="Browse Premium Software * Discover Our Solutions" />
          <Link href="/products" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sm:block">View all</Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {current.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} basePath="/products" />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] border bg-slate-950 p-8 text-white shadow-soft lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Why We Do It</div>
            <h2 className="text-3xl font-semibold tracking-tight">Empowering Organizations Through Scalable Software</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">DriftsAI is a dedicated software hub offering a dual approach to technology: robust, ready-to-deploy digital products and bespoke engineering services. We specialize in transforming complex organizational challenges into streamlined, intuitive mobile and web applications designed to support your entire workforce effortlessly.</p>
          </div>
          <div className="grid gap-3">
            {["Products", "Upcoming products", "Interested leads", "General inquiries", "Support feedback", "Audit logs"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Upcoming" title="Upcoming Releases" description="Coming Soon (Very standard, highly recognizable)" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {upcoming.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} basePath="/upcoming" />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold">Need a custom build?</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Send an inquiry and let the driftsAi team respond through CRM.</div>
          </div>
          <LinkButton href="/inquire" className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Open inquiry form</LinkButton>
        </Card>
      </section>
    </>
  );
}
