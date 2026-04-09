import { NextResponse } from 'next/server';

import { ADMIN_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';


export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', req.url));
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
