// Test script per verificare i dati di fattibilità esistenti
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

// Configurazione Firebase (usa le stesse credenziali dell'app)
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
const db = getFirestore(app);

async function testFeasibilityData() {
  try {
    console.log('🔄 Test recupero dati fattibilità...');
    
    // Test 1: Recupera tutti i progetti
    console.log('\n📊 Test 1: Tutti i progetti');
    const allProjectsRef = collection(db, 'feasibilityProjects');
    const allProjectsSnapshot = await getDocs(allProjectsRef);
    console.log(`✅ Trovati ${allProjectsSnapshot.size} progetti totali`);
    
    allProjectsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name || 'Senza nome'} (${data.createdBy || 'Nessun utente'})`);
    });
    
    // Test 2: Cerca progetti per pierpaolo.laurito@gmail.com
    console.log('\n👤 Test 2: Progetti per pierpaolo.laurito@gmail.com');
    const userProjectsRef = collection(db, 'feasibilityProjects');
    const userQuery = query(
      userProjectsRef,
      where('createdBy', '==', 'pierpaolo.laurito@gmail.com'),
      orderBy('createdAt', 'desc')
    );
    
    const userSnapshot = await getDocs(userQuery);
    console.log(`✅ Trovati ${userSnapshot.size} progetti per pierpaolo.laurito@gmail.com`);
    
    userSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name || 'Senza nome'} (${data.address || 'Nessun indirizzo'})`);
      console.log(`    ID: ${doc.id}`);
      console.log(`    Creato: ${data.createdAt?.toDate?.() || data.createdAt}`);
      console.log(`    Status: ${data.status || 'Nessuno'}`);
    });
    
    // Test 3: Cerca specificamente "Ciliegie"
    console.log('\n🍒 Test 3: Progetto "Ciliegie"');
    const ciliegieQuery = query(
      userProjectsRef,
      where('name', '==', 'Ciliegie')
    );
    
    const ciliegieSnapshot = await getDocs(ciliegieQuery);
    console.log(`✅ Trovati ${ciliegieSnapshot.size} progetti chiamati "Ciliegie"`);
    
    ciliegieSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.createdBy})`);
      console.log(`    ID: ${doc.id}`);
      console.log(`    Indirizzo: ${data.address || 'Nessuno'}`);
      console.log(`    Dati completi:`, JSON.stringify(data, null, 2));
    });
    
    console.log('\n✅ Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

// Esegui il test
testFeasibilityData();
