// Script per pulire il database Firebase
// Esegui con: node scripts/cleanFirebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collezioni da pulire
const collectionsToClean = [
  'projects',
  'users',
  'documents',
  'meetings',
  'tasks',
  // Nuove collezioni Analisi di Fattibilità
  'feasibilityProjects',
  'feasibilityComparisons',
  // Collezioni AI Land Scraping
  'emailConfigs',
  'emailLogs',
  'landSearchResults',
];

async function cleanFirebase() {
  console.log('🧹 Iniziando pulizia database Firebase...');
  console.log('📊 Collezioni da pulire:', collectionsToClean.join(', '));

  try {
    for (const collectionName of collectionsToClean) {
      console.log(`\n📁 Pulendo collezione: ${collectionName}`);

      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      if (snapshot.empty) {
        console.log(`   ✅ Collezione ${collectionName} già vuota`);
        continue;
      }

      console.log(`   📊 Trovati ${snapshot.size} documenti da eliminare`);

      const deletePromises = snapshot.docs.map(async docSnapshot => {
        try {
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          console.log(`   🗑️ Eliminato documento: ${docSnapshot.id}`);
          return true;
        } catch (error) {
          console.error(`   ❌ Errore eliminando ${docSnapshot.id}:`, error.message);
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      console.log(
        `   ✅ Eliminati ${successCount}/${snapshot.size} documenti da ${collectionName}`
      );
    }

    console.log('\n🎉 Pulizia database completata con successo!');
    console.log('📝 Il database è ora pulito e pronto per testare le nuove funzionalità:');
    console.log('   • Analisi di Fattibilità');
    console.log('   • AI Land Scraping');
    console.log('   • Email Service');
    console.log('   • Confronti tra Progetti');
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    process.exit(1);
  }
}

// Esegui la pulizia
cleanFirebase();
