import type { SupabaseClient } from '@supabase/supabase-js';

export async function uploadFile(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(
  supabase: SupabaseClient,
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getStoragePath(tenantId: string, folder: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg';
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return `${tenantId}/${folder}/${uniqueName}`;
}
