import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser, getCourseAccess } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourse, getContents } from '@/lib/queries';
import { markDone, addComment } from '@/lib/actions/learning';
import { toInt, pct, fmtDateTime } from '@/lib/format';
import { coverFor } from '@/lib/theme';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { btn, btnGhost, card, input } from '@/components/ui';

export default async function LearnPage({ params, searchParams }) {
  const user = await requireUser();
  const courseId = toInt(params.courseId);
  const course = await getCourse(courseId, user.id);
  if (!course) notFound();
  const access = await getCourseAccess(user, courseId);
  if (!access.ok) redirect(`/courses/${courseId}`);

  const contents = await getContents(courseId);
  const done = new Set();
  if (access.enrollmentId) {
    const { rows } = await query('SELECT content_id FROM content_progress WHERE enrollment_id = $1', [access.enrollmentId]);
    rows.forEach((r) => done.add(r.content_id));
  }
  // Tanpa ?c= langsung ke materi pertama yang belum selesai
  const requested = contents.findIndex((c) => c.id === toInt(searchParams.c));
  const firstTodo = contents.findIndex((c) => !done.has(c.id));
  const idx = requested >= 0 ? requested : Math.max(0, firstTodo);
  const current = contents[idx];
  const prev = contents[idx - 1];
  const next = contents[idx + 1];
  const progress = pct(done.size, contents.length);

  let comments = [];
  if (current) {
    comments = (await query(
      `SELECT cm.id, cm.body, cm.created_at, u.id AS user_id, u.username, u.role,
              EXTRACT(EPOCH FROM u.avatar_updated_at)::bigint AS v
         FROM comments cm JOIN users u ON u.id = cm.user_id
        WHERE cm.content_id = $1 ORDER BY cm.created_at DESC`, [current.id])).rows;
  }

  return (
    <div className="space-y-6">
      <header className={`relative overflow-hidden rounded-2xl ${coverFor(course.category_id)} pattern-dots p-6 text-white`}>
        <Link href={`/courses/${courseId}`} className="text-xs font-semibold text-white/80 hover:underline">← Detail course</Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{course.name}</h1>
        {!access.preview && (
          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex justify-between text-xs font-bold"><span>{done.size}/{contents.length} materi selesai</span><span>{progress}%</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-amber transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
      </header>

      {!access.preview && contents.length > 0 && progress === 100 && (
        <p role="status" className="flex items-center gap-3 rounded-xl border border-teal bg-teal-soft p-4 text-sm font-semibold text-teal-dark"><Icon name="check" className="h-5 w-5" /> Selamat! Anda sudah menyelesaikan semua materi di course ini.</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
        <aside className={`${card} h-fit p-4 lg:sticky lg:top-24`}>
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">Daftar materi</p>
          <ol className="space-y-1">
            {contents.map((c, i) => (
              <li key={c.id}>
                <Link href={`/learn/${courseId}?c=${c.id}`} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${i === idx ? 'bg-teal-soft font-semibold text-teal-dark' : 'hover:bg-mist'}`}>
                  <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done.has(c.id) ? 'bg-teal text-white' : 'border border-line bg-white'}`}>{done.has(c.id) ? '✓' : c.order_index}</span>
                  <span>{c.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        <section className="space-y-6">
          {!current ? (
            <p className={`${card} p-10 text-center text-slate-500`}>Pengajar belum menambahkan materi untuk course ini.</p>
          ) : (
            <>
              <article className={`${card} p-6 sm:p-8`}>
                {access.preview && <p className="mb-4 rounded-lg bg-amber-soft px-3 py-2 text-xs font-semibold">Mode pratinjau — progres hanya tercatat untuk siswa.</p>}
                <p className="text-sm font-bold text-teal">Materi {idx + 1} dari {contents.length}</p>
                <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">{current.title}</h2>
                <div className="mt-5 max-w-prose whitespace-pre-line text-base leading-8 text-slate-700">{current.body}</div>
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                  {prev && <Link href={`/learn/${courseId}?c=${prev.id}`} className={btnGhost}>← Sebelumnya</Link>}
                  {!access.preview && (done.has(current.id)
                    ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-soft px-4 py-2.5 text-sm font-semibold text-teal-dark"><Icon name="check" className="h-4 w-4" /> Sudah selesai</span>
                    : <form action={markDone}><input type="hidden" name="course_id" value={courseId} /><input type="hidden" name="content_id" value={current.id} /><button className={btn}>Mark as done</button></form>)}
                  <span className="flex-1" />
                  {next
                    ? <Link href={`/learn/${courseId}?c=${next.id}`} className={btn}>Lanjutkan <Icon name="arrow" className="h-4 w-4" /></Link>
                    : <Link href="/profile" className={btnGhost}>Selesai — lihat progres</Link>}
                </div>
              </article>

              <section className={`${card} p-6`}>
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Icon name="chat" className="h-5 w-5 text-teal" /> Diskusi ({comments.length})</h3>
                <ActionForm action={addComment} className="my-4 space-y-2">
                  <input type="hidden" name="course_id" value={courseId} />
                  <input type="hidden" name="content_id" value={current.id} />
                  <textarea name="body" rows={3} maxLength={1000} required placeholder="Tulis pertanyaan atau tanggapan…" aria-label="Komentar" className={input} />
                  <SubmitButton>Kirim komentar</SubmitButton>
                </ActionForm>
                {comments.length ? (
                  <ul className="space-y-3">
                    {comments.map((cm) => (
                      <li key={cm.id} className="flex gap-3 rounded-xl bg-mist p-4 text-sm">
                        <Avatar id={cm.user_id} name={cm.username} v={cm.v} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink">{cm.username}{cm.role !== 'student' && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-xs font-semibold text-white">{cm.role}</span>}
                            <span className="ml-2 text-xs font-normal text-slate-500">{fmtDateTime(cm.created_at)}</span></p>
                          <p className="mt-1 whitespace-pre-line">{cm.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">Belum ada komentar. Jadilah yang pertama bertanya.</p>}
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
