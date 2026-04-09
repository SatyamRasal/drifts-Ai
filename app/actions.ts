'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { leadSchema } from '@/lib/validators';
import { tryGetSupabaseAdminClient } from '@/lib/supabase';
import { buildLeadEmailHtml, maybeSendNotificationEmail } from '@/lib/mailer';
import { writeAuditLog } from '@/lib/audit';
import { sanitizeRedirectPath } from '@/lib/utils';



export async function createLead(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
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
      actor: parsed.data.email,
      action: 'create',
      tableName: 'leads',
      rowId: data.id,
      after: data,
    });
  } else {
    void writeAuditLog({
      actor: parsed.data.email,
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

  const redirectTo = sanitizeRedirectPath(formData.get('redirectTo'), '/');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/upcoming');
  revalidatePath('/admin');
  redirect(redirectTo);
}
