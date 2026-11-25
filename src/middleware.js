// Catatan: halaman /login & /register sengaja TIDAK dijaga di sini. Token yang masih valid belum
// tentu berarti akunnya masih ada di DB (mis. DB di-reset), jadi pengecekan "sudah login?" untuk
// halaman itu dilakukan di page memakai getUser() (cek DB).
// Middleware berjalan di Edge runtime: HANYA membaca cookie + verifikasi JWT.
// Dilarang memanggil PostgreSQL (pg) di sini. Pengecekan role yang bergantung
// data terbaru (mis. guru baru di-approve) dilakukan ulang di layout server.
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function readSession(req) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return payload;
  } catch {
    return null; // token rusak / kedaluwarsa
  }
}

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const session = await readSession(req);

  // Route private: wajib login
  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(url);
    if (req.cookies.get('session')) res.cookies.delete('session'); // bersihkan token invalid
    return res;
  }

  // Area admin: khusus role admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/learn/:path*', '/manage/:path*', '/admin/:path*'],
};
