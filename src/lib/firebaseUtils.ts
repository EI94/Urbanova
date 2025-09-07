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
  console.log('🚀🚀🚀 [safeCollection] db === null:', db === null);
  console.log('🚀🚀🚀 [safeCollection] db === undefined:', db === undefined);
  console.log('🚀🚀🚀 [safeCollection] Stack trace chiamata:', new Error().stack);
  
  if (!db) {
    console.warn('⚠️⚠️⚠️ [safeCollection] Firebase Firestore non inizializzato - tentativo di reinizializzazione...');
    
    try {
      // Import dinamico per evitare problemi di inizializzazione
      const { getFirestore } = require('firebase/firestore');
      const { initializeApp } = require('firebase/app');
      
      // Configurazione Firebase
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAxex9T9insV0Y5-puRZc6y-QQhn1KLXD8',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'urbanova-b623e.firebaseapp.com',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'urbanova-b623e',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'urbanova-b623e.firebasestorage.app',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '599892072352',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:599892072352:web:34553ac67eb39d2b9ab6c5',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-QHNDTK9P3L',
      };
      
      // Reinizializza Firebase
      const app = initializeApp(firebaseConfig);
      const newDb = getFirestore(app);
      
      console.log('✅✅✅ [safeCollection] Firebase reinizializzato con successo!');
      console.log('✅✅✅ [safeCollection] newDb:', newDb);
      
      // Usa il nuovo db
      const collectionRef = collection(newDb, collectionName);
      console.log('✅✅✅ [safeCollection] Collezione creata con successo dopo reinizializzazione:', collectionName);
      return collectionRef;
      
    } catch (reinitError) {
      console.error('❌❌❌ [safeCollection] Errore durante la reinizializzazione Firebase:', reinitError);
      throw new Error(`Firebase Firestore non inizializzato e reinizializzazione fallita per ${collectionName}`);
    }
  }
  
  // Verifica che db sia effettivamente un'istanza di Firestore
  if (typeof db !== 'object' || !db) {
    console.error('❌❌❌ [safeCollection] Firebase Firestore non è un oggetto valido:', typeof db, db);
    throw new Error('Firebase Firestore non è valido');
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
