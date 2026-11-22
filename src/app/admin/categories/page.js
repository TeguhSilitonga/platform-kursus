import Link from 'next/link';
import { query } from '@/lib/db';
import { saveCategory, deleteCategory } from '@/lib/actions/admin';
import { toInt } from '@/lib/format';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import ConfirmButton from '@/components/ConfirmButton';
import { btnGhost, card, input, label, th, td } from '@/components/ui';

export default async function Categories({ searchParams }) {
  const { rows } = await query(
    `SELECT cat.id, cat.name, COUNT(c.id)::int AS courses
       FROM categories cat LEFT JOIN courses c ON c.category_id = cat.id
      GROUP BY cat.id ORDER BY cat.name`
  );
  const editing = rows.find((r) => r.id === toInt(searchParams.edit));
  return (
    <>
      <h1 className="text-2xl font-extrabold text-ink">Kategori course</h1>
      {searchParams.error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{searchParams.error}</p>}
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full">
            <thead className="border-b border-line bg-mist"><tr><th className={th}>Nama</th><th className={th}>Jumlah course</th><th className={th}>Aksi</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className={`${td} font-semibold`}>{c.name}</td><td className={td}>{c.courses}</td>
                  <td className={td}><div className="flex gap-2"><Link href={`/admin/categories?edit=${c.id}`} className={btnGhost}>Edit</Link><ConfirmButton action={deleteCategory} fields={{ id: c.id }} message={`Hapus kategori "${c.name}"?`} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className={`${card} h-fit p-4`}>
          <h2 className="mb-3 font-bold text-ink">{editing ? 'Edit kategori' : 'Tambah kategori'}</h2>
          <ActionForm key={editing?.id ?? 'new'} action={saveCategory}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div><label htmlFor="name" className={label}>Nama kategori</label><input id="name" name="name" required maxLength={60} defaultValue={editing?.name} className={input} /></div>
            <div className="flex gap-2"><SubmitButton>Simpan</SubmitButton>{editing && <Link href="/admin/categories" className={btnGhost}>Batal</Link>}</div>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
