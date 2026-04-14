import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) throw new Error('Supabase URL is required');
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  return key;
}

function getSiteUrl(req: Request) {
  return (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const nextPath = typeof body.next === 'string' && body.next.startsWith('/') && !body.next.startsWith('//') ? body.next : '/reset-password';
    const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl(req)}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'Unable to send password reset email.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Password reset request failed:', error);
    return NextResponse.json({ error: 'Unable to send password reset email.' }, { status: 500 });
  }
}
