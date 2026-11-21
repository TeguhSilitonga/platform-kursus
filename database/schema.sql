-- =====================================================================
-- Platform Kursus — skema + data awal (PostgreSQL)
-- Cara pakai:
--   1) createdb kursus            (atau buat database "kursus" di pgAdmin)
--   2) jalankan file ini lewat Query Tool pgAdmin, atau:
--      psql -U postgres -d kursus -f database/schema.sql
-- Akun awal (password semua: password123)
--   admin@kursus.test | guru@kursus.test | siswa@kursus.test
-- =====================================================================

DROP TABLE IF EXISTS comments, content_progress, enrollments, contents, courses, categories, users CASCADE;

CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(30)  NOT NULL UNIQUE,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password       VARCHAR(100) NOT NULL,            -- hash bcrypt
  role           VARCHAR(10)  NOT NULL DEFAULT 'student'
                 CHECK (role IN ('admin', 'teacher', 'student')),
  teacher_status VARCHAR(10)  NOT NULL DEFAULT 'none'
                 CHECK (teacher_status IN ('none', 'pending', 'approved')),
  approved_at    TIMESTAMPTZ,
  avatar            BYTEA,                         -- foto profil (JPG/PNG/WebP, maks 2 MB)
  avatar_type       VARCHAR(20),
  avatar_updated_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT         NOT NULL,
  category_id INT          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  teacher_id  INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date  DATE,        -- NULL = lifetime access
  end_date    DATE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE contents (
  id          SERIAL PRIMARY KEY,
  course_id   INT          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  body        TEXT         NOT NULL,
  order_index INT          NOT NULL CHECK (order_index > 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, order_index)
);

CREATE TABLE enrollments (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  course_id   INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- "Mark as Done" tersimpan di sini, terikat ke enrollment siswa
CREATE TABLE content_progress (
  id            SERIAL PRIMARY KEY,
  enrollment_id INT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  content_id    INT NOT NULL REFERENCES contents(id)    ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, content_id)
);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  content_id INT  NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id    INT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_category  ON courses(category_id);
CREATE INDEX idx_courses_teacher   ON courses(teacher_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_comments_content  ON comments(content_id);

-- ---------------------------------------------------------------------
-- Data awal
-- ---------------------------------------------------------------------
INSERT INTO users (username, email, password, role, teacher_status, approved_at) VALUES
  ('admin',     'admin@kursus.test', '$2a$10$xGD3I.pfwKdJh.Poie.4ce9cF.QYXi6Fuys8DxwQadsODhgc016V.', 'admin',   'none',     NULL),
  ('bu_sinta',  'guru@kursus.test',  '$2a$10$xGD3I.pfwKdJh.Poie.4ce9cF.QYXi6Fuys8DxwQadsODhgc016V.', 'teacher', 'approved', NOW() - INTERVAL '30 days'),
  ('andi',      'siswa@kursus.test', '$2a$10$xGD3I.pfwKdJh.Poie.4ce9cF.QYXi6Fuys8DxwQadsODhgc016V.', 'student', 'none',     NULL),
  ('calon_guru','calon@kursus.test', '$2a$10$xGD3I.pfwKdJh.Poie.4ce9cF.QYXi6Fuys8DxwQadsODhgc016V.', 'student', 'pending',  NULL);

INSERT INTO categories (name) VALUES ('Web Development'), ('Data Science'), ('Teknologi'), ('Desain');

INSERT INTO courses (name, description, category_id, teacher_id, start_date, end_date) VALUES
  ('Dasar HTML & CSS', 'Belajar membangun halaman web pertama Anda dari nol: struktur HTML, styling CSS, dan layout responsif.', 1, 2, NULL, NULL),
  ('JavaScript Modern', 'ES6+, asynchronous programming, dan manipulasi DOM untuk pemula hingga menengah.', 1, 2, '2026-11-01', '2027-02-28'),
  ('Pengantar Data Science', 'Mengenal alur kerja data: pengumpulan, pembersihan, analisis, hingga visualisasi.', 2, 2, NULL, NULL);

INSERT INTO contents (course_id, title, body, order_index) VALUES
  (1, 'Apa itu HTML?', E'HTML (HyperText Markup Language) adalah bahasa penanda untuk menyusun struktur halaman web.\n\nContoh elemen dasar: heading, paragraf, tautan, gambar, dan daftar.', 1),
  (1, 'Dasar CSS', E'CSS mengatur tampilan: warna, jarak, tipografi, dan tata letak.\n\nPelajari selector, properti box model, dan flexbox.', 2),
  (1, 'Layout Responsif', E'Gunakan media query dan satuan relatif agar halaman nyaman dibuka dari ponsel maupun desktop.', 3),
  (2, 'Variabel dan Tipe Data', E'Gunakan let dan const. Kenali tipe data: string, number, boolean, array, object.', 1),
  (2, 'Fungsi dan Arrow Function', E'Fungsi adalah blok kode yang dapat dipakai ulang. Arrow function memberi sintaks lebih ringkas.', 2),
  (3, 'Alur Kerja Data', E'Tahapan umum: definisi masalah, pengumpulan data, pembersihan, eksplorasi, pemodelan, komunikasi hasil.', 1),
  (3, 'Membaca Data dengan Tabel', E'Data tabular terdiri dari baris (observasi) dan kolom (variabel). Mulailah dengan memeriksa ukuran dan tipe tiap kolom.', 2);

INSERT INTO enrollments (user_id, course_id) VALUES (3, 1);
INSERT INTO content_progress (enrollment_id, content_id) VALUES (1, 1);
INSERT INTO comments (content_id, user_id, body) VALUES
  (1, 3, 'Penjelasannya jelas, terima kasih Bu!'),
  (1, 2, 'Sama-sama. Jangan ragu bertanya di kolom ini.');
