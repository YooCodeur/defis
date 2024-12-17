import './globals.css';
import Header from './components/Header';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Défis ORT',
  description: 'Application de défis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
