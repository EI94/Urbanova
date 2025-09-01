'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.storage = exports.db = exports.auth = void 0;
// Import the functions you need from the SDKs you need
const app_1 = require('firebase/app');
const auth_1 = require('firebase/auth');
const firestore_1 = require('firebase/firestore');
const storage_1 = require('firebase/storage');
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
const app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
// Configurazione per gestire errori di connessione
if (typeof window !== 'undefined') {
  // Gestione errori di connessione Firebase
  const handleFirebaseError = error => {
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
exports.default = app;
//# sourceMappingURL=firebase.js.map
