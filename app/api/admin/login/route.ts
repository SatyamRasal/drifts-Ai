import { NextResponse } from 'next/server';

import { createSessionToken, ADMIN_COOKIE } from '@/lib/session';
import { verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';


export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    const isValid = await verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
    }

    const token = createSessionToken(email);
    const response = NextResponse.redirect(new URL('/admin', req.url));
    response.cookies.set({
      name: ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
  }
}
