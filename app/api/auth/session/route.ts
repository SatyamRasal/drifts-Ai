import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUserSessionToken, USER_COOKIE } from '@/lib/auth';
import { createSessionToken, ADMIN_COOKIE } from '@/lib/session';
import { isAllowedAdminIdentity } from '@/lib/admin-auth';

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const accessToken = typeof body.access_token === 'string' ? body.access_token : '';
    const nextPath = typeof body.next === 'string' && body.next.startsWith('/') && !body.next.startsWith('//') ? body.next : '/';

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);
    const user = data.user;
    const email = typeof user?.email === 'string' ? user.email : '';
    if (error || !user || !email || !user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, next: nextPath });
    response.cookies.set({
      name: USER_COOKIE,
      value: createUserSessionToken({
        email: email.toLowerCase(),
        userId: user.id,
        provider: user.app_metadata?.provider || 'email',
        name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      }),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (isAllowedAdminIdentity(email, user.id)) {
      response.cookies.set({
        name: ADMIN_COOKIE,
        value: createSessionToken(email),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 12,
      });
    }

    return response;
  } catch (error) {
    console.error('Auth session bootstrap failed:', error);
    return NextResponse.json({ error: 'Unable to establish session' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  for (const name of [USER_COOKIE, ADMIN_COOKIE]) {
    response.cookies.set({ name, value: '', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  }
  return response;
}
