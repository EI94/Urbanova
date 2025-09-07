// ULTRA-NUCLEAR FIREBASE COLLECTION POLYFILL
// Questo polyfill sostituisce COMPLETAMENTE la funzione collection di Firebase

console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Inizializzando polyfill collection()...');

// Verifica che siamo nel browser
if (typeof window !== 'undefined') {
  console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Browser rilevato, implementando polyfill...');

  // Container per le funzioni originali
  window.__firebaseOriginals = window.__firebaseOriginals || {};
  window.__firebasePolyfills = window.__firebasePolyfills || {};

  // Crea il polyfill ultra-sicuro per collection
  const ultraSafeCollection = function(db, collectionName) {
    console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Chiamata collection() intercettata per:', collectionName);
    console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] db type:', typeof db);
    console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] db value:', db);

    // Verifica che db sia valido
    if (!db) {
      console.error('❌❌❌❌❌ [ULTRA-NUCLEAR POLYFILL] Firebase Firestore non inizializzato!');
      throw new Error('Firebase Firestore non inizializzato');
    }

    if (typeof db !== 'object' || !db) {
      console.error('❌❌❌❌❌ [ULTRA-NUCLEAR POLYFILL] Firebase Firestore non è un oggetto valido!');
      throw new Error('Firebase Firestore non è valido');
    }

    try {
      console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Chiamando funzione collection originale...');

      // Se abbiamo la funzione originale, usala
      if (window.__firebaseOriginals.collection) {
        const result = window.__firebaseOriginals.collection(db, collectionName);
        console.log('✅✅✅✅✅ [ULTRA-NUCLEAR POLYFILL] Collection creata con successo per:', collectionName);
        return result;
      } else {
        // Fallback: prova a usare il metodo interno di Firebase
        console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Tentando fallback con db.collection...');
        if (db.collection && typeof db.collection === 'function') {
          const result = db.collection(collectionName);
          console.log('✅✅✅✅✅ [ULTRA-NUCLEAR POLYFILL] Collection creata con fallback per:', collectionName);
          return result;
        } else {
          console.error('❌❌❌❌❌ [ULTRA-NUCLEAR POLYFILL] Nessun metodo collection disponibile!');
          throw new Error('Nessun metodo collection disponibile');
        }
      }
    } catch (error) {
      console.error('❌❌❌❌❌ [ULTRA-NUCLEAR POLYFILL] Errore nella creazione collezione:', error);
      console.error('❌❌❌❌❌ [ULTRA-NUCLEAR POLYFILL] Stack:', error.stack);
      throw error;
    }
  };

  // Salva il polyfill globalmente
  window.__firebasePolyfills.collection = ultraSafeCollection;

  // Sostituisci immediatamente la funzione collection globale
  if (typeof window.collection === 'undefined') {
    window.collection = ultraSafeCollection;
    console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Collection globale installata!');
  }

  // Intercetta i moduli che vengono importati
  const originalDefine = window.define;
  if (typeof originalDefine === 'function') {
    window.define = function(...args) {
      // Intercetta definizioni AMD che potrebbero contenere Firebase
      if (args.length > 0 && typeof args[args.length - 1] === 'function') {
        const originalFactory = args[args.length - 1];
        args[args.length - 1] = function(...deps) {
          const result = originalFactory.apply(this, deps);
          
          // Se il risultato contiene collection, sostituiscila
          if (result && typeof result.collection === 'function') {
            console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Intercettato modulo con collection, sostituendo...');
            window.__firebaseOriginals.collection = result.collection;
            result.collection = ultraSafeCollection;
          }
          
          return result;
        };
      }
      return originalDefine.apply(this, args);
    };
  }

  // Intercetta anche require se disponibile
  if (typeof window.require === 'function') {
    const originalRequire = window.require;
    window.require = function(moduleName) {
      const result = originalRequire.call(this, moduleName);
      
      // Se il modulo contiene collection, sostituiscila
      if (result && typeof result.collection === 'function' && moduleName.includes('firebase')) {
        console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Intercettato require firebase con collection, sostituendo...');
        window.__firebaseOriginals.collection = result.collection;
        result.collection = ultraSafeCollection;
      }
      
      return result;
    };
  }

  console.log('✅✅✅✅✅ [ULTRA-NUCLEAR POLYFILL] Polyfill collection() installato completamente!');
} else {
  console.log('🔥🔥🔥🔥🔥 [ULTRA-NUCLEAR POLYFILL] Ambiente server-side rilevato, polyfill non installato');
}

// Esporta per eventuali import
if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
  module.exports = { ultraSafeCollection: window.__firebasePolyfills.collection };
}
