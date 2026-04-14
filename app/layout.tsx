import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteShell } from '@/components/site-shell';
import { getSiteSettings } from '@/lib/data';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Drifts AI',
  description: 'Premium software solutions website with CRM, admin CMS, and secure lead handling.',
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
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
