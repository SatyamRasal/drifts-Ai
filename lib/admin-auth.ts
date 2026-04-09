import bcrypt from 'bcryptjs';

type AdminLoginConfig = {
  email: string;
  password?: string;
  passwordHash?: string;
};

function getEnv(name: string, fallback = '') {
  return String(process.env[name] || fallback);
}

export function getAdminLoginConfig(): AdminLoginConfig {
  const email = getEnv('ADMIN_EMAIL', 'admin@driftsai.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!email) throw new Error('ADMIN_EMAIL is required.');
  if (!password && !passwordHash) throw new Error('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH is required.');

  return { email, password, passwordHash };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const config = getAdminLoginConfig();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== config.email) return false;

  if (config.passwordHash) {
    return bcrypt.compare(password, config.passwordHash);
  }

  return password === (config.password ?? '');
}
