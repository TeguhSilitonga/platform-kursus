import { requireUser } from '@/lib/auth';
import NavLinks from '@/components/NavLinks';

// Cek ulang role dari DB (middleware hanya memastikan sudah login)
export default async function ManageLayout({ children }) {
  const user = await requireUser(['admin', 'teacher']);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-fit gap-1 rounded-full bg-line/50 p-1"><NavLinks variant="pill" links={[{ href: '/manage/courses', text: 'Course' }]} /></div>
        <span className="text-sm text-slate-500">{user.role === 'admin' ? 'Mode Admin: semua course' : 'Course milik saya'}</span>
      </div>
      {children}
    </div>
  );
}
