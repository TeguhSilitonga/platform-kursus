import Link from 'next/link';
import { enroll } from '@/lib/actions/learning';
import { pct } from '@/lib/format';
import { btn, btnGhost } from './ui';
import Icon from './Icon';

// Progress + tombol aksi yang menyesuaikan status user (guest / student / sudah mengikuti)
export default function CourseAction({ course: c, user, variant = 'panel' }) {
  const ended = c.end_date && c.end_date < new Date().toISOString().slice(0, 10);
  const progress = pct(c.done, c.total_contents);
  if (variant === 'bar') {
    const bar = 'flex w-full items-center justify-center gap-2 px-5 py-4 text-sm font-extrabold uppercase tracking-wide text-white transition';
    const grad = `${bar} bg-gradient-to-r from-teal-dark to-ink hover:brightness-125`;
    if (c.enrollment_id) {
      return (
        <Link href={`/learn/${c.id}`} className={`${bar} justify-between bg-ink hover:bg-teal-dark`}>
          <span className="flex items-center gap-3 normal-case">
            <span className="text-xs font-bold">Progress {progress}%</span>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/25"><span className="block h-full rounded-full bg-amber" style={{ width: `${progress}%` }} /></span>
          </span>
          <span className="flex items-center gap-1.5">Lanjutkan belajar <Icon name="arrow" className="h-4 w-4" /></span>
        </Link>
      );
    }
    if (user?.role === 'student') {
      return ended ? <div className={`${bar} bg-slate-400`}>Course sudah berakhir</div> : (
        <form action={enroll} className="w-full"><input type="hidden" name="course_id" value={c.id} /><button className={grad}>Ikuti course <Icon name="arrow" className="h-4 w-4" /></button></form>
      );
    }
    if (!user) return <Link href={`/login?next=/courses/${c.id}`} className={grad}>Masuk untuk mengikuti</Link>;
    return <Link href={`/courses/${c.id}`} className={grad}>Lihat detail</Link>;
  }

  return (
    <>
      {c.enrollment_id && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-bold text-ink"><span>Progress belajar</span><span>{progress}%</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-amber to-teal transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {c.enrollment_id ? (
          <Link href={`/learn/${c.id}`} className={btn}>Lanjutkan belajar <Icon name="arrow" className="h-4 w-4" /></Link>
        ) : user?.role === 'student' ? (
          ended ? <span className="text-sm font-semibold text-slate-500">Course sudah berakhir</span> : (
            <form action={enroll}><input type="hidden" name="course_id" value={c.id} /><button className={btn}>Ikuti course <Icon name="arrow" className="h-4 w-4" /></button></form>
          )
        ) : !user ? (
          <Link href={`/login?next=/courses/${c.id}`} className={btn}>Masuk untuk mengikuti</Link>
        ) : (
          <Link href={`/courses/${c.id}`} className={btn}>Lihat detail</Link>
        )}
        <a href={`mailto:${c.teacher_email}?subject=${encodeURIComponent('Tanya course: ' + c.name)}`} className={btnGhost}><Icon name="mail" className="h-4 w-4" /> Hubungi teacher</a>
      </div>
    </>
  );
}
