// 🎯 INTENT RESOLVER - Risoluzione intelligente intent con context
// Sistema che analizza messaggio + context per risolvere intent ambigui

import { getContextTracker } from './ConversationContextTracker';

export interface ResolvedIntent {
  shouldForce: boolean;
  toolName?: string;
  enrichedParams?: any;
  reasoning?: string;
}

/**
 * Intent Resolver - Analizza messaggio con context per risolvere ambiguità
 */
export class IntentResolver {
  // LAZY: Inizializzato solo quando accessato per evitare TDZ
  private _contextTracker: ReturnType<typeof getContextTracker> | null = null;
  
  private get contextTracker() {
    if (!this._contextTracker) {
      this._contextTracker = getContextTracker();
    }
    return this._contextTracker;
  }
  
  /**
   * Risolve intent da messaggio + context
   */
  resolveIntent(
    message: string,
    sessionId: string
  ): ResolvedIntent {
    const msgLower = message.toLowerCase();
    const context = this.contextTracker.getContext(sessionId);
    
    // Pattern 1: "Salva questi dati" con ultima operazione
    if (this.matchesSavePattern(msgLower) && context.lastOperation) {
      const params = this.extractSaveParams(context.lastOperation);
      if (params) {
        return {
          shouldForce: true,
          toolName: 'project_save',
          enrichedParams: params,
          reasoning: `Riferimento a ultima operazione: ${context.lastOperation.summary}`
        };
      }
    }
    
    // Pattern 2: "Analizza pro e contro" / "entrambi" con località menzionate
    if (this.matchesComparativeAnalysis(msgLower)) {
      if (context.mentionedEntities.locations.length >= 2) {
        const locations = context.mentionedEntities.locations.slice(0, 2);
        return {
          shouldForce: true,
          toolName: 'feasibility_analyze',
          enrichedParams: {
            location: locations[0], // Prima analisi
            _secondLocation: locations[1], // Hint per seconda
            _comparative: true
          },
          reasoning: `Analisi comparativa per: ${locations.join(' vs ')}`
        };
      }
    }
    
    // Pattern 3: "Ho terreno X vs Y" - dovrebbe attivare analisi multiple
    if (this.matchesMultiLocationPattern(msgLower)) {
      const locations = this.extractLocationsFromText(message);
      if (locations.length >= 2) {
        return {
          shouldForce: true,
          toolName: 'feasibility_analyze',
          enrichedParams: {
            location: locations[0],
            _locations: locations,
            _multiAnalysis: true
          },
          reasoning: `Multi-analisi per: ${locations.join(', ')}`
        };
      }
    }
    
    // Pattern 4: "Crea BP" senza parametri - forza defaults
    if (this.matchesBusinessPlanPattern(msgLower) && !this.hasExplicitParams(message)) {
      return {
        shouldForce: true,
        toolName: 'business_plan_calculate',
        enrichedParams: this.getDefaultBPParams(context),
        reasoning: 'BP senza parametri espliciti - uso defaults'
      };
    }
    
    return { shouldForce: false };
  }
  
  private matchesSavePattern(msg: string): boolean {
    return msg.match(/\b(salva|save)\s+(questi|questo|quest|i)\s+(dati|dat|progetto|risultati?)/i) !== null;
  }
  
  private matchesComparativeAnalysis(msg: string): boolean {
    return msg.match(/\b(analizza|confronta|compara|valuta)\s+.*(pro\s+e\s+contro|entrambi|tutti\s+e\s+due)/i) !== null;
  }
  
  private matchesMultiLocationPattern(msg: string): boolean {
    return msg.match(/\b(terreno|progetto).*(vs|versus|contro|oppure|o)\b/i) !== null ||
           msg.match(/\b(milano|roma|torino|napoli|firenze|bologna).*(vs|e|,).*(milano|roma|torino|napoli|firenze|bologna)/i) !== null;
  }
  
  private matchesBusinessPlanPattern(msg: string): boolean {
    return msg.match(/\b(crea|fai|genera|calcola).*(bp|business\s*plan|piano\s*economico)/i) !== null;
  }
  
  private hasExplicitParams(msg: string): boolean {
    // Se contiene numeri/parametri espliciti
    return msg.match(/\d+\s*(mq|unità|€|euro|mila)/i) !== null;
  }
  
  private extractSaveParams(lastOp: any): any | null {
    if (lastOp.type === 'feasibility') {
      return {
        projectName: lastOp.inputs.location || 'Progetto',
        projectType: 'feasibility',
        data: lastOp.result
      };
    }
    if (lastOp.type === 'businessPlan') {
      return {
        projectName: lastOp.inputs.projectName || 'Business Plan',
        projectType: 'businessPlan',
        data: lastOp.result
      };
    }
    return null;
  }
  
  private extractLocationsFromText(text: string): string[] {
    const italianCities = ['Milano', 'Roma', 'Torino', 'Napoli', 'Firenze', 'Bologna', 'Venezia', 'Palermo', 'Genova', 'Bari'];
    const found: string[] = [];
    
    italianCities.forEach(city => {
      if (text.toLowerCase().includes(city.toLowerCase())) {
        found.push(city);
      }
    });
    
    return found;
  }
  
  private getDefaultBPParams(context: any): any {
    // Usa dati da context se disponibili
    if (context.lastOperation?.type === 'feasibility') {
      return {
        projectName: context.lastOperation.inputs.location || 'Progetto Standard',
        units: 10,
        landArea: context.lastOperation.inputs.landArea || 500,
        location: context.lastOperation.inputs.location || 'Italia'
      };
    }
    
    // Defaults puri
    return {
      projectName: 'Progetto Standard',
      units: 10,
      landArea: 500,
      location: 'Italia'
    };
  }
}

// Singleton
let instance: IntentResolver;

export function getIntentResolver(): IntentResolver {
  if (!instance) {
    instance = new IntentResolver();
    console.log('🎯 [IntentResolver] Inizializzato');
  }
  return instance;
}

