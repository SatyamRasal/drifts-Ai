import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [current, upcoming] = await Promise.all([getProducts('current'), getProducts('upcoming')]);
  const base = 'https://driftsai.com';
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    { url: `${base}/upcoming`, lastModified: new Date() },
    { url: `${base}/inquire`, lastModified: new Date() },
    { url: `${base}/support`, lastModified: new Date() },
    { url: `${base}/privacy`, lastModified: new Date() },
    { url: `${base}/terms`, lastModified: new Date() },
    { url: `${base}/cookies`, lastModified: new Date() },
    ...current.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: new Date(product.updated_at) })),
    ...upcoming.map((product) => ({ url: `${base}/upcoming/${product.slug}`, lastModified: new Date(product.updated_at) })),
  ];
}
