import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteShell } from '@/components/site-shell';
import { GoogleAnalytics } from '@/components/google-analytics';
import { getSiteSettings } from '@/lib/data';
import { getConfiguredSiteUrl } from '@/lib/site-url';
import type { CSSProperties } from 'react';

const siteUrl = getConfiguredSiteUrl() || 'https://driftsai.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Drifts AI', template: '%s | Drifts AI' },
  description: 'Premium software solutions website with CRM, admin CMS, and secure lead handling.',
  openGraph: {
    type: 'website',
    siteName: 'Drifts AI',
    title: 'Drifts AI',
    description: 'Premium software solutions website with CRM, admin CMS, and secure lead handling.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drifts AI',
    description: 'Premium software solutions website with CRM, admin CMS, and secure lead handling.',
  },
};

function fontStack(font: string) {
  switch (font) {
    case 'serif':
      return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    case 'mono':
      return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
    case 'space':
      return '"Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif';
    case 'system':
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    default:
      return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const style = {
    '--brand-accent': settings.accent_color,
    '--brand-font': fontStack(settings.font_family),
  } as CSSProperties;
  return (
    <html lang="en" suppressHydrationWarning data-button-style={settings.button_style} style={style}>
      <body>
        <ThemeProvider defaultTheme={settings.theme}>
          <GoogleAnalytics measurementId={settings.google_analytics_id} />
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
