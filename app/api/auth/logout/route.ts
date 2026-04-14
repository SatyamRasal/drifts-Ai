import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/session';
import { USER_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL('/', req.url));
  for (const name of [USER_COOKIE, ADMIN_COOKIE]) {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
  }
  return response;
}
