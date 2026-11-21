'use client';
export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-8 text-center shadow-soft">
      <h1 className="font-display text-2xl font-extrabold text-ink">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-slate-600">Pastikan PostgreSQL berjalan dan <code>database/schema.sql</code> sudah dijalankan, lalu coba lagi.</p>
      <button onClick={reset} className="mt-5 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark">Coba lagi</button>
    </div>
  );
}
