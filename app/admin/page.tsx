import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { getDashboardStats, getLeads, getPageContent, getProducts, getSiteSettings, getAuditLogs } from '@/lib/data';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { saveProduct, deleteProduct, saveSettings, savePageContent, saveLead, deleteLead } from '@/app/admin/actions';
import { uploadSiteAsset } from '@/app/admin/upload-actions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default async function AdminPage() {
  const session = getAdminSession();
  const adminEmail = session?.email;
  if (!adminEmail) {
    redirect('/admin/login');
  }

  const [stats, settings, currentProducts, upcomingProducts, leads, privacy, terms, cookies, auditLogs] = await Promise.all([
    getDashboardStats(),
    getSiteSettings(),
    getProducts('current'),
    getProducts('upcoming'),
    getLeads(),
    getPageContent('privacy'),
    getPageContent('terms'),
    getPageContent('cookies'),
    getAuditLogs(),
  ]);

  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Current products" value={String(stats.currentProducts)} />
        <Stat title="Upcoming products" value={String(stats.upcomingProducts)} />
        <Stat title="Total leads" value={String(stats.leads)} />
        <Stat title="New leads" value={String(stats.newLeads)} />
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
        <Card className="space-y-6">
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
            <div><label className="mb-1 block text-sm">SEO title</label><Input name="seoTitle" defaultValue={settings.seo_title} /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm">SEO description</label><Textarea name="seoDescription" rows={3} defaultValue={settings.seo_description} /></div>
            <div><label className="mb-1 block text-sm">Logo URL</label><Input name="logoUrl" defaultValue={settings.logo_url} /></div>
            <div><label className="mb-1 block text-sm">Favicon URL</label><Input name="faviconUrl" defaultValue={settings.favicon_url} /></div>
            <div><label className="mb-1 block text-sm">Open Graph image URL</label><Input name="ogImageUrl" defaultValue={settings.og_image_url} /></div>
            <div className="md:col-span-2"><Button>Save settings</Button></div>
          </form>

          <form action={uploadSiteAsset} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm">Upload logo</label><Input type="file" name="asset" accept="image/*" /></div>
            <div><label className="mb-1 block text-sm">Upload favicon</label><Input type="file" name="favicon" accept="image/*" /></div>
            <div className="md:col-span-2"><Button>Upload media to Supabase Storage</Button></div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">New product</h2>
            <form action={saveProduct} encType="multipart/form-data" className="space-y-4">
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
            <form action={saveProduct} encType="multipart/form-data" className="space-y-4">
              <input type="hidden" name="kind" value="upcoming" />
              <div><label className="mb-1 block text-sm">Title</label><Input name="title" /></div>
              <div><label className="mb-1 block text-sm">Slug</label><Input name="slug" placeholder="future-product" /></div>
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
              <Button className="w-full">Create upcoming product</Button>
            </form>
          </Card>
        </div>
      </div>

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
                  <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><Button type="submit" className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-600">Delete</Button></form>
                </div>
                <form action={saveProduct} encType="multipart/form-data" className="mt-4 grid gap-3 md:grid-cols-2">
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
                  <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><Button type="submit" className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-600">Delete</Button></form>
                </div>
                <form action={saveProduct} encType="multipart/form-data" className="mt-4 grid gap-3 md:grid-cols-2">
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

      <Card className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">CRM leads</h2>
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.email} · {lead.lead_type}</div>
                  <div className="text-xs text-slate-500">Created {formatDate(lead.created_at)}</div>
                </div>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-white dark:hover:bg-red-600">Delete</Button>
                </form>
              </div>

              <form action={saveLead} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs">Lead type</label>
                    <Select name="leadType" defaultValue={lead.lead_type}>
                      <option value="interested">Interested</option>
                      <option value="inquiry">Inquiry</option>
                      <option value="support">Support</option>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs">Status</label>
                    <Select name="status" defaultValue={lead.status}>
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="quoted">Quoted</option>
                      <option value="closed">Closed</option>
                    </Select>
                  </div>
                  <div><label className="mb-1 block text-xs">Name</label><Input name="name" defaultValue={lead.name} /></div>
                  <div><label className="mb-1 block text-xs">Email</label><Input name="email" type="email" defaultValue={lead.email} /></div>
                  <div><label className="mb-1 block text-xs">Company</label><Input name="company" defaultValue={lead.company ?? ''} /></div>
                  <div><label className="mb-1 block text-xs">Phone</label><Input name="phone" defaultValue={lead.phone ?? ''} /></div>
                  <div><label className="mb-1 block text-xs">Product ID</label><Input name="productId" defaultValue={lead.product_id ?? ''} /></div>
                  <div><label className="mb-1 block text-xs">Product slug</label><Input name="productSlug" defaultValue={lead.product_slug ?? ''} /></div>
                </div>
                <div><label className="mb-1 block text-xs">Message</label><Textarea name="message" rows={5} defaultValue={lead.message} /></div>
                <div><label className="mb-1 block text-xs">Notes</label><Textarea name="notes" rows={4} defaultValue={lead.notes ?? ''} /></div>
                <Button type="submit">Save lead</Button>
              </form>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-4">
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

      <Card className="space-y-4">
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
