import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { approveTeacher, deleteUser } from '@/lib/actions/admin';
import { toInt } from '@/lib/format';
import ConfirmButton from '@/components/ConfirmButton';
import Avatar from '@/components/Avatar';
import { btn, btnGhost, card, th, td } from '@/components/ui';

const PER_PAGE = 10;

export default async function UsersPage({ searchParams }) {
  const me = await requireUser(['admin']);
  const page = Math.max(1, toInt(searchParams.page) ?? 1);
  const role = ['admin', 'teacher', 'student'].includes(searchParams.role) ? searchParams.role : null;
  const { rows } = await query(
    `SELECT id, username, email, role, teacher_status, created_at, EXTRACT(EPOCH FROM avatar_updated_at)::bigint AS v, COUNT(*) OVER()::int AS total
       FROM users
      WHERE ($1::text IS NULL OR role = $1)
      ORDER BY (teacher_status = 'pending') DESC, created_at DESC
      LIMIT $2 OFFSET $3`,
    [role, PER_PAGE, (page - 1) * PER_PAGE]
  );
  const total = rows[0]?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (p) => `/admin/users?page=${p}${role ? `&role=${role}` : ''}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Pengguna ({total})</h1>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <select name="role" defaultValue={role ?? ''} aria-label="Filter role" className="rounded-md border border-line bg-white px-3 py-2 text-sm">
              <option value="">Semua role</option><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option>
            </select>
            <button className={btnGhost}>Filter</button>
          </form>
          <Link href="/admin/users/new" className={btn}>Tambah user</Link>
        </div>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[42rem]">
          <thead className="border-b border-line bg-mist"><tr><th className={th}>Username</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Aksi</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id} className={u.teacher_status === 'pending' ? 'bg-amber-soft' : ''}>
                <td className={`${td} font-semibold`}><span className="flex items-center gap-2"><Avatar id={u.id} name={u.username} v={u.v} size="sm" />{u.username}</span></td>
                <td className={td}>{u.email}</td>
                <td className={`${td} capitalize`}>{u.role}</td>
                <td className={td}>{u.teacher_status === 'pending' ? 'Teacher pending' : u.teacher_status === 'approved' ? 'Teacher terverifikasi' : '—'}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-2">
                    {u.teacher_status === 'pending' && <form action={approveTeacher}><input type="hidden" name="id" value={u.id} /><button className={btn}>Approve</button></form>}
                    <Link href={`/admin/users/${u.id}/edit`} className={btnGhost}>Edit</Link>
                    {u.id !== me.id && <ConfirmButton action={deleteUser} fields={{ id: u.id }} message={`Hapus pengguna "${u.username}"?`} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Halaman {page} dari {pages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={href(page - 1)} className={btnGhost}>Sebelumnya</Link>}
          {page < pages && <Link href={href(page + 1)} className={btnGhost}>Berikutnya</Link>}
        </div>
      </div>
    </>
  );
}
