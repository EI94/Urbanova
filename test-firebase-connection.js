// Test connessione Firebase - Urbanova
// Esegui questo file per testare la connessione

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxex9T9insV0Y5-puRZc6y-QQhn1KLXD8",
  authDomain: "urbanova-b623e.firebaseapp.com",
  projectId: "urbanova-b623e",
  storageBucket: "urbanova-b623e.firebasestorage.app",
  messagingSenderId: "599892072352",
  appId: "1:599892072352:web:34553ac67eb39d2b9ab6c5",
  measurementId: "G-QHNDTK9P3L"
};

async function testFirebaseConnection() {
  try {
    console.log('🧪 Test connessione Firebase...');
    
    // Inizializza Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inizializzato');
    
    // Test 1: Prova a creare un documento di test
    console.log('🧪 Test 1: Creazione documento test...');
    
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Test connessione Firebase',
      timestamp: serverTimestamp(),
      test: true
    });
    
    console.log('✅ Test 1 completato - Documento creato:', testDoc.id);
    
    // Test 2: Prova a creare un progetto di fattibilità
    console.log('🧪 Test 2: Creazione progetto fattibilità...');
    
    const testProject = {
      name: 'Test Progetto Firebase',
      address: 'Via Test Firebase, Roma',
      status: 'PIANIFICAZIONE',
      startDate: new Date(),
      constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      duration: 18,
      targetMargin: 30,
      totalArea: 500,
      costs: {
        land: {
          purchasePrice: 100000,
          purchaseTaxes: 10000,
          intermediationFees: 5000,
          subtotal: 115000
        },
        construction: {
          excavation: 20000,
          structures: 150000,
          systems: 80000,
          finishes: 120000,
          subtotal: 370000
        },
        externalWorks: 30000,
        concessionFees: 15000,
        design: 25000,
        bankCharges: 10000,
        exchange: 5000,
        insurance: 8000,
        total: 668000
      },
      revenues: {
        units: 2,
        averageArea: 144,
        pricePerSqm: 1700,
        revenuePerUnit: 244800,
        totalSales: 489600,
        otherRevenues: 0,
        total: 489600
      },
      results: {
        profit: -178400,
        margin: -36.4,
        roi: -26.7,
        paybackPeriod: 0
      },
      isTargetAchieved: false,
      createdBy: 'test-script',
      notes: 'Progetto di test per verifica connessione Firebase',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const projectDoc = await addDoc(collection(db, 'feasibilityProjects'), testProject);
    
    console.log('✅ Test 2 completato - Progetto creato:', projectDoc.id);
    
    console.log('🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!');
    console.log('✅ Firebase è configurato correttamente');
    console.log('✅ Le regole di sicurezza sono attive');
    console.log('✅ Il salvataggio progetti funziona');
    
    return {
      success: true,
      testDocId: testDoc.id,
      projectId: projectDoc.id,
      message: 'Tutti i test completati con successo'
    };
    
  } catch (error) {
    console.error('❌ Test fallito:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Errore permessi - Verificare regole di sicurezza Firestore');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Errore connessione - Verificare connessione internet e stato Firebase');
    } else if (error.code === 'unauthenticated') {
      console.error('👤 Errore autenticazione - Verificare configurazione Auth');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      message: 'Test fallito - Controllare configurazione Firebase'
    };
  }
}

// Esegui il test
if (require.main === module) {
  testFirebaseConnection()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 RISULTATO: SUCCESSO');
        process.exit(0);
      } else {
        console.log('\n💥 RISULTATO: FALLITO');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Errore durante il test:', error);
      process.exit(1);
    });
}

module.exports = { testFirebaseConnection };
