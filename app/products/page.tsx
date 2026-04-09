import { getProducts, getSiteSettings } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `Products — ${settings.brand_name}`, description: settings.seo_description };
}

export default async function ProductsPage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts('current')]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Products" title="What is available right now" description={settings.seo_description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} basePath="/products" />)}
      </div>
    </section>
  );
}
