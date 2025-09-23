#!/usr/bin/env node

const https = require('https');

// Configurazione
const API_URL = 'https://www.urbanova.life/api/chat';
const TOTAL_TESTS = 100;
const DELAY_BETWEEN_TESTS = 2000; // 2 secondi

// Array di test cases estremi
const testCases = [
  // 1-10: UTENTI INCAZZATI E AGGRESSIVI
  {
    id: 1,
    category: "UTENTE INCAZZATO",
    message: "Questo OS fa schifo! Voglio un'analisi di fattibilità per un terreno a Roma, 800mq, costo 1800 euro/mq, acquisto 400000 euro, target 25%!",
    expectedTools: ["feasibility_analysis"],
    difficulty: "EXTREME"
  },
  {
    id: 2,
    category: "UTENTE INCAZZATO",
    message: "URBANOVA È UNA MERDA! Non funziona niente! Aiutami con un progetto a Milano o ti denuncio!",
    expectedTools: ["feasibility_analysis", "market_intelligence"],
    difficulty: "EXTREME"
  },
  {
    id: 3,
    category: "UTENTE INCAZZATO",
    message: "STO PERDENDO SOLDI PER COLPA TUA! Fai subito un'analisi di sensibilità per il prezzo di vendita!",
    expectedTools: ["sensitivity_analysis"],
    difficulty: "EXTREME"
  },
  {
    id: 4,
    category: "UTENTE INCAZZATO",
    message: "SEI INUTILE! Voglio un business plan completo ORA! Terreno 500mq, costruzione 2000€/mq, acquisto 300k!",
    expectedTools: ["feasibility_analysis", "strategic_planning"],
    difficulty: "EXTREME"
  },
  {
    id: 5,
    category: "UTENTE INCAZZATO",
    message: "NON CAPISCI NIENTE! Fai un'analisi di rischio per il mio progetto o ti licenzio!",
    expectedTools: ["risk_analysis"],
    difficulty: "EXTREME"
  }
];

// Funzione per fare una richiesta HTTP
function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: testCase.message,
      userId: `hammer-crudele-${testCase.id}`,
      userEmail: `hammer-crudele-${testCase.id}@example.com`,
      conversationHistory: []
    });

    const options = {
      hostname: 'www.urbanova.life',
      port: 443,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            testCase,
            response: response.response || 'NO RESPONSE',
            statusCode: res.statusCode,
            success: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            testCase,
            response: 'PARSE ERROR: ' + error.message,
            statusCode: res.statusCode,
            success: false,
            error: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        testCase,
        response: 'REQUEST ERROR: ' + error.message,
        statusCode: 0,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({
        testCase,
        response: 'TIMEOUT ERROR',
        statusCode: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

// Funzione per analizzare la risposta
function analyzeResponse(result) {
  const { testCase, response, success } = result;
  
  const analysis = {
    testId: testCase.id,
    category: testCase.category,
    difficulty: testCase.difficulty,
    success: success,
    responseLength: response.length,
    hasFeasibilityAnalysis: response.toLowerCase().includes('analisi di fattibilità') || 
                           response.toLowerCase().includes('costo di costruzione') ||
                           response.toLowerCase().includes('prezzo di vendita'),
    hasSensitivityAnalysis: response.toLowerCase().includes('sensibilità') ||
                           response.toLowerCase().includes('sensitivity') ||
                           response.toLowerCase().includes('variazione'),
    hasRiskAnalysis: response.toLowerCase().includes('rischio') ||
                    response.toLowerCase().includes('risk') ||
                    response.toLowerCase().includes('mitigazione'),
    hasMarketAnalysis: response.toLowerCase().includes('mercato') ||
                      response.toLowerCase().includes('market') ||
                      response.toLowerCase().includes('prezzi di mercato'),
    hasInvestmentValuation: response.toLowerCase().includes('valutazione') ||
                           response.toLowerCase().includes('valuation') ||
                           response.toLowerCase().includes('irr') ||
                           response.toLowerCase().includes('npv'),
    hasStrategicPlanning: response.toLowerCase().includes('strategico') ||
                         response.toLowerCase().includes('strategic') ||
                         response.toLowerCase().includes('piano') ||
                         response.toLowerCase().includes('plan'),
    isGenericResponse: response.toLowerCase().includes('ciao! sono qui per aiutarti') ||
                      response.toLowerCase().includes('posso supportarti') ||
                      response.toLowerCase().includes('dimmi pure cosa hai in mente'),
    isErrorResponse: response.toLowerCase().includes('error') ||
                    response.toLowerCase().includes('errore') ||
                    response.toLowerCase().includes('timeout'),
    isProfessional: response.includes('€') || response.includes('mq') || response.includes('%') ||
                   response.includes('euro') || response.includes('metri') || response.includes('percentuale'),
    toolActivation: 'UNKNOWN'
  };

  if (analysis.hasFeasibilityAnalysis) analysis.toolActivation = 'feasibility_analysis';
  else if (analysis.hasSensitivityAnalysis) analysis.toolActivation = 'sensitivity_analysis';
  else if (analysis.hasRiskAnalysis) analysis.toolActivation = 'risk_analysis';
  else if (analysis.hasMarketAnalysis) analysis.toolActivation = 'market_benchmark';
  else if (analysis.hasInvestmentValuation) analysis.toolActivation = 'investment_valuation';
  else if (analysis.hasStrategicPlanning) analysis.toolActivation = 'strategic_planning';
  else if (analysis.isGenericResponse) analysis.toolActivation = 'generic_response';
  else if (analysis.isErrorResponse) analysis.toolActivation = 'error_response';
  else analysis.toolActivation = 'unknown';

  return analysis;
}

// Funzione principale
async function runHammerTest() {
  console.log('🔨 HAMMER TEST CRUDELE - INIZIO');
  console.log('================================');
  console.log(`Testando ${testCases.length} conversazioni estreme...`);
  console.log('');

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 TEST ${i + 1}/${testCases.length} - ${testCase.category} (${testCase.difficulty})`);
    console.log(`📝 Messaggio: "${testCase.message.substring(0, 100)}..."`);
    
    try {
      const result = await makeRequest(testCase);
      const analysis = analyzeResponse(result);
      results.push(analysis);
      
      console.log(`✅ Risposta ricevuta (${result.response.length} caratteri)`);
      console.log(`�� Tool attivato: ${analysis.toolActivation}`);
      console.log(`📊 Successo: ${analysis.success ? 'SÌ' : 'NO'}`);
      
      if (analysis.isGenericResponse) {
        console.log('⚠️  RISPOSTA GENERICA RILEVATA!');
      }
      if (analysis.isErrorResponse) {
        console.log('❌ ERRORE RILEVATO!');
      }
      
    } catch (error) {
      console.log(`❌ ERRORE: ${error.message}`);
      results.push({
        testId: testCase.id,
        category: testCase.category,
        difficulty: testCase.difficulty,
        success: false,
        error: error.message,
        toolActivation: 'error'
      });
    }

    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;

  generateReport(results, totalTime);
}

// Funzione per generare il report
function generateReport(results, totalTime) {
  console.log('\n\n📊 REPORT HAMMER TEST CRUDELE');
  console.log('================================');
  console.log(`⏱️  Tempo totale: ${totalTime.toFixed(2)} secondi`);
  console.log(`🧪 Test eseguiti: ${results.length}`);
  console.log('');

  const successRate = (results.filter(r => r.success).length / results.length) * 100;
  const genericResponses = results.filter(r => r.isGenericResponse).length;
  const errorResponses = results.filter(r => r.isErrorResponse).length;
  const professionalResponses = results.filter(r => r.isProfessional).length;

  console.log('📈 STATISTICHE GENERALI');
  console.log('------------------------');
  console.log(`✅ Tasso di successo: ${successRate.toFixed(1)}%`);
  console.log(`⚠️  Risposte generiche: ${genericResponses} (${(genericResponses/results.length*100).toFixed(1)}%)`);
  console.log(`❌ Risposte di errore: ${errorResponses} (${(errorResponses/results.length*100).toFixed(1)}%)`);
  console.log(`💼 Risposte professionali: ${professionalResponses} (${(professionalResponses/results.length*100).toFixed(1)}%)`);
  console.log('');

  console.log('🔧 ANALISI TOOL ACTIVATION');
  console.log('---------------------------');
  const toolActivations = [...new Set(results.map(r => r.toolActivation))];
  toolActivations.forEach(tool => {
    const toolCount = results.filter(r => r.toolActivation === tool).length;
    console.log(`${tool}: ${toolCount} volte (${(toolCount/results.length*100).toFixed(1)}%)`);
  });
  console.log('');

  console.log('💡 RACCOMANDAZIONI');
  console.log('-------------------');
  if (genericResponses > results.length * 0.2) {
    console.log('❌ TROPPE RISPOSTE GENERICHE: Migliorare il riconoscimento delle intenzioni');
  }
  if (errorResponses > results.length * 0.1) {
    console.log('❌ TROPPI ERRORI: Migliorare la gestione degli errori e timeout');
  }
  if (successRate < 80) {
    console.log('❌ TASSO DI SUCCESSO BASSO: Rivedere la logica di routing dei tool');
  }
  if (professionalResponses < results.length * 0.5) {
    console.log('❌ POCHE RISPOSTE PROFESSIONALI: Migliorare la qualità delle risposte');
  }
  
  console.log('\n🎯 LIVELLO ATTUALE URBANOVA OS:');
  if (successRate >= 90 && genericResponses < results.length * 0.1) {
    console.log('🏆 ECCELLENTE - Pronto per utenti paganti');
  } else if (successRate >= 80 && genericResponses < results.length * 0.2) {
    console.log('✅ BUONO - Quasi pronto, piccoli miglioramenti');
  } else if (successRate >= 70 && genericResponses < results.length * 0.3) {
    console.log('⚠️  MEDIO - Necessari miglioramenti significativi');
  } else {
    console.log('❌ INSUFFICIENTE - Rework necessario');
  }
}

runHammerTest().catch(console.error);
