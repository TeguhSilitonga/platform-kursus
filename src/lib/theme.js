// Gradien sampul per kategori (konsisten: kategori yang sama = warna yang sama)
const COVERS = [
  'from-teal to-ink',
  'from-ink to-sky-700',
  'from-amber to-rose-500',
  'from-violet-600 to-ink',
  'from-emerald-600 to-teal-dark',
  'from-rose-500 to-violet-700',
];
export const coverFor = (id) => `bg-gradient-to-br ${COVERS[Math.abs(id) % COVERS.length]}`;
