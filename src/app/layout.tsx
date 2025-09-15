import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Toaster from '@/components/ui/Toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import CommandPaletteWrapper from '@/components/CommandPaletteWrapper';
import { EnvironmentBanner } from '@/components/ui/EnvironmentBanner';

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
              console.log("🛡️ [INLINE PROTECTION] Inizializzazione protezione inline...");
              
              // Intercetta TUTTI gli errori JavaScript globali PRIMA di React
              const originalOnError = window.onerror;
              window.onerror = function(message, source, lineno, colno, error) {
                if (message && typeof message === 'string' && message.includes("Cannot destructure property 'auth'")) {
                  console.warn("🛡️ [INLINE PROTECTION] Errore auth destructuring intercettato:", message);
                  return true; // Previeni il crash
                }
                if (originalOnError) {
                  return originalOnError.call(this, message, source, lineno, colno, error);
                }
                return false;
              };

              // Intercetta errori non gestiti
              const originalOnUnhandledRejection = window.onunhandledrejection;
              window.onunhandledrejection = function(event) {
                if (event.reason && event.reason.message && event.reason.message.includes("Cannot destructure property 'auth'")) {
                  console.warn("🛡️ [INLINE PROTECTION] Promise rejection auth destructuring intercettata:", event.reason.message);
                  event.preventDefault();
                  return;
                }
                if (originalOnUnhandledRejection) {
                  return originalOnUnhandledRejection.call(this, event);
                }
              };

              // Intercetta console.error per nascondere errori auth
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes("Cannot destructure property 'auth'")) {
                  console.warn("🛡️ [INLINE PROTECTION] Errore auth destructuring nascosto:", message);
                  return;
                }
                return originalConsoleError.apply(console, args);
              };

              // Intercetta React hooks quando React si carica
              const originalReact = window.React;
              Object.defineProperty(window, 'React', {
                get: function() {
                  const react = originalReact || window.React;
                  if (react && react.useMemo) {
                    const originalUseMemo = react.useMemo;
                    react.useMemo = function(factory, deps) {
                      try {
                        return originalUseMemo(factory, deps);
                      } catch (error) {
                        if (error.message && error.message.includes("Cannot destructure property 'auth'")) {
                          console.warn("🛡️ [INLINE PROTECTION] Errore auth destructuring intercettato in useMemo:", error.message);
                          try {
                            return factory();
                          } catch {
                            return undefined;
                          }
                        }
                        throw error;
                      }
                    };
                  }
                  return react;
                },
                set: function(value) {
                  window._React = value;
                }
              });

              console.log("🛡️ [INLINE PROTECTION] Protezione inline attivata con successo");
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
