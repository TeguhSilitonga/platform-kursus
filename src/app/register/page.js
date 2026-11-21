import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import AuthShell from '@/components/AuthShell';
import { register } from '@/lib/actions/auth';
import { input, label } from '@/components/ui';

export const metadata = { title: 'Daftar — KelasKita' };

export default async function RegisterPage({ searchParams }) {
  if (await getUser()) redirect('/'); // sudah login (terverifikasi di DB)
  const teacher = searchParams.as === 'teacher';
  const tab = (active) => `flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${active ? 'bg-ink text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`;
  return (
    <AuthShell
      title="Buat akun baru"
      subtitle="Mulai belajar atau bagikan ilmu Anda."
      footer={<p className="mt-6 text-sm text-slate-600">Sudah punya akun? <Link href="/login" className="font-semibold text-teal hover:underline">Masuk</Link></p>}
    >
      <div className="mb-5 flex gap-1 rounded-xl bg-mist p-1">
        <Link href="/register?as=student" className={tab(!teacher)}>Sebagai Student</Link>
        <Link href="/register?as=teacher" className={tab(teacher)}>Sebagai Teacher</Link>
      </div>
      {teacher && <p className="mb-4 rounded-lg bg-amber-soft px-3 py-2.5 text-sm text-slate-700">Pendaftar Teacher masuk sebagai Student dulu. Status pengajar menunggu verifikasi Admin.</p>}
      <ActionForm action={register}>
        <input type="hidden" name="as" value={teacher ? 'teacher' : 'student'} />
        <div><label htmlFor="username" className={label}>Username</label><input id="username" name="username" required minLength={3} maxLength={30} autoComplete="username" className={input} /></div>
        <div><label htmlFor="email" className={label}>Email</label><input id="email" name="email" type="email" required autoComplete="email" className={input} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="password" className={label}>Password (min. 8)</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={input} /></div>
          <div><label htmlFor="confirm" className={label}>Konfirmasi</label><input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></div>
        </div>
        <SubmitButton className="w-full rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-dark disabled:opacity-60">Daftar</SubmitButton>
      </ActionForm>
    </AuthShell>
  );
}
