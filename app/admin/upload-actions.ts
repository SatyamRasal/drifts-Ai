'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/session';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { sanitizeFilename } from '@/lib/utils';



const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export async function uploadSiteAsset(formData: FormData) {
  const session = getAdminSession();
  if (!session) redirect('/admin/login');
  const adminEmail = session.email;
  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'assets';
  const logo = formData.get('asset');
  const favicon = formData.get('favicon');

  const updates: Record<string, string> = {};
  const uploaded: string[] = [];

  async function uploadFile(file: File, prefix: string) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.');
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error('File is too large. Maximum size is 8 MB.');
    }
    const safeName = sanitizeFilename(file.name);
    const ext = safeName.includes('.') ? safeName.split('.').pop() || 'bin' : 'bin';
    const path = `branding/${prefix}-${Date.now()}-${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  const errors: string[] = [];

  if (logo instanceof File && logo.size > 0) {
    try {
      updates.logo_url = await uploadFile(logo, 'logo');
      uploaded.push(updates.logo_url);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Logo upload failed');
      console.error('Logo upload failed:', error);
    }
  }

  if (favicon instanceof File && favicon.size > 0) {
    try {
      updates.favicon_url = await uploadFile(favicon, 'favicon');
      uploaded.push(updates.favicon_url);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Favicon upload failed');
      console.error('Favicon upload failed:', error);
    }
  }

  if (Object.keys(updates).length > 0) {
    const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  }

  void writeAuditLog({ actor: adminEmail, action: 'upload', tableName: 'storage', after: { uploaded, updates, errors } });
  revalidatePath('/admin');
  revalidatePath('/');
}
