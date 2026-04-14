import { cache } from 'react';
import { tryGetSupabaseAdminClient } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/utils';
import { parseFaqList, type ChatbotFaq } from '@/lib/chatbot';

export type LandingBlockType = 'hero' | 'text' | 'image' | 'video' | 'cta' | 'feature_grid' | 'stats' | 'spacer';

export type LandingBlock = {
  id: string;
  type: LandingBlockType;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  media_url?: string;
  label?: string;
  href?: string;
  align?: 'left' | 'center';
  columns?: number;
  background?: 'surface' | 'muted' | 'dark' | 'accent';
  items?: { title: string; text: string }[];
  stats?: { label: string; value: string }[];
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
};

export type SiteSettings = {
  brand_name: string;
  legal_name: string;
  logo_url: string;
  favicon_url: string;
  hero_title: string;
  hero_subtitle: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  contact_email: string;
  support_email: string;
  sales_phone: string;
  office_address: string;
  footer_text: string;
  theme: 'light' | 'dark' | 'system';
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  social_links: { label: string; href: string }[];
  accent_color: string;
  font_family: 'inter' | 'system' | 'serif' | 'mono' | 'space';
  button_style: 'solid' | 'outline' | 'soft';
  landing_blocks: LandingBlock[];
  chatbot_enabled: boolean;
  chatbot_welcome_message: string;
  chatbot_default_answer: string;
  chatbot_ai_enabled: boolean;
  chatbot_ai_model: string;
  chatbot_system_prompt: string;
  chatbot_faqs: ChatbotFaq[];
  chatbot_openai_api_key?: string;
};

export type AdminSiteSettings = SiteSettings & {
  chatbot_openai_api_key: string;
};

export type Product = {
  id: string;
  slug: string;
  kind: 'current' | 'upcoming';
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  featured: boolean;
  cta_label: string;
  cta_href: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  lead_type: 'interested' | 'inquiry' | 'support';
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  product_id: string | null;
  product_slug: string | null;
  status: 'new' | 'in_progress' | 'quoted' | 'closed';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  table_name: string;
  row_id: string | null;
  before_data: unknown;
  after_data: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type PageContent = {
  slug: 'privacy' | 'terms' | 'cookies';
  title: string;
  content: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

const defaults: SiteSettings = {
  brand_name: 'Drifts AI',
  legal_name: 'Drifts AI',
  logo_url: '',
  favicon_url: '',
  hero_title: 'Premium digital storefronts for serious product companies',
  hero_subtitle: 'Show products, capture high-intent leads, manage enquiries, and keep every request in one secure CRM. Built for premium brands that expect speed, polish, and control.',
  primary_cta_label: 'View products',
  primary_cta_href: '/products',
  secondary_cta_label: 'Send an inquiry',
  secondary_cta_href: '/inquire',
  contact_email: 'sales@driftsai.com',
  support_email: 'support@driftsai.com',
  sales_phone: '+91 00000 00000',
  office_address: 'India',
  footer_text: 'Built for premium product brands. Admin access is restricted and every lead is tracked in CRM.',
  theme: 'system',
  seo_title: 'Drifts AI — Premium software solutions and CRM',
  seo_description: 'A high-end product website with interested leads, enquiries, support requests, admin CMS, and Supabase CRM.',
  og_image_url: '',
  social_links: [],
  accent_color: '#0f172a',
  font_family: 'inter',
  button_style: 'solid',
  landing_blocks: [],
  chatbot_enabled: true,
  chatbot_welcome_message: 'Ask me anything about the site, products, pricing, setup, or support.',
  chatbot_default_answer: 'I could not match that question yet. Please rephrase it, or ask an admin to add it to the knowledge base.',
  chatbot_ai_enabled: false,
  chatbot_ai_model: 'gpt-4.1-mini',
  chatbot_system_prompt: 'You are a CRM website assistant. Answer concisely, use only the provided knowledge base and product/site context, and avoid inventing details. If the answer is not known, say so and suggest the default fallback.',
  chatbot_faqs: [],
};

const pagesFallback: Record<'privacy' | 'terms' | 'cookies', PageContent> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: 'This is the default privacy policy text. Replace it from the admin panel.',
    seo_title: 'Privacy Policy — Drifts AI',
    seo_description: 'Privacy policy for Drifts AI.',
    updated_at: new Date().toISOString(),
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    content: 'This is the default terms text. Replace it from the admin panel.',
    seo_title: 'Terms of Service — Drifts AI',
    seo_description: 'Terms of service for Drifts AI.',
    updated_at: new Date().toISOString(),
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    content: 'This is the default cookie policy text. Replace it from the admin panel.',
    seo_title: 'Cookie Policy — Drifts AI',
    seo_description: 'Cookie policy for Drifts AI.',
    updated_at: new Date().toISOString(),
  },
};

function normalizeLandingBlocks(value: unknown): LandingBlock[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): LandingBlock | null => {
      if (!item || typeof item !== 'object') return null;
      const block = item as Partial<LandingBlock>;
      const id = typeof block.id === 'string' && block.id.trim() ? block.id : `block-${index + 1}`;
      const type = (block.type as LandingBlockType) || 'text';
      const items = Array.isArray(block.items)
        ? block.items
            .map((entry) => (entry && typeof entry === 'object' ? { title: String((entry as { title?: unknown }).title ?? ''), text: String((entry as { text?: unknown }).text ?? '') } : null))
            .filter((entry): entry is { title: string; text: string } => Boolean(entry))
        : [];
      const stats = Array.isArray(block.stats)
        ? block.stats
            .map((entry) => (entry && typeof entry === 'object' ? { label: String((entry as { label?: unknown }).label ?? ''), value: String((entry as { value?: unknown }).value ?? '') } : null))
            .filter((entry): entry is { label: string; value: string } => Boolean(entry))
        : [];

      return {
        id,
        type,
        eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
        title: typeof block.title === 'string' ? block.title : undefined,
        subtitle: typeof block.subtitle === 'string' ? block.subtitle : undefined,
        body: typeof block.body === 'string' ? block.body : undefined,
        media_url: typeof block.media_url === 'string' ? block.media_url : undefined,
        label: typeof block.label === 'string' ? block.label : undefined,
        href: typeof block.href === 'string' ? block.href : undefined,
        align: block.align === 'center' ? 'center' : 'left',
        columns: typeof block.columns === 'number' ? block.columns : undefined,
        background: block.background === 'muted' || block.background === 'dark' || block.background === 'accent' ? block.background : 'surface',
        items,
        stats,
        caption: typeof block.caption === 'string' ? block.caption : undefined,
        autoplay: Boolean(block.autoplay),
        loop: Boolean(block.loop),
      };
    })
    .filter((block): block is LandingBlock => block !== null);
}

function mapSettings(data: Record<string, unknown> | null | undefined, includeSecrets = false): SiteSettings {
  if (!data) return defaults;
  const faqs = parseFaqList(data.chatbot_faqs);
  return {
    ...defaults,
    brand_name: String(data.brand_name ?? defaults.brand_name),
    legal_name: String(data.legal_name ?? defaults.legal_name),
    logo_url: String(data.logo_url ?? defaults.logo_url),
    favicon_url: String(data.favicon_url ?? defaults.favicon_url),
    hero_title: String(data.hero_title ?? defaults.hero_title),
    hero_subtitle: String(data.hero_subtitle ?? defaults.hero_subtitle),
    primary_cta_label: String(data.primary_cta_label ?? defaults.primary_cta_label),
    primary_cta_href: String(data.primary_cta_href ?? defaults.primary_cta_href),
    secondary_cta_label: String(data.secondary_cta_label ?? defaults.secondary_cta_label),
    secondary_cta_href: String(data.secondary_cta_href ?? defaults.secondary_cta_href),
    contact_email: String(data.contact_email ?? defaults.contact_email),
    support_email: String(data.support_email ?? defaults.support_email),
    sales_phone: String(data.sales_phone ?? defaults.sales_phone),
    office_address: String(data.office_address ?? defaults.office_address),
    footer_text: String(data.footer_text ?? defaults.footer_text),
    theme: (data.theme as SiteSettings['theme']) ?? defaults.theme,
    seo_title: String(data.seo_title ?? defaults.seo_title),
    seo_description: String(data.seo_description ?? defaults.seo_description),
    og_image_url: String(data.og_image_url ?? defaults.og_image_url),
    social_links: Array.isArray(data.social_links) ? data.social_links as { label: string; href: string }[] : safeJsonParse(String(data.social_links ?? '[]'), []),
    accent_color: String(data.accent_color ?? defaults.accent_color),
    font_family: (data.font_family as SiteSettings['font_family']) ?? defaults.font_family,
    button_style: (data.button_style as SiteSettings['button_style']) ?? defaults.button_style,
    landing_blocks: normalizeLandingBlocks(data.landing_blocks),
    chatbot_enabled: Boolean(data.chatbot_enabled ?? defaults.chatbot_enabled),
    chatbot_welcome_message: String(data.chatbot_welcome_message ?? defaults.chatbot_welcome_message),
    chatbot_default_answer: String(data.chatbot_default_answer ?? defaults.chatbot_default_answer),
    chatbot_ai_enabled: Boolean(data.chatbot_ai_enabled ?? defaults.chatbot_ai_enabled),
    chatbot_ai_model: String(data.chatbot_ai_model ?? defaults.chatbot_ai_model),
    chatbot_system_prompt: String(data.chatbot_system_prompt ?? defaults.chatbot_system_prompt),
    chatbot_faqs: faqs,
    chatbot_openai_api_key: includeSecrets ? String(data.chatbot_openai_api_key ?? '') : '',
  };
}

async function loadSettings(includeSecrets = false) {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return mapSettings(null, includeSecrets);

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data?.length) return mapSettings(null, includeSecrets);
    const row = Object.fromEntries(data.map((item: { key: string; value: unknown }) => [item.key, item.value]));
    return mapSettings(row as Record<string, unknown>, includeSecrets);
  } catch {
    return mapSettings(null, includeSecrets);
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => loadSettings(false));

export const getAdminSiteSettings = cache(async (): Promise<AdminSiteSettings> => loadSettings(true) as Promise<AdminSiteSettings>);

export const getProducts = cache(async (kind?: 'current' | 'upcoming'): Promise<Product[]> => {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return [];

  try {
    let query = supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (kind) query = query.eq('kind', kind);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
});

export const getLeads = cache(async (): Promise<Lead[]> => {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Lead[];
  } catch {
    return [];
  }
});

export const getPageContent = cache(async (slug: 'privacy' | 'terms' | 'cookies'): Promise<PageContent> => {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return pagesFallback[slug];

  try {
    const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle();
    if (error || !data) return pagesFallback[slug];
    return data as PageContent;
  } catch {
    return pagesFallback[slug];
  }
});

export const getAuditLogs = cache(async (): Promise<AuditLog[]> => {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(25);
    if (error || !data) return [];
    return data as AuditLog[];
  } catch {
    return [];
  }
});

export async function getDashboardStats() {
  const [products, upcoming, leads, settings] = await Promise.all([
    getProducts('current'),
    getProducts('upcoming'),
    getLeads(),
    getSiteSettings(),
  ]);

  return {
    currentProducts: products.length,
    upcomingProducts: upcoming.length,
    leads: leads.length,
    brandName: settings.brand_name,
    newLeads: leads.filter((lead: Lead) => lead.status === 'new').length,
  };
}
