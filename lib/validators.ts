import { z } from 'zod';

const landingItemSchema = z.object({
  title: z.string().trim().max(120),
  text: z.string().trim().max(240),
});

const landingStatSchema = z.object({
  label: z.string().trim().max(120),
  value: z.string().trim().max(80),
});

export const landingBlockSchema = z.object({
  id: z.string().trim().min(1).max(80),
  type: z.enum(['hero', 'text', 'image', 'video', 'cta', 'feature_grid', 'stats', 'spacer']),
  eyebrow: z.string().trim().max(120).optional().or(z.literal('')),
  title: z.string().trim().max(180).optional().or(z.literal('')),
  subtitle: z.string().trim().max(240).optional().or(z.literal('')),
  body: z.string().trim().max(5000).optional().or(z.literal('')),
  media_url: z.string().trim().max(600).optional().or(z.literal('')),
  label: z.string().trim().max(120).optional().or(z.literal('')),
  href: z.string().trim().max(400).optional().or(z.literal('')),
  align: z.enum(['left', 'center']).optional(),
  columns: z.coerce.number().int().min(1).max(4).optional(),
  background: z.enum(['surface', 'muted', 'dark', 'accent']).optional(),
  items: z.array(landingItemSchema).optional(),
  stats: z.array(landingStatSchema).optional(),
  caption: z.string().trim().max(240).optional().or(z.literal('')),
  autoplay: z.coerce.boolean().optional(),
  loop: z.coerce.boolean().optional(),
});

export const leadSchema = z.object({
  leadType: z.enum(['interested', 'inquiry', 'support']),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(4000),
  productId: z.string().uuid().optional().or(z.literal('')),
  productSlug: z.string().trim().max(200).optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
});

export const productSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  kind: z.enum(['current', 'upcoming']),
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional().or(z.literal('')),
  subtitle: z.string().trim().min(2).max(220),
  description: z.string().trim().min(10).max(5000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  featured: z.string().optional(),
  ctaLabel: z.string().trim().max(60),
  ctaHref: z.string().trim().max(400).optional().or(z.literal('')),
  seoTitle: z.string().trim().max(160).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(260).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const settingsSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  legalName: z.string().trim().min(2).max(160),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  heroTitle: z.string().trim().min(10).max(160),
  heroSubtitle: z.string().trim().min(20).max(400),
  primaryCtaLabel: z.string().trim().min(2).max(40),
  primaryCtaHref: z.string().trim().max(200),
  secondaryCtaLabel: z.string().trim().min(2).max(40),
  secondaryCtaHref: z.string().trim().max(200),
  contactEmail: z.string().trim().email().max(180),
  supportEmail: z.string().trim().email().max(180),
  salesPhone: z.string().trim().max(50),
  officeAddress: z.string().trim().max(300),
  footerText: z.string().trim().max(300),
  theme: z.enum(['light', 'dark', 'system']),
  seoTitle: z.string().trim().min(10).max(160),
  seoDescription: z.string().trim().min(20).max(260),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
  accentColor: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#0f172a'),
  fontFamily: z.enum(['inter', 'system', 'serif', 'mono', 'space']),
  buttonStyle: z.enum(['solid', 'outline', 'soft']),
  chatbotEnabled: z.preprocess((value: unknown) => value === true || value === 'true' || value === '1' || value === 1 || value === 'on', z.boolean()),
  chatbotWelcomeMessage: z.string().trim().min(5).max(240),
  chatbotDefaultAnswer: z.string().trim().min(5).max(800),
  chatbotAiEnabled: z.preprocess((value: unknown) => value === true || value === 'true' || value === '1' || value === 1 || value === 'on', z.boolean()),
  chatbotAiModel: z.string().trim().min(1).max(80),
  chatbotSystemPrompt: z.string().trim().min(20).max(4000),
  googleAnalyticsId: z.string().trim().regex(/^[A-Z0-9-]+$/i).optional().or(z.literal('')),
  chatbotOpenAiApiKey: z.string().trim().max(4096).optional().or(z.literal('')),
});

export const landingBlocksSchema = z.object({
  landingBlocksJson: z.string().trim().min(2),
});

export const pageSchema = z.object({
  slug: z.enum(['privacy', 'terms', 'cookies']),
  title: z.string().trim().min(4).max(120),
  content: z.string().trim().min(30).max(12000),
  seoTitle: z.string().trim().min(10).max(160),
  seoDescription: z.string().trim().min(20).max(260),
});
