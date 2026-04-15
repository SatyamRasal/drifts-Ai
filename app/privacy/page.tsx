import { getPageContent } from '@/lib/data';

export async function generateMetadata() {
  const page = await getPageContent('privacy');
  return {
    title: page.seo_title,
    description: page.seo_description,
    alternates: { canonical: '/privacy' },
    openGraph: {
      title: page.seo_title,
      description: page.seo_description,
      url: '/privacy',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: page.seo_title,
      description: page.seo_description,
    },
  };
}

export default async function PrivacyPage() {
  const page = await getPageContent('privacy');
  return <PageRenderer title={page.title} content={page.content} />;
}

function PageRenderer({ title, content }: { title: string; content: string }) {
  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"><article className="prose-clean space-y-5"><h1 className="text-4xl font-semibold tracking-tight">{title}</h1><div className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{content}</div></article></section>;
}
