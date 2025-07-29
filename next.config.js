/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next.js 13.4 e superiori hanno App Router abilitato di default
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'via.placeholder.com'
    ],
  },
  // Escludiamo le directory che non devono essere compilate
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Configurazione per gestire Puppeteer e dipendenze problematiche
  webpack: (config, { isServer }) => {
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
        puppeteer: false
      };
    }
    
    // Escludi Puppeteer dal bundle client
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('puppeteer', 'puppeteer-core');
    }
    
    return config;
  },
  // Configurazione per Vercel
  serverRuntimeConfig: {
    // Configurazioni disponibili solo lato server
  },
  publicRuntimeConfig: {
    // Configurazioni disponibili lato client
  },
  // Ignora completamente gli errori TypeScript
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Disabilita completamente TypeScript per il build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

module.exports = nextConfig; 