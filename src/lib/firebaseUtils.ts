import { Firestore, collection } from 'firebase/firestore';

/**
 * Funzione helper per verificare che Firebase sia inizializzato correttamente
 * prima di chiamare collection() per evitare l'errore:
 * "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
 */
// Cache globale per l'istanza Firebase
let cachedDb: Firestore | null = null;
let cachedApp: any = null;

export function safeCollection(collectionName: string) {
  console.log('🚀🚀🚀 [safeCollection] CHIAMATA RICEVUTA per collezione:', collectionName);
  console.log('🚀🚀🚀 [safeCollection] cachedDb type:', typeof cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb value:', cachedDb);
  console.log('🚀🚀🚀 [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
  console.log('🚀🚀🚀 [safeCollection] cachedDb === null:', cachedDb === null);
  console.log('🚀🚀🚀 [safeCollection] cachedDb === undefined:', cachedDb === undefined);
  console.log('🚀🚀🚀 [safeCollection] Stack trace chiamata:', new Error().stack);
  
  // CHIRURGICO: Usa sempre l'istanza Firebase principale da firebase.ts
  if (!cachedDb || cachedDb === undefined || cachedDb === null) {
    console.warn('⚠️⚠️⚠️ [safeCollection] Firebase Firestore non cached - usando istanza principale...');
    console.warn('⚠️⚠️⚠️ [safeCollection] cachedDb value:', cachedDb);
    console.warn('⚠️⚠️⚠️ [safeCollection] cachedDb type:', typeof cachedDb);
    
    try {
      // Importa l'istanza principale da firebase.ts
      const { db } = require('./firebase');
      cachedDb = db;
      
      console.log('✅✅✅ [safeCollection] Firebase istanza principale caricata!');
      console.log('✅✅✅ [safeCollection] cachedDb type:', typeof cachedDb);
      console.log('✅✅✅ [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
      console.log('✅✅✅ [safeCollection] cachedDb value:', cachedDb);
      
      // Verifica che cachedDb sia valido
      if (!cachedDb || typeof cachedDb !== 'object') {
        throw new Error('cachedDb non è un oggetto valido dopo caricamento istanza principale');
      }
      
    } catch (initError: any) {
      console.error('❌❌❌ [safeCollection] Errore caricamento istanza principale Firebase:', initError);
      console.error('❌❌❌ [safeCollection] initError message:', initError.message);
      console.error('❌❌❌ [safeCollection] initError stack:', initError.stack);
      throw new Error(`Firebase Firestore non inizializzato per ${collectionName}: ${initError.message}`);
    }
  }
  
  // Verifica che cachedDb sia effettivamente un'istanza di Firestore
  if (typeof cachedDb !== 'object' || !cachedDb) {
    console.error('❌❌❌ [safeCollection] Firebase Firestore cached non è un oggetto valido:', typeof cachedDb, cachedDb);
    throw new Error('Firebase Firestore cached non è valido');
  }
  
  try {
    console.log('🚀🚀🚀 [safeCollection] Chiamando collection() Firebase per:', collectionName);
    const result = collection(cachedDb, collectionName);
    console.log('✅✅✅ [safeCollection] Collection REALE creata con successo per:', collectionName);
    return result;
  } catch (error: any) {
    console.error('❌❌❌ [safeCollection] ERRORE nella creazione del riferimento alla collezione:', collectionName, error);
    console.error('❌❌❌ [safeCollection] Error message:', error.message);
    console.error('❌❌❌ [safeCollection] Stack trace:', error.stack);
    
    // RILANCIA l'errore per debugging
    throw new Error(`safeCollection fallita per ${collectionName}: ${error.message}`);
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
