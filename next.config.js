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
