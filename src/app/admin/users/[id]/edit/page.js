import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { toInt } from '@/lib/format';
import UserForm from '@/components/UserForm';

export default async function EditUser({ params }) {
  const id = toInt(params.id);
  const { rows } = id ? await query('SELECT id, username, email, role FROM users WHERE id = $1', [id]) : { rows: [] };
  if (!rows[0]) notFound();
  return (<><h1 className="text-2xl font-extrabold text-ink">Edit pengguna</h1><UserForm user={rows[0]} /></>);
}
