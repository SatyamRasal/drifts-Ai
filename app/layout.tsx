
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteShell } from '@/components/site-shell';
import { getSiteSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Drifts AI',
  description: 'Premium product showcase website with CRM, admin CMS, and secure lead handling.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme={settings.theme}>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
