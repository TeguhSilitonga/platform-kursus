import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCategories } from '@/lib/queries';
import CourseForm from '@/components/CourseForm';

export default async function NewCourse() {
  const user = await requireUser(['admin', 'teacher']);
  const [categories, t] = await Promise.all([getCategories(), query(`SELECT id, username FROM users WHERE role IN ('teacher','admin') ORDER BY username`)]);
  return (<><h1 className="text-2xl font-extrabold text-ink">Tambah course</h1><CourseForm categories={categories} teachers={t.rows} user={user} /></>);
}
