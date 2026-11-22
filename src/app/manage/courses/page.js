import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { listCourses } from '@/lib/queries';
import { deleteCourse } from '@/lib/actions/manage';
import { periodLabel } from '@/lib/format';
import ConfirmButton from '@/components/ConfirmButton';
import { btn, btnGhost, card, th, td } from '@/components/ui';

export default async function ManageCourses() {
  const user = await requireUser(['admin', 'teacher']);
  const courses = await listCourses({ teacherId: user.role === 'teacher' ? user.id : null });
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Kelola course</h1>
        <Link href="/manage/courses/new" className={btn}>Tambah course</Link>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[40rem]">
          <thead className="border-b border-line bg-mist"><tr><th className={th}>Course</th><th className={th}>Kategori</th><th className={th}>Teacher</th><th className={th}>Periode</th><th className={th}>Materi</th><th className={th}>Aksi</th></tr></thead>
          <tbody className="divide-y divide-line">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className={`${td} font-semibold`}>{c.name}</td>
                <td className={td}>{c.category}</td>
                <td className={td}>{c.teacher}</td>
                <td className={td}>{periodLabel(c.start_date, c.end_date)}</td>
                <td className={td}>{c.total_contents}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/manage/courses/${c.id}/contents`} className={btnGhost}>Materi</Link>
                    <Link href={`/manage/courses/${c.id}/edit`} className={btnGhost}>Edit</Link>
                    <ConfirmButton action={deleteCourse} fields={{ id: c.id }} message={`Hapus course "${c.name}" beserta semua materi dan data siswa?`} />
                  </div>
                </td>
              </tr>
            ))}
            {!courses.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">Belum ada course. Klik "Tambah course".</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
