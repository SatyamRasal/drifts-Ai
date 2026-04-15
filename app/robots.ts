import type { MetadataRoute } from 'next';

function getSiteUrl() {
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://driftsai.com';
}

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
