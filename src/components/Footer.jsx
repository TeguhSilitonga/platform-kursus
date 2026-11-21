import Link from 'next/link';
import { Logo } from './Navbar';

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">Platform kursus daring: belajar dari pengajar terverifikasi, pantau progres, dan diskusi di setiap materi.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">Jelajahi</p>
          <ul className="space-y-2 text-sm"><li><Link href="/" className="hover:text-white">Beranda</Link></li><li><Link href="/courses" className="hover:text-white">Katalog course</Link></li></ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">Bergabung</p>
          <ul className="space-y-2 text-sm"><li><Link href="/register?as=student" className="hover:text-white">Daftar sebagai Student</Link></li><li><Link href="/register?as=teacher" className="hover:text-white">Daftar sebagai Teacher</Link></li><li><Link href="/login" className="hover:text-white">Masuk</Link></li></ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© 2026 KelasKita — Tugas Final Praktikum Pemrograman Web</div>
    </footer>
  );
}
