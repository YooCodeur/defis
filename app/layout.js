import { AuthProvider } from './hooks/useAuth';
import './globals.css';

export const metadata = {
  title: 'Défis de Code',
  description: 'Plateforme de défis de programmation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 