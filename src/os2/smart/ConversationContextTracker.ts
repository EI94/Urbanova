// 🧠 CONVERSATION CONTEXT TRACKER - Tracciamento intelligente del contesto
// Sistema LLM-driven per risolvere riferimenti impliciti

export interface Operation {
  type: 'feasibility' | 'businessPlan' | 'sensitivity' | 'save' | 'query';
  tool: string;
  inputs: any;
  result: any;
  timestamp: Date;
  summary: string; // Riassunto breve generato dall'LLM
}

export interface ConversationContext {
  // Ultima operazione eseguita
  lastOperation?: Operation;
  
  // Stack di operazioni (per "torna indietro")
  operationStack: Operation[];
  
  // Entità menzionate (progetti, località, ecc.)
  mentionedEntities: {
    projects: string[];
    locations: string[];
    scenarios: string[];
  };
  
  // Dati correnti "in working memory"
  currentData: {
    projectName?: string;
    location?: string;
    analysisResults?: any;
    businessPlanData?: any;
  };
}

/**
 * Context Tracker Intelligente
 * Traccia operazioni e contesto conversazionale per risolvere riferimenti impliciti
 * PERSISTENTE tra pagine e sessioni
 */
export class ConversationContextTracker {
  private contexts: Map<string, ConversationContext> = new Map();
  private maxStackSize = 10;
  private readonly STORAGE_KEY = 'urbanova_context_tracker';
  
  /**
   * Ottiene o inizializza context per una sessione
   */
  getContext(sessionId: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        operationStack: [],
        mentionedEntities: {
          projects: [],
          locations: [],
          scenarios: []
        },
        currentData: {}
      });
    }
    return this.contexts.get(sessionId)!;
  }
  
  /**
   * Registra operazione eseguita
   */
  recordOperation(
    sessionId: string,
    operation: Operation
  ): void {
    const context = this.getContext(sessionId);
    
    // Aggiungi allo stack
    context.operationStack.push(operation);
    
    // Mantieni solo le ultime N operazioni
    if (context.operationStack.length > this.maxStackSize) {
      context.operationStack.shift();
    }
    
    // Update last operation
    context.lastOperation = operation;
    
    // Estrai entità dal result
    this.extractEntities(operation, context);
    
    // Update current data
    this.updateCurrentData(operation, context);
    
    console.log(`📝 [ContextTracker] Operazione registrata: ${operation.type} (${operation.tool})`);
    console.log(`   Entità menzionate: ${context.mentionedEntities.projects.length} progetti, ${context.mentionedEntities.locations.length} località`);
    
    // Salva in storage per persistenza
    this.saveToStorage();
  }
  
  /**
   * Estrae entità dal risultato dell'operazione
   */
  private extractEntities(operation: Operation, context: ConversationContext): void {
    const result = operation.result;
    const inputs = operation.inputs;
    
    // Estrai progetti
    if (inputs.projectName && !context.mentionedEntities.projects.includes(inputs.projectName)) {
      context.mentionedEntities.projects.push(inputs.projectName);
    }
    if (result?.projectName && !context.mentionedEntities.projects.includes(result.projectName)) {
      context.mentionedEntities.projects.push(result.projectName);
    }
    
    // Estrai località (anche da testo libero)
    if (inputs.location && !context.mentionedEntities.locations.includes(inputs.location)) {
      context.mentionedEntities.locations.push(inputs.location);
    }
    
    // Estrai località da analisi comparativa (es. "Milano vs Roma")
    const inputText = JSON.stringify(inputs).toLowerCase();
    const italianCities = ['milano', 'roma', 'torino', 'napoli', 'firenze', 'bologna', 'venezia', 'palermo', 'genova', 'bari'];
    italianCities.forEach(city => {
      if (inputText.includes(city)) {
        const capitalCity = city.charAt(0).toUpperCase() + city.slice(1);
        if (!context.mentionedEntities.locations.includes(capitalCity)) {
          context.mentionedEntities.locations.push(capitalCity);
        }
      }
    });
  }
  
  /**
   * Aggiorna dati correnti
   */
  private updateCurrentData(operation: Operation, context: ConversationContext): void {
    if (operation.type === 'feasibility') {
      context.currentData.analysisResults = operation.result;
      context.currentData.location = operation.inputs.location;
    }
    
    if (operation.type === 'businessPlan') {
      context.currentData.businessPlanData = operation.result;
      context.currentData.projectName = operation.inputs.projectName;
    }
    
    if (operation.type === 'save') {
      context.currentData.projectName = operation.result.projectName;
    }
  }
  
  /**
   * Genera context summary per il prompt
   */
  generateContextSummary(sessionId: string): string {
    const context = this.getContext(sessionId);
    
    if (!context.lastOperation) {
      return 'Nessuna operazione precedente in questa conversazione.';
    }
    
    const parts: string[] = [];
    
    // Last operation con dettagli
    parts.push(`📊 ULTIMA OPERAZIONE: ${context.lastOperation.tool}`);
    parts.push(`   ${context.lastOperation.summary}`);
    parts.push(`   Input: ${JSON.stringify(context.lastOperation.inputs).substring(0, 100)}`);
    
    // Current data
    if (context.currentData.projectName) {
      parts.push(`\n📌 PROGETTO CORRENTE: ${context.currentData.projectName}`);
    }
    
    if (context.currentData.location) {
      parts.push(`📍 LOCALITÀ: ${context.currentData.location}`);
    }
    
    // Mentioned entities
    if (context.mentionedEntities.projects.length > 0) {
      parts.push(`\n💼 PROGETTI MENZIONATI: ${context.mentionedEntities.projects.join(', ')}`);
    }
    
    if (context.mentionedEntities.locations.length > 0) {
      parts.push(`🗺️  LOCALITÀ MENZIONATE: ${context.mentionedEntities.locations.join(', ')}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * Risolve riferimenti pronominali intelligentemente
   */
  resolveReference(
    message: string,
    sessionId: string
  ): {
    resolved: boolean;
    context?: any;
    suggestion?: string;
  } {
    const msgLower = message.toLowerCase();
    const context = this.getContext(sessionId);
    
    // "questo/quello/questi" → last operation
    if (msgLower.match(/\b(questo|quello|questi|quelli|quella)\b/)) {
      if (context.lastOperation) {
        return {
          resolved: true,
          context: context.lastOperation,
          suggestion: `Riferimento a ${context.lastOperation.type}: ${context.lastOperation.summary}`
        };
      }
    }
    
    // "quale" senza oggetto → progetti menzionati
    if (msgLower.match(/\bquale\b/) && context.mentionedEntities.projects.length > 0) {
      return {
        resolved: true,
        context: {
          projects: context.mentionedEntities.projects,
          lastResults: context.operationStack.filter(op => op.type === 'feasibility').map(op => op.result)
        },
        suggestion: `Confronto tra progetti: ${context.mentionedEntities.projects.join(', ')}`
      };
    }
    
    // "torna indietro" → previous operation
    if (msgLower.includes('torna indietro') || msgLower.includes('torniamo')) {
      if (context.operationStack.length > 1) {
        const previous = context.operationStack[context.operationStack.length - 2];
        return {
          resolved: true,
          context: previous,
          suggestion: `Tornare a: ${previous.summary}`
        };
      }
    }
    
    return { resolved: false };
  }
  
  /**
   * Pulisce context per una sessione
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
    console.log(`🗑️  [ContextTracker] Context cleared per session: ${sessionId}`);
  }
}

// Singleton
let instance: ConversationContextTracker;

export function getContextTracker(): ConversationContextTracker {
  if (!instance) {
    instance = new ConversationContextTracker();
    console.log('🧠 [ContextTracker] Inizializzato');
    instance.loadFromStorage(); // Carica context persistenti
  }
  return instance;
}

// Aggiungi metodi di persistenza alla classe
ConversationContextTracker.prototype.loadFromStorage = function() {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const stored = localStorage.getItem('urbanova_context_tracker');
    if (!stored) return;
    
    const data = JSON.parse(stored);
    Object.entries(data).forEach(([sessionId, context]: [string, any]) => {
      // Converte timestamp da stringa a Date
      if (context.lastOperation) {
        context.lastOperation.timestamp = new Date(context.lastOperation.timestamp);
      }
      context.operationStack = context.operationStack.map((op: any) => ({
        ...op,
        timestamp: new Date(op.timestamp)
      }));
      
      this.contexts.set(sessionId, context);
    });
    
    console.log(`📂 [ContextTracker] Caricati ${this.contexts.size} context da storage`);
  } catch (error) {
    console.error('❌ [ContextTracker] Errore caricamento storage:', error);
  }
};

ConversationContextTracker.prototype.saveToStorage = function() {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const data: Record<string, any> = {};
    this.contexts.forEach((context, sessionId) => {
      data[sessionId] = context;
    });
    
    localStorage.setItem('urbanova_context_tracker', JSON.stringify(data));
    console.log(`💾 [ContextTracker] Salvati ${this.contexts.size} context in storage`);
  } catch (error) {
    console.error('❌ [ContextTracker] Errore salvataggio storage:', error);
  }
};


