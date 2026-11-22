import { requireUser } from '@/lib/auth';
import NavLinks from '@/components/NavLinks';

export default async function AdminLayout({ children }) {
  await requireUser(['admin']); // lapisan kedua setelah middleware
  const links = [
    { href: '/admin', text: 'Dashboard' },
    { href: '/admin/users', text: 'Pengguna' },
    { href: '/admin/categories', text: 'Kategori' },
    { href: '/manage/courses', text: 'Course' },
  ];
  return (
    <div className="space-y-6">
      <nav aria-label="Menu admin" className="flex w-fit max-w-full flex-wrap gap-1 rounded-full bg-line/50 p-1"><NavLinks variant="pill" links={links} /></nav>
      {children}
    </div>
  );
}
