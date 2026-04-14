import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { getDashboardStats, getLeads, getPageContent, getProducts, getAdminSiteSettings, getAuditLogs } from '@/lib/data';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { saveProduct, deleteProduct, saveSettings, savePageContent, updateLeadStatus, saveLandingBlocks, saveChatbotKnowledge } from '@/app/admin/actions';
import { uploadSiteAsset } from '@/app/admin/upload-actions';
import { formatDate } from '@/lib/utils';
import { LandingPageBuilder } from '@/components/landing-page-builder';
import { flashMessageForAdmin } from '@/lib/messages';


const adminSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'settings', label: 'Site settings' },
  { id: 'chatbot', label: 'Chatbot knowledge' },
  { id: 'products', label: 'Products' },
  { id: 'landing', label: 'Landing page' },
  { id: 'leads', label: 'CRM leads' },
  { id: 'pages', label: 'Policies' },
  { id: 'audit', label: 'Audit logs' },
] as const;

function countBy<T extends string>(items: { [K in T]: string }[], key: T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ flash?: string }> }) {
  const { flash } = await searchParams;
  const session = await getAdminSession();
  const adminEmail = session?.email;
  if (!adminEmail) {
    redirect('/admin/login');
  }

  const flashMessage = flashMessageForAdmin(flash);

  const [stats, settings, currentProducts, upcomingProducts, leads, privacy, terms, cookies, auditLogs] = await Promise.all([
    getDashboardStats(),
    getAdminSiteSettings(),
    getProducts('current'),
    getProducts('upcoming'),
    getLeads(),
    getPageContent('privacy'),
    getPageContent('terms'),
    getPageContent('cookies'),
    getAuditLogs(),
  ]);

  const leadStatusCounts = countBy(leads, 'status');
  const leadTypeCounts = countBy(leads, 'lead_type');
  const leadPriority = [
    { label: 'New', value: leadStatusCounts.new || 0 },
    { label: 'In progress', value: leadStatusCounts.in_progress || 0 },
    { label: 'Quoted', value: leadStatusCounts.quoted || 0 },
    { label: 'Closed', value: leadStatusCounts.closed || 0 },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="sticky top-4 z-40 rounded-3xl border bg-white/85 p-3 shadow-sm backdrop-blur-xl dark:bg-slate-950/85">
        <div className="flex gap-2 overflow-x-auto">
          {adminSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-950 hover:text-slate-950 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>

      {flashMessage ? (
        <div role="status" aria-live="polite" className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          {flashMessage}
        </div>
      ) : null}
      <div id="overview" className="grid gap-4 md:grid-cols-4 scroll-mt-28">
        <Stat title="Current products" value={String(stats.currentProducts)} />
        <Stat title="Upcoming products" value={String(stats.upcomingProducts)} />
        <Stat title="Total leads" value={String(stats.leads)} />
        <Stat title="New leads" value={String(stats.newLeads)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business essentials</div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['Contact record', 'Every inquiry lands in one profile with company, phone, product, notes, and status.'],
              ['Pipeline', 'Move leads from new to in-progress, quoted, and closed without spreadsheet drift.'],
              ['Support desk', 'Capture support requests separately from sales leads for faster resolution.'],
              ['Knowledge base', 'Keep chatbot answers and FAQ rows editable from the admin panel.'],
              ['Marketing pages', 'Edit privacy, terms, and cookie content in the same workspace.'],
              ['Audit trail', 'Track who changed what, and when, for operational accountability.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border bg-slate-50 p-4 dark:bg-slate-900/40">
                <div className="font-medium">{title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lead pipeline</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {leadPriority.map((item) => (
              <div key={item.label} className="rounded-2xl border bg-slate-50 p-4 dark:bg-slate-900/40">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-1 text-3xl font-semibold tracking-tight">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-300">
            Lead types: new {leadTypeCounts.interested || 0} interested, {leadTypeCounts.inquiry || 0} inquiries, {leadTypeCounts.support || 0} support requests.
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Admin CRM</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Signed in as {adminEmail}</p>
          </div>
          <form action="/api/admin/logout" method="post"><Button type="submit">Logout</Button></form>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card id="settings" className="space-y-6 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">Site settings</h2>
          <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm">Brand name</label><Input name="brandName" defaultValue={settings.brand_name} /></div>
            <div><label className="mb-1 block text-sm">Legal name</label><Input name="legalName" defaultValue={settings.legal_name} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">Hero title</label><Input name="heroTitle" defaultValue={settings.hero_title} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">Hero subtitle</label><Textarea name="heroSubtitle" rows={4} defaultValue={settings.hero_subtitle} /></div>
            <div><label className="mb-1 block text-sm">Primary CTA label</label><Input name="primaryCtaLabel" defaultValue={settings.primary_cta_label} /></div>
            <div><label className="mb-1 block text-sm">Primary CTA href</label><Input name="primaryCtaHref" defaultValue={settings.primary_cta_href} /></div>
            <div><label className="mb-1 block text-sm">Secondary CTA label</label><Input name="secondaryCtaLabel" defaultValue={settings.secondary_cta_label} /></div>
            <div><label className="mb-1 block text-sm">Secondary CTA href</label><Input name="secondaryCtaHref" defaultValue={settings.secondary_cta_href} /></div>
            <div><label className="mb-1 block text-sm">Contact email</label><Input name="contactEmail" defaultValue={settings.contact_email} /></div>
            <div><label className="mb-1 block text-sm">Support email</label><Input name="supportEmail" defaultValue={settings.support_email} /></div>
            <div><label className="mb-1 block text-sm">Sales phone</label><Input name="salesPhone" defaultValue={settings.sales_phone} /></div>
            <div><label className="mb-1 block text-sm">Office address</label><Input name="officeAddress" defaultValue={settings.office_address} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">Footer text</label><Textarea name="footerText" rows={3} defaultValue={settings.footer_text} /></div>
            <div><label className="mb-1 block text-sm">Theme default</label><Select name="theme" defaultValue={settings.theme}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></div>
            <div><label className="mb-1 block text-sm">Accent color</label><Input name="accentColor" defaultValue={settings.accent_color} placeholder="#0f172a" /></div>
            <div><label className="mb-1 block text-sm">Font family</label><Select name="fontFamily" defaultValue={settings.font_family}><option value="inter">Inter</option><option value="system">System</option><option value="serif">Serif</option><option value="mono">Mono</option><option value="space">Space Grotesk</option></Select></div>
            <div><label className="mb-1 block text-sm">Button style</label><Select name="buttonStyle" defaultValue={settings.button_style}><option value="solid">Solid</option><option value="outline">Outline</option><option value="soft">Soft</option></Select></div>
            <div><label className="mb-1 block text-sm">SEO title</label><Input name="seoTitle" defaultValue={settings.seo_title} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">SEO description</label><Textarea name="seoDescription" rows={3} defaultValue={settings.seo_description} /></div>
            <div><label className="mb-1 block text-sm">Google Analytics ID</label><Input name="googleAnalyticsId" defaultValue={settings.google_analytics_id} placeholder="G-XXXXXXXXXX" /></div>
            <div><label className="mb-1 block text-sm">Logo URL</label><Input name="logoUrl" defaultValue={settings.logo_url} /></div>
            <div><label className="mb-1 block text-sm">Favicon URL</label><Input name="faviconUrl" defaultValue={settings.favicon_url} /></div>
            <div><label className="mb-1 block text-sm">Open Graph image URL</label><Input name="ogImageUrl" defaultValue={settings.og_image_url} /></div>
            <div><label className="mb-1 block text-sm">Chatbot enabled</label><Select name="chatbotEnabled" defaultValue={String(settings.chatbot_enabled)}><option value="true">Yes</option><option value="false">No</option></Select></div>
            <div><label className="mb-1 block text-sm">Welcome message</label><Input name="chatbotWelcomeMessage" defaultValue={settings.chatbot_welcome_message} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">Default fallback answer</label><Textarea name="chatbotDefaultAnswer" rows={3} defaultValue={settings.chatbot_default_answer} /></div>
            <div><label className="mb-1 block text-sm">AI enabled</label><Select name="chatbotAiEnabled" defaultValue={String(settings.chatbot_ai_enabled)}><option value="true">Yes</option><option value="false">No</option></Select></div>
            <div><label className="mb-1 block text-sm">AI model</label><Input name="chatbotAiModel" defaultValue={settings.chatbot_ai_model} placeholder="gpt-4.1-mini" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">System prompt</label><Textarea name="chatbotSystemPrompt" rows={5} defaultValue={settings.chatbot_system_prompt} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">OpenAI API key (leave blank to keep existing)</label><Input name="chatbotOpenAiApiKey" type="password" autoComplete="off" placeholder="sk-..." /></div>
            <div className="md:col-span-2"><Button>Save settings</Button></div>
          </form>

          <form action={uploadSiteAsset} className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm">Upload logo</label><Input type="file" name="asset" accept="image/*" /></div>
            <div><label className="mb-1 block text-sm">Upload favicon</label><Input type="file" name="favicon" accept="image/*" /></div>
            <div className="md:col-span-2"><Button>Upload media to Supabase Storage</Button></div>
          </form>

          <div id="chatbot" className="rounded-3xl border bg-slate-50 p-5 dark:bg-slate-900/40 scroll-mt-28">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Chatbot knowledge base</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Add natural-language question and answer pairs. Upload the demo CSV or paste rows in the format: question | answer | tags | priority | enabled.</p>
              </div>
              <div className="text-sm text-slate-500">{settings.chatbot_faqs.length} saved answers</div>
            </div>
            <form action={saveChatbotKnowledge} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm">Paste rows or CSV</label>
                <Textarea name="faqRows" rows={8} defaultValue={settings.chatbot_faqs.map((item) => [item.question, item.answer, item.tags.join('; '), item.priority, item.enabled ? 'true' : 'false'].join(' | ')).join('\n')} placeholder="What is your refund policy? | Refunds are handled case by case. | refund; billing | 5 | true" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Upload CSV / sheet export</label>
                <Input type="file" name="faqSheet" accept=".csv,.tsv,.txt" />
              </div>
              <Button type="submit">Save chatbot answers</Button>
            </form>
          </div>
        </Card>

        <div className="space-y-6">
          <Card id="products" className="space-y-4 scroll-mt-28">
            <h2 className="text-2xl font-semibold tracking-tight">New product</h2>
            <form action={saveProduct} className="space-y-4">
              <input type="hidden" name="kind" value="current" />
              <div><label className="mb-1 block text-sm">Title</label><Input name="title" /></div>
              <div><label className="mb-1 block text-sm">Slug</label><Input name="slug" placeholder="premium-product" /></div>
              <div><label className="mb-1 block text-sm">Subtitle</label><Input name="subtitle" /></div>
              <div><label className="mb-1 block text-sm">Description</label><Textarea name="description" rows={6} /></div>
              <div><label className="mb-1 block text-sm">Image URL</label><Input name="imageUrl" /></div>
              <div><label className="mb-1 block text-sm">Or upload image</label><Input type="file" name="imageFile" accept="image/*" /></div>
              <div><label className="mb-1 block text-sm">CTA label</label><Input name="ctaLabel" defaultValue="Interested" /></div>
              <div><label className="mb-1 block text-sm">CTA href</label><Input name="ctaHref" defaultValue="/inquire" /></div>
              <div><label className="mb-1 block text-sm">SEO title</label><Input name="seoTitle" /></div>
              <div><label className="mb-1 block text-sm">SEO description</label><Textarea name="seoDescription" rows={3} /></div>
              <div><label className="mb-1 block text-sm">Sort order</label><Input name="sortOrder" type="number" defaultValue={0} /></div>
              <div><label className="mb-1 block text-sm">Featured</label><Select name="featured"><option value="true">Yes</option><option value="false">No</option></Select></div>
              <Button className="w-full">Create current product</Button>
            </form>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">New upcoming product</h2>
            <form action={saveProduct} className="space-y-4">
              <input type="hidden" name="kind" value="upcoming" />
              <div><label className="mb-1 block text-sm">Title</label><Input name="title" /></div>
              <div><label className="mb-1 block text-sm">Slug</label><Input name="slug" placeholder="launch-name" /></div>
              <div><label className="mb-1 block text-sm">Subtitle</label><Input name="subtitle" /></div>
              <div><label className="mb-1 block text-sm">Description</label><Textarea name="description" rows={6} /></div>
              <div><label className="mb-1 block text-sm">Image URL</label><Input name="imageUrl" /></div>
              <div><label className="mb-1 block text-sm">Or upload image</label><Input type="file" name="imageFile" accept="image/*" /></div>
              <div><label className="mb-1 block text-sm">CTA label</label><Input name="ctaLabel" defaultValue="Register interest" /></div>
              <div><label className="mb-1 block text-sm">CTA href</label><Input name="ctaHref" defaultValue="/inquire" /></div>
              <div><label className="mb-1 block text-sm">SEO title</label><Input name="seoTitle" /></div>
              <div><label className="mb-1 block text-sm">SEO description</label><Textarea name="seoDescription" rows={3} /></div>
              <div><label className="mb-1 block text-sm">Sort order</label><Input name="sortOrder" type="number" defaultValue={0} /></div>
              <div><label className="mb-1 block text-sm">Featured</label><Select name="featured"><option value="true">Yes</option><option value="false">No</option></Select></div>
              <Button className="w-full">Create upcoming product</Button>
            </form>
          </Card>
        </div>
      </div>

      <Card id="landing" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-semibold tracking-tight">Landing page builder</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Build sections by clicking, reordering, and filling fields. The home page will render these blocks in order.</p>
        <form action={saveLandingBlocks} className="space-y-4">
          <LandingPageBuilder initialBlocks={settings.landing_blocks} />
          <Button type="submit">Save landing page</Button>
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Current products</h2>
          <div className="space-y-4">
            {currentProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-slate-500">/{product.slug} · {product.featured ? 'featured' : 'not featured'}</div>
                  </div>
                  <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><Button type="submit">Delete</Button></form>
                </div>
                <form action={saveProduct} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="kind" value={product.kind} />
                  <div><label className="mb-1 block text-xs">Title</label><Input name="title" defaultValue={product.title} /></div>
                  <div><label className="mb-1 block text-xs">Slug</label><Input name="slug" defaultValue={product.slug} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">Subtitle</label><Input name="subtitle" defaultValue={product.subtitle} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">Description</label><Textarea name="description" rows={5} defaultValue={product.description} /></div>
                  <div><label className="mb-1 block text-xs">Image URL</label><Input name="imageUrl" defaultValue={product.image_url} /></div>
                  <div><label className="mb-1 block text-xs">Or upload image</label><Input type="file" name="imageFile" accept="image/*" /></div>
                  <div><label className="mb-1 block text-xs">CTA label</label><Input name="ctaLabel" defaultValue={product.cta_label} /></div>
                  <div><label className="mb-1 block text-xs">CTA href</label><Input name="ctaHref" defaultValue={product.cta_href} /></div>
                  <div><label className="mb-1 block text-xs">SEO title</label><Input name="seoTitle" defaultValue={product.seo_title} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">SEO description</label><Textarea name="seoDescription" rows={3} defaultValue={product.seo_description} /></div>
                  <div><label className="mb-1 block text-xs">Sort order</label><Input name="sortOrder" type="number" defaultValue={product.sort_order} /></div>
                  <div><label className="mb-1 block text-xs">Featured</label><Select name="featured" defaultValue={String(product.featured)}><option value="true">Yes</option><option value="false">No</option></Select></div>
                  <div className="md:col-span-2"><Button type="submit">Save product</Button></div>
                </form>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Upcoming products</h2>
          <div className="space-y-4">
            {upcomingProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-slate-500">/{product.slug} · {product.featured ? 'featured' : 'not featured'}</div>
                  </div>
                  <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><Button type="submit">Delete</Button></form>
                </div>
                <form action={saveProduct} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="kind" value={product.kind} />
                  <div><label className="mb-1 block text-xs">Title</label><Input name="title" defaultValue={product.title} /></div>
                  <div><label className="mb-1 block text-xs">Slug</label><Input name="slug" defaultValue={product.slug} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">Subtitle</label><Input name="subtitle" defaultValue={product.subtitle} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">Description</label><Textarea name="description" rows={5} defaultValue={product.description} /></div>
                  <div><label className="mb-1 block text-xs">Image URL</label><Input name="imageUrl" defaultValue={product.image_url} /></div>
                  <div><label className="mb-1 block text-xs">Or upload image</label><Input type="file" name="imageFile" accept="image/*" /></div>
                  <div><label className="mb-1 block text-xs">CTA label</label><Input name="ctaLabel" defaultValue={product.cta_label} /></div>
                  <div><label className="mb-1 block text-xs">CTA href</label><Input name="ctaHref" defaultValue={product.cta_href} /></div>
                  <div><label className="mb-1 block text-xs">SEO title</label><Input name="seoTitle" defaultValue={product.seo_title} /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-xs">SEO description</label><Textarea name="seoDescription" rows={3} defaultValue={product.seo_description} /></div>
                  <div><label className="mb-1 block text-xs">Sort order</label><Input name="sortOrder" type="number" defaultValue={product.sort_order} /></div>
                  <div><label className="mb-1 block text-xs">Featured</label><Select name="featured" defaultValue={String(product.featured)}><option value="true">Yes</option><option value="false">No</option></Select></div>
                  <div className="md:col-span-2"><Button type="submit">Save product</Button></div>
                </form>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card id="leads" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-semibold tracking-tight">CRM leads</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.email} · {lead.lead_type}</div>
                </div>
                <div className="text-xs text-slate-500">{formatDate(lead.created_at)}</div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{lead.message}</p>
              <form action={updateLeadStatus} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <input type="hidden" name="id" value={lead.id} />
                <Select name="status" defaultValue={lead.status}><option value="new">New</option><option value="in_progress">In progress</option><option value="quoted">Quoted</option><option value="closed">Closed</option></Select>
                <Button type="submit">Update</Button>
              </form>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card id="pages" className="space-y-4 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">Privacy page</h2>
          <form action={savePageContent} className="space-y-4">
            <input type="hidden" name="slug" value="privacy" />
            <Input name="title" defaultValue={privacy.title} />
            <Textarea name="content" rows={10} defaultValue={privacy.content} />
            <Input name="seoTitle" defaultValue={privacy.seo_title} />
            <Textarea name="seoDescription" rows={3} defaultValue={privacy.seo_description} />
            <Button>Save privacy page</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Terms page</h2>
          <form action={savePageContent} className="space-y-4">
            <input type="hidden" name="slug" value="terms" />
            <Input name="title" defaultValue={terms.title} />
            <Textarea name="content" rows={10} defaultValue={terms.content} />
            <Input name="seoTitle" defaultValue={terms.seo_title} />
            <Textarea name="seoDescription" rows={3} defaultValue={terms.seo_description} />
            <Button>Save terms page</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Cookie page</h2>
          <form action={savePageContent} className="space-y-4">
            <input type="hidden" name="slug" value="cookies" />
            <Input name="title" defaultValue={cookies.title} />
            <Textarea name="content" rows={10} defaultValue={cookies.content} />
            <Input name="seoTitle" defaultValue={cookies.seo_title} />
            <Textarea name="seoDescription" rows={3} defaultValue={cookies.seo_description} />
            <Button>Save cookies page</Button>
          </form>
        </Card>
      </div>

      <Card id="audit" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-semibold tracking-tight">Audit logs</h2>
        <div className="grid gap-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">{log.action} · {log.table_name}</div>
                <div className="text-xs text-slate-500">{formatDate(log.created_at)}</div>
              </div>
              <div className="mt-2 text-xs text-slate-500">Actor: {log.actor} · Row: {log.row_id || '-'}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Admin footer: {settings.brand_name} · {adminEmail}</div>
      </Card>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return <Card className="space-y-2"><div className="text-sm text-slate-500">{title}</div><div className="text-3xl font-semibold tracking-tight">{value}</div></Card>;
}
