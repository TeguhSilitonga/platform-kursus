import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getCourse, getContents } from '@/lib/queries';
import { saveContent, deleteContent } from '@/lib/actions/manage';
import { toInt } from '@/lib/format';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import ConfirmButton from '@/components/ConfirmButton';
import { btnGhost, card, input, label } from '@/components/ui';

export default async function ManageContents({ params, searchParams }) {
  const user = await requireUser(['admin', 'teacher']);
  const courseId = toInt(params.id);
  const course = await getCourse(courseId, null);
  if (!course || (user.role === 'teacher' && course.teacher_id !== user.id)) notFound();
  const contents = await getContents(courseId);
  const editing = contents.find((c) => c.id === toInt(searchParams.edit));
  const nextOrder = contents.length ? Math.max(...contents.map((c) => c.order_index)) + 1 : 1;

  return (
    <>
      <div>
        <Link href="/manage/courses" className="text-sm font-semibold text-teal hover:underline">← Kembali</Link>
        <h1 className="text-2xl font-extrabold text-ink">Materi: {course.name}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <ol className="space-y-3">
          {contents.map((c) => (
            <li key={c.id} className={`${card} flex flex-wrap items-start justify-between gap-3 p-4`}>
              <div className="min-w-0 flex-1"><p className="font-bold text-ink"><span className="mr-2 text-teal">{c.order_index}.</span>{c.title}</p><p className="line-clamp-2 text-sm text-slate-600">{c.body}</p></div>
              <div className="flex gap-2">
                <Link href={`/manage/courses/${courseId}/contents?edit=${c.id}`} className={btnGhost}>Edit</Link>
                <ConfirmButton action={deleteContent} fields={{ id: c.id, course_id: courseId }} message={`Hapus materi "${c.title}"?`} />
              </div>
            </li>
          ))}
          {!contents.length && <li className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-slate-500">Belum ada materi. Tambahkan materi pertama di formulir.</li>}
        </ol>
        <aside className={`${card} h-fit p-4`}>
          <h2 className="mb-3 font-bold text-ink">{editing ? 'Edit materi' : 'Tambah materi'}</h2>
          {/* key memaksa form di-reset saat pindah antara tambah/edit */}
          <ActionForm key={editing?.id ?? 'new'} action={saveContent}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <input type="hidden" name="course_id" value={courseId} />
            <div><label htmlFor="title" className={label}>Judul</label><input id="title" name="title" required maxLength={150} defaultValue={editing?.title} className={input} /></div>
            <div><label htmlFor="order_index" className={label}>Urutan</label><input id="order_index" name="order_index" type="number" min={1} required defaultValue={editing?.order_index ?? nextOrder} className={input} /></div>
            <div><label htmlFor="body" className={label}>Isi materi</label><textarea id="body" name="body" rows={8} required defaultValue={editing?.body} className={input} /></div>
            <div className="flex gap-2"><SubmitButton>Simpan materi</SubmitButton>{editing && <Link href={`/manage/courses/${courseId}/contents`} className={btnGhost}>Batal</Link>}</div>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
