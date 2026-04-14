import crypto from 'crypto';
import { cookies } from 'next/headers';
import { safeCompareStrings } from '@/lib/utils';

export const ADMIN_COOKIE = 'driftsai_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@driftsai.com').trim().toLowerCase();
  const passwordSource = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '';

  if (!passwordSource) {
    throw new Error('ADMIN_SESSION_SECRET must be set to a long random string, or ADMIN_PASSWORD / ADMIN_PASSWORD_HASH must be configured.');
  }

  return crypto.createHash('sha256').update(`${email}:${passwordSource}`).digest('hex');
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expires = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = JSON.stringify({ email: normalizedEmail, expires });
  const body = base64url(payload);
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  let expected = '';
  try {
    expected = sign(body);
  } catch {
    return null;
  }

  if (!safeCompareStrings(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { email?: unknown; expires?: unknown };
    if (typeof payload.email !== 'string' || typeof payload.expires !== 'number') return null;
    if (Date.now() > payload.expires) return null;
    return { email: payload.email, expires: payload.expires };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setAdminCookie(token: string) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie() {
  (await cookies()).set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
