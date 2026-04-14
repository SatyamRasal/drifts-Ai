'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { leadSchema } from '@/lib/validators';
import { tryGetSupabaseAdminClient } from '@/lib/supabase';
import { buildLeadEmailHtml, maybeSendNotificationEmail } from '@/lib/mailer';
import { writeAuditLog } from '@/lib/audit';
import { sanitizeRedirectPath } from '@/lib/utils';
import { formatValidationMessage } from '@/lib/messages';
import { getActiveSession } from '@/lib/active-session';

export async function createLead(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(formatValidationMessage(parsed.error.issues));
  }

  const redirectTo = sanitizeRedirectPath(formData.get('redirectTo'), '/');
  const session = await getActiveSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  if (parsed.data.website) {
    redirect('/');
  }

  const supabase = tryGetSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        lead_type: parsed.data.leadType,
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        product_id: parsed.data.productId || null,
        product_slug: parsed.data.productSlug || null,
        status: 'new',
      })
      .select('*')
      .single();

    if (error) throw error;

    void writeAuditLog({
      actor: session?.email || parsed.data.email,
      action: 'create',
      tableName: 'leads',
      rowId: data.id,
      after: data,
    });
  } else {
    void writeAuditLog({
      actor: session?.email || parsed.data.email,
      action: 'create',
      tableName: 'leads',
      after: {
        lead_type: parsed.data.leadType,
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        product_id: parsed.data.productId || null,
        product_slug: parsed.data.productSlug || null,
        status: 'new',
        note: 'Lead storage skipped because Supabase admin client is not configured.',
      },
    });
  }

  void maybeSendNotificationEmail(
    `New ${parsed.data.leadType} lead from ${parsed.data.name}`,
    buildLeadEmailHtml({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || '',
      phone: parsed.data.phone || '',
      message: parsed.data.message,
    }),
  );

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath('/admin');
  redirect(redirectTo);
}
