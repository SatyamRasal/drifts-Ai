import crypto from 'crypto';
import { cookies } from 'next/headers';
import { safeCompareStrings } from '@/lib/utils';

export const USER_COOKIE = 'driftsai_user_session';
const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  const email = (process.env.ADMIN_EMAIL || 'admin@driftsai.com').trim().toLowerCase();
  const passwordSource = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '';
  if (!passwordSource) {
    throw new Error('AUTH_SESSION_SECRET or ADMIN_SESSION_SECRET must be configured.');
  }
  return crypto.createHash('sha256').update(`${email}:${passwordSource}:visitor`).digest('hex');
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export type VisitorSession = {
  email: string;
  userId: string;
  provider: string;
  name?: string;
  expires: number;
};

export function createUserSessionToken(session: Omit<VisitorSession, 'expires'>) {
  const expires = Date.now() + USER_COOKIE_MAX_AGE * 1000;
  const payload = JSON.stringify({ ...session, expires });
  const body = base64url(payload);
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifyUserSessionToken(token?: string | null) {
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
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<VisitorSession>;
    if (typeof payload.email !== 'string' || typeof payload.userId !== 'string' || typeof payload.provider !== 'string' || typeof payload.expires !== 'number') {
      return null;
    }
    if (Date.now() > payload.expires) return null;
    return payload as VisitorSession;
  } catch {
    return null;
  }
}

export async function getVisitorSession() {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  return verifyUserSessionToken(token);
}

export async function setVisitorCookie(token: string) {
  (await cookies()).set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: USER_COOKIE_MAX_AGE,
  });
}

export async function clearVisitorCookie() {
  (await cookies()).set(USER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
