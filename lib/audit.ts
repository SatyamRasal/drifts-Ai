import { tryGetSupabaseAdminClient } from '@/lib/supabase';

export async function writeAuditLog(entry: {
  actor: string;
  action: string;
  tableName: string;
  rowId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    const supabase = tryGetSupabaseAdminClient();
    if (!supabase) return;

    await supabase.from('audit_logs').insert({
      actor: entry.actor,
      action: entry.action,
      table_name: entry.tableName,
      row_id: entry.rowId ?? null,
      before_data: entry.before ?? null,
      after_data: entry.after ?? null,
      ip_address: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
    });
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
}
