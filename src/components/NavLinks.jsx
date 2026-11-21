'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Tautan dengan penanda halaman aktif. variant: 'top' (garis bawah) | 'pill' (tab)
export default function NavLinks({ links, variant = 'top' }) {
  const path = usePathname();
  const isActive = (h) => (h === '/' ? path === '/' : path === h || path.startsWith(h + '/'));
  return links.map((l) => {
    const a = isActive(l.href);
    const cls = variant === 'pill'
      ? `rounded-full px-4 py-1.5 text-sm font-semibold transition ${a ? 'bg-ink text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-ink'}`
      : `relative py-1 text-sm font-semibold transition ${a ? 'text-teal' : 'text-slate-600 hover:text-ink'}`;
    return (
      <Link key={l.href} href={l.href} aria-current={a ? 'page' : undefined} className={cls}>
        {l.text}
        {variant === 'top' && a && <span className="absolute inset-x-0 -bottom-[19px] h-0.5 rounded bg-teal" />}
      </Link>
    );
  });
}
