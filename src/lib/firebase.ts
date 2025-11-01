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

// NON inizializzare subito - lascia che i Proxy inizializzino al primo accesso
// Questo evita race condition e TDZ durante module evaluation

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

// 🔥 EXPORT LAZY - SOLUZIONE DEFINITIVA: Proxy creati immediatamente ma NON accedono istanze fino a quando necessario
// I Proxy sono creati durante l'import ma NON chiamano getAuthInstance/getDbInstance/getStorageInstance
// fino a quando una proprietà viene effettivamente accessata

// Cache per le istanze (solo quando effettivamente necessarie)
let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;
let _storage: ReturnType<typeof getStorage> | null = null;

// Funzioni helper che inizializzano SOLO quando chiamate (non durante l'import)
const getAuthLazy = (): ReturnType<typeof getAuth> => {
  if (!_auth) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase Auth non disponibile lato server');
    }
    const instance = getAuthInstance();
    if (!instance) {
      throw new Error('Firebase Auth non inizializzato. Assicurati che window sia disponibile.');
    }
    _auth = instance;
  }
  return _auth;
};

const getDbLazy = (): ReturnType<typeof getFirestore> => {
  if (!_db) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase Firestore non disponibile lato server');
    }
    const instance = getDbInstance();
    if (!instance) {
      throw new Error('Firebase Firestore non inizializzato. Assicurati che window sia disponibile.');
    }
    _db = instance;
  }
  return _db;
};

const getStorageLazy = (): ReturnType<typeof getStorage> => {
  if (!_storage) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase Storage non disponibile lato server');
    }
    const instance = getStorageInstance();
    if (!instance) {
      throw new Error('Firebase Storage non inizializzato. Assicurati che window sia disponibile.');
    }
    _storage = instance;
  }
  return _storage;
};

// Export LAZY: I Proxy vengono creati solo quando window è disponibile
// Questo evita completamente l'esecuzione durante l'import del modulo
let _authProxy: ReturnType<typeof getAuth> | null = null;
let _dbProxy: ReturnType<typeof getFirestore> | null = null;
let _storageProxy: ReturnType<typeof getStorage> | null = null;

const createAuthProxy = (): ReturnType<typeof getAuth> => {
  if (!_authProxy) {
    _authProxy = new Proxy({} as ReturnType<typeof getAuth>, {
      get(target, prop) {
        const instance = getAuthLazy();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
      }
    });
  }
  return _authProxy;
};

const createDbProxy = (): ReturnType<typeof getFirestore> => {
  if (!_dbProxy) {
    _dbProxy = new Proxy({} as ReturnType<typeof getFirestore>, {
      get(target, prop) {
        const instance = getDbLazy();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
      }
    });
  }
  return _dbProxy;
};

const createStorageProxy = (): ReturnType<typeof getStorage> => {
  if (!_storageProxy) {
    _storageProxy = new Proxy({} as ReturnType<typeof getStorage>, {
      get(target, prop) {
        const instance = getStorageLazy();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
      }
    });
  }
  return _storageProxy;
};

// Export TOTALLY LAZY: Oggetti vuoti che vengono sostituiti con Proxy SOLO quando accessati
// NESSUNA esecuzione durante l'import - neanche new Proxy()

const authExport = {} as ReturnType<typeof getAuth>;
const dbExport = {} as ReturnType<typeof getFirestore>;
const storageExport = {} as ReturnType<typeof getStorage>;

// Crea Proxy IMMEDIATAMENTE se window è disponibile (nessun setTimeout per evitare race condition)
if (typeof window !== 'undefined') {
  try {
    // Crea Proxy che delegano alle funzioni createAuthProxy/createDbProxy/createStorageProxy
    const authProxy = new Proxy({} as ReturnType<typeof getAuth>, {
      get(target, prop) {
        return (createAuthProxy() as any)[prop];
      }
    });
    
    const dbProxy = new Proxy({} as ReturnType<typeof getFirestore>, {
      get(target, prop) {
        return (createDbProxy() as any)[prop];
      }
    });
    
    const storageProxy = new Proxy({} as ReturnType<typeof getStorage>, {
      get(target, prop) {
        return (createStorageProxy() as any)[prop];
      }
    });
    
    // Sostituisci i prototype degli oggetti export con i Proxy
    Object.setPrototypeOf(authExport, authProxy);
    Object.setPrototypeOf(dbExport, dbProxy);
    Object.setPrototypeOf(storageExport, storageProxy);
  } catch (e) {
    console.warn('Firebase proxy init error:', e);
  }
}

console.log(`🔍 [TDZ DEBUG] firebase.ts - Export auth/db/storage valutato, timestamp: ${Date.now()}, typeof window: ${typeof window}, stack:`, new Error().stack?.split('\n').slice(1, 5).join('\n'));

export const auth = authExport;
export const db = dbExport;
export const storage = storageExport;

console.log(`🔍 [TDZ DEBUG] firebase.ts - Export auth/db/storage completato, timestamp: ${Date.now()}`);

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
