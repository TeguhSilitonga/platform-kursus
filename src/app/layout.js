import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'KelasKita — Platform Kursus Online',
  description: 'Belajar bersama pengajar terbaik, pantau progres, dan diskusi di setiap materi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-mist font-sans text-slate-800 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
