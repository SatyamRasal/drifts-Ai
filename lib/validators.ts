import { z } from 'zod';

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
  seoDescription: z.string().trim().min(40).max(260),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
});

export const pageSchema = z.object({
  slug: z.enum(['privacy', 'terms', 'cookies']),
  title: z.string().trim().min(4).max(120),
  content: z.string().trim().min(30).max(12000),
  seoTitle: z.string().trim().min(10).max(160),
  seoDescription: z.string().trim().min(40).max(260),
});
