// Pasang foto ke akun lewat terminal (alternatif dari tombol "Unggah foto" di halaman Profil).
// Pakai:  node scripts/set-avatar.mjs guru@kursus.test lokasi/foto.png
import fs from 'node:fs';
import pg from 'pg';

for (const line of fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8').split('\n') : []) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const [, , identity, file] = process.argv;
if (!identity || !file) { console.error('Pemakaian: node scripts/set-avatar.mjs <email|username> <file foto>'); process.exit(1); }

const buf = fs.readFileSync(file);
const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
const isWebp = buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
const type = isPng ? 'image/png' : isJpg ? 'image/jpeg' : isWebp ? 'image/webp' : null;
if (!type) { console.error('Format harus JPG, PNG, atau WebP.'); process.exit(1); }
if (buf.length > 2 * 1024 * 1024) { console.error('Ukuran foto maksimal 2 MB.'); process.exit(1); }

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rowCount } = await pool.query(
  `UPDATE users SET avatar = $1, avatar_type = $2, avatar_updated_at = NOW()
    WHERE LOWER(email) = LOWER($3) OR LOWER(username) = LOWER($3)`,
  [buf, type, identity]
);
console.log(rowCount ? `Foto terpasang untuk ${identity}.` : `Akun "${identity}" tidak ditemukan.`);
await pool.end();
