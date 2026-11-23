import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { getCategories, listCourses, getStats, getTeachers } from '@/lib/queries';
import { toInt } from '@/lib/format';
import { coverFor } from '@/lib/theme';
import CourseCard from '@/components/CourseCard';
import SearchBar from '@/components/SearchBar';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { btn } from '@/components/ui';

const STEPS = [
  ['search', 'Temukan course', 'Cari berdasarkan kata kunci atau kategori, lalu lihat daftar materinya.'],
  ['book', 'Belajar bertahap', 'Ikuti materi berurutan dan tandai yang sudah selesai dengan satu klik.'],
  ['chart', 'Pantau progres', 'Lihat persentase kemajuan dan diskusikan pertanyaan di setiap materi.'],
];

export default async function Home({ searchParams }) {
  const user = await getUser();
  const q = (searchParams.q ?? '').trim() || null;
  const category = toInt(searchParams.category);
  const filtering = Boolean(q || category);
  const [categories, courses, stats, teachers] = await Promise.all([
    getCategories(),
    listCourses({ q, categoryId: category, userId: user?.id, limit: filtering ? null : 5, sort: 'popular' }),
    getStats(),
    getTeachers(6),
  ]);
  const statItems = [['layers', stats.courses, 'Course'], ['book', stats.contents, 'Materi'], ['cap', stats.teachers, 'Pengajar'], ['users', stats.students, 'Siswa']];

  return (
    <div className="space-y-20">
      <section className="relative isolate overflow-hidden rounded-3xl bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-grid opacity-70" />
        <div className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-teal/40 blur-3xl" />
        <div className="absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full bg-amber/25 blur-3xl" />
        <div className="grid items-center gap-12 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-amber" /> Platform kursus daring · {stats.courses} course tersedia
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Naikkan skill, <span className="text-amber underline decoration-amber/40 decoration-4 underline-offset-8">satu materi</span> setiap hari.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">Ikuti course dari pengajar terverifikasi, tandai materi yang selesai, dan diskusi langsung di bawah setiap materi.</p>
            <div className="mt-7 max-w-2xl rounded-2xl bg-white p-2.5 text-slate-800 shadow-lift">
              <SearchBar action="/" categories={categories} q={q} category={category} />
            </div>
            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {statItems.map(([icon, v, k]) => (
                <div key={k}><dt className="flex items-center gap-1.5 text-xs text-slate-400"><Icon name={icon} className="h-3.5 w-3.5" />{k}</dt><dd className="font-display text-2xl font-extrabold">{v}</dd></div>
              ))}
            </dl>
          </div>

          {/* Ilustrasi dekoratif (bukan data nyata) */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="animate-float rounded-2xl bg-white p-5 text-slate-800 shadow-lift">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-teal"><Icon name="book" /></div>
                <div><p className="text-xs text-slate-500">Sedang dipelajari</p><p className="font-display font-bold text-ink">JavaScript Modern</p></div>
              </div>
              <div className="mt-4 flex justify-between text-xs font-bold text-ink"><span>Progress</span><span>68%</span></div>
              <div className="mt-1.5 h-2.5 rounded-full bg-mist"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-amber to-teal" /></div>
              <ul className="mt-4 space-y-2 text-sm">
                {['Variabel dan tipe data', 'Fungsi dan arrow function', 'Asynchronous & fetch'].map((t, i) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${i < 2 ? 'bg-teal' : 'border border-line text-transparent'}`}><Icon name="check" className="h-3 w-3" /></span>
                    <span className={i < 2 ? 'text-slate-500 line-through' : 'font-semibold'}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-5 -left-8 animate-float rounded-xl bg-amber px-4 py-3 text-sm font-extrabold text-ink shadow-lift [animation-delay:1.2s]">Materi selesai ✓</div>
            <div className="absolute -right-3 -top-5 flex animate-float items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-lift [animation-delay:.6s]"><Icon name="chat" className="h-4 w-4 text-teal" /> Diskusi aktif</div>
          </div>
        </div>
      </section>

      {!filtering && categories.length > 0 && (
        <section aria-labelledby="kategori">
          <h2 id="kategori" className="mb-5 font-display text-3xl font-extrabold text-ink">Jelajahi kategori</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/?category=${c.id}#kursus`} className={`group relative block overflow-hidden rounded-xl ${coverFor(c.id)} pattern-dots p-5 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift`}>
                  <Icon name="layers" className="h-7 w-7 text-white/80" />
                  <p className="mt-6 font-display text-lg font-bold">{c.name}</p>
                  <p className="text-sm text-white/80">{c.courses} course</p>
                  <Icon name="arrow" className="absolute bottom-5 right-5 h-5 w-5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="kursus" className="scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-3xl font-extrabold text-ink">{filtering ? `Hasil pencarian (${courses.length})` : '5 course terpopuler'}</h2>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline">Lihat semua course <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
        {filtering && (
          <div className="mb-5 flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold hover:bg-teal-soft">× Hapus filter</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/?category=${c.id}`} className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${category === c.id ? 'border-teal bg-teal text-white' : 'border-line bg-white hover:bg-teal-soft'}`}>{c.name}</Link>
            ))}
          </div>
        )}
        {courses.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((c, i) => {
              const first = !filtering && i === 0; // course #1 tampil lebar
              return <CourseCard key={c.id} course={c} user={user} rank={filtering ? undefined : i + 1} wide={first} className={first ? 'md:col-span-2' : ''} />;
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-slate-500">Tidak ada course yang cocok. Coba kata kunci atau kategori lain.</p>
        )}
      </section>

      <section aria-labelledby="cara">
        <h2 id="cara" className="mb-8 text-center font-display text-3xl font-extrabold text-ink">Belajar jadi lebih mudah</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([icon, title, text], i) => (
            <li key={title} className="relative rounded-xl border border-line bg-white p-6 shadow-soft">
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-mist">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-soft text-teal"><Icon name={icon} className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {!filtering && teachers.length > 0 && (
        <section aria-labelledby="pengajar">
          <h2 id="pengajar" className="mb-5 font-display text-3xl font-extrabold text-ink">Pengajar kami</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => (
              <li key={t.id} className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <Avatar id={t.id} name={t.username} v={t.v} size="md" />
                <div><p className="font-display font-bold text-ink">{t.username}</p><p className="text-sm text-slate-500">{t.courses} course</p></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!user && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal to-ink px-6 py-10 text-white sm:px-12">
          <div className="pattern-dots absolute inset-0 opacity-60" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div><h2 className="font-display text-3xl font-extrabold">Ingin berbagi ilmu?</h2><p className="mt-1 max-w-lg text-white/85">Daftar sebagai Teacher. Setelah Admin menyetujui, Anda bisa membuat course dan materi sendiri.</p></div>
            <Link href="/register?as=teacher" className={`${btn} !bg-white !text-ink hover:!bg-amber-soft`}>Daftar sebagai Teacher</Link>
          </div>
        </section>
      )}
    </div>
  );
}
