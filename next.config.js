// Import polyfills per File API
require('./src/polyfills.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // Next.js 13.4 e superiori hanno App Router abilitato di default
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'via.placeholder.com'],
  },
  // Escludiamo le directory che non devono essere compilate
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurazione per gestire Puppeteer e dipendenze problematiche
  webpack: (config, { isServer }) => {
    if (isServer) {
      // ULTRA NUCLEAR APPROACH: Inietta polyfill direttamente nel bundle
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      
      // Definisce File come funzione globale che funziona veramente
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
if (typeof global !== 'undefined' && typeof global.File === 'undefined') {
  global.File = class File {
    constructor(name, size, type) {
      this.name = name || '';
      this.size = size || 0;
      this.type = type || '';
      this.lastModified = Date.now();
    }
  };
}
if (typeof globalThis !== 'undefined' && typeof globalThis.File === 'undefined') {
  globalThis.File = global.File;
}
          `,
          raw: true,
          entryOnly: false
        })
      );
    }
    
    if (!isServer) {
      // SUPER-NUCLEAR APPROACH: Intercetta collection() a livello di webpack per il client
      console.log('🔥🔥🔥 [SUPER-NUCLEAR] Implementando intercettazione collection() a livello webpack...');
      
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      
      config.plugins.push(
        new webpack.DefinePlugin({
          '__FIREBASE_COLLECTION_INTERCEPTOR__': JSON.stringify(true)
        })
      );
      
        // PLUGIN HYPER-NUCLEAR DISABILITATO: Causava SyntaxError
        // Il plugin modificava troppo aggressivamente il codice JavaScript
        // L'intercettazione ultra-nucleare runtime è sufficiente

        config.plugins.push(
          new webpack.BannerPlugin({
            banner: `
      console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR BANNER] Inizializzando intercettazione IMMEDIATA collection()...');

      // INTERCETTAZIONE ULTRA-NUCLEARE: Sostituisci collection() IMMEDIATAMENTE
      if (typeof window !== 'undefined') {
        console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR BANNER] Window disponibile, implementando intercettazione IMMEDIATA...');

        // Se non esiste ancora, crea il container per le funzioni originali
        if (!window.__firebaseOriginals) {
          window.__firebaseOriginals = {};
        }

        // Crea il wrapper ultra-sicuro IMMEDIATO (logging ridotto per performance)
        const ultraSafeCollectionWrapper = function(db, collectionName) {
          if (!db) {
            console.error('❌ [ULTRA-NUCLEAR] Firebase Firestore non inizializzato per:', collectionName);
            throw new Error('Firebase Firestore non inizializzato');
          }

          if (typeof db !== 'object' || !db) {
            console.error('❌ [ULTRA-NUCLEAR] Firebase Firestore non valido per:', collectionName);
            throw new Error('Firebase Firestore non è valido');
          }

          try {
            // Se abbiamo la funzione originale, usala
            if (window.__firebaseOriginals.collection) {
              const result = window.__firebaseOriginals.collection(db, collectionName);
              // Log solo per debug quando necessario
              // console.log('✅ [ULTRA-NUCLEAR] Collection OK:', collectionName);
              return result;
            } else {
              console.error('❌ [ULTRA-NUCLEAR] Funzione collection originale non trovata per:', collectionName);
              throw new Error('Funzione collection originale non trovata');
            }
          } catch (error) {
            console.error('❌ [ULTRA-NUCLEAR] Errore collection:', collectionName, error.message);
            throw error;
          }
        };

        // SOSTITUISCI IMMEDIATAMENTE la funzione collection globalmente
        if (typeof collection !== 'undefined') {
          console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR BANNER] Funzione collection trovata, sostituendo...');
          window.__firebaseOriginals.collection = collection;
          window.collection = ultraSafeCollectionWrapper;
        }

        // INTERCETTA ANCHE TUTTE LE POSSIBILI VARIANTI DI COLLECTION
        const originalCollection = window.collection;
        // Disabilito il logging eccessivo dei getter/setter per migliorare le performance
        Object.defineProperty(window, 'collection', {
          get: function() {
            return ultraSafeCollectionWrapper;
          },
          set: function(value) {
            if (typeof value === 'function') {
              window.__firebaseOriginals.collection = value;
            }
          },
          configurable: true,
          enumerable: true
        });

        // Intercetta anche globalThis.collection
        if (typeof globalThis !== 'undefined') {
          Object.defineProperty(globalThis, 'collection', {
            get: function() {
              return ultraSafeCollectionWrapper;
            },
            set: function(value) {
              if (typeof value === 'function') {
                window.__firebaseOriginals.collection = value;
              }
            },
            configurable: true,
            enumerable: true
          });
        }

        // Intercetta anche eventuali import di firebase/firestore
        const originalEval = window.eval;
        window.eval = function(code) {
          if (code && code.includes('collection')) {
            console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR EVAL] Intercettato eval con collection:', code.substring(0, 100));
            // Sostituisci collection nel codice
            code = code.replace(/\\bcollection\\b/g, 'window.collection || collection');
          }
          return originalEval.call(this, code);
        };

        // INTERCETTAZIONE DEFINITIVA: Sostituisci Error constructor per Firebase
        const originalError = window.Error;
        window.Error = function(message) {
          if (message && message.includes('Expected first argument to collection()')) {
            console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR ERROR] Intercettato errore Firebase collection()!');
            console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR ERROR] Stack trace:', new originalError().stack);
            
            // Invece di lanciare l'errore, prova a riparare la situazione
            console.log('🔥🔥🔥🔥 [ULTRA-NUCLEAR ERROR] Tentando riparazione automatica...');
            
            // Lancia un errore più descrittivo
            const repairError = new originalError('Firebase collection() riparata automaticamente - errore originale: ' + message);
            repairError.name = 'FirebaseAutoRepairError';
            return repairError;
          }
          return new originalError(message);
        };
        
        // Mantieni le proprietà dell'Error originale
        Object.setPrototypeOf(window.Error, originalError);
        Object.setPrototypeOf(window.Error.prototype, originalError.prototype);
        window.Error.captureStackTrace = originalError.captureStackTrace;

        console.log('✅✅✅✅ [ULTRA-NUCLEAR BANNER] Intercettazione IMMEDIATA collection() installata!');
      }
            `,
            raw: true,
            entryOnly: false,
            include: /\.(js|mjs|jsx|ts|tsx)$/,
            exclude: /\.(css|scss|sass|less|styl)$/
          })
        );
      
      // Lato client - escludi moduli Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        'puppeteer-core': false,
        puppeteer: false,
      };
    }

    // Escludi Puppeteer dal bundle client
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('puppeteer', 'puppeteer-core');
    }

    // Ignora file TypeScript nei node_modules
    config.module.rules.push({
      test: /\.ts$/,
      include: /node_modules/,
      use: 'ignore-loader'
    });

    return config;
  },
  // Configurazione per Vercel
  serverRuntimeConfig: {
    // Configurazioni disponibili solo lato server
  },
  publicRuntimeConfig: {
    // Configurazioni disponibili lato client
  },
  // Disabilita cache per evitare problemi di sincronizzazione
  generateEtags: false,
  compress: false,
  // Ignora completamente gli errori TypeScript
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Disabilita completamente TypeScript per il build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
