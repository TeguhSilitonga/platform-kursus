import Link from 'next/link';
export default function NotFound() {
  return (<div className="py-20 text-center"><h1 className="font-display text-3xl font-extrabold text-ink">Halaman tidak ditemukan</h1><Link href="/" className="mt-4 inline-block font-semibold text-teal hover:underline">Kembali ke beranda</Link></div>);
}
