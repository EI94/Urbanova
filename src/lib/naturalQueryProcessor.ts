// 🔍 NATURAL QUERY PROCESSOR - PROCESSORE QUERY NATURALI AVANZATO
// Trasforma linguaggio naturale in query strutturate per l'OS

// 🛡️ OS PROTECTION - Importa protezione CSS per natural query processor
import '@/lib/osProtection';

import { UserMemoryProfile, Entity, QueryIntent, ParsedQuery } from './userMemoryService';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface QueryPattern {
  pattern: RegExp;
  intent: QueryIntent;
  confidence: number;
  examples: string[];
}

export interface EntityMatcher {
  type: 'project' | 'location' | 'metric' | 'date' | 'number' | 'comparison';
  patterns: RegExp[];
  synonyms: string[];
  extractor: (match: RegExpMatchArray) => string;
}

export interface QueryContext {
  userProfile: UserMemoryProfile;
  conversationHistory: string[];
  currentSession: string[];
}

// ============================================================================
// NATURAL QUERY PROCESSOR CLASS
// ============================================================================

export class NaturalQueryProcessor {
  private queryPatterns: QueryPattern[] = [];
  private entityMatchers: EntityMatcher[] = [];
  private metricSynonyms: Record<string, string> = {};
  private projectSynonyms: Record<string, string> = {};

  constructor() {
    this.initializeQueryPatterns();
    this.initializeEntityMatchers();
    this.initializeSynonyms();
    console.log('🔍 [NaturalQueryProcessor] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 Processa query naturale principale
   */
  async processQuery(
    query: string, 
    context: QueryContext
  ): Promise<{
    originalQuery: string;
    parsedQuery: ParsedQuery;
    intent: QueryIntent;
    entities: Entity[];
    confidence: number;
    suggestions: string[];
  }> {
    console.log('🔍 [NaturalQueryProcessor] Processando query:', query);

    try {
      // 1. Preprocessa query
      const preprocessedQuery = this.preprocessQuery(query);
      
      // 2. Estrai entità
      const entities = this.extractEntities(preprocessedQuery, context);
      
      // 3. Determina intent
      const intent = this.determineIntent(preprocessedQuery, entities, context);
      
      // 4. Estrai parametri
      const parsedQuery = this.parseQueryParameters(preprocessedQuery, entities, intent);
      
      // 5. Calcola confidence
      const confidence = this.calculateConfidence(intent, entities, parsedQuery);
      
      // 6. Genera suggerimenti
      const suggestions = this.generateSuggestions(intent, entities, context);
      
      console.log('✅ [NaturalQueryProcessor] Query processata:', {
        intent: intent.type,
        confidence,
        entities: entities.length
      });

      return {
        originalQuery: query,
        parsedQuery,
        intent,
        entities,
        confidence,
        suggestions
      };

    } catch (error) {
      console.error('❌ [NaturalQueryProcessor] Errore processamento:', error);
      throw error;
    }
  }

  // ============================================================================
  // INIZIALIZZAZIONE
  // ============================================================================

  /**
   * Inizializza pattern di query
   */
  private initializeQueryPatterns(): void {
    this.queryPatterns = [
      // ===== MARKET INTELLIGENCE PATTERNS (PRIORITÀ MASSIMA) =====
      
      // Query Market Intelligence - Ricerca terreni (PRIORITÀ MASSIMA)
      {
        pattern: /(?:cerca|trova|ricerca|mostra|filtra|cerco|trovare|ricercare).*(?:terreno|terreni|immobile|immobili|proprietà|appartamento|appartamenti|casa|case|ufficio|uffici|negozio|negozi|capannone|capannoni|magazzino|magazzini|bene immobiliare|beni immobiliari|investimento immobiliare|investimenti immobiliari)/i,
        intent: {
          type: 'market_intelligence',
          confidence: 0.98,
          parameters: { action: 'search_land' }
        },
        confidence: 0.98,
        examples: [
          'Cerca terreni residenziali a Milano',
          'Trova immobili commerciali a Roma',
          'Ricerca proprietà industriali',
          'Cerca terreni con budget 500k',
          'Mostra appartamenti a Firenze',
          'Trova case a Bologna',
          'Cerca uffici a Torino',
          'Cerco terreni a Milano',
          'Trovare immobili a Roma',
          'Ricercare proprietà a Napoli'
        ]
      },

      // Query Market Intelligence - Analisi mercato (PRIORITÀ MASSIMA)
      {
        pattern: /(?:analisi|analizza|come sta|stato del|andamento del|previsioni del|trend del|analizzare|analisi del|fai un'analisi|fai analisi).*(?:mercato|mercati|immobiliare|immobiliari|settore immobiliare|real estate|mercato immobiliare|mercati immobiliari|settore immobiliare|real estate market)/i,
        intent: {
          type: 'market_intelligence',
          confidence: 0.98,
          parameters: { action: 'analyze_market' }
        },
        confidence: 0.98,
        examples: [
          'Analizza il mercato immobiliare di Milano',
          'Fai un\'analisi di mercato per Roma',
          'Analisi del mercato residenziale',
          'Come sta il mercato immobiliare?',
          'Stato del mercato a Napoli',
          'Andamento del settore immobiliare',
          'Previsioni del mercato immobiliare',
          'Analizzare il mercato immobiliare',
          'Fai analisi del mercato',
          'Analisi del settore immobiliare'
        ]
      },

      // Query Market Intelligence - Opportunità (PRIORITÀ MEDIA)
      {
        pattern: /(?:opportunità|occasioni|oportunità|migliori|migliori opportunità|investimenti|affari|deal|deals|offerte|offerte speciali)/i,
        intent: {
          type: 'market_intelligence',
          confidence: 0.9,
          parameters: { action: 'get_opportunities' }
        },
        confidence: 0.9,
        examples: [
          'Mostra le migliori opportunità',
          'Quali sono le occasioni disponibili?',
          'Trova opportunità di investimento',
          'Mostra le opportunità urgenti',
          'Cerca affari immobiliari',
          'Mostra deal disponibili'
        ]
      },

      // ===== PREDICTIVE ANALYTICS PATTERNS (PRIORITÀ ALTA) =====
      
      // Query predittive e analisi avanzate (PRIORITÀ ALTA)
      {
        pattern: /(?:previsioni|forecast|predici|analisi predittiva|trend|tendenze|predizione|predizioni|futuro|proiezioni|scenario|scenari)/i,
        intent: {
          type: 'predictive',
          confidence: 0.95,
          parameters: {}
        },
        confidence: 0.95,
        examples: [
          'Mostra le previsioni di mercato',
          'Analisi predittiva dei miei progetti',
          'Quali sono i trend del mercato?',
          'Predici l\'andamento dei prezzi',
          'Forecast per i prossimi 6 mesi',
          'Tendenze del settore immobiliare',
          'Proiezioni di crescita'
        ]
      },

      // Query di ottimizzazione (PRIORITÀ ALTA)
      {
        pattern: /(?:ottimizza|migliora|massimizza|aumenta|incrementa|potenzia|migliorare|ottimizzare|massimizzare).*(?:roi|margine|profitto|efficienza|performance|rendimento|risultati|benefici)/i,
        intent: {
          type: 'optimize',
          confidence: 0.9,
          parameters: {}
        },
        confidence: 0.9,
        examples: [
          'Ottimizza il ROI del progetto Ciliegie',
          'Migliora il margine di Villa Roma',
          'Massimizza i profitti',
          'Aumenta l\'efficienza',
          'Potenzia le performance',
          'Migliorare il rendimento',
          'Ottimizzare i risultati'
        ]
      },

      // ===== PATTERN BASE (PRIORITÀ MEDIA) =====
      
      // Query per ottenere metriche
      {
        pattern: /(?:quanto|quanti|qual è|dimmi|mostrami|voglio sapere).*(?:metri quadrati|mq|superficie|area|budget|costo|prezzo|roi|margine|profitto|timeline|durata)/i,
        intent: {
          type: 'get_metric',
          confidence: 0.9,
          parameters: {}
        },
        confidence: 0.9,
        examples: [
          'Quanti metri quadrati ha il progetto Ciliegie?',
          'Qual è il budget del progetto Villa Roma?',
          'Dimmi il ROI del progetto Ufficio Milano'
        ]
      },
      
      // Query di confronto (PRIORITÀ ALTA)
      {
        pattern: /(?:confronta|paragona|confronto|rispetto|vs|differenza|confrontare|paragonare|comparare|comparazione).*(?:progetto|progetti|ciliegie|villa|roma|budget|costo|prezzo|roi|margine|performance|risultati)/i,
        intent: {
          type: 'compare',
          confidence: 0.9,
          parameters: {}
        },
        confidence: 0.9,
        examples: [
          'Confronta il progetto Ciliegie con Villa Roma',
          'Paragona i budget dei miei progetti',
          'Qual è la differenza tra Ciliegie e Villa Roma?',
          'Confronta i budget di Ciliegie e Villa Roma',
          'Confrontare i ROI dei progetti',
          'Paragonare le performance',
          'Comparare i risultati'
        ]
      },
      
      // Query di analisi (PRIORITÀ ALTA)
      {
        pattern: /(?:analizza|valuta|come sta|stato|performance|andamento|analisi|valutazione|valutare|analizzare).*(?:progetto|progetti|ciliegie|villa|roma|milano)/i,
        intent: {
          type: 'analyze',
          confidence: 0.9,
          parameters: {}
        },
        confidence: 0.9,
        examples: [
          'Analizza il progetto Ciliegie',
          'Come sta andando Villa Roma?',
          'Valuta la performance dei miei progetti',
          'Analisi del progetto Ciliegie',
          'Valutazione di Villa Roma',
          'Valutare il progetto Milano'
        ]
      },
      
      // Query di ricerca (PRIORITÀ MOLTO BASSA - solo per progetti esistenti)
      {
        pattern: /(?:mostra|elenca|lista|visualizza|vedi).*(?:progetto|progetti|miei progetti|tutti i progetti|portafoglio|i miei progetti|progetti esistenti)/i,
        intent: {
          type: 'search',
          confidence: 0.4,
          parameters: {}
        },
        confidence: 0.4,
        examples: [
          'Mostra tutti i miei progetti',
          'Elenca i progetti in corso',
          'Lista i progetti a Milano',
          'Visualizza i miei progetti',
          'Vedi il portafoglio progetti'
        ]
      },
      
      // Query di creazione
      {
        pattern: /(?:crea|nuovo|inizia|avvia|fai).*(?:progetto|studio|analisi|business plan|design)/i,
        intent: {
          type: 'create',
          confidence: 0.8,
          parameters: {}
        },
        confidence: 0.8,
        examples: [
          'Crea un nuovo progetto',
          'Inizia uno studio di fattibilità',
          'Fai un business plan per Milano'
        ]
      }

    ];
  }

  /**
   * Inizializza matcher di entità
   */
  private initializeEntityMatchers(): void {
    this.entityMatchers = [
      // Matcher per progetti
      {
        type: 'project',
        patterns: [
          /(?:progetto|project)\s+([A-Za-z0-9\s]+)/i,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
        ],
        synonyms: ['progetto', 'project', 'piano', 'plan'],
        extractor: (match) => match[1].trim()
      },
      
      // Matcher per metriche
      {
        type: 'metric',
        patterns: [
          /(?:metri quadrati|mq|superficie|area)/i,
          /(?:budget|costo|prezzo|investimento)/i,
          /(?:roi|margine|profitto|rendimento)/i,
          /(?:timeline|durata|tempo)/i
        ],
        synonyms: ['metri quadrati', 'mq', 'superficie', 'area', 'budget', 'costo', 'prezzo', 'roi', 'margine', 'profitto', 'timeline', 'durata'],
        extractor: (match) => this.normalizeMetric(match[0])
      },
      
      // Matcher per numeri
      {
        type: 'number',
        patterns: [
          /(\d+(?:\.\d+)?)\s*(?:mq|metri|euro|€|k|mila|milioni)/i,
          /(\d+(?:\.\d+)?)/g
        ],
        synonyms: [],
        extractor: (match) => match[1]
      },
      
      // Matcher per date
      {
        type: 'date',
        patterns: [
          /(?:oggi|ieri|domani|questa settimana|questo mese|quest'anno)/i,
          /(\d{1,2}\/\d{1,2}\/\d{4})/g,
          /(\d{4}-\d{2}-\d{2})/g
        ],
        synonyms: ['oggi', 'ieri', 'domani', 'settimana', 'mese', 'anno'],
        extractor: (match) => match[1] || match[0]
      },
      
      // Matcher per confronti
      {
        type: 'comparison',
        patterns: [
          /(?:confronta|paragona|vs|rispetto|differenza)/i,
          /(?:migliore|peggiore|più alto|più basso|superiore|inferiore)/i
        ],
        synonyms: ['confronta', 'paragona', 'vs', 'rispetto', 'differenza', 'migliore', 'peggiore'],
        extractor: (match) => match[0]
      }
    ];
  }

  /**
   * Inizializza sinonimi
   */
  private initializeSynonyms(): void {
    this.metricSynonyms = {
      'metri quadrati': 'totalArea',
      'mq': 'totalArea',
      'superficie': 'totalArea',
      'area': 'totalArea',
      'budget': 'budget',
      'costo': 'budget',
      'prezzo': 'budget',
      'investimento': 'budget',
      'roi': 'roi',
      'margine': 'margin',
      'profitto': 'profit',
      'rendimento': 'roi',
      'timeline': 'timeline',
      'durata': 'timeline',
      'tempo': 'timeline'
    };

    this.projectSynonyms = {
      'ciliegie': 'Progetto Ciliegie',
      'villa roma': 'Villa Roma',
      'ufficio milano': 'Ufficio Milano',
      'progetto roma': 'Progetto Roma',
      'villa milano': 'Villa Milano'
    };
  }

  // ============================================================================
  // METODI DI PROCESSAMENTO
  // ============================================================================

  /**
   * Preprocessa query
   */
  private preprocessQuery(query: string): string {
    // Rimuovi caratteri speciali eccessivi
    let processed = query.replace(/[^\w\s\?\!\.\,]/g, ' ');
    
    // Normalizza spazi
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Rimuovi parole comuni non utili
    const stopWords = ['il', 'la', 'lo', 'gli', 'le', 'di', 'da', 'del', 'della', 'dei', 'delle', 'in', 'su', 'per', 'con', 'a', 'al', 'alla', 'ai', 'alle'];
    stopWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, '');
    });
    
    // Normalizza spazi di nuovo
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  }

  /**
   * Estrai entità dalla query
   */
  private extractEntities(query: string, context: QueryContext): Entity[] {
    const entities: Entity[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Estrai entità usando i matcher
    this.entityMatchers.forEach(matcher => {
      matcher.patterns.forEach(pattern => {
        const matches = query.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const value = matcher.extractor([match]);
            if (value) {
              entities.push({
                type: matcher.type,
                value: value,
                confidence: 0.8,
                synonyms: matcher.synonyms
              });
            }
          });
        }
      });
    });
    
    // Estrai progetti specifici dal contesto utente
    context.userProfile.context.currentProjects.forEach(project => {
      if (lowerQuery.includes(project.name.toLowerCase())) {
        entities.push({
          type: 'project',
          value: project.name,
          confidence: 0.9,
          synonyms: [project.name.toLowerCase()]
        });
      }
    });
    
    // Estrai progetti usando sinonimi
    Object.entries(this.projectSynonyms).forEach(([synonym, projectName]) => {
      if (lowerQuery.includes(synonym)) {
        entities.push({
          type: 'project',
          value: projectName,
          confidence: 0.8,
          synonyms: [synonym]
        });
      }
    });
    
    // Per query di confronto, estrai progetti da frasi come "Ciliegie e Villa Roma"
    if (lowerQuery.includes('confronta') || lowerQuery.includes('paragona')) {
      // Pattern per estrarre nomi di progetti
      const projectPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
      const projectMatches = query.match(projectPattern);
      if (projectMatches) {
        projectMatches.forEach(match => {
          const projectName = match.trim();
          // Filtra parole comuni e mantieni solo nomi di progetti
          const commonWords = ['Confronta', 'Paragona', 'budget', 'costo', 'prezzo', 'e', 'di', 'con'];
          if (projectName.length > 2 && !commonWords.includes(projectName)) {
            entities.push({
              type: 'project',
              value: projectName,
              confidence: 0.7,
              synonyms: [projectName.toLowerCase()]
            });
          }
        });
      }
      
      // Pattern specifico per "Ciliegie e Villa Roma"
      const specificPattern = /(?:Ciliegie|Villa Roma|Progetto Ciliegie)/gi;
      const specificMatches = query.match(specificPattern);
      if (specificMatches) {
        specificMatches.forEach(match => {
          entities.push({
            type: 'project',
            value: match,
            confidence: 0.9,
            synonyms: [match.toLowerCase()]
          });
        });
      }
    }
    
    return entities;
  }

  /**
   * Determina intent della query
   */
  private determineIntent(
    query: string, 
    entities: Entity[], 
    context: QueryContext
  ): QueryIntent {
    console.log('🔍 [NaturalQueryProcessor] Determinando intent per query:', query);
    console.log('🔍 [NaturalQueryProcessor] Entità estratte:', entities);
    
    // Cerca pattern di intent
    for (const pattern of this.queryPatterns) {
      console.log('🔍 [NaturalQueryProcessor] Testando pattern:', pattern.pattern);
      if (pattern.pattern.test(query)) {
        console.log('✅ [NaturalQueryProcessor] Pattern trovato:', pattern.intent.type);
        return {
          ...pattern.intent,
          confidence: pattern.confidence,
          parameters: this.extractIntentParameters(query, entities, pattern.intent.type)
        };
      }
    }
    
    // Fallback: determina intent basato su entità
    if (entities.some(e => e.type === 'project') && entities.some(e => e.type === 'metric')) {
      return {
        type: 'get_metric',
        confidence: 0.7,
        parameters: {
          project: entities.find(e => e.type === 'project')?.value,
          metric: entities.find(e => e.type === 'metric')?.value
        }
      };
    }
    
    // Default: ricerca
    return {
      type: 'search',
      confidence: 0.5,
      parameters: {}
    };
  }

  /**
   * Estrai parametri per intent
   */
  private extractIntentParameters(
    query: string, 
    entities: Entity[], 
    intentType: string
  ): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    switch (intentType) {
      case 'get_metric':
        parameters.project = entities.find(e => e.type === 'project')?.value;
        parameters.metric = entities.find(e => e.type === 'metric')?.value;
        parameters.number = entities.find(e => e.type === 'number')?.value;
        break;
        
      case 'compare':
        parameters.projects = entities.filter(e => e.type === 'project').map(e => e.value);
        parameters.metric = entities.find(e => e.type === 'metric')?.value;
        break;
        
      case 'analyze':
        parameters.project = entities.find(e => e.type === 'project')?.value;
        parameters.aspect = entities.find(e => e.type === 'metric')?.value;
        break;
        
      case 'search':
        parameters.query = query;
        parameters.filters = this.extractSearchFilters(query, entities);
        break;
        
      case 'create':
        parameters.type = this.extractProjectType(query);
        parameters.location = entities.find(e => e.type === 'location')?.value;
        break;
    }
    
    return parameters;
  }

  /**
   * Estrai filtri di ricerca
   */
  private extractSearchFilters(query: string, entities: Entity[]): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Filtro per budget
    const budgetEntity = entities.find(e => e.type === 'number' && 
      (query.toLowerCase().includes('budget') || query.toLowerCase().includes('costo')));
    if (budgetEntity) {
      filters.budget = parseFloat(budgetEntity.value);
    }
    
    // Filtro per area
    const areaEntity = entities.find(e => e.type === 'number' && 
      (query.toLowerCase().includes('mq') || query.toLowerCase().includes('metri')));
    if (areaEntity) {
      filters.area = parseFloat(areaEntity.value);
    }
    
    // Filtro per location
    const locationEntity = entities.find(e => e.type === 'location');
    if (locationEntity) {
      filters.location = locationEntity.value;
    }
    
    return filters;
  }

  /**
   * Estrai tipo di progetto
   */
  private extractProjectType(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('feasibility') || lowerQuery.includes('fattibilità')) {
      return 'feasibility';
    }
    if (lowerQuery.includes('design') || lowerQuery.includes('progettazione')) {
      return 'design';
    }
    if (lowerQuery.includes('business plan') || lowerQuery.includes('piano d\'affari')) {
      return 'business-plan';
    }
    if (lowerQuery.includes('market') || lowerQuery.includes('ricerca')) {
      return 'market-intelligence';
    }
    
    return 'feasibility'; // Default
  }

  /**
   * Estrai parametri query
   */
  private parseQueryParameters(
    query: string, 
    entities: Entity[], 
    intent: QueryIntent
  ): ParsedQuery {
    return {
      action: this.getActionFromIntent(intent.type),
      entity: entities.find(e => e.type === 'project')?.value || '',
      metric: entities.find(e => e.type === 'metric')?.value,
      filters: intent.parameters || {},
      timeframe: entities.find(e => e.type === 'date')?.value,
      comparison: entities.find(e => e.type === 'comparison')?.value
    };
  }

  /**
   * Ottieni azione da intent
   */
  private getActionFromIntent(intentType: string): string {
    const actionMap: Record<string, string> = {
      'get_metric': 'get',
      'compare': 'compare',
      'analyze': 'analyze',
      'search': 'search',
      'create': 'create'
    };
    
    return actionMap[intentType] || 'search';
  }

  /**
   * Calcola confidence
   */
  private calculateConfidence(
    intent: QueryIntent, 
    entities: Entity[], 
    parsedQuery: ParsedQuery
  ): number {
    let confidence = intent.confidence;
    
    // Bonus per entità rilevanti
    if (entities.length > 0) {
      confidence += 0.1;
    }
    
    // Bonus per query specifiche
    if (parsedQuery.entity && parsedQuery.metric) {
      confidence += 0.1;
    }
    
    // Penalità per query ambigue
    if (entities.length > 5) {
      confidence -= 0.1;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Genera suggerimenti
   */
  private generateSuggestions(
    intent: QueryIntent, 
    entities: Entity[], 
    context: QueryContext
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggerimenti basati su intent
    switch (intent.type) {
      case 'get_metric':
        if (!entities.some(e => e.type === 'project')) {
          suggestions.push('Specifica il nome del progetto');
        }
        if (!entities.some(e => e.type === 'metric')) {
          suggestions.push('Specifica la metrica (es. metri quadrati, budget, ROI)');
        }
        break;
        
      case 'compare':
        if (entities.filter(e => e.type === 'project').length < 2) {
          suggestions.push('Specifica almeno due progetti da confrontare');
        }
        break;
        
      case 'analyze':
        if (!entities.some(e => e.type === 'project')) {
          suggestions.push('Specifica il progetto da analizzare');
        }
        break;
    }
    
    // Suggerimenti basati su progetti disponibili
    const availableProjects = context.userProfile.context.currentProjects;
    if (availableProjects.length > 0 && !entities.some(e => e.type === 'project')) {
      suggestions.push(`Prova: "Quanti metri quadrati ha ${availableProjects[0].name}?"`);
      suggestions.push(`Prova: "Analizza ${availableProjects[0].name}"`);
    }
    
    return suggestions;
  }

  /**
   * Normalizza metrica
   */
  private normalizeMetric(metric: string): string {
    const normalized = metric.toLowerCase().trim();
    return this.metricSynonyms[normalized] || normalized;
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const naturalQueryProcessor = new NaturalQueryProcessor();
