// Test diretto FeasibilityService per verificare se funziona
const { FeasibilityService } = require('./src/lib/feasibilityService.ts');

async function testFeasibilityService() {
  try {
    console.log('🧪 [TEST] Inizializzando FeasibilityService...');
    const feasibilityService = new FeasibilityService();
    console.log('✅ [TEST] FeasibilityService inizializzato:', !!feasibilityService);
    
    const testProject = {
      name: 'Test Project',
      address: 'Via Test 123',
      status: 'PIANIFICAZIONE',
      startDate: new Date(),
      constructionStartDate: new Date(),
      duration: 18,
      totalArea: 1000,
      targetMargin: 25,
      createdBy: 'test-user',
      notes: 'Test project',
      costs: {
        land: {
          purchasePrice: 100000,
          purchaseTaxes: 10000,
          intermediationFees: 3000,
          subtotal: 113000
        },
        construction: {
          excavation: 10000,
          structures: 40000,
          systems: 20000,
          finishes: 30000,
          subtotal: 100000
        },
        externalWorks: 5000,
        concessionFees: 2000,
        design: 3000,
        bankCharges: 1000,
        exchange: 0,
        insurance: 1500,
        total: 221500
      },
      revenues: {
        units: 1,
        averageArea: 1000,
        pricePerSqm: 2500,
        revenuePerUnit: 2500000,
        totalSales: 2500000,
        otherRevenues: 0,
        total: 2500000
      },
      results: {
        profit: 285000,
        margin: 12.86,
        roi: 12.86,
        paybackPeriod: 0
      },
      isTargetAchieved: false
    };
    
    console.log('🧪 [TEST] Testando createProject...');
    const result = await feasibilityService.createProject(testProject);
    console.log('✅ [TEST] Progetto creato con successo:', result);
    
  } catch (error) {
    console.error('❌ [TEST] Errore:', error);
    console.error('❌ [TEST] Stack:', error.stack);
  }
}

testFeasibilityService();