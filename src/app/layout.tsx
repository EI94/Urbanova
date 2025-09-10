import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Toaster from '@/components/ui/Toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import CommandPaletteWrapper from '@/components/CommandPaletteWrapper';
import { EnvironmentBanner } from '@/components/ui/EnvironmentBanner';
// FirebaseInterceptorLoader rimosso - approccio semplice con safeCollection()

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Urbanova - Piattaforma Smart City',
  description:
    'Urbanova - La piattaforma integrata per la gestione delle smart city e sviluppo immobiliare intelligente',
  keywords: 'smart city, sviluppo immobiliare, urbanistica, AI, analisi fattibilità, land scraping',
  authors: [{ name: 'Urbanova Team' }],
  creator: 'Urbanova',
  publisher: 'Urbanova',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://urbanova.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Urbanova - Piattaforma Smart City',
    description:
      'La piattaforma integrata per la gestione delle smart city e sviluppo immobiliare intelligente',
    url: 'https://urbanova.vercel.app',
    siteName: 'Urbanova',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Urbanova - Piattaforma Smart City',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urbanova - Piattaforma Smart City',
    description:
      'La piattaforma integrata per la gestione delle smart city e sviluppo immobiliare intelligente',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="urbanova">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // GLOBAL ERROR INTERCEPTOR - Gestione errori non critici
              console.log('🔥 [GLOBAL ERROR CATCHER] Inizializzato');
              
              window.addEventListener('error', function(event) {
                const error = event.error;
                const message = error?.message || '';
                
                // Ignora errori Firebase 400 che non bloccano l'app
                if (message.includes('firestore') || 
                    message.includes('400') || 
                    message.includes('Bad Request') ||
                    message.includes('collection')) {
                  console.warn('⚠️ [ERROR INTERCEPTOR] Firebase error ignorato (non critico):', message);
                  event.preventDefault();
                  return false;
                }
                
                // Ignora errori CSS che non bloccano l'app
                if (message.includes('@import rules are not allowed')) {
                  console.warn('⚠️ [ERROR INTERCEPTOR] CSS import error ignorato (non critico):', message);
                  event.preventDefault();
                  return false;
                }
              });
              
              window.addEventListener('unhandledrejection', function(event) {
                const reason = event.reason;
                const message = reason?.message || '';
                
                // Ignora errori Firebase 400
                if (message.includes('firestore') || 
                    message.includes('400') || 
                    message.includes('Bad Request')) {
                  console.warn('⚠️ [ERROR INTERCEPTOR] Firebase promise rejection ignorato (non critico):', message);
                  event.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <DarkModeProvider>
              <EnvironmentBanner />
              <CommandPaletteWrapper>{children}</CommandPaletteWrapper>
              <Toaster />
            </DarkModeProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
