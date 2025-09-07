import { Firestore, collection, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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
  
  // Se non abbiamo un db cached, inizializziamo Firebase
  if (!cachedDb || cachedDb === undefined || cachedDb === null) {
    console.warn('⚠️⚠️⚠️ [safeCollection] Firebase Firestore non cached - inizializzazione completa...');
    console.warn('⚠️⚠️⚠️ [safeCollection] cachedDb value:', cachedDb);
    console.warn('⚠️⚠️⚠️ [safeCollection] cachedDb type:', typeof cachedDb);
    
    try {
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
      
      console.log('🚀🚀🚀 [safeCollection] Inizializzando Firebase con config:', firebaseConfig);
      
      // Inizializza Firebase completamente
      cachedApp = initializeApp(firebaseConfig);
      cachedDb = getFirestore(cachedApp);
      
      console.log('✅✅✅ [safeCollection] Firebase inizializzato con successo!');
      console.log('✅✅✅ [safeCollection] cachedDb type:', typeof cachedDb);
      console.log('✅✅✅ [safeCollection] cachedDb constructor:', cachedDb?.constructor?.name);
      console.log('✅✅✅ [safeCollection] cachedDb value:', cachedDb);
      
      // Verifica che cachedDb sia valido
      if (!cachedDb || typeof cachedDb !== 'object') {
        throw new Error('cachedDb non è un oggetto valido dopo inizializzazione');
      }
      
    } catch (initError: any) {
      console.error('❌❌❌ [safeCollection] Errore durante l\'inizializzazione Firebase:', initError);
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
