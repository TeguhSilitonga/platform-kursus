import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCategories, getCourse } from '@/lib/queries';
import { toInt } from '@/lib/format';
import CourseForm from '@/components/CourseForm';

export default async function EditCourse({ params }) {
  const user = await requireUser(['admin', 'teacher']);
  const course = await getCourse(toInt(params.id), null);
  if (!course || (user.role === 'teacher' && course.teacher_id !== user.id)) notFound();
  const [categories, t] = await Promise.all([getCategories(), query(`SELECT id, username FROM users WHERE role IN ('teacher','admin') ORDER BY username`)]);
  return (<><h1 className="text-2xl font-extrabold text-ink">Edit course</h1><CourseForm course={course} categories={categories} teachers={t.rows} user={user} /></>);
}
