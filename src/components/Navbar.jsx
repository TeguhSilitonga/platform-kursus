import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { logout } from '@/lib/actions/auth';
import { btn, btnGhost } from './ui';
import Avatar from './Avatar';
import Icon from './Icon';
import NavLinks from './NavLinks';

export function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-white shadow-sm"><Icon name="cap" className="h-5 w-5" /></span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Kelas<span className="text-teal">Kita</span></span>
    </span>
  );
}

export default async function Navbar() {
  const user = await getUser();
  const staff = user && ['admin', 'teacher'].includes(user.role);
  const links = [
    { href: '/', text: 'Beranda' },
    { href: '/courses', text: 'Katalog' },
    ...(user ? [{ href: '/profile', text: 'Profil' }] : []),
    ...(staff ? [{ href: '/manage/courses', text: 'Kelola Course' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', text: 'Admin' }] : []),
  ];
  const auth = user ? (
    <>
      <Link href="/profile" className="flex items-center gap-2" aria-label="Profil saya">
        <Avatar id={user.id} name={user.username} v={user.avatar_v} size="sm" />
        <span className="max-w-[8rem] truncate text-sm font-semibold text-ink">{user.username}</span>
      </Link>
      <form action={logout}><button className={btnGhost}>Keluar</button></form>
    </>
  ) : (
    <>
      <Link href="/login" className={btnGhost}>Masuk</Link>
      <Link href="/register" className={btn}>Daftar</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="KelasKita — beranda"><Logo /></Link>
        <div className="hidden items-center gap-7 md:flex"><NavLinks links={links} /></div>
        <div className="hidden items-center gap-3 md:flex">{auth}</div>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold">Menu</summary>
          <div className="absolute right-0 z-20 mt-2 w-60 space-y-1 rounded-xl border border-line bg-white p-3 shadow-lift">
            {links.map((l) => <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-mist">{l.text}</Link>)}
            <div className="flex items-center gap-2 border-t border-line pt-3">{auth}</div>
          </div>
        </details>
      </nav>
    </header>
  );
}
