import { randomUUID } from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sanitizeFilename } from '@/lib/utils';

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export async function uploadOptionalFile(file: FormDataEntryValue | null, folder: string) {
  if (!(file instanceof File) || file.size === 0) return '';

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image uploads are allowed.');
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('Upload is too large. Maximum size is 8 MB.');
  }

  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'assets';
  const sanitized = sanitizeFilename(file.name);
  const ext = sanitized.includes('.') ? sanitized.split('.').pop() || 'bin' : 'bin';
  const path = `${folder}/${randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, Buffer.from(arrayBuffer), {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
