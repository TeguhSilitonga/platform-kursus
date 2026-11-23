'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query } from '../db';
import { requireUser, getCourseAccess } from '../auth';
import { toInt } from '../format';

export async function enroll(formData) {
  const user = await requireUser(['student']);
  const courseId = toInt(formData.get('course_id'));
  const { rows } = await query(
    `SELECT id FROM courses WHERE id = $1 AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
    [courseId]
  );
  if (!rows.length) redirect('/courses?error=Course tidak tersedia atau sudah berakhir');
  await query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, courseId]);
  redirect(`/learn/${courseId}`);
}

export async function markDone(formData) {
  const user = await requireUser(['student']);
  const courseId = toInt(formData.get('course_id'));
  const contentId = toInt(formData.get('content_id'));
  const access = await getCourseAccess(user, courseId);
  if (!access.ok || access.preview) redirect('/courses');
  // Pastikan materi memang milik course tsb
  const ok = await query('SELECT 1 FROM contents WHERE id = $1 AND course_id = $2', [contentId, courseId]);
  if (ok.rows.length) {
    await query(
      'INSERT INTO content_progress (enrollment_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [access.enrollmentId, contentId]
    );
  }
  revalidatePath(`/learn/${courseId}`);
}

export async function addComment(prev, formData) {
  const user = await requireUser();
  const courseId = toInt(formData.get('course_id'));
  const contentId = toInt(formData.get('content_id'));
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return { error: 'Komentar tidak boleh kosong.' };
  if (body.length > 1000) return { error: 'Komentar maksimal 1000 karakter.' };
  const access = await getCourseAccess(user, courseId);
  if (!access.ok) return { error: 'Anda tidak punya akses ke course ini.' };
  const ok = await query('SELECT 1 FROM contents WHERE id = $1 AND course_id = $2', [contentId, courseId]);
  if (!ok.rows.length) return { error: 'Materi tidak ditemukan.' };
  await query('INSERT INTO comments (content_id, user_id, body) VALUES ($1, $2, $3)', [contentId, user.id, body]);
  revalidatePath(`/learn/${courseId}`);
  return { ok: Date.now() };
}
