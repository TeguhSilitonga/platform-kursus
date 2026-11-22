import { query } from '@/lib/db';
import { getStats } from '@/lib/queries';
import { approveTeacher } from '@/lib/actions/admin';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { card, btn } from '@/components/ui';

export default async function AdminHome() {
  const [stats, pending] = await Promise.all([
    getStats(),
    query(`SELECT id, username, email, EXTRACT(EPOCH FROM avatar_updated_at)::bigint AS v FROM users WHERE teacher_status = 'pending' ORDER BY created_at`),
  ]);
  const items = [
    ['layers', 'Course', stats.courses, 'bg-teal-soft text-teal'],
    ['book', 'Materi', stats.contents, 'bg-amber-soft text-amber'],
    ['cap', 'Teacher', stats.teachers, 'bg-violet-100 text-violet-700'],
    ['users', 'Student', stats.students, 'bg-sky-100 text-sky-700'],
  ];
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-ink">Dashboard admin</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map(([icon, k, v, tone]) => (
          <div key={k} className={`${card} p-5 transition hover:-translate-y-0.5 hover:shadow-lift`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon name={icon} /></span>
            <p className="mt-4 text-sm text-slate-500">{k}</p><p className="font-display text-4xl font-extrabold text-ink">{v}</p>
          </div>
        ))}
      </div>
      <section className={`${card} p-6`}>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink"><Icon name="shield" className="h-5 w-5 text-teal" /> Verifikasi teacher ({pending.rows.length})</h2>
        {pending.rows.length ? (
          <ul className="divide-y divide-line">
            {pending.rows.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3"><Avatar id={u.id} name={u.username} v={u.v} size="md" /><div><p className="font-semibold">{u.username}</p><p className="text-sm text-slate-500">{u.email}</p></div></div>
                <form action={approveTeacher}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value="dashboard" /><button className={btn}>Approve</button></form>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">Tidak ada pendaftar teacher yang menunggu.</p>}
      </section>
    </>
  );
}
