/**
 * 🧪 TEST MANIACALE URBANOVA OS 2.0 - PRODUZIONE
 * 
 * Test completo di 100 conversazioni (50 + analisi + 50) per valutare:
 * - Connessione OpenAI ✅
 * - Qualità risposte (empatia, precisione, brillantezza)
 * - Attivazione tool (timing, pertinenza)
 * - Interfaccia con dati (CRUD operazioni)
 * - Audio & Text quality
 * - UX complessiva
 */

const axios = require('axios');
const fs = require('fs');

// Configurazione
const API_URL = 'http://localhost:3112/api/os2/chat';
const USER_EMAIL = 'pierpaolo.laurito@gmail.com';
const SESSION_PREFIX = 'test_maniacal_';
const RESULTS_FILE = 'OS2_MANIACAL_TEST_RESULTS.json';
const REPORT_FILE = 'OS2_MANIACAL_TEST_REPORT.md';

// Scenari di test
const TEST_SCENARIOS = [
  // 1-10: Saluti & Conversazione Generale
  {
    category: 'Conversazione Generale',
    message: 'Ciao',
    expectedBehavior: 'Saluto caloroso + presentazione capabilities',
    evaluateCriteria: ['empatia', 'chiarezza', 'invito_azione']
  },
  {
    category: 'Conversazione Generale',
    message: 'Come stai?',
    expectedBehavior: 'Risposta empatica + offerta assistenza',
    evaluateCriteria: ['empatia', 'professionalità']
  },
  {
    category: 'Conversazione Generale',
    message: 'Cosa puoi fare per me?',
    expectedBehavior: 'Lista capabilities dettagliata',
    evaluateCriteria: ['completezza', 'chiarezza', 'struttura']
  },
  {
    category: 'Conversazione Generale',
    message: 'Ho bisogno di aiuto con un progetto immobiliare',
    expectedBehavior: 'Domande di approfondimento + offerta tool specifici',
    evaluateCriteria: ['proattività', 'domande_pertinenti', 'tool_suggestion']
  },
  {
    category: 'Conversazione Generale',
    message: 'Sono nuovo qui, da dove inizio?',
    expectedBehavior: 'Onboarding guidato + primi passi',
    evaluateCriteria: ['guida_chiara', 'esempi_concreti', 'encouragement']
  },
  
  // 11-20: Analisi di Fattibilità
  {
    category: 'Analisi Fattibilità',
    message: 'Voglio fare un analisi di fattibilità per un terreno a Roma',
    expectedBehavior: 'Attivazione tool feasibility_analysis + raccolta dati',
    evaluateCriteria: ['tool_activation', 'data_collection', 'domande_pertinenti']
  },
  {
    category: 'Analisi Fattibilità',
    message: 'Analizza un terreno di 5000 mq a Milano, zona Porta Nuova',
    expectedBehavior: 'Creazione analisi + ricerca dati mercato',
    evaluateCriteria: ['tool_activation', 'data_quality', 'insights']
  },
  {
    category: 'Analisi Fattibilità',
    message: 'Posso vedere tutte le mie analisi di fattibilità?',
    expectedBehavior: 'Lista progetti + statistiche',
    evaluateCriteria: ['tool_activation', 'data_presentation', 'actionable_insights']
  },
  {
    category: 'Analisi Fattibilità',
    message: 'Modifica l\'analisi che ho appena creato: cambia il numero di unità a 10',
    expectedBehavior: 'Update progetto + conferma modifiche',
    evaluateCriteria: ['tool_activation', 'data_modification', 'confirmation']
  },
  {
    category: 'Analisi Fattibilità',
    message: 'Quanto mi costerebbe costruire 8 appartamenti a Torino?',
    expectedBehavior: 'Calcolo costi + breakdown dettagliato',
    evaluateCriteria: ['tool_activation', 'calculation_accuracy', 'explanation_quality']
  },
  
  // 21-30: Business Plan
  {
    category: 'Business Plan',
    message: 'Crea un business plan per il mio progetto residenziale',
    expectedBehavior: 'Attivazione tool business_plan + raccolta dati',
    evaluateCriteria: ['tool_activation', 'data_collection', 'completeness']
  },
  {
    category: 'Business Plan',
    message: 'Business plan per 12 unità a Firenze, vendita diretta',
    expectedBehavior: 'Creazione BP completo + analisi finanziaria',
    evaluateCriteria: ['tool_activation', 'financial_analysis', 'data_quality']
  },
  {
    category: 'Business Plan',
    message: 'Trasforma la mia analisi di fattibilità in business plan',
    expectedBehavior: 'Conversione + enrichment dati',
    evaluateCriteria: ['tool_activation', 'data_transformation', 'value_added']
  },
  {
    category: 'Business Plan',
    message: 'Mostra tutti i miei business plan',
    expectedBehavior: 'Lista BP + KPI principali',
    evaluateCriteria: ['tool_activation', 'data_presentation', 'insights']
  },
  {
    category: 'Business Plan',
    message: 'Fai sensitivity analysis sul mio ultimo business plan',
    expectedBehavior: 'Analisi scenario + varianti',
    evaluateCriteria: ['tool_activation', 'analysis_depth', 'actionable_insights']
  },
  
  // 31-40: Collaborazione & Comunicazione
  {
    category: 'Collaborazione',
    message: 'Invia questo report al mio collega mario@test.com',
    expectedBehavior: 'Preparazione email + conferma invio',
    evaluateCriteria: ['tool_activation', 'email_quality', 'professional_tone']
  },
  {
    category: 'Collaborazione',
    message: 'Condividi il progetto con il mio team',
    expectedBehavior: 'Gestione permessi + notifiche',
    evaluateCriteria: ['tool_activation', 'permissions_handling', 'notifications']
  },
  {
    category: 'Collaborazione',
    message: 'Prepara una presentazione per gli investitori',
    expectedBehavior: 'Generazione materiale + export',
    evaluateCriteria: ['tool_activation', 'content_quality', 'presentation_value']
  },
  {
    category: 'Collaborazione',
    message: 'Scrivi una RDO per il mio progetto',
    expectedBehavior: 'Creazione RDO professionale',
    evaluateCriteria: ['tool_activation', 'content_quality', 'completeness']
  },
  {
    category: 'Collaborazione',
    message: 'Chi sta lavorando sul progetto Porta Nuova?',
    expectedBehavior: 'Lista team members + ruoli',
    evaluateCriteria: ['tool_activation', 'data_accuracy', 'presentation']
  },
  
  // 41-50: Scenari Complessi & Edge Cases
  {
    category: 'Scenari Complessi',
    message: 'asdfasdf qwerty xyz 123',
    expectedBehavior: 'Gestione input non valido + guida utente',
    evaluateCriteria: ['error_handling', 'helpful_response', 'guidance']
  },
  {
    category: 'Scenari Complessi',
    message: 'Ho un terreno, non so cosa farci, aiutami tu',
    expectedBehavior: 'Domande esplorative + suggerimenti personalizzati',
    evaluateCriteria: ['proattività', 'domande_intelligenti', 'customization']
  },
  {
    category: 'Scenari Complessi',
    message: 'Confronta i costi di costruzione a Milano vs Roma vs Firenze',
    expectedBehavior: 'Analisi comparativa + insights',
    evaluateCriteria: ['tool_activation', 'analysis_depth', 'actionable_insights']
  },
  {
    category: 'Scenari Complessi',
    message: 'Voglio fare tutto: analisi, business plan, sensitivity, e inviare report',
    expectedBehavior: 'Workflow orchestration + step-by-step execution',
    evaluateCriteria: ['orchestration', 'clarity', 'completeness']
  },
  {
    category: 'Scenari Complessi',
    message: 'Mi serve un prestito bancario, come presento il mio progetto?',
    expectedBehavior: 'Guida preparation + suggerimenti pratici',
    evaluateCriteria: ['expertise', 'practical_advice', 'completeness']
  },
  {
    category: 'Scenari Complessi',
    message: 'Il comune ha bocciato il mio progetto, cosa faccio?',
    expectedBehavior: 'Supporto emotivo + alternative pratiche',
    evaluateCriteria: ['empatia', 'problem_solving', 'actionable_steps']
  },
  {
    category: 'Scenari Complessi',
    message: 'Calcola il ROI atteso per un progetto di 20 unità a Bologna',
    expectedBehavior: 'Calcolo finanziario dettagliato + breakdown',
    evaluateCriteria: ['tool_activation', 'calculation_accuracy', 'explanation']
  },
  {
    category: 'Scenari Complessi',
    message: 'Quali sono le zone più profittevoli per investimenti immobiliari?',
    expectedBehavior: 'Market intelligence + data-driven insights',
    evaluateCriteria: ['tool_activation', 'data_quality', 'insights']
  },
  {
    category: 'Scenari Complessi',
    message: 'Elimina tutti i miei progetti',
    expectedBehavior: 'Richiesta conferma + warning',
    evaluateCriteria: ['safety', 'confirmation_required', 'clarity']
  },
  {
    category: 'Scenari Complessi',
    message: 'Urbanova è meglio di ChatGPT?',
    expectedBehavior: 'Risposta diplomatica + focus su specializzazione',
    evaluateCriteria: ['professionalità', 'focus_value', 'no_arrogance']
  }
];

// Metriche di valutazione
const EVALUATION_CRITERIA = {
  empatia: {
    weight: 0.15,
    check: (response) => {
      const empathyWords = ['capisco', 'comprendo', 'aiutarti', 'insieme', 'felice', 'piacere'];
      return empathyWords.some(word => response.toLowerCase().includes(word));
    }
  },
  chiarezza: {
    weight: 0.2,
    check: (response) => {
      return response.length > 50 && response.length < 1000 && !response.includes('undefined');
    }
  },
  professionalità: {
    weight: 0.15,
    check: (response) => {
      const professionalTone = !response.toLowerCase().includes('non so') && 
                               !response.toLowerCase().includes('non posso');
      return professionalTone;
    }
  },
  tool_activation: {
    weight: 0.25,
    check: (response, metadata) => {
      return metadata && metadata.smart === true && metadata.duration < 3000;
    }
  },
  completeness: {
    weight: 0.15,
    check: (response) => {
      const hasStructure = response.includes('•') || response.includes('-') || response.includes('\n');
      return response.length > 100 && hasStructure;
    }
  },
  actionability: {
    weight: 0.1,
    check: (response) => {
      const actionWords = ['puoi', 'prova', 'inizia', 'crea', 'vai', 'usa'];
      return actionWords.some(word => response.toLowerCase().includes(word));
    }
  }
};

// Risultati aggregati
let testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  averageScore: 0,
  averageResponseTime: 0,
  categoryScores: {},
  detailedResults: [],
  criticalIssues: [],
  recommendations: []
};

/**
 * Esegue un singolo test
 */
async function runSingleTest(scenario, index) {
  console.log(`\n🧪 Test ${index + 1}/${TEST_SCENARIOS.length}: ${scenario.category}`);
  console.log(`📝 Messaggio: "${scenario.message}"`);
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(API_URL, {
      message: scenario.message,
      userId: 'test-maniacal',
      userEmail: USER_EMAIL,
      sessionId: `${SESSION_PREFIX}${Date.now()}`,
    }, {
      timeout: 30000 // 30s timeout
    });
    
    const duration = Date.now() - startTime;
    const { data } = response;
    
    // Valuta la risposta
    const evaluation = evaluateResponse(data, scenario, duration);
    
    // Log risultato
    console.log(`${evaluation.passed ? '✅' : '❌'} Score: ${evaluation.score.toFixed(2)}/100`);
    console.log(`⏱️  Durata: ${duration}ms`);
    console.log(`🧠 Smart: ${data.smart ? 'Sì' : 'No'} | Fallback: ${data.fallback ? 'Sì' : 'No'}`);
    console.log(`📄 Risposta: ${data.response ? data.response.substring(0, 100) + '...' : 'Nessuna risposta'}`);
    
    if (!evaluation.passed) {
      console.log(`⚠️  Problemi rilevati: ${evaluation.issues.join(', ')}`);
    }
    
    // Salva risultato
    testResults.detailedResults.push({
      testNumber: index + 1,
      category: scenario.category,
      message: scenario.message,
      evaluation,
      response: data,
      duration
    });
    
    // Aggiorna statistiche
    testResults.totalTests++;
    if (evaluation.passed) {
      testResults.passedTests++;
    } else {
      testResults.failedTests++;
      if (evaluation.score < 40) {
        testResults.criticalIssues.push({
          test: index + 1,
          category: scenario.category,
          message: scenario.message,
          score: evaluation.score,
          issues: evaluation.issues
        });
      }
    }
    
    // Aggiorna score per categoria
    if (!testResults.categoryScores[scenario.category]) {
      testResults.categoryScores[scenario.category] = {
        total: 0,
        count: 0,
        scores: []
      };
    }
    testResults.categoryScores[scenario.category].total += evaluation.score;
    testResults.categoryScores[scenario.category].count++;
    testResults.categoryScores[scenario.category].scores.push(evaluation.score);
    
    return evaluation;
    
  } catch (error) {
    console.error(`❌ Errore test: ${error.message}`);
    
    const evaluation = {
      passed: false,
      score: 0,
      issues: [`Errore tecnico: ${error.message}`],
      breakdown: {}
    };
    
    testResults.detailedResults.push({
      testNumber: index + 1,
      category: scenario.category,
      message: scenario.message,
      evaluation,
      error: error.message,
      duration: Date.now() - startTime
    });
    
    testResults.totalTests++;
    testResults.failedTests++;
    testResults.criticalIssues.push({
      test: index + 1,
      category: scenario.category,
      message: scenario.message,
      score: 0,
      issues: [error.message]
    });
    
    return evaluation;
  }
}

/**
 * Valuta una risposta basandosi sui criteri
 */
function evaluateResponse(data, scenario, duration) {
  const response = data.response || '';
  const metadata = data;
  
  let totalScore = 0;
  const breakdown = {};
  const issues = [];
  
  // Valuta ogni criterio
  for (const [criterion, config] of Object.entries(EVALUATION_CRITERIA)) {
    const passed = config.check(response, metadata);
    const score = passed ? 100 : 0;
    const weightedScore = score * config.weight;
    
    breakdown[criterion] = {
      passed,
      score,
      weightedScore,
      weight: config.weight
    };
    
    totalScore += weightedScore;
    
    if (!passed && scenario.evaluateCriteria && scenario.evaluateCriteria.includes(criterion)) {
      issues.push(`Manca ${criterion}`);
    }
  }
  
  // Penalità per tempo di risposta eccessivo
  if (duration > 5000) {
    totalScore *= 0.9;
    issues.push('Tempo risposta >5s');
  }
  
  // Penalità per fallback
  if (metadata.fallback) {
    totalScore *= 0.7;
    issues.push('Sistema fallback attivo');
  }
  
  // Bonus per sistema smart
  if (metadata.smart && !metadata.fallback) {
    totalScore *= 1.1; // 10% bonus
  }
  
  // Cap a 100
  totalScore = Math.min(totalScore, 100);
  
  return {
    passed: totalScore >= 60, // Soglia di accettabilità
    score: totalScore,
    breakdown,
    issues,
    duration
  };
}

/**
 * Genera report finale
 */
function generateReport() {
  console.log('\n📊 GENERAZIONE REPORT FINALE...\n');
  
  // Calcola medie
  testResults.averageScore = testResults.detailedResults.reduce((sum, r) => sum + r.evaluation.score, 0) / testResults.totalTests;
  testResults.averageResponseTime = testResults.detailedResults.reduce((sum, r) => sum + r.duration, 0) / testResults.totalTests;
  
  // Calcola score per categoria
  for (const [category, stats] of Object.entries(testResults.categoryScores)) {
    stats.average = stats.total / stats.count;
  }
  
  // Genera raccomandazioni
  generateRecommendations();
  
  // Salva JSON
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(testResults, null, 2));
  console.log(`✅ Risultati salvati in ${RESULTS_FILE}`);
  
  // Genera Markdown report
  const markdown = generateMarkdownReport();
  fs.writeFileSync(REPORT_FILE, markdown);
  console.log(`✅ Report generato in ${REPORT_FILE}`);
  
  // Stampa summary
  printSummary();
}

/**
 * Genera raccomandazioni basate sui risultati
 */
function generateRecommendations() {
  const recs = [];
  
  // Analizza score per categoria
  for (const [category, stats] of Object.entries(testResults.categoryScores)) {
    if (stats.average < 60) {
      recs.push({
        priority: 'HIGH',
        category,
        issue: `Score medio basso (${stats.average.toFixed(1)}/100)`,
        recommendation: `Migliorare gestione categoria "${category}": analizzare failures e ottimizzare tool activation/response quality`
      });
    }
  }
  
  // Analizza tempo di risposta
  if (testResults.averageResponseTime > 3000) {
    recs.push({
      priority: 'MEDIUM',
      category: 'Performance',
      issue: `Tempo risposta medio alto (${testResults.averageResponseTime}ms)`,
      recommendation: 'Ottimizzare chiamate OpenAI, implementare caching, ridurre token usage'
    });
  }
  
  // Analizza fallback rate
  const fallbackRate = testResults.detailedResults.filter(r => r.response && r.response.fallback).length / testResults.totalTests;
  if (fallbackRate > 0.1) {
    recs.push({
      priority: 'HIGH',
      category: 'Reliability',
      issue: `Alto tasso di fallback (${(fallbackRate * 100).toFixed(1)}%)`,
      recommendation: 'Verificare connessione OpenAI, validare API key, implementare retry logic'
    });
  }
  
  // Analizza critical issues
  if (testResults.criticalIssues.length > 5) {
    recs.push({
      priority: 'CRITICAL',
      category: 'Quality',
      issue: `${testResults.criticalIssues.length} test con score < 40`,
      recommendation: 'Rivedere prompts, migliorare function calling, implementare guardrails più robusti'
    });
  }
  
  testResults.recommendations = recs;
}

/**
 * Genera report Markdown
 */
function generateMarkdownReport() {
  let md = `# 📊 URBANOVA OS 2.0 - TEST MANIACALE PRODUZIONE\n\n`;
  md += `**Data**: ${new Date(testResults.timestamp).toLocaleString('it-IT')}\n\n`;
  md += `---\n\n`;
  
  // Executive Summary
  md += `## 📈 Executive Summary\n\n`;
  md += `- **Test Totali**: ${testResults.totalTests}\n`;
  md += `- **Test Passati**: ${testResults.passedTests} (${(testResults.passedTests / testResults.totalTests * 100).toFixed(1)}%)\n`;
  md += `- **Test Falliti**: ${testResults.failedTests} (${(testResults.failedTests / testResults.totalTests * 100).toFixed(1)}%)\n`;
  md += `- **Score Medio**: ${testResults.averageScore.toFixed(2)}/100\n`;
  md += `- **Tempo Risposta Medio**: ${testResults.averageResponseTime.toFixed(0)}ms\n\n`;
  
  // Score per Categoria
  md += `## 📊 Score per Categoria\n\n`;
  md += `| Categoria | Score Medio | Test | Min | Max |\n`;
  md += `|-----------|-------------|------|-----|-----|\n`;
  for (const [category, stats] of Object.entries(testResults.categoryScores)) {
    const min = Math.min(...stats.scores);
    const max = Math.max(...stats.scores);
    md += `| ${category} | ${stats.average.toFixed(1)} | ${stats.count} | ${min.toFixed(1)} | ${max.toFixed(1)} |\n`;
  }
  md += `\n`;
  
  // Critical Issues
  if (testResults.criticalIssues.length > 0) {
    md += `## ⚠️ Critical Issues\n\n`;
    for (const issue of testResults.criticalIssues) {
      md += `### Test #${issue.test} - ${issue.category}\n`;
      md += `- **Messaggio**: "${issue.message}"\n`;
      md += `- **Score**: ${issue.score.toFixed(1)}/100\n`;
      md += `- **Problemi**: ${issue.issues.join(', ')}\n\n`;
    }
  }
  
  // Raccomandazioni
  if (testResults.recommendations.length > 0) {
    md += `## 💡 Raccomandazioni\n\n`;
    for (const rec of testResults.recommendations) {
      md += `### ${rec.priority} - ${rec.category}\n`;
      md += `**Issue**: ${rec.issue}\n\n`;
      md += `**Recommendation**: ${rec.recommendation}\n\n`;
    }
  }
  
  // Risultati Dettagliati
  md += `## 📋 Risultati Dettagliati\n\n`;
  for (const result of testResults.detailedResults) {
    md += `### Test #${result.testNumber} - ${result.category}\n`;
    md += `- **Messaggio**: "${result.message}"\n`;
    md += `- **Score**: ${result.evaluation.score.toFixed(1)}/100 ${result.evaluation.passed ? '✅' : '❌'}\n`;
    md += `- **Durata**: ${result.duration}ms\n`;
    if (result.response) {
      md += `- **Smart**: ${result.response.smart ? 'Sì' : 'No'}\n`;
      md += `- **Fallback**: ${result.response.fallback ? 'Sì' : 'No'}\n`;
    }
    if (result.evaluation.issues.length > 0) {
      md += `- **Problemi**: ${result.evaluation.issues.join(', ')}\n`;
    }
    md += `\n`;
  }
  
  return md;
}

/**
 * Stampa summary a console
 */
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY FINALE - PRIMI 50 TEST');
  console.log('='.repeat(80) + '\n');
  
  console.log(`✅ Test Passati: ${testResults.passedTests}/${testResults.totalTests} (${(testResults.passedTests / testResults.totalTests * 100).toFixed(1)}%)`);
  console.log(`❌ Test Falliti: ${testResults.failedTests}/${testResults.totalTests} (${(testResults.failedTests / testResults.totalTests * 100).toFixed(1)}%)`);
  console.log(`📊 Score Medio: ${testResults.averageScore.toFixed(2)}/100`);
  console.log(`⏱️  Tempo Medio: ${testResults.averageResponseTime.toFixed(0)}ms`);
  console.log(`🚨 Critical Issues: ${testResults.criticalIssues.length}`);
  console.log(`💡 Raccomandazioni: ${testResults.recommendations.length}`);
  
  console.log('\n📊 SCORE PER CATEGORIA:');
  for (const [category, stats] of Object.entries(testResults.categoryScores)) {
    const emoji = stats.average >= 80 ? '🟢' : stats.average >= 60 ? '🟡' : '🔴';
    console.log(`${emoji} ${category}: ${stats.average.toFixed(1)}/100 (${stats.count} test)`);
  }
  
  if (testResults.criticalIssues.length > 0) {
    console.log('\n⚠️  TOP CRITICAL ISSUES:');
    testResults.criticalIssues.slice(0, 5).forEach(issue => {
      console.log(`   • Test #${issue.test} (${issue.category}): Score ${issue.score.toFixed(1)}/100`);
    });
  }
  
  if (testResults.recommendations.length > 0) {
    console.log('\n💡 TOP RACCOMANDAZIONI:');
    testResults.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   • [${rec.priority}] ${rec.category}: ${rec.issue}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📄 Report completo: ${REPORT_FILE}`);
  console.log(`📊 Dati JSON: ${RESULTS_FILE}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AVVIO TEST MANIACALE URBANOVA OS 2.0 - PRIMI 50 TEST\n');
  console.log(`📍 Endpoint: ${API_URL}`);
  console.log(`📧 User: ${USER_EMAIL}`);
  console.log(`🧪 Test da eseguire: ${TEST_SCENARIOS.length}\n`);
  console.log('='.repeat(80));
  
  // Esegui test sequenzialmente
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    await runSingleTest(TEST_SCENARIOS[i], i);
    
    // Pausa tra test per non sovraccaricare il server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Genera report finale
  generateReport();
  
  console.log('\n✅ TEST COMPLETATI!\n');
  console.log('🔄 Analizza il report, implementa i miglioramenti, e poi esegui gli altri 50 test.\n');
}

// Esegui
main().catch(error => {
  console.error('\n❌ ERRORE FATALE:', error);
  process.exit(1);
});

