const COLORS = ['bg-teal', 'bg-ink', 'bg-sky-800', 'bg-rose-700', 'bg-emerald-700', 'bg-violet-700'];
const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-12 w-12 text-base', lg: 'h-24 w-24 text-3xl' };

// Foto profil; jika belum ada foto tampil inisial dengan warna per-user.
// v = versi (timestamp) agar browser memuat ulang saat foto diganti.
export default function Avatar({ id, name, v, size = 'sm', className = '' }) {
  const cls = `${SIZES[size]} shrink-0 rounded-full object-cover ${className}`;
  if (v) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/api/avatar/${id}?v=${v}`} alt={`Foto ${name}`} className={cls} loading="lazy" />;
  }
  return (
    <span aria-hidden className={`${cls} inline-flex items-center justify-center font-bold text-white ${COLORS[id % COLORS.length]}`}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
