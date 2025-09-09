// Script per creare un utente di test
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBw7cG6hY7v8x9z0a1b2c3d4e5f6g7h8",
  authDomain: "urbanova-b623e.firebaseapp.com",
  projectId: "urbanova-b623e",
  storageBucket: "urbanova-b623e.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createTestUser() {
  try {
    console.log('🔄 Creazione utente di test...');
    
    const email = 'pierpaolo.laurito@gmail.com';
    const password = 'password123';
    
    // Prova prima a fare login
    try {
      console.log('🔐 Tentativo di login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login riuscito!', userCredential.user.email);
      return;
    } catch (loginError) {
      console.log('❌ Login fallito, provo a creare utente...');
    }
    
    // Se il login fallisce, prova a creare l'utente
    try {
      console.log('👤 Creazione nuovo utente...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Utente creato!', userCredential.user.email);
    } catch (createError) {
      console.error('❌ Errore creazione utente:', createError.message);
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

// Esegui la creazione
createTestUser();
