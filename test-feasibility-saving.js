// Test diretto del salvataggio delle analisi di fattibilità
import { feasibilityDebugService } from './src/lib/feasibilityDebugService';

async function testFeasibilitySaving() {
  console.log('🚀 [TEST MANIACALE] Avvio test completo salvataggio analisi fattibilità...');
  
  try {
    // Test 1: Connessione Firebase
    console.log('\n🔍 [TEST 1] Test connessione Firebase...');
    const connectionTest = await feasibilityDebugService.testFirebaseConnection();
    console.log('📊 [TEST 1] Risultato:', connectionTest);
    
    if (!connectionTest.success) {
      console.error('❌ [TEST 1] Connessione Firebase fallita:', connectionTest.error);
      return;
    }
    
    // Test 2: Salvataggio semplice
    console.log('\n🔍 [TEST 2] Test salvataggio semplice...');
    const simpleSaveTest = await feasibilityDebugService.testSimpleSave();
    console.log('📊 [TEST 2] Risultato:', simpleSaveTest);
    
    if (!simpleSaveTest.success) {
      console.error('❌ [TEST 2] Salvataggio semplice fallito:', simpleSaveTest.error);
      return;
    }
    
    // Test 3: Verifica progetti esistenti
    console.log('\n🔍 [TEST 3] Verifica progetti esistenti...');
    const existingTest = await feasibilityDebugService.checkExistingProjects();
    console.log('📊 [TEST 3] Risultato:', existingTest);
    
    // Test 4: Salvataggio con dati reali
    console.log('\n🔍 [TEST 4] Test salvataggio dati reali...');
    const realProjectData = {
      name: 'Test Progetto Reale',
      address: 'Via Test Reale 123, Milano',
      status: 'PIANIFICAZIONE',
      totalArea: 200,
      targetMargin: 25,
      createdBy: 'test-user-real',
      costs: {
        land: {
          purchasePrice: 200000,
          purchaseTaxes: 10000,
          intermediationFees: 4000,
          subtotal: 214000,
        },
        construction: {
          excavation: 20000,
          structures: 100000,
          systems: 40000,
          finishes: 60000,
          subtotal: 220000,
        },
        externalWorks: 10000,
        concessionFees: 4000,
        design: 6000,
        bankCharges: 2000,
        exchange: 0,
        insurance: 2000,
        total: 456000,
      },
      revenues: {
        units: 2,
        averageArea: 100,
        pricePerSqm: 3500,
        revenuePerUnit: 350000,
        totalSales: 700000,
        otherRevenues: 0,
        total: 700000,
      },
      results: {
        profit: 244000,
        margin: 34.9,
        roi: 53.5,
        paybackPeriod: 22.4,
      },
      isTargetAchieved: true,
      notes: 'Progetto di test con dati reali per debug salvataggio'
    };
    
    const realSaveTest = await feasibilityDebugService.testRealDataSave(realProjectData);
    console.log('📊 [TEST 4] Risultato:', realSaveTest);
    
    if (!realSaveTest.success) {
      console.error('❌ [TEST 4] Salvataggio dati reali fallito:', realSaveTest.error);
      return;
    }
    
    // Test 5: Test completo
    console.log('\n🔍 [TEST 5] Test completo sistema...');
    const fullTest = await feasibilityDebugService.runFullTest();
    console.log('📊 [TEST 5] Risultato:', fullTest);
    
    // Risultati finali
    console.log('\n🎯 [RISULTATI FINALI]');
    console.log('✅ Connessione Firebase:', connectionTest.success ? 'OK' : 'FAILED');
    console.log('✅ Salvataggio semplice:', simpleSaveTest.success ? 'OK' : 'FAILED');
    console.log('✅ Progetti esistenti:', existingTest.count);
    console.log('✅ Salvataggio dati reali:', realSaveTest.success ? 'OK' : 'FAILED');
    console.log('✅ Test completo:', fullTest.firebaseConnection.success && fullTest.simpleSave.success ? 'OK' : 'FAILED');
    
    if (connectionTest.success && simpleSaveTest.success && realSaveTest.success) {
      console.log('\n🎉 [SUCCESSO] Tutti i test sono passati! Il sistema di salvataggio funziona correttamente.');
    } else {
      console.log('\n❌ [FALLIMENTO] Alcuni test sono falliti. Il sistema di salvataggio ha problemi.');
    }
    
  } catch (error) {
    console.error('❌ [ERRORE CRITICO] Test fallito:', error);
  }
}

// Esegui il test
testFeasibilitySaving();
