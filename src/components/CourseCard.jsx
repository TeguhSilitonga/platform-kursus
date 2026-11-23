import Link from 'next/link';
import { periodLabel } from '@/lib/format';
import { coverFor } from '@/lib/theme';
import Icon from './Icon';
import CourseAction from './CourseAction';

// Kartu bergaya poster: foto pengajar besar di kiri, judul besar, daftar materi, CTA penuh di bawah.
export default function CourseCard({ course: c, user, rank, wide = false, className = '' }) {
  const topics = c.topics ?? [];
  const more = c.total_contents - topics.length;
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-white via-sky-50 to-teal-soft shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift ${className}`}>
      <div className={`grid flex-1 ${wide ? 'sm:grid-cols-[32%_1fr]' : 'sm:grid-cols-[42%_1fr]'}`}>
        {/* Kolom foto */}
        <div className="relative min-h-[18rem] overflow-hidden sm:min-h-[24rem]">
          {c.teacher_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/avatar/${c.teacher_id}?v=${c.teacher_avatar}`} alt={`Foto pengajar ${c.teacher}`} loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${coverFor(c.category_id)}`}>
              <span aria-hidden className="font-display text-7xl font-extrabold text-white/90">{c.teacher.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-display text-sm font-extrabold text-teal shadow-sm">Kelas<span className="text-ink">Kita</span></span>
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 shadow-lift backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Diajar oleh pakar</p>
            <p className="font-display font-bold text-ink">{c.teacher}</p>
            <a href={`mailto:${c.teacher_email}?subject=${encodeURIComponent('Tanya course: ' + c.name)}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline">
              <Icon name="mail" className="h-3.5 w-3.5" /> Hubungi teacher
            </a>
          </div>
        </div>

        {/* Kolom isi */}
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap justify-end gap-1.5 text-xs font-bold">
            {rank ? <span className="rounded-full bg-amber px-2.5 py-1 font-extrabold text-ink">★ #{rank} populer</span>
              : c.enrollment_id ? <span className="rounded-full bg-amber px-2.5 py-1 font-extrabold text-ink">Terdaftar</span> : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-teal px-2.5 py-1 text-white"><Icon name="users" className="h-3 w-3" />{c.students} Siswa</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-600">{c.category}</p>
          <h3 className="line-clamp-3 font-display text-2xl font-extrabold uppercase leading-[1.05] text-teal sm:text-3xl">
            <Link href={`/courses/${c.id}`} className="hover:text-teal-dark">{c.name}</Link>
          </h3>

          {topics.length ? (
            <>
              <p className="mt-4 inline-block self-start rounded-md bg-amber px-3 py-1.5 text-sm font-extrabold text-ink shadow-sm">{c.total_contents} Materi Online &amp; Praktik tentang:</p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                {topics.map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />{t}</li>)}
                {more > 0 && <li className="pl-3.5 text-slate-500">+ {more} materi lainnya</li>}
              </ul>
            </>
          ) : (
            <p className="mt-4 line-clamp-4 text-sm text-slate-600">{c.description}</p>
          )}
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-slate-500"><Icon name="clock" className="h-3.5 w-3.5" />{periodLabel(c.start_date, c.end_date)}</p>
        </div>
      </div>
      <CourseAction course={c} user={user} variant="bar" />
    </article>
  );
}
