// 🧪 OS TEST SERVICE - TEST MASSIVO DELL'OS
// Testa 100 richieste diverse per identificare e risolvere problemi

export interface TestCase {
  id: string;
  category: string;
  query: string;
  expectedIntent: string;
  expectedResponse: string;
  priority: 'high' | 'medium' | 'low';
}

export class OSTestService {
  private testCases: TestCase[] = [];

  constructor() {
    this.initializeTestCases();
  }

  /**
   * Inizializza 100 test cases diversi
   */
  private initializeTestCases(): void {
    this.testCases = [
      // ANALISI DI FATTIBILITÀ (20 test cases)
      {
        id: 'feasibility-001',
        category: 'feasibility',
        query: 'Ciao, puoi creare per me una analisi di fattibilità?',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-002',
        category: 'feasibility',
        query: 'Voglio valutare un terreno a Milano',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-003',
        category: 'feasibility',
        query: 'Quanto costa un progetto residenziale?',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-004',
        category: 'feasibility',
        query: 'Calcola il ROI di un investimento immobiliare',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-005',
        category: 'feasibility',
        query: 'Analizza la fattibilità di un progetto commerciale',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-006',
        category: 'feasibility',
        query: 'Qual è il margine di profitto di un progetto?',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-007',
        category: 'feasibility',
        query: 'Quanto tempo ci vuole per completare un progetto?',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-008',
        category: 'feasibility',
        query: 'Valuta un terreno di 1000 mq a Roma',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-009',
        category: 'feasibility',
        query: 'Studio di fattibilità per un hotel',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-010',
        category: 'feasibility',
        query: 'Quanto investire per un progetto residenziale?',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'feasibility-011',
        category: 'feasibility',
        query: 'Analisi costi-benefici di un progetto',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-012',
        category: 'feasibility',
        query: 'Valutazione economica di un immobile',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-013',
        category: 'feasibility',
        query: 'Proiezioni finanziarie per un progetto',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-014',
        category: 'feasibility',
        query: 'Calcola il payback period',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-015',
        category: 'feasibility',
        query: 'Analisi di sensibilità di un progetto',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'feasibility-016',
        category: 'feasibility',
        query: 'Valutazione rischio di un investimento',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-017',
        category: 'feasibility',
        query: 'Ottimizzazione costi di un progetto',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-018',
        category: 'feasibility',
        query: 'Analisi comparativa di progetti',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'feasibility-019',
        category: 'feasibility',
        query: 'Valutazione immobiliare professionale',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'feasibility-020',
        category: 'feasibility',
        query: 'Studio di mercato per un progetto',
        expectedIntent: 'feasibility',
        expectedResponse: 'conversational',
        priority: 'medium'
      },

      // MARKET INTELLIGENCE (20 test cases)
      {
        id: 'market-001',
        category: 'market_intelligence',
        query: 'Cerca terreni a Milano',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-002',
        category: 'market_intelligence',
        query: 'Analisi di mercato immobiliare',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-003',
        category: 'market_intelligence',
        query: 'Prezzi immobili a Roma',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-004',
        category: 'market_intelligence',
        query: 'Trend del mercato immobiliare',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-005',
        category: 'market_intelligence',
        query: 'Opportunità di investimento a Napoli',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-006',
        category: 'market_intelligence',
        query: 'Dati OMI per Milano',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-007',
        category: 'market_intelligence',
        query: 'Analisi demografica di una zona',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-008',
        category: 'market_intelligence',
        query: 'Ricerca terreni edificabili',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-009',
        category: 'market_intelligence',
        query: 'Valutazione immobiliare comparativa',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-010',
        category: 'market_intelligence',
        query: 'Previsioni di mercato immobiliare',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-011',
        category: 'market_intelligence',
        query: 'Analisi della domanda immobiliare',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-012',
        category: 'market_intelligence',
        query: 'Ricerca immobili in vendita',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-013',
        category: 'market_intelligence',
        query: 'Analisi della concorrenza immobiliare',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'market-014',
        category: 'market_intelligence',
        query: 'Valutazione zone di interesse',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-015',
        category: 'market_intelligence',
        query: 'Ricerca terreni agricoli',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'market-016',
        category: 'market_intelligence',
        query: 'Analisi infrastrutture di una zona',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-017',
        category: 'market_intelligence',
        query: 'Prezzi al metro quadro per zona',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'market-018',
        category: 'market_intelligence',
        query: 'Ricerca immobili commerciali',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-019',
        category: 'market_intelligence',
        query: 'Analisi del mercato residenziale',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'market-020',
        category: 'market_intelligence',
        query: 'Identifica zone in crescita',
        expectedIntent: 'market_intelligence',
        expectedResponse: 'conversational',
        priority: 'high'
      },

      // DESIGN CENTER (15 test cases)
      {
        id: 'design-001',
        category: 'design',
        query: 'Crea un progetto di design',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'design-002',
        category: 'design',
        query: 'Progetta un edificio residenziale',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'design-003',
        category: 'design',
        query: 'Rendering 3D di un progetto',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-004',
        category: 'design',
        query: 'Layout ottimizzato per un immobile',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-005',
        category: 'design',
        query: 'Progettazione sostenibile',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-006',
        category: 'design',
        query: 'Planimetrie di un appartamento',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'design-007',
        category: 'design',
        query: 'Design di interni moderno',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-008',
        category: 'design',
        query: 'Progettazione architettonica',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'design-009',
        category: 'design',
        query: 'Visualizzazione 3D di un progetto',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-010',
        category: 'design',
        query: 'Ottimizzazione spazi interni',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'design-011',
        category: 'design',
        query: 'Progettazione di un ufficio',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'design-012',
        category: 'design',
        query: 'Design di un negozio',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'design-013',
        category: 'design',
        query: 'Progettazione di un ristorante',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'design-014',
        category: 'design',
        query: 'Layout di un centro commerciale',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'design-015',
        category: 'design',
        query: 'Progettazione di un hotel',
        expectedIntent: 'design',
        expectedResponse: 'conversational',
        priority: 'low'
      },

      // BUSINESS PLAN (15 test cases)
      {
        id: 'business-001',
        category: 'business_plan',
        query: 'Crea un business plan',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'business-002',
        category: 'business_plan',
        query: 'Piano finanziario per un progetto',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'business-003',
        category: 'business_plan',
        query: 'Proiezioni di cassa per 5 anni',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-004',
        category: 'business_plan',
        query: 'Strategia di vendita immobiliare',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-005',
        category: 'business_plan',
        query: 'Analisi di mercato per business plan',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-006',
        category: 'business_plan',
        query: 'Piano di marketing immobiliare',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-007',
        category: 'business_plan',
        query: 'Gestione del rischio in un progetto',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-008',
        category: 'business_plan',
        query: 'Valutazione della concorrenza',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-009',
        category: 'business_plan',
        query: 'Piano di crescita aziendale',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-010',
        category: 'business_plan',
        query: 'Analisi SWOT di un progetto',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-011',
        category: 'business_plan',
        query: 'Piano di investimento immobiliare',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-012',
        category: 'business_plan',
        query: 'Strategia di finanziamento',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'business-013',
        category: 'business_plan',
        query: 'Piano di exit da un investimento',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-014',
        category: 'business_plan',
        query: 'Valutazione di un portafoglio immobiliare',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'business-015',
        category: 'business_plan',
        query: 'Piano di diversificazione investimenti',
        expectedIntent: 'business_plan',
        expectedResponse: 'conversational',
        priority: 'low'
      },

      // GESTIONE PROGETTI (15 test cases)
      {
        id: 'project-001',
        category: 'project_management',
        query: 'Gestisci i miei progetti',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'project-002',
        category: 'project_management',
        query: 'Mostra lo stato dei progetti',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'project-003',
        category: 'project_management',
        query: 'Timeline di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'project-004',
        category: 'project_management',
        query: 'Scadenze dei progetti',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'project-005',
        category: 'project_management',
        query: 'Budget di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'project-006',
        category: 'project_management',
        query: 'Team di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'project-007',
        category: 'project_management',
        query: 'Documenti di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'project-008',
        category: 'project_management',
        query: 'Riunioni di progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'project-009',
        category: 'project_management',
        query: 'Progresso di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'project-010',
        category: 'project_management',
        query: 'Rischi di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'project-011',
        category: 'project_management',
        query: 'Milestone di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'project-012',
        category: 'project_management',
        query: 'Report di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'project-013',
        category: 'project_management',
        query: 'Condivisione di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'project-014',
        category: 'project_management',
        query: 'Archiviazione di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'project-015',
        category: 'project_management',
        query: 'Backup di un progetto',
        expectedIntent: 'project_management',
        expectedResponse: 'conversational',
        priority: 'low'
      },

      // PERMESSI E COMPLIANCE (10 test cases)
      {
        id: 'compliance-001',
        category: 'compliance',
        query: 'Permessi edilizi per un progetto',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'compliance-002',
        category: 'compliance',
        query: 'Normative edilizie da rispettare',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'compliance-003',
        category: 'compliance',
        query: 'Autorizzazioni per costruire',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'high'
      },
      {
        id: 'compliance-004',
        category: 'compliance',
        query: 'Vincoli urbanistici di una zona',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'compliance-005',
        category: 'compliance',
        query: 'Certificazioni energetiche',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'compliance-006',
        category: 'compliance',
        query: 'Sicurezza sul lavoro',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'compliance-007',
        category: 'compliance',
        query: 'Ambiente e sostenibilità',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'compliance-008',
        category: 'compliance',
        query: 'Privacy e GDPR',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'compliance-009',
        category: 'compliance',
        query: 'Contratti e documentazione',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'compliance-010',
        category: 'compliance',
        query: 'Audit di conformità',
        expectedIntent: 'compliance',
        expectedResponse: 'conversational',
        priority: 'low'
      },

      // RICERCA E CONFRONTO (5 test cases)
      {
        id: 'search-001',
        category: 'search',
        query: 'Cerca progetti simili',
        expectedIntent: 'search',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'search-002',
        category: 'search',
        query: 'Trova documenti di un progetto',
        expectedIntent: 'search',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'search-003',
        category: 'search',
        query: 'Ricerca nel portafoglio',
        expectedIntent: 'search',
        expectedResponse: 'conversational',
        priority: 'medium'
      },
      {
        id: 'search-004',
        category: 'search',
        query: 'Filtra progetti per zona',
        expectedIntent: 'search',
        expectedResponse: 'conversational',
        priority: 'low'
      },
      {
        id: 'search-005',
        category: 'search',
        query: 'Ordina progetti per ROI',
        expectedIntent: 'search',
        expectedResponse: 'conversational',
        priority: 'low'
      }
    ];
  }

  /**
   * Esegue tutti i test cases
   */
  async runAllTests(): Promise<{
    total: number;
    passed: number;
    failed: number;
    results: Array<{
      testCase: TestCase;
      status: 'passed' | 'failed';
      error?: string;
      response?: string;
    }>;
  }> {
    console.log('🧪 [OSTest] Avvio test massivo con 100 richieste...');
    
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of this.testCases) {
      try {
        console.log(`🧪 [OSTest] Eseguendo test: ${testCase.id} - ${testCase.query}`);
        
        const response = await this.executeTest(testCase);
        
        if (this.validateResponse(testCase, response)) {
          results.push({
            testCase,
            status: 'passed',
            response
          });
          passed++;
        } else {
          results.push({
            testCase,
            status: 'failed',
            error: 'Risposta non valida',
            response
          });
          failed++;
        }
      } catch (error) {
        console.error(`❌ [OSTest] Errore test ${testCase.id}:`, error);
        results.push({
          testCase,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
        failed++;
      }
    }

    console.log(`✅ [OSTest] Test completati: ${passed}/${this.testCases.length} passati`);

    return {
      total: this.testCases.length,
      passed,
      failed,
      results
    };
  }

  /**
   * Esegue un singolo test
   */
  private async executeTest(testCase: TestCase): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.urbanova.life';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testCase.query,
        userId: 'test-user',
        userEmail: 'test@urbanova.it'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  /**
   * Valida una risposta
   */
  private validateResponse(testCase: TestCase, response: string): boolean {
    // Controlla che non sia JSON grezzo
    if (response.includes('{') && response.includes('}') && response.includes('"projects"')) {
      console.error(`❌ [OSTest] ${testCase.id}: Risposta JSON grezza`);
      return false;
    }

    // Controlla che non contenga ** non renderizzati
    if (response.includes('**') && !response.includes('<strong>')) {
      console.error(`❌ [OSTest] ${testCase.id}: Markdown non renderizzato`);
      return false;
    }

    // Controlla che sia conversazionale
    if (response.length < 10) {
      console.error(`❌ [OSTest] ${testCase.id}: Risposta troppo corta`);
      return false;
    }

    // Controlla che non menzioni "assistente AI"
    if (response.toLowerCase().includes('assistente ai') || response.toLowerCase().includes('ai assistant')) {
      console.error(`❌ [OSTest] ${testCase.id}: Menziona assistente AI`);
      return false;
    }

    return true;
  }

  /**
   * Esegue test per categoria
   */
  async runTestsByCategory(category: string): Promise<any> {
    const categoryTests = this.testCases.filter(tc => tc.category === category);
    console.log(`🧪 [OSTest] Eseguendo ${categoryTests.length} test per categoria: ${category}`);
    
    const results = [];
    for (const testCase of categoryTests) {
      try {
        const response = await this.executeTest(testCase);
        results.push({
          testCase,
          response,
          valid: this.validateResponse(testCase, response)
        });
      } catch (error) {
        results.push({
          testCase,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          valid: false
        });
      }
    }

    return results;
  }

  /**
   * Genera report dei test
   */
  generateTestReport(results: any[]): string {
    let report = '# 🧪 REPORT TEST OS URBANOVA\n\n';
    
    const categories = [...new Set(results.map(r => r.testCase.category))];
    
    categories.forEach(category => {
      const categoryResults = results.filter(r => r.testCase.category === category);
      const passed = categoryResults.filter(r => r.status === 'passed').length;
      const total = categoryResults.length;
      
      report += `## ${category.toUpperCase()} (${passed}/${total})\n\n`;
      
      categoryResults.forEach(result => {
        const status = result.status === 'passed' ? '✅' : '❌';
        report += `${status} **${result.testCase.id}**: ${result.testCase.query}\n`;
        if (result.error) {
          report += `   - Errore: ${result.error}\n`;
        }
        report += '\n';
      });
    });

    return report;
  }
}

export const osTestService = new OSTestService();
