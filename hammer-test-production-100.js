#!/usr/bin/env node

/**
 * 🚀 HAMMER TEST PRODUZIONE - 100 CONVERSAZIONI COMPLETE
 * 
 * Test completo dell'OS Urbanova in produzione con:
 * - 100 conversazioni complete (non singoli messaggi)
 * - Simulazione utenti reali paganti
 * - Analisi pattern e problemi
 * - Report dettagliato per miglioramenti
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 🎯 CONFIGURAZIONE PRODUZIONE
const PRODUCTION_URL = 'https://www.urbanova.life';
const API_ENDPOINT = `${PRODUCTION_URL}/api/chat`;

// 📊 METRICHE E ANALISI
const metrics = {
  totalConversations: 0,
  successfulConversations: 0,
  failedConversations: 0,
  totalMessages: 0,
  averageResponseTime: 0,
  responseTimes: [],
  errors: [],
  patterns: {
    commonErrors: {},
    responseTypes: {},
    userIntents: {},
    osBehaviors: {}
  },
  conversations: []
};

// 🎭 SCENARI CONVERSAZIONE REALISTICI
const CONVERSATION_SCENARIOS = [
  // Scenario 1: Nuovo Utente - Presentazione
  {
    id: 'new_user_intro',
    name: 'Nuovo Utente - Presentazione',
    messages: [
      { role: 'user', content: 'Ciao, sono nuovo su Urbanova. Chi sei e cosa puoi fare?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Interessante! Ho un terreno a Milano e vorrei capire se è fattibile costruire un condominio' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Perfetto, come posso iniziare un\'analisi di fattibilità?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 2: Analisi Fattibilità Completa
  {
    id: 'feasibility_analysis',
    name: 'Analisi Fattibilità Completa',
    messages: [
      { role: 'user', content: 'Voglio fare un\'analisi di fattibilità per un progetto residenziale a Roma' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Il terreno è di 2000 mq in zona EUR, budget 2 milioni' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Posso creare un progetto con questi dati?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Ottimo! Ora vorrei vedere il ROI e i margini' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 3: Market Intelligence
  {
    id: 'market_intelligence',
    name: 'Market Intelligence',
    messages: [
      { role: 'user', content: 'Mi serve un\'analisi di mercato per Milano' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Sono interessato al mercato residenziale di lusso' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Quali sono i trend di prezzo negli ultimi 2 anni?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 4: Design Center
  {
    id: 'design_center',
    name: 'Design Center',
    messages: [
      { role: 'user', content: 'Ho bisogno di progettare un edificio residenziale' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Voglio 20 appartamenti da 80 mq ciascuno' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Posso vedere un rendering 3D?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 5: Gestione Progetti
  {
    id: 'project_management',
    name: 'Gestione Progetti',
    messages: [
      { role: 'user', content: 'Ho un progetto in corso e devo gestire i documenti' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Come posso organizzare i permessi e la compliance?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Mi serve un timeline per il progetto' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 6: Business Plan
  {
    id: 'business_plan',
    name: 'Business Plan',
    messages: [
      { role: 'user', content: 'Devo creare un business plan per un investimento immobiliare' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Il progetto è un hotel a Firenze, budget 5 milioni' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Posso avere proiezioni finanziarie per 10 anni?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 7: Scansione Terreni
  {
    id: 'land_scraping',
    name: 'Scansione Terreni',
    messages: [
      { role: 'user', content: 'Cerco terreni edificabili a Bologna' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Budget massimo 500k, superficie minima 1000 mq' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Puoi farmi una ricerca automatica?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 8: Utente Esperto - Domande Tecniche
  {
    id: 'expert_user',
    name: 'Utente Esperto - Domande Tecniche',
    messages: [
      { role: 'user', content: 'Qual è il coefficiente di edificabilità per zona C1 a Milano?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Come calcolo il VAN con tasso di sconto del 8%?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Quali sono i requisiti per la certificazione LEED?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 9: Problema Complesso
  {
    id: 'complex_problem',
    name: 'Problema Complesso',
    messages: [
      { role: 'user', content: 'Ho un terreno con vincoli paesaggistici e archeologici' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Come posso procedere per ottenere i permessi?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Ci sono alternative per valorizzare il terreno?' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Quali sono i tempi e i costi stimati?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  },

  // Scenario 10: Supporto Generale
  {
    id: 'general_support',
    name: 'Supporto Generale',
    messages: [
      { role: 'user', content: 'Non riesco a caricare un documento' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Il sistema è lento oggi' },
      { role: 'assistant', content: 'response_expected' },
      { role: 'user', content: 'Come posso esportare i miei progetti?' },
      { role: 'assistant', content: 'response_expected' }
    ]
  }
];

// 🔧 UTILITY FUNCTIONS
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'www.urbanova.life',
      port: 443,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Urbanova-Hammer-Test/1.0'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            responseTime: Date.now() - startTime
          });
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    const startTime = Date.now();
    req.write(postData);
    req.end();
  });
}

function analyzeResponse(response, expectedRole) {
  const analysis = {
    isValid: false,
    isRelevant: false,
    isComplete: false,
    hasError: false,
    responseType: 'unknown',
    issues: []
  };

  if (!response.success) {
    analysis.hasError = true;
    analysis.issues.push('Response marked as unsuccessful');
    return analysis;
  }

  if (!response.response || response.response.trim() === '') {
    analysis.issues.push('Empty response');
    return analysis;
  }

  // Analizza tipo di risposta
  const responseText = response.response.toLowerCase();
  
  if (responseText.includes('workflow completato') || responseText.includes('ho attivato')) {
    analysis.responseType = 'workflow_generic';
    analysis.issues.push('Generic workflow response');
  } else if (responseText.includes('mi dispiace') && (responseText.includes('errore') || responseText.includes('problema'))) {
    // Solo se contiene "mi dispiace" E ("errore" o "problema") - non solo "mi dispiace"
    analysis.responseType = 'error_response';
    analysis.issues.push('Error response');
  } else if (responseText.includes('urbanova') && responseText.includes('aiutarti')) {
    analysis.responseType = 'helpful_response';
    analysis.isValid = true;
  } else if (responseText.length > 50 && !responseText.includes('fallback')) {
    analysis.responseType = 'natural_response';
    analysis.isValid = true;
    analysis.isRelevant = true;
  }

  // Controlla completezza
  if (responseText.length > 100) {
    analysis.isComplete = true;
  }

  return analysis;
}

async function runConversation(scenario, conversationIndex) {
  console.log(`\n🎭 [${conversationIndex + 1}/100] Scenario: ${scenario.name}`);
  
  const conversation = {
    scenario: scenario.id,
    scenarioName: scenario.name,
    messages: [],
    startTime: Date.now(),
    endTime: null,
    success: false,
    totalResponseTime: 0,
    issues: []
  };

  let sessionId = `hammer_test_${Date.now()}_${conversationIndex}`;
  let userId = `test_user_${conversationIndex}`;
  let userEmail = `test${conversationIndex}@hammer-test.com`;

  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    
    if (message.role === 'user') {
      console.log(`  📤 Messaggio ${i + 1}: ${message.content.substring(0, 50)}...`);
      
      try {
        const requestData = {
          message: message.content,
          sessionId: sessionId,
          userId: userId,
          userEmail: userEmail,
          history: conversation.messages
        };

        const response = await makeRequest(requestData);
        conversation.totalResponseTime += response.responseTime;
        metrics.responseTimes.push(response.responseTime);

        const analysis = analyzeResponse(response.data, message.role);
        
        conversation.messages.push({
          role: 'user',
          content: message.content,
          timestamp: Date.now()
        });

        conversation.messages.push({
          role: 'assistant',
          content: response.data.response || 'No response',
          timestamp: Date.now(),
          analysis: analysis,
          responseTime: response.responseTime
        });

        if (analysis.hasError || analysis.issues.length > 0) {
          conversation.issues.push(...analysis.issues);
          metrics.errors.push({
            conversation: conversationIndex,
            message: i,
            error: analysis.issues.join(', '),
            response: response.data.response
          });
        }

        // Aggiorna pattern
        metrics.patterns.responseTypes[analysis.responseType] = 
          (metrics.patterns.responseTypes[analysis.responseType] || 0) + 1;

        console.log(`  📥 Risposta ${i + 1}: ${response.data.response?.substring(0, 50)}... (${response.responseTime}ms)`);
        
        // Pausa tra messaggi per simulare utente reale
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      } catch (error) {
        console.log(`  ❌ Errore messaggio ${i + 1}: ${error.message}`);
        conversation.issues.push(`Request error: ${error.message}`);
        metrics.errors.push({
          conversation: conversationIndex,
          message: i,
          error: error.message,
          response: null
        });
      }
    }
  }

  conversation.endTime = Date.now();
  conversation.success = conversation.issues.length === 0;
  
  if (conversation.success) {
    metrics.successfulConversations++;
  } else {
    metrics.failedConversations++;
  }

  metrics.totalConversations++;
  metrics.totalMessages += conversation.messages.length;
  metrics.conversations.push(conversation);

  console.log(`  ✅ Conversazione completata: ${conversation.success ? 'SUCCESS' : 'FAILED'} (${conversation.totalResponseTime}ms)`);
  
  return conversation;
}

function generateReport() {
  console.log('\n📊 GENERAZIONE REPORT HAMMER TEST...');
  
  // Calcola metriche aggregate
  metrics.averageResponseTime = metrics.responseTimes.length > 0 
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length 
    : 0;

  // Analizza pattern errori
  metrics.errors.forEach(error => {
    const errorType = error.error.split(':')[0];
    metrics.patterns.commonErrors[errorType] = (metrics.patterns.commonErrors[errorType] || 0) + 1;
  });

  // Analizza comportamenti OS
  metrics.conversations.forEach(conv => {
    conv.messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.analysis) {
        const behavior = msg.analysis.responseType;
        metrics.patterns.osBehaviors[behavior] = (metrics.patterns.osBehaviors[behavior] || 0) + 1;
      }
    });
  });

  const report = {
    summary: {
      totalConversations: metrics.totalConversations,
      successfulConversations: metrics.successfulConversations,
      failedConversations: metrics.failedConversations,
      successRate: (metrics.successfulConversations / metrics.totalConversations * 100).toFixed(2) + '%',
      totalMessages: metrics.totalMessages,
      averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
      totalErrors: metrics.errors.length
    },
    patterns: metrics.patterns,
    detailedConversations: metrics.conversations,
    errors: metrics.errors,
    recommendations: generateRecommendations()
  };

  return report;
}

function generateRecommendations() {
  const recommendations = [];
  
  // Analizza errori comuni
  const errorTypes = Object.keys(metrics.patterns.commonErrors);
  if (errorTypes.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Error Handling',
      issue: `Errori comuni rilevati: ${errorTypes.join(', ')}`,
      recommendation: 'Implementare gestione errori più robusta e messaggi utente più chiari'
    });
  }

  // Analizza tipi di risposta
  const responseTypes = Object.keys(metrics.patterns.responseTypes);
  const genericResponses = metrics.patterns.responseTypes.workflow_generic || 0;
  if (genericResponses > 10) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Response Quality',
      issue: `${genericResponses} risposte generiche "workflow completato"`,
      recommendation: 'Migliorare logica di generazione risposte per evitare risposte generiche'
    });
  }

  // Analizza tempi di risposta
  if (metrics.averageResponseTime > 5000) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Performance',
      issue: `Tempo di risposta medio: ${Math.round(metrics.averageResponseTime)}ms`,
      recommendation: 'Ottimizzare performance e caching per ridurre tempi di risposta'
    });
  }

  // Analizza success rate
  const successRate = metrics.successfulConversations / metrics.totalConversations;
  if (successRate < 0.8) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Reliability',
      issue: `Success rate: ${(successRate * 100).toFixed(2)}%`,
      recommendation: 'CRITICO: Success rate sotto l\'80%. Intervento immediato necessario'
    });
  }

  return recommendations;
}

// 🚀 MAIN EXECUTION
async function main() {
  console.log('🚀 HAMMER TEST PRODUZIONE - 100 CONVERSAZIONI');
  console.log('🎯 Target: https://urbanova.life/api/chat');
  console.log('📊 Simulazione utenti paganti reali\n');

  const startTime = Date.now();

  try {
    // Esegui 100 conversazioni (10 scenari x 10 volte)
    for (let i = 0; i < 100; i++) {
      const scenarioIndex = i % CONVERSATION_SCENARIOS.length;
      const scenario = CONVERSATION_SCENARIOS[scenarioIndex];
      
      await runConversation(scenario, i);
      
      // Pausa tra conversazioni per non sovraccaricare
      if (i < 99) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('\n📊 ANALISI COMPLETATA');
    console.log(`⏱️  Tempo totale: ${Math.round(totalTime / 1000)}s`);
    console.log(`📈 Conversazioni: ${metrics.successfulConversations}/${metrics.totalConversations} successful`);
    console.log(`⚡ Tempo medio risposta: ${Math.round(metrics.averageResponseTime)}ms`);

    // Genera report
    const report = generateReport();
    
    // Salva report
    const reportPath = `hammer-test-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report salvato: ${reportPath}`);
    console.log('\n🎯 RACCOMANDAZIONI PRIORITARIE:');
    
    report.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   Problema: ${rec.issue}`);
      console.log(`   Raccomandazione: ${rec.recommendation}`);
    });

    console.log('\n✅ HAMMER TEST COMPLETATO');
    
  } catch (error) {
    console.error('❌ Errore durante Hammer Test:', error);
    process.exit(1);
  }
}

// Avvia il test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, CONVERSATION_SCENARIOS, metrics };
