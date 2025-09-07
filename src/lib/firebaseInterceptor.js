// MEGA-SUPER-NUCLEAR FIREBASE INTERCEPTOR
// Questo file deve essere caricato PRIMA di qualsiasi altro codice Firebase

console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR] Inizializzando intercettore Firebase globale...');

// Verifica se siamo nel browser
if (typeof window !== 'undefined') {
  console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR] Browser rilevato, implementando intercettazione globale...');
  
  // Salva le funzioni originali
  window.__originalFirebaseCollection = null;
  window.__originalFirebaseModules = {};
  
  // Crea il wrapper mega-sicuro
  window.__megaSafeCollectionWrapper = function(db, collectionName) {
    console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR WRAPPER] Intercettata chiamata collection() per:', collectionName);
    console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR WRAPPER] db type:', typeof db);
    console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR WRAPPER] db value:', db);
    
    // Verifica che db sia inizializzato
    if (!db) {
      console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR WRAPPER] Firebase Firestore non inizializzato!');
      throw new Error('Firebase Firestore non inizializzato');
    }
    
    if (typeof db !== 'object' || !db) {
      console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR WRAPPER] Firebase Firestore non è un oggetto valido!');
      throw new Error('Firebase Firestore non è valido');
    }
    
    try {
      console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR WRAPPER] Chiamando funzione collection originale...');
      
      // Se abbiamo la funzione originale, usala
      if (window.__originalFirebaseCollection) {
        const result = window.__originalFirebaseCollection(db, collectionName);
        console.log('✅✅✅✅ [MEGA-SUPER-NUCLEAR WRAPPER] Collection creata con successo per:', collectionName);
        return result;
      } else {
        console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR WRAPPER] Funzione collection originale non trovata!');
        throw new Error('Funzione collection originale non trovata');
      }
    } catch (error) {
      console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR WRAPPER] Errore nella creazione collezione:', error);
      console.error('❌❌❌❌ [MEGA-SUPER-NUCLEAR WRAPPER] Stack:', error.stack);
      throw error;
    }
  };
  
  // Intercetta gli import dinamici di Firebase
  const originalImport = window.import || (() => {});
  window.import = function(moduleName) {
    console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR IMPORT] Intercettato import dinamico:', moduleName);
    
    if (moduleName && moduleName.includes('firebase/firestore')) {
      console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR IMPORT] Rilevato import Firebase Firestore!');
      
      return originalImport.call(this, moduleName).then((module) => {
        console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR IMPORT] Modulo Firebase caricato, intercettando collection...');
        
        if (module.collection) {
          // Salva la funzione originale
          window.__originalFirebaseCollection = module.collection;
          console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR IMPORT] Funzione collection originale salvata!');
          
          // Sostituisci con il wrapper
          module.collection = window.__megaSafeCollectionWrapper;
          console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR IMPORT] Funzione collection sostituita con wrapper!');
        }
        
        return module;
      });
    }
    
    return originalImport.call(this, moduleName);
  };
  
  // Intercetta anche require se disponibile
  if (typeof require !== 'undefined') {
    const originalRequire = require;
    window.require = function(moduleName) {
      console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR REQUIRE] Intercettato require:', moduleName);
      
      const module = originalRequire.call(this, moduleName);
      
      if (moduleName && moduleName.includes('firebase/firestore') && module.collection) {
        console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR REQUIRE] Intercettando collection in require...');
        
        // Salva la funzione originale
        window.__originalFirebaseCollection = module.collection;
        
        // Sostituisci con il wrapper
        module.collection = window.__megaSafeCollectionWrapper;
      }
      
      return module;
    };
  }
  
  console.log('✅✅✅✅ [MEGA-SUPER-NUCLEAR] Intercettore globale Firebase installato!');
}

// Esporta per eventuali import
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { megaSafeCollectionWrapper: window.__megaSafeCollectionWrapper };
}
