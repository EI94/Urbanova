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
console.log('🔥 [FIREBASE INIT] Inizializzando Firebase services...');
console.log('🔥 [FIREBASE INIT] app:', app);

export const auth = getAuth(app);
console.log('🔥 [FIREBASE INIT] auth:', auth);

export const db = getFirestore(app);
console.log('🔥 [FIREBASE INIT] db:', db);
console.log('🔥 [FIREBASE INIT] db type:', typeof db);
console.log('🔥 [FIREBASE INIT] db constructor:', db?.constructor?.name);

export const storage = getStorage(app);
console.log('🔥 [FIREBASE INIT] storage:', storage);

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

  // APPROCCIO NUCLEARE DISABILITATO: Non funziona, causa solo confusione
  // Torniamo al semplice approccio con safeCollection() nei file sorgente
  console.log('🔥 [SIMPLE APPROACH] Approccio nucleare disabilitato, usando solo safeCollection()');

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
