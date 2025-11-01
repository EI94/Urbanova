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
 * USA L'ISTANZA FIREBASE ESISTENTE da firebase.ts invece di inizializzarne una nuova
 */
// Cache per l'istanza Firebase ESISTENTE
let cachedDb: Firestore | null = null;

// Lazy getter per Firebase db da firebase.ts
async function getFirestoreInstance(): Promise<Firestore> {
  if (cachedDb) {
    return cachedDb;
  }
  
  console.log('🔄 [safeCollection] Importando istanza Firebase esistente...');
  
  try {
    // Import dinamico per evitare TDZ
    const { db } = await import('@/lib/firebase');
    
    // Attendi che db sia disponibile (potrebbe essere un Proxy lazy)
    if (typeof db === 'object' && db !== null) {
      cachedDb = db as Firestore;
      console.log('✅ [safeCollection] Istanza Firebase esistente caricata:', cachedDb?.constructor?.name);
      return cachedDb;
    }
    
    throw new Error('Istanza Firebase non disponibile');
  } catch (error: any) {
    console.error('❌ [safeCollection] Errore caricamento Firebase:', error);
    throw error;
  }
}

export function safeCollection(collectionName: string) {
  console.log('🚀🚀🚀 [safeCollection] CHIAMATA RICEVUTA per collezione:', collectionName);
  console.log('🚀🚀🚀 [safeCollection] cachedDb type:', typeof cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb value:', cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
  console.log('🚀🚀🚀 [safeCollection] cachedDb === null:', cachedDb === null);
  console.log('🚀🚀🚀 [safeCollection] cachedDb === undefined:', cachedDb === undefined);
  console.log('🚀🚀🚀 [safeCollection] Stack trace chiamata:', new Error().stack?.split('\n').slice(0, 5).join('\n'));
  
  // 🛡️ GUARD: Se cachedDb non è ancora disponibile, usa import sincrono
  if (!cachedDb) {
    console.warn('⚠️⚠️⚠️ [safeCollection] Firebase Firestore non cached - usando import sincrono...');
    
    try {
      // Import sincrono (require) per evitare async in funzione sync
      const firebaseModule = require('@/lib/firebase');
      cachedDb = firebaseModule.db as Firestore;
      
      console.log('✅✅✅ [safeCollection] Firebase caricato con successo via require!');
      console.log('✅✅✅ [safeCollection] cachedDb type:', typeof cachedDb);
      console.log('✅✅✅ [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
      
      // Verifica che cachedDb sia valido
      if (!cachedDb || typeof cachedDb !== 'object') {
        throw new Error('cachedDb non è un oggetto valido dopo require');
      }
      
    } catch (requireError: any) {
      console.error('❌❌❌ [safeCollection] Errore require Firebase:', requireError);
      console.error('❌❌❌ [safeCollection] requireError message:', requireError.message);
      
      // FALLBACK: ritorna una collection placeholder che NON causa crash
      console.warn('⚠️ [safeCollection] FALLBACK: ritorno collection placeholder per evitare crash');
      // HACK: ritorna un oggetto che assomiglia a una CollectionReference ma è vuoto
      return {
        type: 'collection',
        path: collectionName,
        id: collectionName,
        _placeholder: true
      } as any;
    }
  }
  
  // Verifica che cachedDb sia effettivamente un'istanza di Firestore
  if (typeof cachedDb !== 'object' || !cachedDb) {
    console.error('❌❌❌ [safeCollection] Firebase Firestore cached non è un oggetto valido:', typeof cachedDb, cachedDb);
    // FALLBACK: ritorna placeholder invece di crashare
    console.warn('⚠️ [safeCollection] FALLBACK: ritorno collection placeholder per evitare crash');
    return {
      type: 'collection',
      path: collectionName,
      id: collectionName,
      _placeholder: true
    } as any;
  }
  
  try {
    console.log('🚀🚀🚀 [safeCollection] Chiamando collection() Firebase per:', collectionName);
    const result = collection(cachedDb, collectionName);
    console.log('✅✅✅ [safeCollection] Collection REALE creata con successo per:', collectionName);
    return result;
  } catch (error: any) {
    console.error('❌❌❌ [safeCollection] ERRORE nella creazione del riferimento alla collezione:', collectionName, error);
    console.error('❌❌❌ [safeCollection] Error message:', error.message);
    
    // FALLBACK: ritorna placeholder invece di crashare
    console.warn('⚠️ [safeCollection] FALLBACK dopo errore: ritorno collection placeholder');
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
