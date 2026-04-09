create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('current', 'upcoming')),
  title text not null,
  slug text not null unique,
  subtitle text not null,
  description text not null,
  image_url text not null default '',
  featured boolean not null default false,
  cta_label text not null default 'Interested',
  cta_href text not null default '/inquire',
  seo_title text not null default '',
  seo_description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('interested', 'inquiry', 'support')),
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  slug text primary key check (slug in ('privacy', 'terms', 'cookies')),
  title text not null,
  content text not null,
  seo_title text not null,
  seo_description text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  table_name text not null,
  row_id text,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);


create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_products_updated_at before update on public.products for each row execute function public.touch_updated_at();
create trigger touch_leads_updated_at before update on public.leads for each row execute function public.touch_updated_at();
create trigger touch_pages_updated_at before update on public.pages for each row execute function public.touch_updated_at();


create index if not exists idx_products_kind_sort_order on public.products (kind, sort_order, created_at desc);
create index if not exists idx_leads_status_created_at on public.leads (status, created_at desc);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);


alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.pages enable row level security;
alter table public.audit_logs enable row level security;

-- Defense in depth: public cannot access sensitive data directly.
create policy "deny all site settings" on public.site_settings for all using (false) with check (false);
create policy "deny all products" on public.products for all using (false) with check (false);
create policy "deny all leads" on public.leads for all using (false) with check (false);
create policy "deny all pages" on public.pages for all using (false) with check (false);
create policy "deny all audit logs" on public.audit_logs for all using (false) with check (false);

insert into public.site_settings (key, value)
values
  ('brand_name', '"Drifts AI"'::jsonb),
  ('legal_name', '"Drifts AI"'::jsonb),
  ('logo_url', '""'::jsonb),
  ('favicon_url', '""'::jsonb),
  ('hero_title', '"Premium digital storefronts for serious product companies"'::jsonb),
  ('hero_subtitle', '"Show products, capture high-intent leads, manage enquiries, and keep every request in one secure CRM."'::jsonb),
  ('primary_cta_label', '"View products"'::jsonb),
  ('primary_cta_href', '"/products"'::jsonb),
  ('secondary_cta_label', '"Send an inquiry"'::jsonb),
  ('secondary_cta_href', '"/inquire"'::jsonb),
  ('contact_email', '"sales@driftsai.com"'::jsonb),
  ('support_email', '"support@driftsai.com"'::jsonb),
  ('sales_phone', '"+91 00000 00000"'::jsonb),
  ('office_address', '"India"'::jsonb),
  ('footer_text', '"Built for premium product brands. Admin access is restricted and every lead is tracked in CRM."'::jsonb),
  ('theme', '"system"'::jsonb),
  ('seo_title', '"Drifts AI — Premium product showcase and CRM"'::jsonb),
  ('seo_description', '"A high-end product website with interested leads, enquiries, support requests, admin CMS, and Supabase CRM."'::jsonb),
  ('og_image_url', '""'::jsonb),
  ('social_links', '[]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.pages (slug, title, content, seo_title, seo_description)
values
  ('privacy', 'Privacy Policy', 'Replace this default privacy policy from the admin panel.', 'Privacy Policy — Drifts AI', 'Privacy policy for Drifts AI.'),
  ('terms', 'Terms of Service', 'Replace this default terms page from the admin panel.', 'Terms of Service — Drifts AI', 'Terms of service for Drifts AI.'),
  ('cookies', 'Cookie Policy', 'Replace this default cookie policy from the admin panel.', 'Cookie Policy — Drifts AI', 'Cookie policy for Drifts AI.')
on conflict (slug) do update set title = excluded.title, content = excluded.content, seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = now();


create trigger touch_site_settings_updated_at before update on public.site_settings for each row execute function public.touch_updated_at();
