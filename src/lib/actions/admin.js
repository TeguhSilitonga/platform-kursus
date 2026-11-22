'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { query } from '../db';
import { requireUser } from '../auth';
import { toInt } from '../format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'teacher', 'student'];

export async function saveUser(prev, formData) {
  const admin = await requireUser(['admin']);
  const id = toInt(formData.get('id'));
  const username = String(formData.get('username') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? '');

  if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(username)) return { error: 'Username 3–30 karakter (huruf, angka, . atau _).' };
  if (!EMAIL_RE.test(email)) return { error: 'Format email tidak valid.' };
  if (!ROLES.includes(role)) return { error: 'Role tidak valid.' };
  if (!id && password.length < 8) return { error: 'Password minimal 8 karakter.' };
  if (id && password && password.length < 8) return { error: 'Password baru minimal 8 karakter.' };
  if (id === admin.id && role !== 'admin') return { error: 'Anda tidak bisa menurunkan role akun sendiri.' };

  const dup = await query('SELECT 1 FROM users WHERE (email = $1 OR LOWER(username) = LOWER($2)) AND id IS DISTINCT FROM $3::int', [email, username, id]);
  if (dup.rows.length) return { error: 'Username atau email sudah dipakai.' };

  const status = role === 'teacher' ? 'approved' : 'none';
  if (id) {
    const hash = password ? await bcrypt.hash(password, 10) : null;
    await query(
      `UPDATE users SET username=$1, email=$2, role=$3,
              teacher_status = CASE WHEN $3 = 'teacher' THEN 'approved' WHEN $3 <> role OR teacher_status = 'approved' THEN 'none' ELSE teacher_status END,
              approved_at = CASE WHEN $3 = 'teacher' AND role <> 'teacher' THEN NOW() ELSE approved_at END,
              password = COALESCE($4, password)
        WHERE id=$5`,
      [username, email, role, hash, id]
    );
  } else {
    const hash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (username, email, password, role, teacher_status, approved_at)
       VALUES ($1,$2,$3,$4,$5, CASE WHEN $4 = 'teacher' THEN NOW() END)`,
      [username, email, hash, role, status]
    );
  }
  redirect('/admin/users');
}

export async function deleteUser(formData) {
  const admin = await requireUser(['admin']);
  const id = toInt(formData.get('id'));
  if (id && id !== admin.id) await query('DELETE FROM users WHERE id = $1', [id]);
  redirect('/admin/users');
}

// Verifikasi Teacher: role -> teacher, catat approved_at
export async function approveTeacher(formData) {
  await requireUser(['admin']);
  const id = toInt(formData.get('id'));
  await query(
    `UPDATE users SET role = 'teacher', teacher_status = 'approved', approved_at = NOW()
      WHERE id = $1 AND teacher_status = 'pending'`,
    [id]
  );
  redirect(formData.get('back') === 'dashboard' ? '/admin' : '/admin/users');
}

export async function saveCategory(prev, formData) {
  await requireUser(['admin']);
  const id = toInt(formData.get('id'));
  const name = String(formData.get('name') ?? '').trim();
  if (!name || name.length > 60) return { error: 'Nama kategori wajib diisi (maks. 60 karakter).' };
  const dup = await query('SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1) AND id IS DISTINCT FROM $2::int', [name, id]);
  if (dup.rows.length) return { error: 'Nama kategori sudah ada.' };
  if (id) await query('UPDATE categories SET name = $1 WHERE id = $2', [name, id]);
  else await query('INSERT INTO categories (name) VALUES ($1)', [name]);
  redirect('/admin/categories');
}

export async function deleteCategory(formData) {
  await requireUser(['admin']);
  const id = toInt(formData.get('id'));
  const used = await query('SELECT COUNT(*)::int AS n FROM courses WHERE category_id = $1', [id]);
  if (used.rows[0].n > 0) redirect('/admin/categories?error=Kategori masih dipakai oleh course, tidak bisa dihapus');
  await query('DELETE FROM categories WHERE id = $1', [id]);
  redirect('/admin/categories');
}
