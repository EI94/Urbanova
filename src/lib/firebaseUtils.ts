import { Firestore, collection } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Funzione helper per verificare che Firebase sia inizializzato correttamente
 * prima di chiamare collection() per evitare l'errore:
 * "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
 */
export function safeCollection(collectionName: string) {
  console.log('🚀🚀🚀 [safeCollection] CHIAMATA RICEVUTA per collezione:', collectionName);
  console.log('🚀🚀🚀 [safeCollection] db type:', typeof db);
  console.log('🚀🚀🚀 [safeCollection] db value:', db);
  console.log('🚀🚀🚀 [safeCollection] db constructor:', db?.constructor?.name);
  
  // CHIRURGICO: Usa direttamente l'istanza Firebase principale da firebase.ts
  if (!db || typeof db !== 'object') {
    console.error('❌❌❌ [safeCollection] Firebase Firestore non inizializzato:', typeof db, db);
    throw new Error(`Firebase Firestore non inizializzato per ${collectionName}`);
  }
  
  try {
    console.log('🚀🚀🚀 [safeCollection] Chiamando collection() Firebase per:', collectionName);
    const result = collection(db, collectionName);
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
