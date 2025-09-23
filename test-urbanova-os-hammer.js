// 🔨 URBANOVA OS HAMMER TEST - 100 CONVERSAZIONI DIVERSE
// Test completo di stress per verificare robustezza, intelligenza e autonomia

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURAZIONE TEST
// ============================================================================

const BASE_URL = 'http://localhost:3112'; // URL locale per test
const API_ENDPOINT = `${BASE_URL}/api/chat`;

// Headers per le richieste
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Urbanova-OS-Hammer-Test/1.0'
};

// ============================================================================
// DATI DI TEST DIVERSE CATEGORIE
// ============================================================================

const TEST_CONVERSATIONS = [
  // ============================================================================
  // CATEGORIA 1: STUDI DI FATTIBILITÀ (20 test)
  // ============================================================================
  {
    category: 'FATTIBILITÀ',
    tests: [
      "Ciao Urbanova, devo fare uno studio di fattibilità per un terreno di 5000mq a Milano. Puoi aiutarmi?",
      "Ho un terreno agricolo di 3 ettari in Toscana, voglio trasformarlo in residenziale. Fai l'analisi completa.",
      "Studio di fattibilità urgente: terreno 2000mq zona EUR Roma, destinazione commerciale.",
      "Analizza la fattibilità di un progetto residenziale su terreno di 8000mq a Bologna.",
      "Devo valutare un investimento immobiliare: terreno industriale 15000mq a Torino. Procedi con l'analisi.",
      "Fai uno studio di fattibilità per un complesso residenziale di 50 unità a Firenze.",
      "Terreno misto 6000mq a Napoli, destinazione mista residenziale-commerciale. Analizza tutto.",
      "Studio completo per terreno edificabile 4000mq zona Porta Nuova Milano.",
      "Analisi fattibilità: terreno agricolo 10 ettari in Umbria per agriturismo.",
      "Progetto residenziale di lusso su terreno 12000mq a Como. Fai l'analisi dettagliata.",
      "Studio di fattibilità per complesso commerciale 30000mq a Roma Est.",
      "Terreno industriale dismesso 20000mq a Genova. Valuta riconversione residenziale.",
      "Analizza fattibilità progetto residenziale sociale 100 unità a Palermo.",
      "Studio completo terreno 7000mq zona Navigli Milano per residenziale.",
      "Fai analisi fattibilità terreno agricolo 5 ettari in Puglia per residenziale.",
      "Progetto misto residenziale-commerciale 15000mq a Verona. Analizza tutto.",
      "Studio fattibilità terreno edificabile 9000mq zona Prati Roma.",
      "Analisi completa terreno industriale 25000mq a Bari per riconversione.",
      "Studio per complesso residenziale 80 unità a Bergamo. Procedi.",
      "Terreno misto 11000mq a Padova. Fai studio fattibilità completo."
    ]
  },

  // ============================================================================
  // CATEGORIA 2: RICERCA MERCATO E INTELLIGENZA (15 test)
  // ============================================================================
  {
    category: 'RICERCA_MERCATO',
    tests: [
      "Analizza il mercato immobiliare di Milano per appartamenti di lusso.",
      "Fai una ricerca di mercato sui prezzi degli uffici a Roma centro.",
      "Studio del mercato residenziale a Firenze: trend e previsioni.",
      "Analisi mercato immobiliare commerciale a Torino. Dammi tutti i dati.",
      "Ricerca prezzi terreni edificabili nella zona di Bologna.",
      "Studio mercato immobiliare turistico in Toscana.",
      "Analizza il mercato degli immobili industriali a Napoli.",
      "Ricerca mercato residenziale sociale a Palermo.",
      "Studio mercato immobiliare di lusso a Como e dintorni.",
      "Analisi mercato commerciale a Verona centro storico.",
      "Ricerca prezzi immobili residenziali a Bergamo.",
      "Studio mercato immobiliare studentesco a Padova.",
      "Analisi mercato residenziale a Genova zona porto.",
      "Ricerca mercato immobiliare turistico in Sicilia.",
      "Studio mercato immobiliare residenziale a Bari."
    ]
  },

  // ============================================================================
  // CATEGORIA 3: GESTIONE PROGETTI E TIMELINE (15 test)
  // ============================================================================
  {
    category: 'GESTIONE_PROGETTI',
    tests: [
      "Crea un piano di progetto per un complesso residenziale di 100 unità.",
      "Gestisci la timeline di un progetto immobiliare di 18 mesi.",
      "Organizza le fasi di un progetto residenziale da zero.",
      "Crea cronoprogramma per ristrutturazione edificio storico.",
      "Gestisci progetto residenziale con 5 fasi di sviluppo.",
      "Organizza timeline progetto commerciale 24 mesi.",
      "Crea piano progetto residenziale sociale con permessi.",
      "Gestisci progetto misto residenziale-commerciale.",
      "Organizza fasi progetto residenziale di lusso.",
      "Crea cronoprogramma progetto residenziale con cantieri multipli.",
      "Gestisci progetto residenziale con finanziamenti pubblici.",
      "Organizza timeline progetto residenziale sostenibile.",
      "Crea piano progetto residenziale con tecnologie smart.",
      "Gestisci progetto residenziale con certificazioni energetiche.",
      "Organizza fasi progetto residenziale con spazi comuni."
    ]
  },

  // ============================================================================
  // CATEGORIA 4: COMPLIANCE E PERMESSI (10 test)
  // ============================================================================
  {
    category: 'COMPLIANCE_PERMESSI',
    tests: [
      "Verifica tutti i permessi necessari per un progetto residenziale a Milano.",
      "Controlla compliance normativa per terreno agricolo da trasformare.",
      "Analizza permessi per complesso commerciale a Roma.",
      "Verifica normative per progetto residenziale sostenibile.",
      "Controlla compliance per ristrutturazione edificio storico.",
      "Analizza permessi per progetto residenziale sociale.",
      "Verifica normative per complesso residenziale di lusso.",
      "Controlla compliance per progetto misto residenziale-commerciale.",
      "Analizza permessi per progetto residenziale con spazi verdi.",
      "Verifica normative per progetto residenziale con parcheggi."
    ]
  },

  // ============================================================================
  // CATEGORIA 5: DOMANDE GENERALI E CONVERSAZIONALI (20 test)
  // ============================================================================
  {
    category: 'CONVERSAZIONI_GENERALI',
    tests: [
      "Ciao Urbanova, come stai oggi?",
      "Qual è il tempo a Milano?",
      "Raccontami una barzelletta.",
      "Che ore sono?",
      "Come si calcola il ROI di un investimento immobiliare?",
      "Qual è la differenza tra rendita catastale e valore di mercato?",
      "Spiegami cos'è un mutuo a tasso fisso.",
      "Come funziona l'IVA sugli immobili?",
      "Quali sono i vantaggi del Superbonus 110%?",
      "Come si calcola l'IMU?",
      "Spiegami la differenza tra prima e seconda casa.",
      "Come funziona la compravendita immobiliare?",
      "Quali documenti servono per un mutuo?",
      "Come si calcola il valore di un immobile?",
      "Spiegami cos'è il catasto.",
      "Come funziona la successione immobiliare?",
      "Quali sono i costi di un'agenzia immobiliare?",
      "Come si fa una perizia immobiliare?",
      "Spiegami cos'è il diritto di superficie.",
      "Come funziona l'affitto a canone concordato?"
    ]
  },

  // ============================================================================
  // CATEGORIA 6: DOMANDE TECNICHE COMPLESSE (10 test)
  // ============================================================================
  {
    category: 'DOMANDE_TECNICHE',
    tests: [
      "Calcola il VAN di un progetto residenziale con investimento iniziale di 5M€ e flussi di 500k€ annui per 15 anni.",
      "Analizza la sostenibilità energetica di un complesso residenziale di 200 unità.",
      "Calcola il LTV (Loan-to-Value) per un mutuo di 300k€ su immobile del valore di 400k€.",
      "Analizza l'impatto ambientale di un progetto residenziale su terreno di 10 ettari.",
      "Calcola il DSCR (Debt Service Coverage Ratio) per un progetto commerciale.",
      "Analizza la fattibilità finanziaria di un progetto residenziale con finanziamento misto pubblico-privato.",
      "Calcola il payback period di un investimento immobiliare con cash flow negativi iniziali.",
      "Analizza la sensibilità del progetto ai cambiamenti dei tassi di interesse.",
      "Calcola il valore attuale netto di un progetto residenziale con scenari multipli.",
      "Analizza la sostenibilità economica di un progetto residenziale sociale."
    ]
  },

  // ============================================================================
  // CATEGORIA 7: DOMANDE STRANE E EDGE CASES (10 test)
  // ============================================================================
  {
    category: 'EDGE_CASES',
    tests: [
      "Cosa succede se costruisco una casa su Marte?",
      "Posso comprare la Torre Eiffel?",
      "Come faccio a diventare milionario vendendo case di cartone?",
      "È legale costruire una casa sull'albero di 10 piani?",
      "Posso affittare il mio garage come ufficio?",
      "Come faccio a vendere una casa che non esiste?",
      "È possibile costruire una casa sott'acqua?",
      "Posso comprare un castello per 1€?",
      "Come faccio a diventare proprietario di tutto il mondo?",
      "È legale vivere in una casa mobile permanente?"
    ]
  }
];

// ============================================================================
// FUNZIONI DI SUPPORTO
// ============================================================================

/**
 * Simula una conversazione con Urbanova OS
 */
async function simulateConversation(testMessage, testId, category) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 [TEST ${testId}] ${category}: "${testMessage}"`);
    
    const response = await axios.post(API_ENDPOINT, {
      message: testMessage,
      sessionId: `hammer-test-${testId}`,
      userId: 'hammer-test-user',
      userEmail: 'hammer@test.com'
    }, {
      headers,
      timeout: 30000 // 30 secondi timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const result = {
      testId,
      category,
      input: testMessage,
      output: response.data.response || 'Nessuna risposta',
      responseTime,
      success: true,
      timestamp: new Date().toISOString(),
      metadata: response.data.metadata || {},
      urbanovaOS: response.data.metadata?.urbanovaOS || false
    };

    console.log(`✅ [TEST ${testId}] Risposta ricevuta in ${responseTime}ms`);
    console.log(`📝 [TEST ${testId}] Risposta: ${result.output.substring(0, 100)}...`);
    
    if (result.urbanovaOS) {
      console.log(`🚀 [TEST ${testId}] Urbanova OS attivato!`);
    }

    return result;

  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`❌ [TEST ${testId}] Errore: ${error.message}`);
    
    return {
      testId,
      category,
      input: testMessage,
      output: `ERRORE: ${error.message}`,
      responseTime,
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      urbanovaOS: false
    };
  }
}

/**
 * Analizza i risultati del test
 */
function analyzeResults(results) {
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  const urbanovaOSActivations = results.filter(r => r.urbanovaOS).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
  
  const categoryStats = {};
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = {
        total: 0,
        success: 0,
        failures: 0,
        urbanovaOS: 0,
        avgResponseTime: 0
      };
    }
    
    categoryStats[result.category].total++;
    if (result.success) categoryStats[result.category].success++;
    else categoryStats[result.category].failures++;
    if (result.urbanovaOS) categoryStats[result.category].urbanovaOS++;
  });

  // Calcola tempi medi per categoria
  Object.keys(categoryStats).forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    categoryStats[category].avgResponseTime = 
      categoryResults.reduce((sum, r) => sum + r.responseTime, 0) / categoryResults.length;
  });

  return {
    summary: {
      totalTests,
      successfulTests,
      failedTests,
      successRate: (successfulTests / totalTests * 100).toFixed(2),
      urbanovaOSActivations,
      urbanovaOSActivationRate: (urbanovaOSActivations / totalTests * 100).toFixed(2),
      avgResponseTime: Math.round(avgResponseTime)
    },
    categoryStats,
    results
  };
}

/**
 * Genera report dettagliato
 */
function generateReport(analysis) {
  const report = `
# 🔨 URBANOVA OS HAMMER TEST REPORT

## 📊 RIEPILOGO GENERALE
- **Test Totali**: ${analysis.summary.totalTests}
- **Test Riusciti**: ${analysis.summary.successfulTests}
- **Test Falliti**: ${analysis.summary.failedTests}
- **Tasso di Successo**: ${analysis.summary.successRate}%
- **Attivazioni Urbanova OS**: ${analysis.summary.urbanovaOSActivations}
- **Tasso Attivazione OS**: ${analysis.summary.urbanovaOSActivationRate}%
- **Tempo Risposta Medio**: ${analysis.summary.avgResponseTime}ms

## 📈 STATISTICHE PER CATEGORIA

${Object.entries(analysis.categoryStats).map(([category, stats]) => `
### ${category}
- **Test Totali**: ${stats.total}
- **Successi**: ${stats.success} (${(stats.success/stats.total*100).toFixed(2)}%)
- **Fallimenti**: ${stats.failures}
- **Attivazioni OS**: ${stats.urbanovaOS} (${(stats.urbanovaOS/stats.total*100).toFixed(2)}%)
- **Tempo Risposta Medio**: ${Math.round(stats.avgResponseTime)}ms
`).join('')}

## 🎯 VALUTAZIONE PERFORMANCE

### ✅ PUNTI DI FORZA
${analysis.summary.successRate >= 90 ? '- Sistema molto stabile e affidabile' : ''}
${analysis.summary.urbanovaOSActivationRate >= 70 ? '- Urbanova OS si attiva correttamente nella maggior parte dei casi' : ''}
${analysis.summary.avgResponseTime <= 5000 ? '- Tempi di risposta ottimi' : ''}

### ⚠️ AREE DI MIGLIORAMENTO
${analysis.summary.successRate < 90 ? '- Alcuni test hanno fallito, verificare errori' : ''}
${analysis.summary.urbanovaOSActivationRate < 70 ? '- Urbanova OS potrebbe attivarsi più frequentemente' : ''}
${analysis.summary.avgResponseTime > 5000 ? '- Tempi di risposta potrebbero essere migliorati' : ''}

## 🔍 DETTAGLI TEST FALLITI
${analysis.results.filter(r => !r.success).map(r => `
### Test ${r.testId} - ${r.category}
- **Input**: ${r.input}
- **Errore**: ${r.error}
- **Timestamp**: ${r.timestamp}
`).join('')}

## 🚀 DETTAGLI ATTIVAZIONI URBANOVA OS
${analysis.results.filter(r => r.urbanovaOS).map(r => `
### Test ${r.testId} - ${r.category}
- **Input**: ${r.input}
- **Output**: ${r.output.substring(0, 200)}...
- **Tempo Risposta**: ${r.responseTime}ms
`).join('')}

---
*Report generato il ${new Date().toLocaleString('it-IT')}*
`;

  return report;
}

// ============================================================================
// ESECUZIONE HAMMER TEST
// ============================================================================

async function runHammerTest() {
  console.log('🔨 INIZIO URBANOVA OS HAMMER TEST');
  console.log('=====================================');
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`📊 Test Totali: ${TEST_CONVERSATIONS.reduce((sum, cat) => sum + cat.tests.length, 0)}`);
  console.log(`⏰ Inizio: ${new Date().toLocaleString('it-IT')}`);
  console.log('=====================================\n');

  const allResults = [];
  let testCounter = 1;

  // Esegui tutti i test per categoria
  for (const category of TEST_CONVERSATIONS) {
    console.log(`\n📂 CATEGORIA: ${category.category}`);
    console.log('='.repeat(50));
    
    for (const testMessage of category.tests) {
      const result = await simulateConversation(testMessage, testCounter, category.category);
      allResults.push(result);
      
      // Pausa tra test per non sovraccaricare il server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      testCounter++;
    }
  }

  console.log('\n🔍 ANALISI RISULTATI...');
  const analysis = analyzeResults(allResults);
  
  console.log('\n📊 RIEPILOGO FINALE:');
  console.log('====================');
  console.log(`✅ Test Riusciti: ${analysis.summary.successfulTests}/${analysis.summary.totalTests} (${analysis.summary.successRate}%)`);
  console.log(`🚀 Attivazioni Urbanova OS: ${analysis.summary.urbanovaOSActivations}/${analysis.summary.totalTests} (${analysis.summary.urbanovaOSActivationRate}%)`);
  console.log(`⏱️ Tempo Risposta Medio: ${analysis.summary.avgResponseTime}ms`);
  
  // Genera report dettagliato
  const report = generateReport(analysis);
  
  // Salva report su file
  const reportPath = path.join(__dirname, `urbanova-os-hammer-test-report-${Date.now()}.md`);
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📄 Report salvato su: ${reportPath}`);
  
  // Salva anche risultati raw in JSON
  const jsonPath = path.join(__dirname, `urbanova-os-hammer-test-results-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  
  console.log(`📊 Risultati raw salvati su: ${jsonPath}`);
  
  console.log('\n🎉 HAMMER TEST COMPLETATO!');
  
  return analysis;
}

// ============================================================================
// AVVIO TEST
// ============================================================================

if (require.main === module) {
  runHammerTest()
    .then(analysis => {
      console.log('\n✅ Test completato con successo!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Errore durante il test:', error);
      process.exit(1);
    });
}

module.exports = { runHammerTest, TEST_CONVERSATIONS };
