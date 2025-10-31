// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// 🛡️ GLOBAL ERROR INTERCEPTOR - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/globalErrorInterceptor').catch(() => {});
}
// 🛡️ OS PROTECTION - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/osProtection').catch(() => {});
}

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

// Initialize Firebase - Solo lato client per evitare TDZ
let app: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ [FIREBASE INIT] Tentativo di inizializzazione lato server, skip');
    return;
  }
  
  if (app) {
    return; // Già inizializzato
  }
  
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  console.log('🔥 [FIREBASE INIT] Inizializzando Firebase services...');
  console.log('🔥 [FIREBASE INIT] app:', app);
  
  authInstance = getAuth(app);
  console.log('🔥 [FIREBASE INIT] auth:', authInstance);
  
  dbInstance = getFirestore(app);
  console.log('🔥 [FIREBASE INIT] db:', dbInstance);
  console.log('🔥 [FIREBASE INIT] db type:', typeof dbInstance);
  console.log('🔥 [FIREBASE INIT] db constructor:', dbInstance?.constructor?.name);
  
  storageInstance = getStorage(app);
  console.log('🔥 [FIREBASE INIT] storage:', storageInstance);
};

// Inizializza Firebase immediatamente se siamo lato client (ma solo dopo window è disponibile)
if (typeof window !== 'undefined') {
  // Usa setTimeout per ritardare dopo che tutti i moduli sono stati inizializzati
  setTimeout(() => {
    initializeFirebase();
  }, 0);
}

// Export getters che inizializzano se necessario
export const getAuthInstance = () => {
  if (typeof window !== 'undefined' && !authInstance) {
    initializeFirebase();
  }
  return authInstance;
};

export const getDbInstance = () => {
  if (typeof window !== 'undefined' && !dbInstance) {
    initializeFirebase();
  }
  return dbInstance;
};

export const getStorageInstance = () => {
  if (typeof window !== 'undefined' && !storageInstance) {
    initializeFirebase();
  }
  return storageInstance;
};

// Export lazy per evitare TDZ - SOLUZIONE DEFINITIVA
// NON creare Proxy a livello di modulo - solo funzioni getter che vengono chiamate quando necessario
// Gli export sono funzioni che restituiscono le istanze solo quando chiamate

// Helper per ottenere istanze direttamente (senza Proxy intermedi)
const getAuthDirect = (): ReturnType<typeof getAuth> => {
  const instance = getAuthInstance();
  if (!instance) {
    throw new Error('Firebase Auth non inizializzato. Assicurati che window sia disponibile.');
  }
  return instance;
};

const getDbDirect = (): ReturnType<typeof getFirestore> => {
  const instance = getDbInstance();
  if (!instance) {
    throw new Error('Firebase Firestore non inizializzato. Assicurati che window sia disponibile.');
  }
  return instance;
};

const getStorageDirect = (): ReturnType<typeof getStorage> => {
  const instance = getStorageInstance();
  if (!instance) {
    throw new Error('Firebase Storage non inizializzato. Assicurati che window sia disponibile.');
  }
  return instance;
};

// Export usando getter properties che NON vengono eseguiti durante l'import del modulo
// Usiamo un oggetto dummy e definiamo le proprietà solo quando window è disponibile
const firebaseExports = {} as {
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
};

// Definisci le proprietà solo quando window è disponibile e dopo un delay
if (typeof window !== 'undefined') {
  // Usa requestAnimationFrame per assicurarsi che tutto sia pronto
  requestAnimationFrame(() => {
    Object.defineProperty(firebaseExports, 'auth', {
      get: getAuthDirect,
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(firebaseExports, 'db', {
      get: getDbDirect,
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(firebaseExports, 'storage', {
      get: getStorageDirect,
      enumerable: true,
      configurable: true
    });
  });
}

// Export - queste NON vengono eseguite durante l'import, solo le proprietà vengono definite dopo
// Webpack/Next.js vedrà queste come proprietà di un oggetto, non come esecuzione immediata
export const auth = firebaseExports.auth;
export const db = firebaseExports.db;
export const storage = firebaseExports.storage;

// Configurazione per gestire errori di connessione - solo lato client e dopo init
if (typeof window !== 'undefined') {
  // Ritarda la configurazione errori fino a quando Firebase è inizializzato
  setTimeout(() => {
    // Verifica di sicurezza per l'inizializzazione di Firebase
    const dbInstance = getDbInstance();
    if (!dbInstance) {
      console.error('❌ Firebase Firestore non inizializzato correttamente');
    } else {
      console.log('✅ Firebase Firestore inizializzato correttamente');
      
      // ESPORTA istanze Firebase globalmente per il wrapper ultra-nucleare
      (window as any).__firebaseApp = app;
      (window as any).__firebaseDb = dbInstance;
      (window as any).__firebaseAuth = getAuthInstance();
      (window as any).__firebaseStorage = getStorageInstance();
      console.log('🔥 [FIREBASE GLOBAL] Istanze Firebase esportate globalmente per wrapper ultra-nucleare');
    }
  }, 100);
  
  // Configurazione per gestire errori di connessione
  // Gestione errori Firebase più robusta
  window.addEventListener('error', (event) => {
    const errorMessage = event.error?.message || event.message || 'Unknown error';
    
    // CHIRURGICO: CATTURA ERRORE SPECIFICO AUTH DESTRUCTURING
    if (errorMessage.includes('Cannot destructure property') && 
        errorMessage.includes('auth')) {
      console.error('🚨 [AUTH DESTRUCTURING] ERRORE CRITICO IDENTIFICATO:', {
        message: errorMessage,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        componentStack: event.error?.componentStack
      });
      
      // Prova a identificare il componente
      const stack = event.error?.stack || '';
      const componentMatch = stack.match(/at\s+(\w+)/g);
      if (componentMatch) {
        console.error('🎯 [AUTH DESTRUCTURING] POSSIBILI COMPONENTI COINVOLTI:', componentMatch);
      }
      
      // NON PREVENIRE IL CRASH - VOGLIAMO VEDERE L'ERRORE COMPLETO
    }
    
    // Ignora errori Firebase 400 che non bloccano l'app
    if (event.error && event.error.message && 
        (event.error.message.includes('collection') || 
         event.error.message.includes('firestore') ||
         event.error.message.includes('400') ||
         event.error.message.includes('permission-denied') ||
         event.error.message.includes('Write/channel'))) {
      console.warn('⚠️ [FIREBASE ERROR] Firebase connection issue (non critico):', event.error.message);
      // Non bloccare l'app per errori di connessione Firebase
      event.preventDefault();
      return false;
    }
    return;
  });

  // Intercetta errori di rete Firebase
  window.addEventListener('online', () => {
    console.log('✅ Connessione ripristinata');
  });

  window.addEventListener('offline', () => {
    console.warn('⚠️ Connessione persa - modalità offline');
  });

  // Gestione errori Promise non gestiti
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('firestore') || 
         event.reason.message.includes('400') ||
         event.reason.message.includes('permission-denied') ||
         event.reason.message.includes('Write/channel'))) {
      console.warn('⚠️ [FIREBASE PROMISE ERROR] Firebase promise rejected (non critico):', event.reason.message);
      event.preventDefault();
      return false;
    }
    return;
  });
}

export default app;
