import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge, Card, Button } from '@/components/ui';
import { ChatbotWidget } from '@/components/chatbot-widget';
import { getSiteSettings } from '@/lib/data';
import { getAdminSession } from '@/lib/session';
import { getVisitorSession } from '@/lib/auth';
import { Globe, LogIn, LogOut, ShieldCheck, Zap } from 'lucide-react';

const nav = [
  { href: '/products', label: 'Products' },
  { href: '/upcoming', label: 'Upcoming' },
  { href: '/inquire', label: 'Build yours' },
  { href: '/support', label: 'Support' },
];

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const visitor = await getVisitorSession();
  const admin = await getAdminSession();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_30%),linear-gradient(to_bottom,_transparent,_transparent)]">
      <header className="sticky top-0 z-50 border-b bg-white/75 backdrop-blur-xl dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              {settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name} className="h-full w-full rounded-2xl object-cover" /> : <span className="text-sm font-semibold">D</span>}
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">{settings.brand_name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Premium software solutions</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {admin?.email ? (
              <>
                <Link href="/admin" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
                  CRM
                </Link>
                <form action="/api/auth/logout" method="post">
                  <Button type="submit" className="gap-2 bg-slate-950 px-4 py-3 text-sm text-white dark:bg-white dark:text-slate-950">
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </form>
              </>
            ) : visitor?.email ? (
              <form action="/api/auth/logout" method="post">
                <Button type="submit" className="gap-2 bg-slate-950 px-4 py-3 text-sm text-white dark:bg-white dark:text-slate-950">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </form>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-white/70 dark:bg-slate-950/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div className="space-y-4">
            <div className="text-lg font-semibold tracking-tight">{settings.brand_name}</div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{settings.footer_text}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure CRM</Badge>
              <Badge className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300"><Zap className="mr-1 h-3.5 w-3.5" /> Fast lead capture</Badge>
              <Badge className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"><Globe className="mr-1 h-3.5 w-3.5" /> SEO-ready</Badge>
            </div>
          </div>

          <Card className="space-y-3">
            <div className="text-sm font-semibold">Explore</div>
            <div className="grid gap-2 text-sm">
              {nav.map((item) => <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">{item.label}</Link>)}
              <Link href="/privacy" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Terms</Link>
              <Link href="/cookies" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Cookie Policy</Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="text-sm font-semibold">Contact</div>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <div>{settings.contact_email}</div>
              <div>{settings.sales_phone}</div>
              <div>{settings.office_address}</div>
            </div>
          </Card>
        </div>
      </footer>
      <ChatbotWidget
        enabled={settings.chatbot_enabled}
        brandName={settings.brand_name}
        greeting={settings.chatbot_welcome_message}
        defaultAnswer={settings.chatbot_default_answer}
        suggestions={settings.chatbot_faqs.map((item) => item.question)}
      />
    </div>
  );
}
