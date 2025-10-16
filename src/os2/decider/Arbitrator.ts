// 🧠 ARBITRATOR - Decision Layer per OS 2.0
// Decide come procedere basandosi su confidence della classificazione

import { ClassificationResult } from '@/lib/urbanovaOS/ml/classificationEngine';
import { PlannerInput } from '../planner/ActionPlan';

/**
 * Decisione dell'Arbitrator
 */
export type ArbitratorDecision = 
  | { type: 'proceed'; plannerInput: PlannerInput }
  | { type: 'clarify'; clarifyPrompt: ClarifyPrompt }
  | { type: 'disambiguate'; interpretations: Interpretation[] };

/**
 * Prompt di chiarimento per confidence medio-bassa
 */
export interface ClarifyPrompt {
  question: string;
  missingFields: string[];
  context: {
    intent: string;
    partialEntities: Record<string, unknown>;
    confidence: number;
  };
  suggestedValues?: Record<string, unknown>;
}

/**
 * Interpretazione possibile per confidence molto bassa
 */
export interface Interpretation {
  id: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  description: string;
  example: string;
}

/**
 * Arbitrator - Decide come procedere basandosi su classification
 */
export class Arbitrator {
  private readonly HIGH_CONFIDENCE_THRESHOLD = 0.7;
  private readonly LOW_CONFIDENCE_THRESHOLD = 0.4;
  
  /**
   * Decide come procedere basandosi sulla classificazione
   */
  public decide(
    classification: ClassificationResult,
    userMessage: string,
    userId: string,
    sessionId: string
  ): ArbitratorDecision {
    const { confidence, intent, entities } = classification;
    
    console.log(`🧠 [Arbitrator] Decisione per confidence ${confidence.toFixed(2)}`);
    
    // SCENARIO 1: Alta confidence (>= 0.7) → Procedi con Planner
    if (confidence >= this.HIGH_CONFIDENCE_THRESHOLD) {
      console.log(`✅ [Arbitrator] Alta confidence (${confidence.toFixed(2)}), procedo con Planner`);
      
      return {
        type: 'proceed',
        plannerInput: {
          intent,
          entities: this.entitiesToRecord(entities),
          userMessage,
          userContext: {
            userId,
            sessionId,
            projectId: undefined,
            userRoles: ['editor'],
            environment: 'production',
            metadata: {},
          },
        },
      };
    }
    
    // SCENARIO 2: Media confidence (0.4-0.7) → Chiedi chiarimento
    if (confidence >= this.LOW_CONFIDENCE_THRESHOLD) {
      console.log(`⚠️ [Arbitrator] Media confidence (${confidence.toFixed(2)}), richiedo chiarimento`);
      
      return {
        type: 'clarify',
        clarifyPrompt: this.generateClarifyPrompt(
          classification,
          userMessage
        ),
      };
    }
    
    // SCENARIO 3: Bassa confidence (< 0.4) → Proponi interpretazioni
    console.log(`❌ [Arbitrator] Bassa confidence (${confidence.toFixed(2)}), propongo interpretazioni`);
    
    return {
      type: 'disambiguate',
      interpretations: this.generateInterpretations(
        classification,
        userMessage
      ),
    };
  }
  
  /**
   * Genera prompt di chiarimento per confidence media
   */
  private generateClarifyPrompt(
    classification: ClassificationResult,
    userMessage: string
  ): ClarifyPrompt {
    const { intent, entities, confidence } = classification;
    
    // Identifica campi mancanti basandosi sull'intent
    const missingFields = this.identifyMissingFields(intent, entities);
    
    // Genera domanda di chiarimento
    let question = `Ho capito che vuoi `;
    
    if (intent === 'business_plan') {
      question += `creare un Business Plan`;
    } else if (intent === 'sensitivity_analysis') {
      question += `fare un'analisi di sensitivity`;
    } else if (intent === 'rdo_send' || intent === 'rdo_create') {
      question += `inviare una Richiesta di Offerta`;
    } else if (intent === 'feasibility_analysis') {
      question += `fare un'analisi di fattibilità`;
    } else {
      question += `eseguire: ${intent}`;
    }
    
    // Aggiungi info su cosa manca
    if (missingFields.length > 0) {
      question += `, ma mi servono ancora queste informazioni:\n\n`;
      
      missingFields.forEach((field, idx) => {
        question += `${idx + 1}. **${this.getFieldLabel(field)}**`;
        
        const suggestion = this.getSuggestedValue(field, entities);
        if (suggestion) {
          question += ` (suggerito: ${suggestion})`;
        }
        
        question += `\n`;
      });
    } else {
      question += `. Puoi confermare o fornire più dettagli?`;
    }
    
    return {
      question,
      missingFields,
      context: {
        intent,
        partialEntities: this.entitiesToRecord(entities),
        confidence,
      },
      suggestedValues: this.generateSuggestedValues(intent, entities),
    };
  }
  
  /**
   * Genera interpretazioni multiple per confidence bassa
   */
  private generateInterpretations(
    classification: ClassificationResult,
    userMessage: string
  ): Interpretation[] {
    const interpretations: Interpretation[] = [];
    
    // Interpretazione 1: Intent primario con entities parziali
    interpretations.push({
      id: 'interp_1',
      intent: classification.intent,
      entities: this.entitiesToRecord(classification.entities),
      confidence: classification.confidence,
      description: this.getIntentDescription(classification.intent),
      example: this.getIntentExample(classification.intent),
    });
    
    // Interpretazione 2: Intent alternativo plausibile
    const alternativeIntent = this.guessAlternativeIntent(userMessage, classification);
    
    interpretations.push({
      id: 'interp_2',
      intent: alternativeIntent.intent,
      entities: alternativeIntent.entities,
      confidence: alternativeIntent.confidence,
      description: this.getIntentDescription(alternativeIntent.intent),
      example: this.getIntentExample(alternativeIntent.intent),
    });
    
    return interpretations;
  }
  
  /**
   * Identifica campi mancanti per un intent
   */
  private identifyMissingFields(
    intent: string,
    entities: Array<{ name: string; value: string }>
  ): string[] {
    const entityNames = new Set(entities.map(e => e.name));
    const missing: string[] = [];
    
    if (intent === 'business_plan') {
      if (!entityNames.has('projectName')) missing.push('projectName');
      if (!entityNames.has('units') && !entityNames.has('totalUnits')) missing.push('units');
      if (!entityNames.has('averagePrice') && !entityNames.has('salePrice')) missing.push('averagePrice');
      if (!entityNames.has('constructionCost') && !entityNames.has('constructionCostPerUnit')) missing.push('constructionCost');
    } else if (intent === 'sensitivity_analysis') {
      if (!entityNames.has('projectId') && !entityNames.has('businessPlanId')) missing.push('projectId');
      if (!entityNames.has('variable')) missing.push('variable');
    } else if (intent === 'rdo_send' || intent === 'rdo_create') {
      if (!entityNames.has('projectId')) missing.push('projectId');
      if (!entityNames.has('vendors')) missing.push('vendors');
    }
    
    return missing;
  }
  
  /**
   * Label leggibile per un campo
   */
  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      projectName: 'Nome del progetto',
      units: 'Numero di unità',
      totalUnits: 'Numero totale di unità',
      averagePrice: 'Prezzo medio di vendita',
      salePrice: 'Prezzo di vendita',
      constructionCost: 'Costo di costruzione per unità',
      constructionCostPerUnit: 'Costo di costruzione per unità',
      projectId: 'ID del progetto',
      businessPlanId: 'ID del Business Plan',
      variable: 'Variabile da analizzare (prezzo, costo, tasso)',
      vendors: 'Fornitori destinatari',
    };
    
    return labels[field] || field;
  }
  
  /**
   * Suggerisce valore per un campo
   */
  private getSuggestedValue(
    field: string,
    entities: Array<{ name: string; value: string }>
  ): string | undefined {
    // Se abbiamo un valore parziale, suggeriscilo
    const entity = entities.find(e => e.name === field);
    if (entity) return entity.value;
    
    // Defaults ragionevoli
    if (field === 'units' || field === 'totalUnits') return '4';
    if (field === 'variable') return 'price';
    
    return undefined;
  }
  
  /**
   * Genera valori suggeriti per un intent
   */
  private generateSuggestedValues(
    intent: string,
    entities: Array<{ name: string; value: string }>
  ): Record<string, unknown> {
    const suggestions: Record<string, unknown> = {};
    
    if (intent === 'business_plan') {
      suggestions.units = 4;
      suggestions.salesCommission = 3;
      suggestions.contingency = 10;
      suggestions.discountRate = 12;
    } else if (intent === 'sensitivity_analysis') {
      suggestions.variable = 'price';
      suggestions.range = 15;
    }
    
    return suggestions;
  }
  
  /**
   * Descrizione leggibile di un intent
   */
  private getIntentDescription(intent: string): string {
    const descriptions: Record<string, string> = {
      business_plan: 'Crea un Business Plan completo con VAN, TIR, DSCR e analisi scenari',
      sensitivity_analysis: 'Esegui analisi di sensitivity su variabili chiave',
      rdo_send: 'Invia Richiesta di Offerta a fornitori selezionati',
      rdo_create: 'Invia Richiesta di Offerta a fornitori selezionati',
      feasibility_analysis: 'Analizza la fattibilità economica di un progetto',
      project_consultation: 'Consulta e cerca tra i progetti esistenti',
      general: 'Informazioni generali o supporto',
    };
    
    return descriptions[intent] || `Esegui operazione: ${intent}`;
  }
  
  /**
   * Esempio per un intent
   */
  private getIntentExample(intent: string): string {
    const examples: Record<string, string> = {
      business_plan: 'Es: "Business plan progetto Ciliegie: 4 case, prezzo 390k, costo 200k"',
      sensitivity_analysis: 'Es: "Sensitivity ±15% sul prezzo del progetto X"',
      rdo_send: 'Es: "Invia RDO a 3 fornitori per il progetto Villa"',
      rdo_create: 'Es: "Invia RDO a 3 fornitori per il progetto Villa"',
      feasibility_analysis: 'Es: "Analisi fattibilità: terreno 1000mq, €2000/mq costruzione"',
      general: 'Es: "Mostrami i miei progetti" o "Come funziona il Business Plan?"',
      project_consultation: 'Es: "Mostrami i progetti a Milano con ROI > 15%"',
    };
    
    return examples[intent] || `Es: Query generica su ${intent}`;
  }
  
  /**
   * Indovina intent alternativo plausibile
   */
  private guessAlternativeIntent(
    userMessage: string,
    classification: ClassificationResult
  ): { intent: string; entities: Record<string, unknown>; confidence: number } {
    const text = userMessage.toLowerCase();
    
    // Se primary è business_plan, alternativa potrebbe essere feasibility
    if (classification.intent === 'business_plan') {
      return {
        intent: 'feasibility_analysis',
        entities: this.entitiesToRecord(classification.entities),
        confidence: 0.6,
      };
    }
    
    // Se primary è feasibility, alternativa è business_plan
    if (classification.intent === 'feasibility_analysis') {
      return {
        intent: 'business_plan',
        entities: this.entitiesToRecord(classification.entities),
        confidence: 0.55,
      };
    }
    
    // Se primary è rdo, alternativa è email generica
    if (classification.intent.includes('rdo')) {
      return {
        intent: 'email_send',
        entities: {},
        confidence: 0.5,
      };
    }
    
    // Default: general inquiry
    return {
      intent: 'general',
      entities: {},
      confidence: 0.4,
    };
  }
  
  /**
   * Converte array di entities in Record
   */
  private entitiesToRecord(
    entities: Array<{ name: string; value: string; confidence?: number }>
  ): Record<string, unknown> {
    return entities.reduce((acc, entity) => {
      acc[entity.name] = entity.value;
      return acc;
    }, {} as Record<string, unknown>);
  }
  
  /**
   * Valuta se può procedere con le informazioni disponibili
   */
  public canProceed(
    classification: ClassificationResult,
    requiredFields: string[]
  ): { canProceed: boolean; reason?: string } {
    const { confidence, entities } = classification;
    
    // Confidence troppo bassa → non può procedere
    if (confidence < this.HIGH_CONFIDENCE_THRESHOLD) {
      return {
        canProceed: false,
        reason: `Confidence troppo bassa (${confidence.toFixed(2)} < ${this.HIGH_CONFIDENCE_THRESHOLD})`,
      };
    }
    
    // Controlla campi richiesti
    const entityNames = new Set(entities.map(e => e.name));
    const missingRequired = requiredFields.filter(field => !entityNames.has(field));
    
    if (missingRequired.length > 0) {
      return {
        canProceed: false,
        reason: `Campi richiesti mancanti: ${missingRequired.join(', ')}`,
      };
    }
    
    return { canProceed: true };
  }
}

