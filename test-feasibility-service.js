// Test script per verificare il servizio di fattibilità
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

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
const db = getFirestore(app);

async function testFeasibilityService() {
  try {
    console.log('🔄 Test servizio fattibilità...');
    
    // Simula un utente mock
    const mockUser = {
      uid: 'mock-user-123',
      email: 'pierpaolo.laurito@gmail.com'
    };
    
    console.log(`👤 Test con utente mock: ${mockUser.email}`);
    
    // Test 1: Recupera progetti per utente
    console.log('\n📊 Test 1: Progetti per utente');
    const projectsRef = collection(db, 'feasibilityProjects');
    const userQuery = query(
      projectsRef,
      where('createdBy', '==', mockUser.email),
      orderBy('createdAt', 'desc')
    );
    
    const userSnapshot = await getDocs(userQuery);
    console.log(`✅ Trovati ${userSnapshot.size} progetti per ${mockUser.email}`);
    
    if (userSnapshot.size > 0) {
      console.log('\n📋 Dettagli progetti:');
      userSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n  ${index + 1}. ${data.name || 'Senza nome'}`);
        console.log(`     ID: ${doc.id}`);
        console.log(`     Indirizzo: ${data.address || 'Nessuno'}`);
        console.log(`     Creato: ${data.createdAt?.toDate?.() || data.createdAt}`);
        console.log(`     Status: ${data.status || 'Nessuno'}`);
        console.log(`     Utente: ${data.createdBy || 'Nessuno'}`);
        
        // Cerca specificamente "Ciliegie"
        if (data.name && data.name.toLowerCase().includes('ciliegie')) {
          console.log(`     🍒 TROVATO PROGETTO CILIEGIE!`);
          console.log(`     Dati completi:`, JSON.stringify(data, null, 2));
        }
      });
    } else {
      console.log('❌ Nessun progetto trovato per questo utente');
    }
    
    // Test 2: Cerca tutti i progetti (per debug)
    console.log('\n🔍 Test 2: Tutti i progetti (debug)');
    const allQuery = query(projectsRef, orderBy('createdAt', 'desc'));
    const allSnapshot = await getDocs(allQuery);
    console.log(`📊 Totale progetti nel database: ${allSnapshot.size}`);
    
    if (allSnapshot.size > 0) {
      console.log('\n📋 Primi 5 progetti:');
      allSnapshot.docs.slice(0, 5).forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.name || 'Senza nome'} (${data.createdBy || 'Nessun utente'})`);
      });
    }
    
    console.log('\n✅ Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    
    if (error.code === 'permission-denied') {
      console.log('💡 Suggerimento: Il database potrebbe richiedere autenticazione');
      console.log('💡 Prova ad accedere all\'app e controlla i log del browser');
    }
  }
}

// Esegui il test
testFeasibilityService();
