// Polyfills per compatibilità server-side
// Questo file risolve il problema "ReferenceError: File is not defined"

// 🛡️ GLOBAL ERROR INTERCEPTOR - DEVE ESSERE PRIMO
try {
  require('./lib/globalErrorInterceptor.ts');
} catch (error) {
  console.log('⚠️ [POLYFILLS] Global Error Interceptor non disponibile:', error.message);
}

if (typeof global !== 'undefined' && typeof global.File === 'undefined') {
  // Definisce un polyfill per File nel server-side
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

// Esporta per eventuali import espliciti (CommonJS)
module.exports = { FilePolyfill: global.File };
