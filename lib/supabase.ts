import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

function getSupabaseUrl() {
  return getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL') || getOptionalEnv('SUPABASE_URL');
}

export function hasAdminSupabaseConfig() {
  return Boolean(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required');
  return createClient(url, requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function tryGetSupabaseAdminClient() {
  if (!hasAdminSupabaseConfig()) return null;
  try {
    return getSupabaseAdminClient();
  } catch {
    return null;
  }
}

export function getSupabasePublicClient() {
  const url = getSupabaseUrl();
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required');
  return createClient(url, requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}
