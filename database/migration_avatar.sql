-- Untuk database yang SUDAH ada (tanpa menghapus data). Jalankan sekali di pgAdmin.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar            BYTEA,
  ADD COLUMN IF NOT EXISTS avatar_type       VARCHAR(20),
  ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMPTZ;
