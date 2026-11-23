import { query } from '@/lib/db';

// Menyajikan foto dari database. URL membawa ?v=<timestamp>, jadi aman di-cache lama.
export async function GET(req, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return new Response(null, { status: 404 });
  const { rows } = await query('SELECT avatar, avatar_type FROM users WHERE id = $1 AND avatar IS NOT NULL', [id]);
  if (!rows[0]) return new Response(null, { status: 404 });
  return new Response(rows[0].avatar, {
    headers: {
      'Content-Type': rows[0].avatar_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
