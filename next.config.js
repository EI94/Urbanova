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
      
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
console.log('🔥🔥🔥 [SUPER-NUCLEAR BANNER] Inizializzando intercettazione collection()...');

// Intercetta collection() immediatamente nel chunk
if (typeof window !== 'undefined') {
  console.log('🔥🔥🔥 [SUPER-NUCLEAR BANNER] Window disponibile, implementando intercettazione...');
  
  // Salva la funzione originale se esiste
  window.__originalFirebaseCollection = null;
  
  // Crea il wrapper super-sicuro
  window.__safeCollectionWrapper = function(db, collectionName) {
    console.log('🔥🔥🔥 [SUPER-NUCLEAR WRAPPER] Intercettata chiamata collection() per:', collectionName);
    console.log('🔥🔥🔥 [SUPER-NUCLEAR WRAPPER] db type:', typeof db);
    console.log('🔥🔥🔥 [SUPER-NUCLEAR WRAPPER] db value:', db);
    
    if (!db) {
      console.error('❌❌❌ [SUPER-NUCLEAR WRAPPER] Firebase Firestore non inizializzato!');
      throw new Error('Firebase Firestore non inizializzato');
    }
    
    if (typeof db !== 'object' || !db) {
      console.error('❌❌❌ [SUPER-NUCLEAR WRAPPER] Firebase Firestore non è un oggetto valido!');
      throw new Error('Firebase Firestore non è valido');
    }
    
    try {
      console.log('🔥🔥🔥 [SUPER-NUCLEAR WRAPPER] Chiamando funzione collection originale...');
      
      // Se abbiamo la funzione originale, usala
      if (window.__originalFirebaseCollection) {
        const result = window.__originalFirebaseCollection(db, collectionName);
        console.log('✅✅✅ [SUPER-NUCLEAR WRAPPER] Collection creata con successo per:', collectionName);
        return result;
      } else {
        // Fallback: usa il metodo interno di Firebase
        console.error('❌❌❌ [SUPER-NUCLEAR WRAPPER] Funzione collection originale non trovata!');
        throw new Error('Funzione collection originale non trovata');
      }
    } catch (error) {
      console.error('❌❌❌ [SUPER-NUCLEAR WRAPPER] Errore nella creazione collezione:', error);
      throw error;
    }
  };
  
  console.log('✅✅✅ [SUPER-NUCLEAR BANNER] Wrapper collection() installato globalmente!');
}
          `,
          raw: true,
          entryOnly: false,
          test: /\.js$/
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
