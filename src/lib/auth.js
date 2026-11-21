import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { query } from './db';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(user) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  cookies().set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true', // set true hanya jika situs dilayani lewat HTTPS
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().delete('session');
}

// User terbaru dari database (role selalu fresh). Di-cache per request.
export const getUser = cache(async () => {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const { rows } = await query(
      `SELECT id, username, email, role, teacher_status, approved_at, created_at,
              EXTRACT(EPOCH FROM avatar_updated_at)::bigint AS avatar_v,
              (approved_at IS NOT NULL AND approved_at > NOW() - INTERVAL '24 hours') AS is_new_teacher
         FROM users WHERE id = $1`,
      [payload.sub]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

export async function requireUser(roles) {
  const user = await getUser();
  if (!user) redirect('/login');
  if (roles && !roles.includes(user.role)) redirect('/');
  return user;
}

// Siswa wajib terdaftar; admin / guru pemilik boleh melihat (preview)
export async function getCourseAccess(user, courseId) {
  if (user.role === 'admin') return { ok: true, preview: true };
  if (user.role === 'teacher') {
    const { rows } = await query('SELECT 1 FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, user.id]);
    if (rows.length) return { ok: true, preview: true };
  }
  const { rows } = await query('SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2', [user.id, courseId]);
  if (rows[0]) return { ok: true, preview: false, enrollmentId: rows[0].id };
  return { ok: false };
}
