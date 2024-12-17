import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import './globals.css';

export const metadata = {
  title: 'Défis',
  description: 'Plateforme de défis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 