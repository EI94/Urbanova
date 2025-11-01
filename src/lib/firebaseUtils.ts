import { Firestore, collection } from 'firebase/firestore';

// 🛡️ OS PROTECTION - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/osProtection').catch(() => {});
}

/**
 * Funzione helper per verificare che Firebase sia inizializzato correttamente
 * prima di chiamare collection() per evitare l'errore:
 * "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
 * 
 * USA L'ISTANZA FIREBASE REALE (non Proxy) da firebase.ts
 */
// Cache per l'istanza Firebase REALE
let cachedDb: Firestore | null = null;

export function safeCollection(collectionName: string) {
  console.log('🚀🚀🚀 [safeCollection] CHIAMATA RICEVUTA per collezione:', collectionName);
  console.log('🚀🚀🚀 [safeCollection] cachedDb type:', typeof cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb value:', cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
  
  // 🛡️ GUARD: Se cachedDb non è ancora disponibile, ottieni istanza REALE
  if (!cachedDb) {
    console.warn('⚠️⚠️⚠️ [safeCollection] Firebase Firestore non cached - ottenendo istanza REALE...');
    
    try {
      // Usa getDbLazy() per ottenere istanza REALE invece del Proxy
      const firebaseModule = require('@/lib/firebase');
      
      // Chiama getDbLazy() per ottenere l'istanza reale di Firestore
      if (firebaseModule.getDbLazy && typeof firebaseModule.getDbLazy === 'function') {
        cachedDb = firebaseModule.getDbLazy() as Firestore;
        console.log('✅✅✅ [safeCollection] Firestore REALE ottenuta via getDbLazy()!');
        console.log('✅✅✅ [safeCollection] cachedDb type:', typeof cachedDb);
        console.log('✅✅✅ [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
      } else {
        // FALLBACK: Prova a usare window.__firebaseDb (impostato dopo 100ms in firebase.ts)
        console.warn('⚠️ [safeCollection] getDbLazy non disponibile, provo window.__firebaseDb');
        if (typeof window !== 'undefined' && (window as any).__firebaseDb) {
          cachedDb = (window as any).__firebaseDb as Firestore;
          console.log('✅✅✅ [safeCollection] Firestore REALE ottenuta via window.__firebaseDb!');
        } else {
          throw new Error('Nessuna istanza Firestore disponibile (né getDbLazy né window.__firebaseDb)');
        }
      }
      
      // Verifica che cachedDb sia valido
      if (!cachedDb || typeof cachedDb !== 'object') {
        throw new Error('cachedDb non è un oggetto valido dopo inizializzazione');
      }
      
    } catch (requireError: any) {
      console.error('❌❌❌ [safeCollection] Errore ottenimento Firebase:', requireError);
      console.error('❌❌❌ [safeCollection] requireError message:', requireError.message);
      
      // FALLBACK FINALE: ritorna placeholder per NON crashare
      console.warn('⚠️ [safeCollection] FALLBACK FINALE: ritorno collection placeholder per evitare crash');
      return {
        type: 'collection',
        path: collectionName,
        id: collectionName,
        _placeholder: true,
        _error: requireError.message
      } as any;
    }
  }
  
  try {
    console.log('🚀🚀🚀 [safeCollection] Chiamando collection() Firebase per:', collectionName);
    const result = collection(cachedDb, collectionName);
    console.log('✅✅✅ [safeCollection] Collection REALE creata con successo per:', collectionName);
    return result;
  } catch (error: any) {
    console.error('❌❌❌ [safeCollection] ERRORE nella creazione del riferimento alla collezione:', collectionName, error);
    console.error('❌❌❌ [safeCollection] Error message:', error.message);
    console.error('❌❌❌ [safeCollection] cachedDb era:', cachedDb?.constructor?.name);
    
    // FALLBACK: ritorna placeholder invece di crashare
    console.warn('⚠️ [safeCollection] FALLBACK dopo errore collection(): ritorno placeholder');
    return {
      type: 'collection',
      path: collectionName,
      id: collectionName,
      _placeholder: true,
      _error: error.message
    } as any;
  }
}

/**
 * Verifica che Firebase sia completamente inizializzato
 */
export function isFirebaseReady(): boolean {
  return !!cachedDb && typeof cachedDb === 'object';
}

/**
 * Attende che Firebase sia inizializzato (con timeout)
 */
export function waitForFirebase(timeoutMs: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isFirebaseReady()) {
      resolve();
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isFirebaseReady()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        reject(new Error('Timeout nell\'inizializzazione di Firebase'));
      }
    }, 100);
  });
}
