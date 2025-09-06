import { Firestore, collection } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Funzione helper per verificare che Firebase sia inizializzato correttamente
 * prima di chiamare collection() per evitare l'errore:
 * "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
 */
export function safeCollection(collectionName: string) {
  console.log('🔍 [safeCollection] Tentativo accesso collezione:', collectionName);
  console.log('🔍 [safeCollection] db type:', typeof db);
  console.log('🔍 [safeCollection] db value:', db);
  
  if (!db) {
    console.error('❌ Firebase Firestore non inizializzato - impossibile accedere alla collezione:', collectionName);
    throw new Error('Firebase Firestore non inizializzato');
  }
  
  // Verifica che db sia effettivamente un'istanza di Firestore
  if (typeof db !== 'object' || !db) {
    console.error('❌ Firebase Firestore non è un oggetto valido:', typeof db, db);
    throw new Error('Firebase Firestore non è valido');
  }
  
  try {
    console.log('🔍 [safeCollection] Calling collection() for:', collectionName);
    const result = collection(db, collectionName);
    console.log('✅ [safeCollection] Collection created successfully for:', collectionName);
    return result;
  } catch (error) {
    console.error('❌ [safeCollection] Errore nella creazione del riferimento alla collezione:', collectionName, error);
    console.error('❌ [safeCollection] Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Verifica che Firebase sia completamente inizializzato
 */
export function isFirebaseReady(): boolean {
  return !!db && typeof db === 'object';
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
