import { Firestore } from 'firebase-admin/firestore';
import { getFirestoreInstance } from './firebase';

/**
 * Funzione helper per verificare che Firebase Admin sia inizializzato correttamente
 * prima di chiamare collection() per evitare l'errore:
 * "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
 * 
 * Questa versione usa Firebase Admin SDK per i packages server-side
 */
export function safeCollection(collectionName: string) {
  const db = getFirestoreInstance();
  
  if (!db) {
    console.error('❌ Firebase Admin Firestore non inizializzato - impossibile accedere alla collezione:', collectionName);
    throw new Error('Firebase Admin Firestore non inizializzato');
  }
  
  // Verifica che db sia effettivamente un'istanza di Firestore
  if (typeof db !== 'object' || !db) {
    console.error('❌ Firebase Admin Firestore non è un oggetto valido:', typeof db, db);
    throw new Error('Firebase Admin Firestore non è valido');
  }
  
  try {
    // Firebase Admin SDK usa db.collection() invece di collection(db, ...)
    return db.collection(collectionName);
  } catch (error) {
    console.error('❌ Errore nella creazione del riferimento alla collezione:', collectionName, error);
    throw error;
  }
}

/**
 * Verifica che Firebase sia completamente inizializzato
 */
export function isFirebaseReady(): boolean {
  const db = getFirestoreInstance();
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
