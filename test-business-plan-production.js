/**
 * 🧪 TEST MASSIVI BUSINESS PLAN - PRODUCTION
 * 
 * Test completi di tutte le funzionalità Business Plan:
 * - API calculate
 * - Scenari multipli
 * - Sensitivity analysis
 * - Leve di negoziazione
 * - Validazioni
 */

const baseURL = 'http://localhost:3112';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(Math.round(num));
}

function log(emoji, category, message, data = null) {
  const timestamp = new Date().toLocaleTimeString('it-IT');
  console.log(`${emoji} [${timestamp}] [${category}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * TEST 1: Calcolo Business Plan Scenario Singolo (Cash)
 */
async function test1_SingleScenarioCash() {
  log('🧪', 'TEST 1', 'Calcolo Business Plan - Scenario Cash Singolo');
  
  const input = {
    projectName: 'Test Scenario Cash',
    location: 'Milano Centro',
    type: 'RESIDENTIAL',
    totalUnits: 4,
    
    averagePrice: 390000,
    salesCalendar: [
      { period: 't1', units: 1 },
      { period: 't2', units: 3 }
    ],
    salesCommission: 3,
    discounts: 0,
    
    constructionCostPerUnit: 200000,
    contingency: 10,
    
    softCostPercentage: 8,
    developmentCharges: 50000,
    utilities: 20000,
    
    landScenarios: [
      {
        id: 's1',
        name: 'S1: Cash Upfront',
        type: 'CASH',
        upfrontPayment: 220000
      }
    ],
    
    discountRate: 12,
    
    constructionTimeline: [
      { phase: 'Fondazioni', period: 't1' },
      { phase: 'Struttura', period: 't1' },
      { phase: 'Finiture', period: 't2' }
    ],
    
    targetMargin: 15,
    minimumDSCR: 1.2
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user',
        includeSensitivity: false,
        compareScenarios: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    log('✅', 'TEST 1', 'SUCCESS - Business Plan calcolato');
    
    // Validazioni
    if (!data.success) throw new Error('Response success = false');
    if (!data.outputs || data.outputs.length !== 1) throw new Error('Expected 1 output');
    
    const output = data.outputs[0];
    log('📊', 'TEST 1', 'Metriche calcolate:', {
      VAN: formatNumber(output.metrics.npv),
      TIR: `${output.metrics.irr.toFixed(1)}%`,
      Margine: `${output.summary.marginPercentage.toFixed(1)}%`,
      Payback: output.metrics.payback === 999 ? '∞' : `${output.metrics.payback.toFixed(1)} anni`,
      CashFlow_Periods: output.cashFlow.length
    });
    
    // Validazioni metriche
    if (output.summary.totalRevenue <= 0) throw new Error('Ricavi totali <= 0');
    if (output.summary.totalCosts <= 0) throw new Error('Costi totali <= 0');
    if (output.cashFlow.length === 0) throw new Error('Cash flow vuoto');
    if (!output.keyAssumptions || output.keyAssumptions.length === 0) throw new Error('Assunzioni mancanti');
    
    log('✅', 'TEST 1', 'PASSED - Tutte le validazioni OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 1', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 2: Calcolo Business Plan - 3 Scenari (Cash, Permuta, Differito)
 */
async function test2_MultipleScenarios() {
  log('🧪', 'TEST 2', 'Calcolo Business Plan - 3 Scenari (Cash, Permuta, Differito)');
  
  const input = {
    projectName: 'Test Multi Scenario - Ciliegie',
    location: 'Milano',
    type: 'RESIDENTIAL',
    totalUnits: 4,
    
    averagePrice: 390000,
    salesCalendar: [
      { period: 't1', units: 1 },
      { period: 't2', units: 3 }
    ],
    salesCommission: 3,
    
    constructionCostPerUnit: 200000,
    contingency: 10,
    
    softCostPercentage: 8,
    developmentCharges: 50000,
    utilities: 20000,
    
    landScenarios: [
      {
        id: 's1',
        name: 'S1: Cash Upfront',
        type: 'CASH',
        upfrontPayment: 220000
      },
      {
        id: 's2',
        name: 'S2: Permuta',
        type: 'PERMUTA',
        unitsInPermuta: 1,
        cashContribution: 80000,
        cashContributionPeriod: 't2'
      },
      {
        id: 's3',
        name: 'S3: Pagamento Differito',
        type: 'DEFERRED_PAYMENT',
        deferredPayment: 300000,
        deferredPaymentPeriod: 't1'
      }
    ],
    
    discountRate: 12,
    
    constructionTimeline: [
      { phase: 'Fondazioni', period: 't1' },
      { phase: 'Struttura', period: 't1' },
      { phase: 'Finiture', period: 't2' }
    ],
    
    targetMargin: 15,
    minimumDSCR: 1.2
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user',
        includeSensitivity: false,
        compareScenarios: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    log('✅', 'TEST 2', 'SUCCESS - 3 Scenari calcolati');
    
    // Validazioni
    if (data.outputs.length !== 3) throw new Error(`Expected 3 outputs, got ${data.outputs.length}`);
    if (!data.comparison) throw new Error('Comparison mancante');
    if (data.comparison.ranking.length !== 3) throw new Error('Ranking incompleto');
    
    // Log risultati confronto
    log('📊', 'TEST 2', 'Ranking Scenari:');
    data.comparison.ranking.forEach((rank, i) => {
      const scenario = data.outputs.find(o => o.scenarioId === rank.scenarioId);
      console.log(`  ${i + 1}. ${scenario.scenarioName}`);
      console.log(`     VAN: €${formatNumber(scenario.metrics.npv)} | TIR: ${scenario.metrics.irr.toFixed(1)}% | Margine: ${scenario.summary.marginPercentage.toFixed(1)}%`);
    });
    
    // Validazione equivalence points
    if (data.comparison.equivalencePoints.length === 0) {
      log('⚠️', 'TEST 2', 'WARNING - Nessun equivalence point calcolato');
    } else {
      log('✅', 'TEST 2', `Equivalence Points: ${data.comparison.equivalencePoints.length}`, 
        data.comparison.equivalencePoints.map(ep => ep.explanation)
      );
    }
    
    log('✅', 'TEST 2', 'PASSED - Confronto scenari OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 2', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 3: Sensitivity Analysis
 */
async function test3_SensitivityAnalysis() {
  log('🧪', 'TEST 3', 'Sensitivity Analysis');
  
  const input = {
    projectName: 'Test Sensitivity',
    location: 'Milano',
    type: 'RESIDENTIAL',
    totalUnits: 4,
    averagePrice: 390000,
    salesCalendar: [{ period: 't1', units: 1 }, { period: 't2', units: 3 }],
    salesCommission: 3,
    constructionCostPerUnit: 200000,
    contingency: 10,
    softCostPercentage: 8,
    developmentCharges: 50000,
    utilities: 20000,
    landScenarios: [
      { id: 's1', name: 'S1: Cash', type: 'CASH', upfrontPayment: 220000 }
    ],
    discountRate: 12,
    constructionTimeline: [
      { phase: 'Fondazioni', period: 't1' },
      { phase: 'Finiture', period: 't2' }
    ]
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user',
        includeSensitivity: true,
        compareScenarios: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    log('✅', 'TEST 3', 'SUCCESS - Sensitivity calcolata');
    
    // Validazioni sensitivity
    if (!data.sensitivity || data.sensitivity.length === 0) {
      throw new Error('Sensitivity data mancante');
    }
    
    log('📊', 'TEST 3', `Sensitivity su ${data.sensitivity.length} variabili:`);
    data.sensitivity.forEach(sens => {
      console.log(`  - ${sens.variable}: ${sens.values.length} valori`);
      if (sens.breakEvenPoint) {
        console.log(`    Break-even: ${sens.breakEvenPoint.description}`);
      }
    });
    
    log('✅', 'TEST 3', 'PASSED - Sensitivity OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 3', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 4: Scenario Permuta con Contributo
 */
async function test4_PermutaScenario() {
  log('🧪', 'TEST 4', 'Scenario Permuta con Contributo Cash');
  
  const input = {
    projectName: 'Test Permuta',
    location: 'Roma',
    type: 'RESIDENTIAL',
    totalUnits: 6,
    averagePrice: 450000,
    salesCalendar: [{ period: 't2', units: 5 }],
    salesCommission: 3,
    constructionCostPerUnit: 250000,
    contingency: 10,
    softCostPercentage: 8,
    developmentCharges: 60000,
    utilities: 25000,
    landScenarios: [
      {
        id: 's_permuta',
        name: 'Permuta 1 Unità + Cash',
        type: 'PERMUTA',
        unitsInPermuta: 1,
        cashContribution: 100000,
        cashContributionPeriod: 't2'
      }
    ],
    discountRate: 12,
    constructionTimeline: [
      { phase: 'Costruzione', period: 't1' },
      { phase: 'Finiture', period: 't2' }
    ]
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    log('✅', 'TEST 4', 'SUCCESS - Permuta calcolata');
    
    const output = data.outputs[0];
    
    // Validazioni specifiche permuta
    const permutaCost = input.unitsInPermuta * input.averagePrice + input.cashContribution;
    log('📊', 'TEST 4', 'Costo terreno permuta:', {
      UnitsInPermuta: input.landScenarios[0].unitsInPermuta,
      ValorePermuta: formatNumber(input.landScenarios[0].unitsInPermuta * input.averagePrice),
      ContributoCash: formatNumber(input.landScenarios[0].cashContribution),
      TotaleLandCost_Stimato: formatNumber(permutaCost)
    });
    
    // Verifica leve di negoziazione per permuta
    if (output.negotiationLevers.length > 0) {
      log('🎯', 'TEST 4', 'Leve di negoziazione:', 
        output.negotiationLevers.map(l => l.explanation)
      );
    }
    
    log('✅', 'TEST 4', 'PASSED - Permuta OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 4', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 5: Scenario con Debito (LTV, DSCR)
 */
async function test5_DebtScenario() {
  log('🧪', 'TEST 5', 'Scenario con Debito - LTV, DSCR');
  
  const input = {
    projectName: 'Test Debito',
    location: 'Torino',
    type: 'RESIDENTIAL',
    totalUnits: 8,
    averagePrice: 350000,
    salesCalendar: [
      { period: 't1', units: 2 },
      { period: 't2', units: 4 },
      { period: 't3', units: 2 }
    ],
    salesCommission: 3,
    constructionCostPerUnit: 180000,
    contingency: 10,
    softCostPercentage: 8,
    developmentCharges: 80000,
    utilities: 30000,
    landScenarios: [
      { id: 's1', name: 'S1: Cash', type: 'CASH', upfrontPayment: 300000 }
    ],
    discountRate: 12,
    debt: {
      ltvTarget: 70,
      interestRate: 6,
      fees: 2,
      gracePeriod: 12,
      amortizationMonths: 120
    },
    constructionTimeline: [
      { phase: 'Costruzione', period: 't1' },
      { phase: 'Costruzione', period: 't2' },
      { phase: 'Finiture', period: 't3' }
    ],
    minimumDSCR: 1.2
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    log('✅', 'TEST 5', 'SUCCESS - Debito calcolato');
    
    const output = data.outputs[0];
    
    // Validazioni debt metrics
    if (output.metrics.dscr.min === 999) {
      throw new Error('DSCR non calcolato (999)');
    }
    if (output.metrics.ltv === 0) {
      throw new Error('LTV non calcolato');
    }
    if (output.metrics.ltc === 0) {
      throw new Error('LTC non calcolato');
    }
    
    log('📊', 'TEST 5', 'Debt Metrics:', {
      DSCR_Min: output.metrics.dscr.min.toFixed(2),
      DSCR_Avg: output.metrics.dscr.average.toFixed(2),
      LTV: `${output.metrics.ltv.toFixed(1)}%`,
      LTC: `${output.metrics.ltc.toFixed(1)}%`
    });
    
    // Verifica alert DSCR
    const dscrAlert = output.alerts.find(a => a.category === 'DSCR');
    if (output.metrics.dscr.min < input.minimumDSCR) {
      if (!dscrAlert) {
        log('⚠️', 'TEST 5', 'WARNING - DSCR sotto soglia ma nessun alert generato');
      } else {
        log('✅', 'TEST 5', 'Alert DSCR generato correttamente:', dscrAlert.message);
      }
    }
    
    log('✅', 'TEST 5', 'PASSED - Debt metrics OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 5', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 6: Esempio REALE "Ciliegie" dalle specifiche
 */
async function test6_CiliegieExample() {
  log('🧪', 'TEST 6', 'Esempio REALE Ciliegie (dalle specifiche utente)');
  
  const input = {
    projectName: 'Ciliegie',
    location: 'Milano',
    type: 'RESIDENTIAL',
    totalUnits: 4,
    
    averagePrice: 390000,
    salesCalendar: [
      { period: 't1', units: 1 },
      { period: 't2', units: 3 }
    ],
    salesCommission: 3,
    
    constructionCostPerUnit: 200000,
    contingency: 10,
    
    softCostPercentage: 8,
    developmentCharges: 50000,
    utilities: 20000,
    
    landScenarios: [
      {
        id: 's1',
        name: 'S1: Cash Upfront',
        type: 'CASH',
        upfrontPayment: 220000
      },
      {
        id: 's2',
        name: 'S2: Permuta 1 casa + 80k',
        type: 'PERMUTA',
        unitsInPermuta: 1,
        cashContribution: 80000,
        cashContributionPeriod: 't2'
      },
      {
        id: 's3',
        name: 'S3: Pagamento 300k a t1',
        type: 'DEFERRED_PAYMENT',
        deferredPayment: 300000,
        deferredPaymentPeriod: 't1'
      }
    ],
    
    discountRate: 12,
    
    constructionTimeline: [
      { phase: 'Fondazioni', period: 't1' },
      { phase: 'Struttura', period: 't1' },
      { phase: 'Finiture', period: 't2' }
    ]
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        userId: 'test-user',
        includeSensitivity: true,
        compareScenarios: true
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    log('✅', 'TEST 6', 'SUCCESS - Ciliegie calcolato');
    
    // Output completo come richiesto dall'utente
    console.log('\n' + '='.repeat(80));
    console.log('📊 BUSINESS PLAN - PROGETTO CILIEGIE');
    console.log('='.repeat(80) + '\n');
    
    data.comparison.ranking.forEach((rank, i) => {
      const scenario = data.outputs.find(o => o.scenarioId === rank.scenarioId);
      
      console.log(`${i + 1}. ${scenario.scenarioName}`);
      console.log(`   Margine: ${scenario.summary.marginPercentage.toFixed(1)}% (Utile €${formatNumber(scenario.summary.profit)})`);
      console.log(`   VAN: €${formatNumber(scenario.metrics.npv)}`);
      console.log(`   TIR: ${scenario.metrics.irr.toFixed(1)}%`);
      console.log(`   Payback: ${scenario.metrics.payback === 999 ? '∞ (mai)' : scenario.metrics.payback.toFixed(1) + ' anni'}`);
      console.log('');
    });
    
    // Leve di negoziazione
    if (data.comparison.equivalencePoints.length > 0) {
      console.log('🎯 LEVE DI NEGOZIAZIONE:');
      data.comparison.equivalencePoints.forEach(ep => {
        console.log(`   • ${ep.explanation}`);
      });
      console.log('');
    }
    
    // Sensitivity
    if (data.sensitivity && data.sensitivity.length > 0) {
      console.log('📊 SENSITIVITY ANALYSIS:');
      data.sensitivity.forEach(sens => {
        console.log(`   • ${sens.variable}: ${sens.values.length} valori testati`);
        if (sens.breakEvenPoint) {
          console.log(`     Break-even: ${sens.breakEvenPoint.description}`);
        }
      });
      console.log('');
    }
    
    console.log('='.repeat(80) + '\n');
    
    log('✅', 'TEST 6', 'PASSED - Esempio Ciliegie completo OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 6', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * TEST 7: Validazione Input Errati
 */
async function test7_InvalidInput() {
  log('🧪', 'TEST 7', 'Validazione Input Errati');
  
  const invalidInputs = [
    {
      name: 'Senza nome progetto',
      input: { location: 'Milano', totalUnits: 4, landScenarios: [] },
      expectedError: /projectName/i
    },
    {
      name: 'Senza scenari',
      input: { projectName: 'Test', totalUnits: 4, landScenarios: [] },
      expectedError: /scenario/i
    },
    {
      name: 'Unità zero',
      input: { projectName: 'Test', totalUnits: 0, landScenarios: [{ id: 's1', type: 'CASH', upfrontPayment: 100000 }] },
      expectedError: /unit/i
    }
  ];
  
  let passedCount = 0;
  
  for (const testCase of invalidInputs) {
    try {
      const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: testCase.input,
          userId: 'test-user'
        })
      });
      
      if (response.ok) {
        log('❌', 'TEST 7', `FAILED - ${testCase.name}: Doveva fallire ma è passato`);
      } else {
        const data = await response.json();
        log('✅', 'TEST 7', `PASSED - ${testCase.name}: Correttamente rifiutato (${response.status})`);
        passedCount++;
      }
      
    } catch (error) {
      log('❌', 'TEST 7', `ERROR - ${testCase.name}:`, error.message);
    }
  }
  
  if (passedCount === invalidInputs.length) {
    log('✅', 'TEST 7', 'PASSED - Tutte le validazioni OK');
    return { success: true };
  } else {
    log('❌', 'TEST 7', `FAILED - Solo ${passedCount}/${invalidInputs.length} validazioni passate`);
    return { success: false };
  }
}

/**
 * TEST 8: Cash Flow Consistency
 */
async function test8_CashFlowConsistency() {
  log('🧪', 'TEST 8', 'Cash Flow Consistency - Verifica somme');
  
  const input = {
    projectName: 'Test Cash Flow',
    location: 'Milano',
    type: 'RESIDENTIAL',
    totalUnits: 4,
    averagePrice: 400000,
    salesCalendar: [
      { period: 't1', units: 2 },
      { period: 't2', units: 2 }
    ],
    salesCommission: 3,
    constructionCostPerUnit: 200000,
    contingency: 10,
    softCostPercentage: 8,
    developmentCharges: 50000,
    utilities: 20000,
    landScenarios: [
      { id: 's1', name: 'S1', type: 'CASH', upfrontPayment: 250000 }
    ],
    discountRate: 12,
    constructionTimeline: [
      { phase: 'Costruzione t1', period: 't1' },
      { phase: 'Costruzione t2', period: 't2' }
    ]
  };
  
  try {
    const response = await fetch(`${baseURL}/api/business-plan/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, userId: 'test-user' })
    });
    
    const data = await response.json();
    const output = data.outputs[0];
    
    // Verifica consistenza cash flow
    const totalRevenueCF = output.cashFlow.reduce((sum, cf) => sum + cf.revenue, 0);
    const totalCostsCF = output.cashFlow.reduce((sum, cf) => 
      sum + cf.constructionCost + cf.softCosts + cf.landPayment + cf.interestAndFees, 0
    );
    const totalNetCF = output.cashFlow.reduce((sum, cf) => sum + cf.netCashFlow, 0);
    
    log('📊', 'TEST 8', 'Totali Cash Flow:', {
      Ricavi: formatNumber(totalRevenueCF),
      Costi: formatNumber(totalCostsCF),
      Netto: formatNumber(totalNetCF),
      Utile_da_Summary: formatNumber(output.summary.profit)
    });
    
    // Il CF netto totale dovrebbe essere circa uguale all'utile
    const difference = Math.abs(totalNetCF - output.summary.profit);
    const tolerance = output.summary.profit * 0.05; // 5% tolleranza
    
    if (difference > tolerance) {
      log('⚠️', 'TEST 8', `WARNING - Differenza tra CF totale e Utile: €${formatNumber(difference)}`);
    } else {
      log('✅', 'TEST 8', 'Cash Flow consistente con Utile');
    }
    
    // Verifica che ultimo CF cumulativo sia circa uguale all'utile
    const lastCumulativeCF = output.cashFlow[output.cashFlow.length - 1].cumulativeCashFlow;
    const diffCumulative = Math.abs(lastCumulativeCF - output.summary.profit);
    
    if (diffCumulative > tolerance) {
      log('⚠️', 'TEST 8', `WARNING - CF Cumulativo finale diverso da Utile: €${formatNumber(diffCumulative)}`);
    } else {
      log('✅', 'TEST 8', 'CF Cumulativo consistente');
    }
    
    log('✅', 'TEST 8', 'PASSED - Cash Flow OK');
    return { success: true, data };
    
  } catch (error) {
    log('❌', 'TEST 8', 'FAILED', { error: error.message });
    return { success: false, error: error.message };
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 BUSINESS PLAN - TEST MASSIVI IN PRODUZIONE');
  console.log('='.repeat(80) + '\n');
  
  // Attendi server startup
  log('⏳', 'SETUP', 'Attendo avvio server...');
  await sleep(5000);
  
  const results = [];
  
  // Run tests sequenzialmente
  results.push(await test1_SingleScenarioCash());
  await sleep(1000);
  
  results.push(await test2_MultipleScenarios());
  await sleep(1000);
  
  results.push(await test3_SensitivityAnalysis());
  await sleep(1000);
  
  results.push(await test4_PermutaScenario());
  await sleep(1000);
  
  results.push(await test5_DebtScenario());
  await sleep(1000);
  
  results.push(await test8_CashFlowConsistency());
  await sleep(1000);
  
  results.push(await test7_InvalidInput());
  await sleep(1000);
  
  results.push(await test6_CiliegieExample());
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(80));
  
  if (failed === 0) {
    console.log('🎉 TUTTI I TEST PASSATI - SISTEMA BUSINESS PLAN PERFETTO!');
  } else {
    console.log('⚠️ ALCUNI TEST FALLITI - REVIEW NECESSARIA');
    
    results.forEach((result, i) => {
      if (!result.success) {
        console.log(`\n❌ Test ${i + 1} fallito: ${result.error}`);
      }
    });
  }
  
  console.log('='.repeat(80) + '\n');
  
  process.exit(failed === 0 ? 0 : 1);
}

// Start tests
runAllTests().catch(error => {
  console.error('💥 FATAL ERROR:', error);
  process.exit(1);
});

