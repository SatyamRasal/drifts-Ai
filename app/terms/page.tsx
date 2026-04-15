import { getPageContent } from '@/lib/data';

export async function generateMetadata() {
  const page = await getPageContent('terms');
  return {
    title: page.seo_title,
    description: page.seo_description,
    alternates: { canonical: '/terms' },
    openGraph: {
      title: page.seo_title,
      description: page.seo_description,
      url: '/terms',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: page.seo_title,
      description: page.seo_description,
    },
  };
}

export default async function TermsPage() {
  const page = await getPageContent('terms');
  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"><article className="prose-clean space-y-5"><h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1><div className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{page.content}</div></article></section>;
}
