'use server';
import { revalidatePath } from 'next/cache';
import { query } from '../db';
import { requireUser } from '../auth';

const MAX_BYTES = 2 * 1024 * 1024;

// Tipe ditentukan dari isi file (magic bytes), bukan dari nama/ekstensi yang bisa dipalsukan
function sniffType(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (b.length > 12 && b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

export async function uploadAvatar(prev, formData) {
  const user = await requireUser();
  const file = formData.get('avatar');
  if (!file || typeof file === 'string' || file.size === 0) return { error: 'Pilih file foto terlebih dahulu.' };
  if (file.size > MAX_BYTES) return { error: 'Ukuran foto maksimal 2 MB.' };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniffType(buf);
  if (!type) return { error: 'Format foto harus JPG, PNG, atau WebP.' };
  await query('UPDATE users SET avatar = $1, avatar_type = $2, avatar_updated_at = NOW() WHERE id = $3', [buf, type, user.id]);
  revalidatePath('/', 'layout');
  return { message: 'Foto profil berhasil diperbarui.' };
}

export async function removeAvatar() {
  const user = await requireUser();
  await query('UPDATE users SET avatar = NULL, avatar_type = NULL, avatar_updated_at = NULL WHERE id = $1', [user.id]);
  revalidatePath('/', 'layout');
}
