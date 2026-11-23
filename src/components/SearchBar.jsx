import { input, btn } from './ui';
import Icon from './Icon';

export default function SearchBar({ action, categories, q, category }) {
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={q ?? ''} placeholder="Cari course, mis. JavaScript" aria-label="Cari course" className={`${input} pl-10`} />
      </div>
      <select name="category" defaultValue={category ?? ''} aria-label="Kategori" className={`${input} sm:w-52`}>
        <option value="">Semua kategori</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button className={btn}>Cari</button>
    </form>
  );
}
