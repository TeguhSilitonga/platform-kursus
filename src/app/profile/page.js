import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { listCourses } from '@/lib/queries';
import { pct, periodLabel } from '@/lib/format';
import { coverFor } from '@/lib/theme';
import WelcomeAlert from '@/components/WelcomeAlert';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import { uploadAvatar, removeAvatar } from '@/lib/actions/profile';
import { card, btn, input } from '@/components/ui';

export const metadata = { title: 'Profil — KelasKita' };

export default async function ProfilePage() {
  const user = await requireUser();
  const isTeacher = user.role === 'teacher';
  const mine = await listCourses({ userId: user.id });
  const enrolled = mine.filter((c) => c.enrollment_id);
  let taught = [];

  if (isTeacher) {
    // Rata-rata progress siswa per course (agregasi di SQL)
    const { rows } = await query(
      `SELECT c.id, c.name, c.category_id,
              COUNT(DISTINCT e.id)::int AS students,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total_contents,
              COUNT(cp.id)::int AS total_done
         FROM courses c
         LEFT JOIN enrollments e ON e.course_id = c.id
         LEFT JOIN content_progress cp ON cp.enrollment_id = e.id
        WHERE c.teacher_id = $1
        GROUP BY c.id ORDER BY c.created_at DESC`, [user.id]);
    taught = rows;
  }
  const doneTotal = enrolled.reduce((a, c) => a + c.done, 0);
  const tiles = isTeacher
    ? [['layers', taught.length, 'Course diajar'], ['users', taught.reduce((a, c) => a + c.students, 0), 'Total siswa']]
    : user.role === 'admin' ? [] : [['book', enrolled.length, 'Course diikuti'], ['check', doneTotal, 'Materi selesai']];

  return (
    <div className="space-y-6">
      {user.is_new_teacher && <WelcomeAlert />}

      <section className={`${card} overflow-hidden`}>
        <div className="relative h-28 bg-gradient-to-br from-ink to-teal pattern-dots sm:h-36" />
        <div className="px-6 pb-6">
          <div className="relative z-10 -mt-14 flex flex-wrap items-end gap-5">
            <Avatar id={user.id} name={user.username} v={user.avatar_v} size="lg" className="ring-4 ring-white" />
            <div className="pb-1">
              <h1 className="font-display text-3xl font-extrabold text-ink">{user.username}</h1>
              <p className="text-sm text-slate-600"><span className="capitalize">{user.role}</span> · {user.email}</p>
            </div>
          </div>
          {user.teacher_status === 'pending' && (
            <p className="mt-4 inline-block rounded-lg bg-amber-soft px-3 py-2 text-sm font-semibold text-slate-800">Akun Pengajar Anda sedang menunggu verifikasi Admin.</p>
          )}
          <div className="mt-5 grid gap-5 border-t border-line pt-5 md:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-2 text-sm font-bold text-ink">Foto profil</p>
              <ActionForm action={uploadAvatar} className="flex flex-wrap items-center gap-2">
                <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" aria-label="Pilih foto profil" className={`${input} max-w-xs`} />
                <SubmitButton>Unggah foto</SubmitButton>
              </ActionForm>
              <p className="mt-1.5 text-xs text-slate-500">JPG, PNG, atau WebP, maksimal 2 MB.
                {user.avatar_v && <> · <form action={removeAvatar} className="inline"><button className="font-semibold text-red-700 hover:underline">Hapus foto</button></form></>}
              </p>
            </div>
            {tiles.length > 0 && (
              <dl className="flex gap-3">
                {tiles.map(([icon, v, k]) => (
                  <div key={k} className="min-w-[8rem] rounded-xl bg-mist p-4">
                    <dt className="flex items-center gap-1.5 text-xs text-slate-500"><Icon name={icon} className="h-3.5 w-3.5" />{k}</dt>
                    <dd className="font-display text-3xl font-extrabold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {isTeacher && (
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold text-ink">Course yang saya ajar</h2><Link href="/manage/courses" className="text-sm font-semibold text-teal hover:underline">Kelola</Link></div>
          {taught.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {taught.map((c) => {
                const avg = pct(c.total_done, c.students * c.total_contents);
                return (
                  <div key={c.id} className={`${card} overflow-hidden`}>
                    <div className={`h-2 ${coverFor(c.category_id)}`} />
                    <div className="p-5">
                      <Link href={`/courses/${c.id}`} className="font-display text-lg font-bold text-ink hover:text-teal">{c.name}</Link>
                      <p className="text-xs text-slate-500">{c.students} siswa · {c.total_contents} materi</p>
                      <div className="mb-1.5 mt-4 flex justify-between text-xs font-bold"><span>Rata-rata progress siswa</span><span>{avg}%</span></div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-gradient-to-r from-amber to-teal" style={{ width: `${avg}%` }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-slate-500">Anda belum membuat course.</p>}
        </section>
      )}

      {user.role !== 'admin' && (
        <section>
          <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">Course yang saya ikuti</h2>
          {enrolled.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {enrolled.map((c) => {
                const p = pct(c.done, c.total_contents);
                return (
                  <div key={c.id} className={`${card} overflow-hidden`}>
                    <div className={`h-2 ${coverFor(c.category_id)}`} />
                    <div className="p-5">
                      <p className="font-display text-lg font-bold text-ink">{c.name}</p>
                      <p className="text-xs text-slate-500">{periodLabel(c.start_date, c.end_date)}</p>
                      <div className="mb-1.5 mt-4 flex justify-between text-xs font-bold"><span>{c.done}/{c.total_contents} materi</span><span>{p}%</span></div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-gradient-to-r from-amber to-teal" style={{ width: `${p}%` }} /></div>
                      <Link href={`/learn/${c.id}`} className={`${btn} mt-4`}>Lanjutkan belajar <Icon name="arrow" className="h-4 w-4" /></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-slate-500">Anda belum mengikuti course. <Link href="/courses" className="font-semibold text-teal hover:underline">Jelajahi katalog</Link></p>
          )}
        </section>
      )}
    </div>
  );
}
