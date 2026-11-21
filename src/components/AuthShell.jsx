import Link from 'next/link';
import { Logo } from './Navbar';
import Icon from './Icon';

const POINTS = [
  ['book', 'Materi berurutan dari pengajar terverifikasi'],
  ['chart', 'Progres belajar tersimpan otomatis'],
  ['chat', 'Diskusi langsung di setiap materi'],
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid max-w-5xl animate-fade-up overflow-hidden rounded-3xl border border-line bg-white shadow-lift lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-amber/25 blur-3xl" />
        <Link href="/" className="relative"><Logo light /></Link>
        <div className="relative">
          <p className="font-display text-3xl font-extrabold leading-tight">Satu akun, semua kelasmu.</p>
          <ul className="mt-6 space-y-4">
            {POINTS.map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber"><Icon name={icon} className="h-4 w-4" /></span>{text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">© 2026 KelasKita</p>
      </aside>
      <div className="p-6 sm:p-10">
        <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">{subtitle}</p>
        {children}
        {footer}
      </div>
    </div>
  );
}
