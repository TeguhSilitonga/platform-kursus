import { getUser } from '@/lib/auth';
import { getCategories, listCourses } from '@/lib/queries';
import { toInt } from '@/lib/format';
import CourseCard from '@/components/CourseCard';
import SearchBar from '@/components/SearchBar';

export const metadata = { title: 'Katalog Course — KelasKita' };

export default async function Catalog({ searchParams }) {
  const user = await getUser();
  const q = (searchParams.q ?? '').trim() || null;
  const category = toInt(searchParams.category);
  const [categories, courses] = await Promise.all([getCategories(), listCourses({ q, categoryId: category, userId: user?.id })]);
  return (
    <div className="space-y-7">
      <header className="animate-fade-up">
        <h1 className="font-display text-4xl font-extrabold text-ink">Katalog course</h1>
        <p className="mt-1 text-slate-600">{courses.length} course tersedia{q || category ? ' sesuai pencarian Anda' : ''}.</p>
      </header>
      {searchParams.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{searchParams.error}</p>}
      <div className="rounded-2xl border border-line bg-white p-3 shadow-soft"><SearchBar action="/courses" categories={categories} q={q} category={category} /></div>
      {courses.length ? (
        <div className="grid gap-6 md:grid-cols-2">{courses.map((c) => <CourseCard key={c.id} course={c} user={user} />)}</div>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-slate-500">Belum ada course yang cocok dengan pencarian Anda.</p>
      )}
    </div>
  );
}
