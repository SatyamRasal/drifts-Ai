'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/session';
import { leadAdminSchema, productSchema, settingsSchema, pageSchema } from '@/lib/validators';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { uploadOptionalFile } from '@/lib/upload';
import { writeAuditLog } from '@/lib/audit';
import { isTruthy, toSlug } from '@/lib/utils';

function requireAdminEmail() {
  const session = getAdminSession();
  const email = session?.email;
  if (!email) {
    redirect('/admin/login');
  }
  return email;
}

function maybeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function revalidateProductPaths(slug: string, kind: 'current' | 'upcoming') {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath(`/products/${slug}`);
  revalidatePath(`/upcoming/${slug}`);
  revalidatePath(kind === 'current' ? '/products' : '/upcoming');
  revalidatePath('/admin');
}

export async function saveProduct(formData: FormData) {
  const actor = requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));

  const supabase = getSupabaseAdminClient();
  const id = parsed.data.id || undefined;
  const imageUrlFromFile = await uploadOptionalFile(formData.get('imageFile'), 'products');
  const imageUrl = imageUrlFromFile || parsed.data.imageUrl || '';
  const featured = isTruthy(parsed.data.featured);
  const slug = parsed.data.slug ? toSlug(parsed.data.slug) : toSlug(parsed.data.title);
  const before = id ? await supabase.from('products').select('*').eq('id', id).maybeSingle() : { data: null };

  const payload = {
    kind: parsed.data.kind,
    title: parsed.data.title,
    slug,
    subtitle: parsed.data.subtitle,
    description: parsed.data.description,
    image_url: imageUrl,
    featured,
    cta_label: parsed.data.ctaLabel,
    cta_href: maybeString(parsed.data.ctaHref, '/inquire') || '/inquire',
    seo_title: maybeString(parsed.data.seoTitle, parsed.data.title),
    seo_description: maybeString(parsed.data.seoDescription, parsed.data.subtitle),
    sort_order: parsed.data.sortOrder,
  };

  if (id) {
    const previous = before.data;
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    void writeAuditLog({ actor, action: 'update', tableName: 'products', rowId: id, before: previous, after: data });
    if (previous?.slug && previous.slug !== slug) {
      revalidatePath(`/products/${previous.slug}`);
      revalidatePath(`/upcoming/${previous.slug}`);
    }
    if (previous?.kind && previous.kind !== parsed.data.kind) {
      revalidatePath(previous.kind === 'current' ? '/products' : '/upcoming');
    }
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select('*').single();
    if (error) throw error;
    void writeAuditLog({ actor, action: 'create', tableName: 'products', rowId: data.id, after: data });
  }

  revalidateProductPaths(slug, parsed.data.kind);
}

export async function deleteProduct(formData: FormData) {
  const actor = requireAdminEmail();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing product id');
  const supabase = getSupabaseAdminClient();
  const { data: before } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  if (before?.slug) {
    revalidatePath(`/products/${before.slug}`);
    revalidatePath(`/upcoming/${before.slug}`);
  }
  void writeAuditLog({ actor, action: 'delete', tableName: 'products', rowId: id, before });
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath('/admin');
}

export async function saveSettings(formData: FormData) {
  const actor = requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  const supabase = getSupabaseAdminClient();

  const rows = [
    ['brand_name', parsed.data.brandName],
    ['legal_name', parsed.data.legalName],
    ['logo_url', parsed.data.logoUrl || ''],
    ['favicon_url', parsed.data.faviconUrl || ''],
    ['hero_title', parsed.data.heroTitle],
    ['hero_subtitle', parsed.data.heroSubtitle],
    ['primary_cta_label', parsed.data.primaryCtaLabel],
    ['primary_cta_href', parsed.data.primaryCtaHref],
    ['secondary_cta_label', parsed.data.secondaryCtaLabel],
    ['secondary_cta_href', parsed.data.secondaryCtaHref],
    ['contact_email', parsed.data.contactEmail],
    ['support_email', parsed.data.supportEmail],
    ['sales_phone', parsed.data.salesPhone],
    ['office_address', parsed.data.officeAddress],
    ['footer_text', parsed.data.footerText],
    ['theme', parsed.data.theme],
    ['seo_title', parsed.data.seoTitle],
    ['seo_description', parsed.data.seoDescription],
    ['og_image_url', parsed.data.ogImageUrl || ''],
  ] as const;

  const payload = rows.map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'key' });
  if (error) throw error;
  void writeAuditLog({ actor, action: 'upsert', tableName: 'site_settings' });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function savePageContent(formData: FormData) {
  const actor = requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  const supabase = getSupabaseAdminClient();
  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    content: parsed.data.content,
    seo_title: parsed.data.seoTitle,
    seo_description: parsed.data.seoDescription,
  };
  const { data: before } = await supabase.from('pages').select('*').eq('slug', parsed.data.slug).maybeSingle();
  const { data, error } = await supabase.from('pages').upsert(payload, { onConflict: 'slug' }).select('*').single();
  if (error) throw error;
  void writeAuditLog({ actor, action: before ? 'update' : 'create', tableName: 'pages', rowId: parsed.data.slug, before, after: data });
  revalidatePath('/privacy');
  revalidatePath('/terms');
  revalidatePath('/cookies');
  revalidatePath('/admin');
}

export async function saveLead(formData: FormData) {
  const actor = requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = leadAdminSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));

  const supabase = getSupabaseAdminClient();
  const payload = {
    lead_type: parsed.data.leadType,
    status: parsed.data.status,
    name: parsed.data.name,
    email: parsed.data.email,
    company: maybeString(parsed.data.company, '') || null,
    phone: maybeString(parsed.data.phone, '') || null,
    message: parsed.data.message,
    product_id: maybeString(parsed.data.productId, '') || null,
    product_slug: maybeString(parsed.data.productSlug, '') || null,
    notes: maybeString(parsed.data.notes, '') || null,
  };

  const { data: before } = await supabase.from('leads').select('*').eq('id', parsed.data.id).maybeSingle();
  const { data, error } = await supabase.from('leads').update(payload).eq('id', parsed.data.id).select('*').single();
  if (error) throw error;
  void writeAuditLog({ actor, action: 'update', tableName: 'leads', rowId: parsed.data.id, before, after: data });
  revalidatePath('/admin');
}

export async function deleteLead(formData: FormData) {
  const actor = requireAdminEmail();
  const id = z.string().uuid().parse(String(formData.get('id') || ''));
  const supabase = getSupabaseAdminClient();
  const { data: before } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
  void writeAuditLog({ actor, action: 'delete', tableName: 'leads', rowId: id, before });
  revalidatePath('/admin');
}

export async function updateLeadStatus(formData: FormData) {
  const actor = requireAdminEmail();
  const id = z.string().uuid().parse(String(formData.get('id') || ''));
  const status = z.enum(['new', 'in_progress', 'quoted', 'closed']).parse(String(formData.get('status') || 'new'));
  const supabase = getSupabaseAdminClient();
  const { data: before } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select('*').single();
  if (error) throw error;
  void writeAuditLog({ actor, action: 'update', tableName: 'leads', rowId: id, before, after: data });
  revalidatePath('/admin');
}
