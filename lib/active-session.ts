import { getVisitorSession, type VisitorSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/session';

export type ActiveSession =
  | (VisitorSession & { role: 'visitor' })
  | { email: string; role: 'admin'; name?: string; userId: string };

export async function getActiveSession(): Promise<ActiveSession | null> {
  const admin = await getAdminSession();
  if (admin?.email) {
    return {
      email: admin.email,
      role: 'admin',
      userId: `admin:${admin.email}`,
      name: admin.email.split('@')[0] || admin.email,
    };
  }

  const visitor = await getVisitorSession();
  if (visitor?.email) {
    return { ...visitor, role: 'visitor' };
  }

  return null;
}

export function getSessionDisplayName(session: ActiveSession | null) {
  if (!session) return '';
  return session.name?.trim() || session.email.split('@')[0] || session.email;
}
