import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getCourse, getContents, getCourseStudents } from '@/lib/queries';
import { toInt, periodLabel } from '@/lib/format';
import { coverFor } from '@/lib/theme';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import CourseAction from '@/components/CourseAction';
import { card } from '@/components/ui';

export default async function CourseDetail({ params }) {
  const user = await getUser();
  const course = await getCourse(toInt(params.id), user?.id);
  if (!course) notFound();
  const [contents, students] = await Promise.all([getContents(course.id), user ? getCourseStudents(course.id) : []]);
  const pill = 'inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur';

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden rounded-3xl ${coverFor(course.category_id)} pattern-dots animate-fade-up p-7 text-white sm:p-12`}>
        <nav aria-label="Breadcrumb" className="text-sm text-white/80"><Link href="/courses" className="hover:underline">Katalog</Link> / {course.category}</nav>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">{course.name}</h1>
        <div className="mt-6 flex flex-wrap gap-2.5 text-sm font-semibold">
          <span className={pill}><Icon name="layers" className="h-4 w-4" />{course.total_contents} materi</span>
          <span className={pill}><Icon name="users" className="h-4 w-4" />{course.students} siswa</span>
          <span className={pill}><Icon name="clock" className="h-4 w-4" />{periodLabel(course.start_date, course.end_date)}</span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Avatar id={course.teacher_id} name={course.teacher} v={course.teacher_avatar} size="md" className="ring-2 ring-white/70" />
          <div><p className="text-xs text-white/70">Pengajar</p><p className="font-display text-lg font-bold">{course.teacher}</p></div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className={`${card} p-6`}>
            <h2 className="font-display text-xl font-bold text-ink">Tentang course</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{course.description}</p>
          </section>

          <section className={`${card} p-6`}>
            <h2 className="font-display text-xl font-bold text-ink">Daftar materi</h2>
            {contents.length ? (
              <ol className="mt-4 space-y-2">
                {contents.map((ct) => (
                  <li key={ct.id} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm transition hover:bg-mist">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-xs font-extrabold text-teal-dark">{ct.order_index}</span>
                    <span className="font-semibold text-ink">{ct.title}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm text-slate-500">Materi belum ditambahkan pengajar.</p>}
          </section>

          <section className={`${card} p-6`}>
            <h2 className="font-display text-xl font-bold text-ink">Siswa yang bergabung ({course.students})</h2>
            {!user ? (
              <p className="mt-2 text-sm text-slate-500">Masuk untuk melihat siswa yang bergabung.</p>
            ) : students.length ? (
              <ul className="mt-4 flex flex-wrap gap-3">
                {students.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3.5 text-sm">
                    <Avatar id={s.id} name={s.username} v={s.v} size="sm" />{s.username}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-slate-500">Belum ada siswa. Jadilah yang pertama.</p>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={`${card} p-6`}>
            <p className="font-display text-lg font-bold text-ink">Mulai belajar</p>
            <p className="text-sm text-slate-600">{course.total_contents} materi · diskusi di setiap materi</p>
            <CourseAction course={course} user={user} />
          </div>
        </aside>
      </div>
    </div>
  );
}
