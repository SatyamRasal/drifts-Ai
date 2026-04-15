'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/session';
import { productSchema, settingsSchema, pageSchema, landingBlockSchema } from '@/lib/validators';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { uploadOptionalFile } from '@/lib/upload';
import { writeAuditLog } from '@/lib/audit';
import { isTruthy, toSlug } from '@/lib/utils';
import { parseFaqSheetText } from '@/lib/chatbot';
import { formatValidationMessage } from '@/lib/messages';

async function requireAdminEmail() {
  const session = await getAdminSession();
  const email = session?.email;
  if (!email) {
    redirect('/admin/login');
  }
  return email as string;
}

function maybeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function parseLandingBlocks(formData: FormData) {
  const raw = String(formData.get('landingBlocksJson') || '');
  try {
    const parsed = JSON.parse(raw);
    return z.array(landingBlockSchema).parse(parsed);
  } catch (error) {
    throw new Error('This detail is not as per expectation to handle (invalid landing blocks JSON).');
  }
}

export async function saveProduct(formData: FormData) {
  const actor = await requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) throw new Error(formatValidationMessage(parsed.error.issues));

  const supabase = getSupabaseAdminClient();
  const id = parsed.data.id || undefined;
  const imageUrlFromFile = await uploadOptionalFile(formData.get('imageFile'), 'products');
  const imageUrl = imageUrlFromFile || parsed.data.imageUrl || '';
  const featured = isTruthy(parsed.data.featured);
  const slug = parsed.data.slug ? toSlug(parsed.data.slug) : toSlug(parsed.data.title);

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
    const { data: before } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    void writeAuditLog({ actor, action: 'update', tableName: 'products', rowId: id, before, after: data });
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select('*').single();
    if (error) throw error;
    void writeAuditLog({ actor, action: 'create', tableName: 'products', rowId: data.id, after: data });
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath('/admin');
  redirect(`/admin?flash=${id ? 'product_saved' : 'product_created'}`);
}

export async function deleteProduct(formData: FormData) {
  const actor = await requireAdminEmail();
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('Missing product id');
  const supabase = getSupabaseAdminClient();
  const { data: before } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  void writeAuditLog({ actor, action: 'delete', tableName: 'products', rowId: id, before });
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath('/admin');
  redirect('/admin?flash=product_deleted');
}

export async function saveSettings(formData: FormData) {
  const actor = await requireAdminEmail();
  const raw = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) throw new Error(formatValidationMessage(parsed.error.issues));
  const supabase = getSupabaseAdminClient();

  const { data: secretRow } = await supabase.from('site_settings').select('value').eq('key', 'chatbot_openai_api_key').maybeSingle();
  const currentApiKey = String(secretRow?.value ?? '').trim();
  const nextApiKey = parsed.data.chatbotOpenAiApiKey?.trim() || currentApiKey;

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
    ['google_analytics_id', parsed.data.googleAnalyticsId || ''],
    ['og_image_url', parsed.data.ogImageUrl || ''],
    ['accent_color', parsed.data.accentColor],
    ['font_family', parsed.data.fontFamily],
    ['button_style', parsed.data.buttonStyle],
    ['chatbot_enabled', parsed.data.chatbotEnabled],
    ['chatbot_welcome_message', parsed.data.chatbotWelcomeMessage],
    ['chatbot_default_answer', parsed.data.chatbotDefaultAnswer],
    ['chatbot_ai_enabled', parsed.data.chatbotAiEnabled],
    ['chatbot_ai_model', parsed.data.chatbotAiModel],
    ['chatbot_system_prompt', parsed.data.chatbotSystemPrompt],
    ['chatbot_openai_api_key', nextApiKey],
  ] as const;

  const payload = rows.map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'key' });
  if (error) throw error;
  void writeAuditLog({ actor, action: 'upsert', tableName: 'site_settings' });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?flash=settings_saved');
}

export async function saveChatbotKnowledge(formData: FormData) {
  const actor = await requireAdminEmail();
  const supabase = getSupabaseAdminClient();
  const file = formData.get('faqSheet');
  let raw = String(formData.get('faqRows') || '');

  if (file instanceof File && file.size > 0) {
    raw = await file.text();
  }

  const parsedRows = parseFaqSheetText(raw);
  if (!parsedRows.length) {
    throw new Error('Add at least one question and answer, or upload a valid sheet/CSV file.');
  }

  const { error } = await supabase.from('site_settings').upsert([
    { key: 'chatbot_faqs', value: parsedRows },
  ], { onConflict: 'key' });
  if (error) throw error;

  void writeAuditLog({ actor, action: 'upsert', tableName: 'site_settings', rowId: 'chatbot_faqs', after: parsedRows });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?flash=chatbot_saved');
}

export async function saveLandingBlocks(formData: FormData) {
  const actor = await requireAdminEmail();
  const supabase = getSupabaseAdminClient();
  const blocks = parseLandingBlocks(formData);
  const { error } = await supabase.from('site_settings').upsert([{ key: 'landing_blocks', value: blocks }], { onConflict: 'key' });
  if (error) throw error;
  void writeAuditLog({ actor, action: 'upsert', tableName: 'site_settings', rowId: 'landing_blocks', after: blocks });
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?flash=landing_saved');
}

export async function savePageContent(formData: FormData) {
  const actor = await requireAdminEmail();
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = pageSchema.safeParse(raw);
    if (!parsed.success) throw new Error(formatValidationMessage(parsed.error.issues));
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
  } catch (error) {
    console.error('savePageContent failed:', error);
    redirect('/admin?flash=page_save_failed');
  }

  redirect('/admin?flash=page_saved');
}

export async function updateLeadStatus(formData: FormData) {
  const actor = await requireAdminEmail();
  const id = z.string().uuid().parse(String(formData.get('id') || ''));
  const status = z.enum(['new', 'in_progress', 'quoted', 'closed']).safeParse(String(formData.get('status') || 'new'));
  if (!status.success) throw new Error('This detail is not as per expectation to handle (invalid lead status).');
  const supabase = getSupabaseAdminClient();
  const { data: before } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  const { data, error } = await supabase.from('leads').update({ status: status.data }).eq('id', id).select('*').single();
  if (error) throw error;
  void writeAuditLog({ actor, action: 'update', tableName: 'leads', rowId: id, before, after: data });
  revalidatePath('/admin');
  redirect('/admin?flash=lead_updated');
}
