// ========================================
// FIREBASE INITIALIZATION - VERSIONE PULITA E PRODUCTION-READY
// ========================================
// Inizializzazione immediata lato client, null lato server

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Carica protezioni solo lato client
if (typeof window !== 'undefined') {
  import('@/lib/globalErrorInterceptor').catch(() => {});
  import('@/lib/osProtection').catch(() => {});
}

// ========================================
// CONFIGURAZIONE
// ========================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAxex9T9insV0Y5-puRZc6y-QQhn1KLXD8',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'urbanova-b623e.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'urbanova-b623e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'urbanova-b623e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '599892072352',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:599892072352:web:34553ac67eb39d2b9ab6c5',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-QHNDTK9P3L',
};

// ========================================
// INIZIALIZZAZIONE IMMEDIATA LATO CLIENT
// ========================================
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== 'undefined') {
  console.log('🔥 [FIREBASE] Inizializzazione immediata lato client...');
  
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('✅ [FIREBASE] Inizializzato:', {
      app: !!app,
      auth: !!auth,
      db: !!db,
      dbType: db?.type,
      dbConstructor: db?.constructor?.name,
      storage: !!storage,
    });
    
    // Export globale per debug
    (window as any).__FIREBASE_APP = app;
    (window as any).__FIREBASE_AUTH = auth;
    (window as any).__FIREBASE_DB = db;
    (window as any).__FIREBASE_STORAGE = storage;
  } catch (error) {
    console.error('❌ [FIREBASE] Errore inizializzazione:', error);
  }
} else {
  console.log('⚠️ [FIREBASE] Server-side rendering - istanze null');
}

// ========================================
// EXPORT ISTANZE REALI - NO PROXY, NO GETTER
// ========================================
export { app, auth, db, storage };

// Export anche come funzioni per compatibilità con codice esistente
export const getAuthInstance = () => auth;
export const getDbInstance = () => db;
export const getStorageInstance = () => storage;

// Export default
export default app;

console.log('✅ [FIREBASE] Modulo caricato, istanze:', {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
});
