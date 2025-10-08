// Script per verificare l'integrità dei dati salvati delle analisi fattibilità
// Questo script controlla che i dati siano stati salvati correttamente in Firebase

// Carica variabili d'ambiente da .env.local se disponibile
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    console.log('✅ Variabili d\'ambiente caricate da .env.local');
  } else {
    console.log('⚠️ File .env.local non trovato, usando variabili d\'ambiente di sistema');
  }
} catch (error) {
  console.log('⚠️ Errore caricamento .env.local:', error.message);
}

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase app initialized for data integrity verification.');
} catch (e) {
  console.warn('⚠️ Firebase app already initialized or error:', e.message);
  const { getApps } = require('firebase/app');
  if (getApps().length) {
    app = getApps()[0];
  } else {
    console.error('❌ Failed to initialize Firebase app.');
    process.exit(1);
  }
}

const db = getFirestore(app);
console.log('✅ Firestore DB instance obtained for data verification.');

class DataIntegrityVerifier {
  constructor() {
    this.COLLECTION = 'feasibilityProjects';
    this.requiredFields = [
      'name', 'address', 'status', 'startDate', 'constructionStartDate',
      'duration', 'totalArea', 'costs', 'revenues', 'results',
      'targetMargin', 'isTargetAchieved', 'createdAt', 'updatedAt', 'createdBy'
    ];
    this.costsRequiredFields = [
      'land', 'construction', 'externalWorks', 'concessionFees',
      'design', 'bankCharges', 'exchange', 'insurance', 'total'
    ];
    this.revenuesRequiredFields = [
      'units', 'averageArea', 'pricePerSqm', 'revenuePerUnit',
      'totalSales', 'otherRevenues', 'total'
    ];
    this.resultsRequiredFields = [
      'profit', 'margin', 'roi', 'paybackPeriod'
    ];
  }

  async verifyAllProjects() {
    console.log('\n🔍 [VERIFICA INTEGRITÀ] Avvio verifica completa di tutti i progetti...');
    
    try {
      const projectsRef = collection(db, this.COLLECTION);
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('⚠️ [VERIFICA INTEGRITÀ] Nessun progetto trovato nella collezione.');
        return { success: true, projects: [], issues: [] };
      }

      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`📊 [VERIFICA INTEGRITÀ] Trovati ${projects.length} progetti da verificare.`);

      const verificationResults = {
        totalProjects: projects.length,
        validProjects: 0,
        invalidProjects: 0,
        issues: [],
        projects: []
      };

      for (const project of projects) {
        const projectVerification = await this.verifyProject(project);
        verificationResults.projects.push(projectVerification);
        
        if (projectVerification.isValid) {
          verificationResults.validProjects++;
        } else {
          verificationResults.invalidProjects++;
          verificationResults.issues.push(...projectVerification.issues);
        }
      }

      return verificationResults;

    } catch (error) {
      console.error('❌ [VERIFICA INTEGRITÀ] Errore durante la verifica:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyProject(project) {
    const issues = [];
    let isValid = true;

    console.log(`\n🔍 [VERIFICA PROGETTO] Verifica progetto: ${project.name || 'Senza nome'} (ID: ${project.id})`);

    // Verifica campi obbligatori principali
    for (const field of this.requiredFields) {
      if (!(field in project)) {
        issues.push(`Campo obbligatorio mancante: ${field}`);
        isValid = false;
      } else if (project[field] === null || project[field] === undefined) {
        issues.push(`Campo obbligatorio null/undefined: ${field}`);
        isValid = false;
      }
    }

    // Verifica struttura dati costs
    if (project.costs && typeof project.costs === 'object') {
      for (const field of this.costsRequiredFields) {
        if (!(field in project.costs)) {
          issues.push(`Campo costs mancante: ${field}`);
          isValid = false;
        }
      }
      
      // Verifica sottostrutture land e construction
      if (project.costs.land && typeof project.costs.land === 'object') {
        const landFields = ['purchasePrice', 'purchaseTaxes', 'intermediationFees', 'subtotal'];
        for (const field of landFields) {
          if (!(field in project.costs.land)) {
            issues.push(`Campo costs.land mancante: ${field}`);
            isValid = false;
          }
        }
      }

      if (project.costs.construction && typeof project.costs.construction === 'object') {
        const constructionFields = ['excavation', 'structures', 'systems', 'finishes', 'subtotal'];
        for (const field of constructionFields) {
          if (!(field in project.costs.construction)) {
            issues.push(`Campo costs.construction mancante: ${field}`);
            isValid = false;
          }
        }
      }
    } else {
      issues.push('Struttura costs mancante o non valida');
      isValid = false;
    }

    // Verifica struttura dati revenues
    if (project.revenues && typeof project.revenues === 'object') {
      for (const field of this.revenuesRequiredFields) {
        if (!(field in project.revenues)) {
          issues.push(`Campo revenues mancante: ${field}`);
          isValid = false;
        }
      }
    } else {
      issues.push('Struttura revenues mancante o non valida');
      isValid = false;
    }

    // Verifica struttura dati results
    if (project.results && typeof project.results === 'object') {
      for (const field of this.resultsRequiredFields) {
        if (!(field in project.results)) {
          issues.push(`Campo results mancante: ${field}`);
          isValid = false;
        }
      }
    } else {
      issues.push('Struttura results mancante o non valida');
      isValid = false;
    }

    // Verifica tipi di dati
    if (typeof project.totalArea !== 'number' || project.totalArea <= 0) {
      issues.push('totalArea deve essere un numero positivo');
      isValid = false;
    }

    if (typeof project.duration !== 'number' || project.duration <= 0) {
      issues.push('duration deve essere un numero positivo');
      isValid = false;
    }

    if (typeof project.targetMargin !== 'number' || project.targetMargin < 0) {
      issues.push('targetMargin deve essere un numero non negativo');
      isValid = false;
    }

    if (typeof project.isTargetAchieved !== 'boolean') {
      issues.push('isTargetAchieved deve essere un booleano');
      isValid = false;
    }

    // Verifica date
    if (!(project.createdAt instanceof Date) && !project.createdAt?.toDate) {
      issues.push('createdAt deve essere una data valida');
      isValid = false;
    }

    if (!(project.updatedAt instanceof Date) && !project.updatedAt?.toDate) {
      issues.push('updatedAt deve essere una data valida');
      isValid = false;
    }

    // Verifica coerenza calcoli
    if (project.costs && project.revenues && project.results) {
      const expectedProfit = project.revenues.total - project.costs.total;
      const actualProfit = project.results.profit;
      const profitDifference = Math.abs(expectedProfit - actualProfit);
      
      if (profitDifference > 1) { // Tolleranza di 1 euro per arrotondamenti
        issues.push(`Incoerenza calcolo profit: atteso ${expectedProfit}, trovato ${actualProfit}`);
        isValid = false;
      }

      const expectedMargin = (expectedProfit / project.revenues.total) * 100;
      const actualMargin = project.results.margin;
      const marginDifference = Math.abs(expectedMargin - actualMargin);
      
      if (marginDifference > 0.1) { // Tolleranza di 0.1% per arrotondamenti
        issues.push(`Incoerenza calcolo margin: atteso ${expectedMargin.toFixed(2)}%, trovato ${actualMargin}%`);
        isValid = false;
      }
    }

    const result = {
      id: project.id,
      name: project.name,
      isValid,
      issues,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy
    };

    if (isValid) {
      console.log(`✅ [VERIFICA PROGETTO] Progetto valido: ${project.name}`);
    } else {
      console.log(`❌ [VERIFICA PROGETTO] Progetto con problemi: ${project.name}`);
      console.log(`   Problemi trovati: ${issues.length}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return result;
  }

  async verifyRecentProjects(limitCount = 5) {
    console.log(`\n🔍 [VERIFICA RECENTI] Verifica degli ultimi ${limitCount} progetti...`);
    
    try {
      const projectsRef = collection(db, this.COLLECTION);
      const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('⚠️ [VERIFICA RECENTI] Nessun progetto recente trovato.');
        return { success: true, projects: [] };
      }

      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`📊 [VERIFICA RECENTI] Trovati ${projects.length} progetti recenti da verificare.`);

      const verificationResults = {
        totalProjects: projects.length,
        validProjects: 0,
        invalidProjects: 0,
        issues: [],
        projects: []
      };

      for (const project of projects) {
        const projectVerification = await this.verifyProject(project);
        verificationResults.projects.push(projectVerification);
        
        if (projectVerification.isValid) {
          verificationResults.validProjects++;
        } else {
          verificationResults.invalidProjects++;
          verificationResults.issues.push(...projectVerification.issues);
        }
      }

      return verificationResults;

    } catch (error) {
      console.error('❌ [VERIFICA RECENTI] Errore durante la verifica:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyTestProjects() {
    console.log('\n🔍 [VERIFICA TEST] Verifica progetti di test...');
    
    try {
      const projectsRef = collection(db, this.COLLECTION);
      const q = query(projectsRef, where('createdBy', 'in', ['test-user-direct-script', 'production-test-user', 'debug-user']));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('⚠️ [VERIFICA TEST] Nessun progetto di test trovato.');
        return { success: true, projects: [] };
      }

      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`📊 [VERIFICA TEST] Trovati ${projects.length} progetti di test da verificare.`);

      const verificationResults = {
        totalProjects: projects.length,
        validProjects: 0,
        invalidProjects: 0,
        issues: [],
        projects: []
      };

      for (const project of projects) {
        const projectVerification = await this.verifyProject(project);
        verificationResults.projects.push(projectVerification);
        
        if (projectVerification.isValid) {
          verificationResults.validProjects++;
        } else {
          verificationResults.invalidProjects++;
          verificationResults.issues.push(...projectVerification.issues);
        }
      }

      return verificationResults;

    } catch (error) {
      console.error('❌ [VERIFICA TEST] Errore durante la verifica:', error);
      return { success: false, error: error.message };
    }
  }
}

async function runDataIntegrityVerification() {
  console.log('🚀 [VERIFICA INTEGRITÀ DATI] Avvio verifica completa integrità dati analisi fattibilità...');
  
  const verifier = new DataIntegrityVerifier();
  
  try {
    // Verifica 1: Progetti recenti
    console.log('\n=== VERIFICA 1: PROGETTI RECENTI ===');
    const recentResults = await verifier.verifyRecentProjects(10);
    
    if (recentResults.success) {
      console.log(`✅ [VERIFICA RECENTI] Completata: ${recentResults.validProjects}/${recentResults.totalProjects} progetti validi`);
      if (recentResults.invalidProjects > 0) {
        console.log(`❌ [VERIFICA RECENTI] ${recentResults.invalidProjects} progetti con problemi`);
        recentResults.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      console.error('❌ [VERIFICA RECENTI] Fallita:', recentResults.error);
    }

    // Verifica 2: Progetti di test
    console.log('\n=== VERIFICA 2: PROGETTI DI TEST ===');
    const testResults = await verifier.verifyTestProjects();
    
    if (testResults.success) {
      console.log(`✅ [VERIFICA TEST] Completata: ${testResults.validProjects}/${testResults.totalProjects} progetti di test validi`);
      if (testResults.invalidProjects > 0) {
        console.log(`❌ [VERIFICA TEST] ${testResults.invalidProjects} progetti di test con problemi`);
        testResults.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      console.error('❌ [VERIFICA TEST] Fallita:', testResults.error);
    }

    // Verifica 3: Tutti i progetti (se non troppi)
    console.log('\n=== VERIFICA 3: TUTTI I PROGETTI ===');
    const allResults = await verifier.verifyAllProjects();
    
    if (allResults.success) {
      console.log(`✅ [VERIFICA COMPLETA] Completata: ${allResults.validProjects}/${allResults.totalProjects} progetti validi`);
      if (allResults.invalidProjects > 0) {
        console.log(`❌ [VERIFICA COMPLETA] ${allResults.invalidProjects} progetti con problemi`);
        console.log('\n📋 [RIEPILOGO PROBLEMI]:');
        allResults.issues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue}`);
        });
      }
    } else {
      console.error('❌ [VERIFICA COMPLETA] Fallita:', allResults.error);
    }

    // Riepilogo finale
    console.log('\n🎯 [RIEPILOGO FINALE VERIFICA INTEGRITÀ]');
    console.log(`📊 Progetti recenti: ${recentResults.success ? `${recentResults.validProjects}/${recentResults.totalProjects} validi` : 'FALLITA'}`);
    console.log(`📊 Progetti di test: ${testResults.success ? `${testResults.validProjects}/${testResults.totalProjects} validi` : 'FALLITA'}`);
    console.log(`📊 Tutti i progetti: ${allResults.success ? `${allResults.validProjects}/${allResults.totalProjects} validi` : 'FALLITA'}`);
    
    const totalIssues = (recentResults.issues?.length || 0) + (testResults.issues?.length || 0) + (allResults.issues?.length || 0);
    
    if (totalIssues === 0) {
      console.log('\n🎉 [SUCCESSO] Tutti i dati verificati sono integri!');
    } else {
      console.log(`\n⚠️ [ATTENZIONE] Trovati ${totalIssues} problemi di integrità nei dati.`);
    }

    return {
      success: totalIssues === 0,
      recentResults,
      testResults,
      allResults,
      totalIssues
    };

  } catch (error) {
    console.error('❌ [VERIFICA INTEGRITÀ] Errore critico:', error);
    return { success: false, error: error.message };
  }
}

runDataIntegrityVerification();
