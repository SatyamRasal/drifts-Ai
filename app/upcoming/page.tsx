import { getProducts, getSiteSettings } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Upcoming Products — ${settings.brand_name}`, description: 'Upcoming product launches and pre-interest collection.' };
}

export default async function UpcomingPage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts('upcoming')]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Upcoming" title="Products in development" description={`Something powerful is in the pipeline. Join the ${settings.brand_name} waitlist to get early access and be the first to know when our new software goes live.`} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} basePath="/upcoming" />)}
      </div>
    </section>
  );
}
