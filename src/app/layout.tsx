import { Sora, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Studygram | Learn together',
  description:
    'A collaborative learning platform where students ask doubts, share knowledge and grow together across every subject.',
  openGraph: {
    title: 'Studygram',
    description: 'Collaborative learning platform for students',
    type: 'website',
  },
  metadataBase: new URL('https://studygram.vercel.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}