# KelasKita — Platform Kursus (Tugas Final Praktikum Pemrograman Web 2026)

Next.js 14 (App Router, JSX) · Tailwind CSS · PostgreSQL (raw SQL dengan `pg`) · bcryptjs · JWT cookie (`jose`)

## Cara menjalankan
1. Buat database `kursus` di pgAdmin, lalu jalankan **`database/schema.sql`** di Query Tool (membuat tabel + data awal).
2. `cp .env.example .env.local` lalu isi `DATABASE_URL` dan `AUTH_SECRET`.
3. `npm install` → `npm run dev` → buka http://localhost:3000

Akun awal (password semua: `password123`): `admin@kursus.test`, `guru@kursus.test`, `siswa@kursus.test`
(`calon@kursus.test` = pendaftar Teacher berstatus pending).

## Desain UI
- Tailwind CSS saja (tanpa library UI tambahan); font Bricolage Grotesque (judul) + Plus Jakarta Sans (isi) dari Google Fonts.
- Palet: navy `ink`, `teal` (aksen utama), `amber` (progres/sorotan). Warna sampul course ditentukan per kategori (`src/lib/theme.js`).
- Komponen bersama: `Icon` (SVG inline), `Avatar`, `CourseCard`, `CourseAction` (tombol pintar sesuai status user), `AuthShell`, `NavLinks` (penanda halaman aktif), `Footer`.
- Responsif (mobile-first), animasi halus yang otomatis nonaktif jika pengguna memilih `prefers-reduced-motion`, `error.js` + `not-found.js` untuk halaman galat.

## Kartu course bergaya poster
- `CourseCard` menampilkan foto pengajar besar di kiri, judul besar, pil "N Materi Online & Praktik tentang:" dengan 5 judul materi pertama (diambil dari DB lewat `ARRAY(SELECT ...)`), dan tombol aksi penuh di bawah (Ikuti course / Lanjutkan belajar + progress).
- Foto kartu = foto profil pengajar. Pasang lewat halaman Profil, atau terminal: `node scripts/set-avatar.mjs guru@kursus.test lokasi/foto.png`.

## Foto profil (guru & siswa)
- Upload di halaman **Profil** (JPG/PNG/WebP, maks. 2 MB); disimpan di kolom `users.avatar` (BYTEA) dan disajikan lewat `GET /api/avatar/[id]`.
- Tipe file dicek dari isi file (magic bytes), bukan ekstensi. Tanpa foto → tampil inisial berwarna.
- Tampil di navbar, kartu course (pengajar), detail course (pengajar + siswa yang bergabung, hanya untuk user login), komentar diskusi, daftar user admin, dan bagian "Pengajar kami" di beranda.
- Database lama: jalankan `database/migration_avatar.sql` (tanpa menghapus data). Database baru: cukup `schema.sql`.

## Fitur keamanan
- **bcryptjs**: `bcrypt.hash` saat register / buat user admin, `bcrypt.compare` saat login (`src/lib/actions/auth.js`). Password tidak pernah disimpan plaintext.
- **`src/middleware.js`**: membaca cookie `session` (JWT httpOnly), memverifikasi dengan `jose` (Edge-compatible), **tanpa koneksi pg**. Melindungi `/profile`, `/learn`, `/manage`, `/admin`; `/admin` khusus role admin; user yang sudah login diarahkan keluar dari `/login` & `/register`.
- Pengecekan role kedua dilakukan di layout server (`requireUser`) memakai data terbaru dari DB — penting karena role guru berubah setelah di-approve, sedangkan token lama masih berisi role lama.
- Semua query memakai parameter (`$1, $2…`) → aman dari SQL injection. Sort memakai whitelist.
- Validasi dilakukan di server (server actions), bukan hanya atribut HTML.

