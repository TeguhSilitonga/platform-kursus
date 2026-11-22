'use server';
import { redirect } from 'next/navigation';
import { query } from '../db';
import { requireUser } from '../auth';
import { toInt } from '../format';

const STAFF = ['admin', 'teacher'];

// Admin boleh semua course; guru hanya miliknya
async function ownsCourse(user, courseId) {
  if (user.role === 'admin') return (await query('SELECT 1 FROM courses WHERE id = $1', [courseId])).rows.length > 0;
  return (await query('SELECT 1 FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, user.id])).rows.length > 0;
}

export async function saveCourse(prev, formData) {
  const user = await requireUser(STAFF);
  const id = toInt(formData.get('id'));
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const categoryId = toInt(formData.get('category_id'));
  const start = String(formData.get('start_date') ?? '') || null;
  const end = String(formData.get('end_date') ?? '') || null;
  // Guru: nama teacher otomatis dirinya; admin memilih
  const teacherId = user.role === 'admin' ? toInt(formData.get('teacher_id')) : user.id;

  if (!name || name.length > 120) return { error: 'Nama course wajib diisi (maks. 120 karakter).' };
  if (!description) return { error: 'Deskripsi wajib diisi.' };
  if (!categoryId) return { error: 'Pilih kategori.' };
  if (!teacherId) return { error: 'Pilih teacher.' };
  if (start && end && end < start) return { error: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' };

  const cat = await query('SELECT 1 FROM categories WHERE id = $1', [categoryId]);
  if (!cat.rows.length) return { error: 'Kategori tidak valid.' };
  const t = await query(`SELECT 1 FROM users WHERE id = $1 AND role IN ('teacher','admin')`, [teacherId]);
  if (!t.rows.length) return { error: 'Teacher tidak valid.' };

  if (id) {
    if (!(await ownsCourse(user, id))) return { error: 'Anda tidak berhak mengubah course ini.' };
    await query(
      `UPDATE courses SET name=$1, description=$2, category_id=$3, teacher_id=$4, start_date=$5, end_date=$6 WHERE id=$7`,
      [name, description, categoryId, teacherId, start, end, id]
    );
  } else {
    await query(
      `INSERT INTO courses (name, description, category_id, teacher_id, start_date, end_date) VALUES ($1,$2,$3,$4,$5,$6)`,
      [name, description, categoryId, teacherId, start, end]
    );
  }
  redirect('/manage/courses');
}

export async function deleteCourse(formData) {
  const user = await requireUser(STAFF);
  const id = toInt(formData.get('id'));
  if (await ownsCourse(user, id)) await query('DELETE FROM courses WHERE id = $1', [id]);
  redirect('/manage/courses');
}

export async function saveContent(prev, formData) {
  const user = await requireUser(STAFF);
  const id = toInt(formData.get('id'));
  const courseId = toInt(formData.get('course_id'));
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const order = toInt(formData.get('order_index'));

  if (!(await ownsCourse(user, courseId))) return { error: 'Anda tidak berhak mengelola materi course ini.' };
  if (!title || title.length > 150) return { error: 'Judul materi wajib diisi (maks. 150 karakter).' };
  if (!body) return { error: 'Isi materi wajib diisi.' };
  if (!order || order < 1) return { error: 'Urutan harus bilangan bulat ≥ 1.' };

  try {
    if (id) {
      const r = await query('UPDATE contents SET title=$1, body=$2, order_index=$3 WHERE id=$4 AND course_id=$5', [title, body, order, id, courseId]);
      if (!r.rowCount) return { error: 'Materi tidak ditemukan.' };
    } else {
      await query('INSERT INTO contents (course_id, title, body, order_index) VALUES ($1,$2,$3,$4)', [courseId, title, body, order]);
    }
  } catch (e) {
    if (e.code === '23505') return { error: `Urutan ${order} sudah dipakai materi lain di course ini.` };
    throw e;
  }
  redirect(`/manage/courses/${courseId}/contents`);
}

export async function deleteContent(formData) {
  const user = await requireUser(STAFF);
  const id = toInt(formData.get('id'));
  const courseId = toInt(formData.get('course_id'));
  if (await ownsCourse(user, courseId)) await query('DELETE FROM contents WHERE id = $1 AND course_id = $2', [id, courseId]);
  redirect(`/manage/courses/${courseId}/contents`);
}
