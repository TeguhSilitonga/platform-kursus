import { query } from './db';

export async function getCategories() {
  const { rows } = await query(
    `SELECT cat.id, cat.name, COUNT(c.id)::int AS courses
       FROM categories cat LEFT JOIN courses c ON c.category_id = cat.id
      GROUP BY cat.id ORDER BY cat.name`
  );
  return rows;
}

// Satu query untuk katalog, home, detail, dan halaman kelola.
// sort hanya boleh dari whitelist (bukan input mentah) agar bebas SQL injection.
const SORTS = { popular: 'students DESC, c.created_at DESC', newest: 'c.created_at DESC' };

export async function listCourses({ q = null, categoryId = null, userId = null, limit = null, courseId = null, teacherId = null, sort = 'newest' } = {}) {
  const { rows } = await query(
    `SELECT c.id, c.name, c.description, c.category_id, c.teacher_id,
            to_char(c.start_date, 'YYYY-MM-DD') AS start_date,
            to_char(c.end_date,   'YYYY-MM-DD') AS end_date,
            cat.name AS category, u.username AS teacher, u.email AS teacher_email,
            EXTRACT(EPOCH FROM u.avatar_updated_at)::bigint AS teacher_avatar,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id)::int AS students,
            (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total_contents,
            ARRAY(SELECT ct.title FROM contents ct WHERE ct.course_id = c.id ORDER BY ct.order_index LIMIT 5)::text[] AS topics,
            me.id AS enrollment_id,
            (SELECT COUNT(*) FROM content_progress cp WHERE cp.enrollment_id = me.id)::int AS done
       FROM courses c
       JOIN categories cat ON cat.id = c.category_id
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN enrollments me ON me.course_id = c.id AND me.user_id = $3::int
      WHERE ($1::text IS NULL OR c.name ILIKE '%' || $1 || '%' OR c.description ILIKE '%' || $1 || '%')
        AND ($2::int IS NULL OR c.category_id = $2)
        AND ($5::int IS NULL OR c.id = $5)
        AND ($6::int IS NULL OR c.teacher_id = $6)
      ORDER BY ${SORTS[sort] ?? SORTS.newest}
      LIMIT $4::int`,
    [q, categoryId, userId, limit, courseId, teacherId]
  );
  return rows;
}

export async function getCourse(id, userId) {
  if (!Number.isInteger(id)) return null;
  return (await listCourses({ courseId: id, userId }))[0] ?? null;
}

export async function getContents(courseId) {
  const { rows } = await query(
    'SELECT id, course_id, title, body, order_index FROM contents WHERE course_id = $1 ORDER BY order_index',
    [courseId]
  );
  return rows;
}

export async function getStats() {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM courses)::int AS courses,
            (SELECT COUNT(*) FROM users WHERE role = 'student')::int AS students,
            (SELECT COUNT(*) FROM users WHERE role = 'teacher')::int AS teachers,
            (SELECT COUNT(*) FROM contents)::int AS contents,
            (SELECT COUNT(*) FROM users WHERE teacher_status = 'pending')::int AS pending`
  );
  return rows[0];
}

// Siswa yang tergabung di course (tanpa kolom avatar mentah; hanya versi untuk cache-busting)
export async function getCourseStudents(courseId, limit = 24) {
  const { rows } = await query(
    `SELECT u.id, u.username, EXTRACT(EPOCH FROM u.avatar_updated_at)::bigint AS v
       FROM enrollments e JOIN users u ON u.id = e.user_id
      WHERE e.course_id = $1 ORDER BY e.enrolled_at LIMIT $2`,
    [courseId, limit]
  );
  return rows;
}

export async function getTeachers(limit = 6) {
  const { rows } = await query(
    `SELECT u.id, u.username, EXTRACT(EPOCH FROM u.avatar_updated_at)::bigint AS v,
            COUNT(c.id)::int AS courses
       FROM users u LEFT JOIN courses c ON c.teacher_id = u.id
      WHERE u.role = 'teacher'
      GROUP BY u.id ORDER BY courses DESC, u.username LIMIT $1`,
    [limit]
  );
  return rows;
}
