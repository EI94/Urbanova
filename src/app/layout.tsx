import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Toaster from '@/components/ui/Toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
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
              // GLOBAL FIREBASE ERROR CATCHER - CARICATO PRIMA DI TUTTO
              console.log('🔥 [GLOBAL ERROR CATCHER] Inizializzato');
              
              window.addEventListener('error', function(event) {
                if (event.error && event.error.message) {
                  if (event.error.message.includes('collection') || 
                      event.error.message.includes('Firebase') ||
                      event.error.message.includes('firestore')) {
                    console.error('🚨🚨🚨 [GLOBAL FIREBASE ERROR] CATTURATO ERRORE FIREBASE!');
                    console.error('🚨 [ERROR] Message:', event.error.message);
                    console.error('🚨 [ERROR] Stack:', event.error.stack);
                    console.error('🚨 [ERROR] Source:', event.filename + ':' + event.lineno + ':' + event.colno);
                    console.error('🚨 [ERROR] Full Event:', event);
                    
                    // Prova a capire da dove viene
                    if (event.error.stack) {
                      const stackLines = event.error.stack.split('\\n');
                      console.error('🚨 [STACK ANALYSIS] Analisi stack trace:');
                      stackLines.forEach((line, index) => {
                        console.error('🚨 [STACK ' + index + ']', line);
                      });
                    }
                  }
                }
              });
              
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message) {
                  if (event.reason.message.includes('collection') || 
                      event.reason.message.includes('Firebase') ||
                      event.reason.message.includes('firestore')) {
                    console.error('🚨🚨🚨 [GLOBAL FIREBASE PROMISE ERROR] CATTURATO PROMISE REJECTION!');
                    console.error('🚨 [PROMISE ERROR] Reason:', event.reason);
                    console.error('🚨 [PROMISE ERROR] Stack:', event.reason.stack);
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <EnvironmentBanner />
            <CommandPaletteWrapper>{children}</CommandPaletteWrapper>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
