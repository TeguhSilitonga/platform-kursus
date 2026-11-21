'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { query } from '../db';
import { createSession, destroySession } from '../auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(prev, formData) {
  const as = formData.get('as') === 'teacher' ? 'teacher' : 'student';
  const username = String(formData.get('username') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (username.length < 3 || username.length > 30) return { error: 'Username harus 3–30 karakter.' };
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return { error: 'Username hanya boleh huruf, angka, titik, dan underscore.' };
  if (!EMAIL_RE.test(email)) return { error: 'Format email tidak valid.' };
  if (password.length < 8) return { error: 'Password minimal 8 karakter.' };
  if (password !== confirm) return { error: 'Konfirmasi password tidak cocok.' };

  const dup = await query('SELECT 1 FROM users WHERE email = $1 OR LOWER(username) = LOWER($2)', [email, username]);
  if (dup.rows.length) return { error: 'Username atau email sudah terdaftar.' };

  const hash = await bcrypt.hash(password, 10);
  // Semua pendaftar masuk sebagai student; pendaftar guru berstatus "pending"
  const { rows } = await query(
    `INSERT INTO users (username, email, password, role, teacher_status)
     VALUES ($1, $2, $3, 'student', $4) RETURNING id, role`,
    [username, email, hash, as === 'teacher' ? 'pending' : 'none']
  );
  await createSession(rows[0]);
  redirect('/profile');
}

export async function login(prev, formData) {
  const identity = String(formData.get('identity') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');
  if (!identity || !password) return { error: 'Email/username dan password wajib diisi.' };

  const { rows } = await query(
    'SELECT id, role, password FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)',
    [identity]
  );
  const user = rows[0];
  // Pesan sengaja sama agar tidak membocorkan akun mana yang ada
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) return { error: 'Email/username atau password salah.' };

  await createSession(user);
  // Cegah open redirect: hanya path internal
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : null;
  redirect(safeNext ?? (user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/manage/courses' : '/courses'));
}

export async function logout() {
  destroySession();
  redirect('/');
}
