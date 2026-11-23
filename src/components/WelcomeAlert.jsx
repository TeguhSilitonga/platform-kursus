'use client';
import { useState } from 'react';

export default function WelcomeAlert() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div role="status" className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-teal bg-teal-soft p-4 animate-fade-up">
      <div>
        <p className="font-bold text-ink">Selamat datang, Teacher!</p>
        <p className="text-sm text-slate-700">Akun pengajar Anda sudah disetujui Admin. Buka menu Kelola Course untuk membuat course pertama Anda.</p>
        <p className="mt-1 text-xs text-slate-500">Jika menu belum tampil, silakan logout lalu login kembali.</p>
      </div>
      <button onClick={() => setOpen(false)} aria-label="Tutup" className="text-xl leading-none text-slate-500 hover:text-ink">×</button>
    </div>
  );
}
