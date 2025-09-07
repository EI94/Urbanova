// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAxex9T9insV0Y5-puRZc6y-QQhn1KLXD8',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'urbanova-b623e.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'urbanova-b623e',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'urbanova-b623e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '599892072352',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:599892072352:web:34553ac67eb39d2b9ab6c5',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-QHNDTK9P3L',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Verifica di sicurezza per l'inizializzazione di Firebase
if (typeof window !== 'undefined') {
  // Solo nel browser, verifica che db sia inizializzato
  if (!db) {
    console.error('❌ Firebase Firestore non inizializzato correttamente');
  } else {
    console.log('✅ Firebase Firestore inizializzato correttamente');
    
    // ESPORTA istanze Firebase globalmente per il wrapper ultra-nucleare
    (window as any).__firebaseApp = app;
    (window as any).__firebaseDb = db;
    (window as any).__firebaseAuth = auth;
    (window as any).__firebaseStorage = storage;
    console.log('🔥 [FIREBASE GLOBAL] Istanze Firebase esportate globalmente per wrapper ultra-nucleare');
  }
}

// Configurazione per gestire errori di connessione
if (typeof window !== 'undefined') {
  // MEGA DEBUG: Cattura TUTTI gli errori Firebase
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('collection')) {
      console.error('🚨 [FIREBASE ERROR CAUGHT] Firebase collection error detected!');
      console.error('🚨 [FIREBASE ERROR] Error:', event.error);
      console.error('🚨 [FIREBASE ERROR] Stack:', event.error.stack);
      console.error('🚨 [FIREBASE ERROR] Source:', event.filename, event.lineno, event.colno);
    }
  });

  // APPROCCIO NUCLEARE + SUPER-NUCLEARE + MEGA-SUPER-NUCLEARE: Intercetta TUTTE le chiamate a collection() globalmente
  console.log('🔥 [NUCLEAR APPROACH] Implementando intercettazione globale collection()...');
  
  // Verifica se l'intercettazione webpack è attiva
  if ((window as any).__FIREBASE_COLLECTION_INTERCEPTOR__) {
    console.log('🔥🔥🔥 [SUPER-NUCLEAR DETECTED] Intercettazione webpack attiva!');
  }
  
  // Verifica se l'intercettazione mega-super-nucleare è attiva
  if ((window as any).__megaSafeCollectionWrapper) {
    console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR DETECTED] Intercettazione mega-super-nucleare attiva!');
  }
  
  // Importa la funzione collection originale in modo dinamico
  import('firebase/firestore').then((firestore) => {
    console.log('🔥 [NUCLEAR APPROACH] Firebase/firestore importato:', firestore);
    
    const originalCollection = firestore.collection;
    console.log('🔥 [NUCLEAR APPROACH] Funzione collection originale:', originalCollection);
    
    // Salva la funzione originale per l'intercettazione webpack
    (window as any).__originalFirebaseCollection = originalCollection;
    console.log('🔥🔥🔥 [SUPER-NUCLEAR BRIDGE] Funzione originale salvata per webpack!');
    
    // Crea un wrapper che forza sempre l'uso sicuro
    const safeCollectionWrapper = (db: any, collectionName: string) => {
      console.log('🔥 [NUCLEAR WRAPPER] Intercettata chiamata collection() per:', collectionName);
      console.log('🔥 [NUCLEAR WRAPPER] db type:', typeof db);
      console.log('🔥 [NUCLEAR WRAPPER] db value:', db);
      
      if (!db) {
        console.error('❌ [NUCLEAR WRAPPER] Firebase Firestore non inizializzato!');
        throw new Error('Firebase Firestore non inizializzato');
      }
      
      try {
        console.log('🔥 [NUCLEAR WRAPPER] Chiamando collection() originale...');
        const result = originalCollection(db, collectionName);
        console.log('✅ [NUCLEAR WRAPPER] Collection creata con successo per:', collectionName);
        return result;
      } catch (error) {
        console.error('❌ [NUCLEAR WRAPPER] Errore nella creazione collezione:', error);
        throw error;
      }
    };
    
    // Sostituisci la funzione originale nel modulo
    firestore.collection = safeCollectionWrapper;
    
    // Sostituisci anche globalmente
    (window as any).collection = safeCollectionWrapper;
    
    // Se l'intercettazione mega-super-nucleare è attiva, usa quella (priorità massima)
    if ((window as any).__megaSafeCollectionWrapper) {
      console.log('🔥🔥🔥🔥 [MEGA-SUPER-NUCLEAR BRIDGE] Usando wrapper mega-super-nucleare!');
      firestore.collection = (window as any).__megaSafeCollectionWrapper;
      (window as any).collection = (window as any).__megaSafeCollectionWrapper;
    }
    // Altrimenti se l'intercettazione webpack è attiva, usa quella
    else if ((window as any).__safeCollectionWrapper) {
      console.log('🔥🔥🔥 [SUPER-NUCLEAR BRIDGE] Usando wrapper webpack!');
      firestore.collection = (window as any).__safeCollectionWrapper;
      (window as any).collection = (window as any).__safeCollectionWrapper;
    }
    
    console.log('✅ [NUCLEAR APPROACH] Intercettazione globale collection() attivata!');
  }).catch((error) => {
    console.error('❌ [NUCLEAR APPROACH] Errore nell\'importazione Firebase:', error);
  });

  // Gestione errori di connessione Firebase
  const handleFirebaseError = (error: any) => {
    console.warn('⚠️ Firebase connection issue:', error);
    // Non bloccare l'app per errori di connessione
  };

  // Intercetta errori di rete Firebase
  window.addEventListener('online', () => {
    console.log('✅ Connessione ripristinata');
  });

  window.addEventListener('offline', () => {
    console.warn('⚠️ Connessione persa - modalità offline');
  });
}

export default app;
