import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import AuthShell from '@/components/AuthShell';
import { login } from '@/lib/actions/auth';
import { input, label } from '@/components/ui';

export const metadata = { title: 'Masuk — KelasKita' };

export default async function LoginPage({ searchParams }) {
  if (await getUser()) redirect('/'); // sudah login (terverifikasi di DB)
  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk sebagai Admin, Teacher, atau Student."
      footer={<p className="mt-6 text-sm text-slate-600">Belum punya akun? <Link href="/register" className="font-semibold text-teal hover:underline">Daftar gratis</Link></p>}
    >
      <ActionForm action={login}>
        <input type="hidden" name="next" value={searchParams.next ?? ''} />
        <div><label htmlFor="identity" className={label}>Email atau username</label><input id="identity" name="identity" required autoComplete="username" className={input} /></div>
        <div><label htmlFor="password" className={label}>Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className={input} /></div>
        <SubmitButton className="w-full rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-dark disabled:opacity-60">Masuk</SubmitButton>
      </ActionForm>
    </AuthShell>
  );
}
