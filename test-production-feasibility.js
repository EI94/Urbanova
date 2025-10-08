// Test di produzione per il salvataggio delle analisi di fattibilità
// Questo script testa il sistema completo in produzione

const PRODUCTION_URL = 'https://urbanova.life';

async function testProductionFeasibilitySaving() {
  console.log('🚀 [TEST PRODUZIONE] Avvio test completo salvataggio analisi fattibilità in produzione...');
  console.log('🌐 [TEST PRODUZIONE] URL produzione:', PRODUCTION_URL);
  
  const results = {
    connection: false,
    debugEndpoint: false,
    feasibilitySmart: false,
    errors: []
  };
  
  try {
    // Test 1: Connessione generale
    console.log('\n🔍 [TEST 1] Test connessione generale...');
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/health`);
      if (response.ok) {
        results.connection = true;
        console.log('✅ [TEST 1] Connessione generale OK');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ [TEST 1] Connessione generale fallita:', error);
      results.errors.push(`Connessione generale: ${error.message}`);
    }
    
    // Test 2: Endpoint debug
    console.log('\n🔍 [TEST 2] Test endpoint debug...');
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/feasibility-debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-connection'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          results.debugEndpoint = true;
          console.log('✅ [TEST 2] Endpoint debug OK');
        } else {
          throw new Error('Endpoint debug restituisce success: false');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ [TEST 2] Endpoint debug fallito:', error);
      results.errors.push(`Endpoint debug: ${error.message}`);
    }
    
    // Test 3: Endpoint feasibility-smart
    console.log('\n🔍 [TEST 3] Test endpoint feasibility-smart...');
    try {
      const testProjectData = {
        name: 'Test Produzione Debug',
        address: 'Via Test Produzione 123, Milano',
        totalArea: 150,
        costs: {
          land: {
            purchasePrice: 150000,
            purchaseTaxes: 7500,
            intermediationFees: 3000,
            subtotal: 160500,
          },
          construction: {
            excavation: 15000,
            structures: 75000,
            systems: 30000,
            finishes: 45000,
            subtotal: 165000,
          },
          externalWorks: 7500,
          concessionFees: 3000,
          design: 4500,
          bankCharges: 1500,
          exchange: 0,
          insurance: 1500,
          total: 342000,
        },
        revenues: {
          units: 1,
          averageArea: 150,
          pricePerSqm: 3200,
          revenuePerUnit: 480000,
          totalSales: 480000,
          otherRevenues: 0,
          total: 480000,
        },
        results: {
          profit: 138000,
          margin: 28.8,
          roi: 40.4,
          paybackPeriod: 29.7,
        },
        targetMargin: 25,
        createdBy: 'test-production-user'
      };
      
      const response = await fetch(`${PRODUCTION_URL}/api/feasibility-smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testProjectData),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.projectId) {
          results.feasibilitySmart = true;
          console.log('✅ [TEST 3] Endpoint feasibility-smart OK, progetto salvato:', result.projectId);
        } else {
          throw new Error('Endpoint feasibility-smart non ha restituito projectId valido');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ [TEST 3] Endpoint feasibility-smart fallito:', error);
      results.errors.push(`Endpoint feasibility-smart: ${error.message}`);
    }
    
    // Risultati finali
    console.log('\n🎯 [RISULTATI FINALI PRODUZIONE]');
    console.log('✅ Connessione generale:', results.connection ? 'OK' : 'FAILED');
    console.log('✅ Endpoint debug:', results.debugEndpoint ? 'OK' : 'FAILED');
    console.log('✅ Endpoint feasibility-smart:', results.feasibilitySmart ? 'OK' : 'FAILED');
    console.log('❌ Errori:', results.errors.length);
    
    if (results.errors.length > 0) {
      console.log('\n📋 [DETTAGLI ERRORI]:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    const allTestsPassed = results.connection && results.debugEndpoint && results.feasibilitySmart;
    
    if (allTestsPassed) {
      console.log('\n🎉 [SUCCESSO PRODUZIONE] Tutti i test sono passati! Il sistema di salvataggio funziona correttamente in produzione.');
      return { success: true, results };
    } else {
      console.log('\n❌ [FALLIMENTO PRODUZIONE] Alcuni test sono falliti. Il sistema di salvataggio ha problemi in produzione.');
      return { success: false, results };
    }
    
  } catch (error) {
    console.error('❌ [ERRORE CRITICO PRODUZIONE] Test fallito:', error);
    return { success: false, error: error.message };
  }
}

// Esegui il test se chiamato direttamente
if (typeof window === 'undefined') {
  // Node.js environment
  testProductionFeasibilitySaving()
    .then(result => {
      console.log('\n📊 [RISULTATO FINALE]:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ [ERRORE FATALE]:', error);
      process.exit(1);
    });
} else {
  // Browser environment
  window.testProductionFeasibilitySaving = testProductionFeasibilitySaving;
}
