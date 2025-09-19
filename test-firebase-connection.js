// Test Firebase Connection - Urbanova
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Configurazione Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAxex9T9insV0Y5-puRZc6y-QQhn1KLXD8',
  authDomain: 'urbanova-b623e.firebaseapp.com',
  projectId: 'urbanova-b623e',
  storageBucket: 'urbanova-b623e.firebasestorage.app',
  messagingSenderId: '599892072352',
  appId: '1:599892072352:web:34553ac67eb39d2b9ab6c5',
  measurementId: 'G-QHNDTK9P3L',
};

async function testFirebaseConnection() {
  try {
    console.log('🔥 Test connessione Firebase...');
    
    // Inizializza Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app inizializzato:', app.name);
    
    // Inizializza Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore inizializzato:', db.app.name);
    
    // Test lettura collezione
    console.log('📖 Test lettura collezione feasibilityProjects...');
    const projectsRef = collection(db, 'feasibilityProjects');
    const snapshot = await getDocs(projectsRef);
    console.log('✅ Progetti letti:', snapshot.size);
    
    // Test scrittura
    console.log('📝 Test scrittura documento di test...');
    const testDoc = await addDoc(collection(db, 'test_collection'), {
      test: true,
      timestamp: new Date(),
      message: 'Test Firebase connection'
    });
    console.log('✅ Documento di test creato:', testDoc.id);
    
    console.log('🎉 Firebase connection test completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore test Firebase:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
  }
}

testFirebaseConnection();
