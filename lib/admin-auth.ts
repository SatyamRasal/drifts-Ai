import bcrypt from 'bcryptjs';

type AdminLoginConfig = {
  email: string;
  password?: string;
  passwordHash?: string;
  allowedEmails: string[];
  allowedUserIds: string[];
};

function parseList(value?: string | null) {
  return String(value || '')
    .split(/[\s,]+/g)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function getPrimaryAdminEmail() {
  return parseList(process.env.ADMIN_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || 'admin@driftsai.com')[0] || 'admin@driftsai.com';
}

export function getAdminLoginConfig(): AdminLoginConfig {
  const allowedEmails = parseList(process.env.ADMIN_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || 'admin@driftsai.com');
  const allowedUserIds = parseList(process.env.ADMIN_ALLOWED_USER_IDS);
  const email = allowedEmails[0] || 'admin@driftsai.com';
  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!email) throw new Error('ADMIN_EMAIL or ADMIN_ALLOWED_EMAILS is required.');
  if (!password && !passwordHash) throw new Error('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is required.');

  return { email, password, passwordHash, allowedEmails, allowedUserIds };
}

export function isAllowedAdminIdentity(email?: string, userId?: string) {
  const config = getAdminLoginConfig();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedUserId = (userId || '').trim().toLowerCase();
  return config.allowedEmails.includes(normalizedEmail) || (normalizedUserId ? config.allowedUserIds.includes(normalizedUserId) : false);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const config = getAdminLoginConfig();
  const normalizedEmail = email.trim().toLowerCase();
  if (!config.allowedEmails.includes(normalizedEmail)) return false;

  if (config.passwordHash) {
    return bcrypt.compare(password, config.passwordHash);
  }

  return password === (config.password ?? '');
}
