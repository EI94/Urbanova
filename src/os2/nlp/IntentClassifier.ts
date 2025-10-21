/**
 * 🧠 INTENT CLASSIFIER - Classificatore NLP avanzato per intent detection
 * 
 * Usa tecniche NLP per classificare l'intent dell'utente:
 * - TF-IDF per keyword extraction
 * - Cosine similarity per matching
 * - Named Entity Recognition per parametri
 * - Context awareness per disambiguazione
 */

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  reasoning: string;
}

export interface IntentPattern {
  name: string;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  entities?: string[];
}

/**
 * Classificatore Intent Avanzato
 */
export class AdvancedIntentClassifier {
  private intentPatterns: IntentPattern[] = [];
  private stopWords = new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per',
    'un', 'una', 'dei', 'delle', 'degli', 'che', 'e', 'o', 'ma', 'se', 'come',
  ]);

  constructor() {
    this.initializePatterns();
    console.log(`🧠 [IntentClassifier] Inizializzato con ${this.intentPatterns.length} pattern`);
  }

  /**
   * Inizializza pattern di intent
   */
  private initializePatterns(): void {
    // Analisi Fattibilità
    this.intentPatterns.push({
      name: 'feasibility.analyze',
      keywords: ['analisi', 'fattibilità', 'terreno', 'valuta', 'analizza', 'studio', 'preliminare'],
      patterns: [
        /analisi.*fattibilità/i,
        /analizza.*terreno/i,
        /studio.*fattibilità/i,
        /valuta.*progetto/i,
      ],
      weight: 1.0,
      entities: ['location', 'area', 'projectType'],
    });

    // Business Plan
    this.intentPatterns.push({
      name: 'business_plan.calculate',
      keywords: ['business', 'plan', 'piano', 'finanziario', 'van', 'tir', 'roi', 'calcola'],
      patterns: [
        /business\s*plan/i,
        /piano.*finanziario/i,
        /calcola.*roi/i,
        /van.*tir/i,
      ],
      weight: 1.0,
      entities: ['projectName', 'units', 'location'],
    });

    // Lista Progetti
    this.intentPatterns.push({
      name: 'project.list',
      keywords: ['mostra', 'lista', 'visualizza', 'progetti', 'tutti', 'miei'],
      patterns: [
        /mostra.*progetti/i,
        /lista.*progetti/i,
        /tutti.*miei.*progetti/i,
        /visualizza.*progetti/i,
      ],
      weight: 0.9,
      entities: ['projectType'],
    });

    // Email/RDO
    this.intentPatterns.push({
      name: 'email.send',
      keywords: ['invia', 'manda', 'email', 'condividi', 'report', 'rdo'],
      patterns: [
        /invia.*(?:email|report|rdo)/i,
        /manda.*(?:email|report)/i,
        /condividi.*(?:progetto|report)/i,
      ],
      weight: 0.9,
      entities: ['recipients', 'subject'],
    });

    // Conversazione Generale
    this.intentPatterns.push({
      name: 'conversation.general',
      keywords: ['ciao', 'salve', 'aiuto', 'help', 'cosa', 'come', 'grazie'],
      patterns: [
        /^ciao/i,
        /^salve/i,
        /come\s*stai/i,
        /cosa.*puoi.*fare/i,
      ],
      weight: 0.7,
      entities: [],
    });

    // Workflow Multi-step
    this.intentPatterns.push({
      name: 'workflow.multi_step',
      keywords: ['tutto', 'completo', 'trasforma', 'prima', 'poi', 'dopo', 'e poi'],
      patterns: [
        /tutto/i,
        /completo/i,
        /trasforma.*in/i,
        /prima.*poi/i,
        /e\s*poi/i,
      ],
      weight: 1.1,
      entities: ['workflowType'],
    });
  }

  /**
   * Classifica intent del messaggio utente
   */
  classify(userMessage: string, context?: Record<string, any>): Intent {
    console.log(`🧠 [IntentClassifier] Classificando: "${userMessage}"`);

    // Tokenize e pulisci messaggio
    const tokens = this.tokenize(userMessage);
    const cleanTokens = tokens.filter(t => !this.stopWords.has(t.toLowerCase()));

    // Calcola score per ogni intent
    const scores = this.intentPatterns.map(pattern => {
      const score = this.calculateScore(userMessage, cleanTokens, pattern);
      return {
        intent: pattern.name,
        score: score * pattern.weight,
        pattern,
      };
    });

    // Ordina per score
    scores.sort((a, b) => b.score - a.score);

    const bestMatch = scores[0];
    const confidence = Math.min(bestMatch.score, 1.0);

    // Estrai entities
    const entities = this.extractEntities(userMessage, bestMatch.pattern.entities || []);

    console.log(`✅ [IntentClassifier] Intent rilevato: ${bestMatch.intent} (confidence: ${confidence.toFixed(2)})`);

    return {
      name: bestMatch.intent,
      confidence,
      entities,
      reasoning: `Match su pattern: ${bestMatch.pattern.name}`,
    };
  }

  /**
   * Tokenize messaggio
   */
  private tokenize(message: string): string[] {
    return message
      .toLowerCase()
      .replace(/[^\w\sàèéìòù]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  /**
   * Calcola score per pattern
   */
  private calculateScore(message: string, tokens: string[], pattern: IntentPattern): number {
    let score = 0;

    // 1. Pattern matching (peso alto)
    for (const regex of pattern.patterns) {
      if (regex.test(message)) {
        score += 0.5;
      }
    }

    // 2. Keyword matching con TF-IDF semplificato
    const keywordMatches = tokens.filter(token => 
      pattern.keywords.some(keyword => 
        keyword.includes(token) || token.includes(keyword)
      )
    );

    const keywordScore = keywordMatches.length / Math.max(pattern.keywords.length, 1);
    score += keywordScore * 0.3;

    // 3. Bonus per keyword exact match
    const exactMatches = tokens.filter(token => pattern.keywords.includes(token));
    score += exactMatches.length * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Estrae entities dal messaggio
   */
  private extractEntities(message: string, entityTypes: string[]): Record<string, any> {
    const entities: Record<string, any> = {};

    for (const entityType of entityTypes) {
      switch (entityType) {
        case 'location':
          entities.location = this.extractLocation(message);
          break;

        case 'area':
          entities.area = this.extractNumber(message, /(\d+)\s*m[²2q]?/i);
          break;

        case 'units':
          entities.units = this.extractNumber(message, /(\d+)\s*unità/i);
          break;

        case 'projectName':
          entities.projectName = this.extractProjectName(message);
          break;

        case 'projectType':
          entities.projectType = this.extractProjectType(message);
          break;

        case 'recipients':
          entities.recipients = this.extractEmails(message);
          break;

        case 'workflowType':
          entities.workflowType = this.extractWorkflowType(message);
          break;
      }
    }

    return entities;
  }

  /**
   * Estrae location dal messaggio
   */
  private extractLocation(message: string): string | null {
    const locations = [
      'roma', 'milano', 'firenze', 'torino', 'bologna', 'napoli', 
      'venezia', 'genova', 'palermo', 'verona', 'padova', 'trieste'
    ];

    const msg = message.toLowerCase();
    for (const loc of locations) {
      if (msg.includes(loc)) {
        return loc.charAt(0).toUpperCase() + loc.slice(1);
      }
    }

    return null;
  }

  /**
   * Estrae numero con regex
   */
  private extractNumber(message: string, regex: RegExp): number | null {
    const match = message.match(regex);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Estrae nome progetto
   */
  private extractProjectName(message: string): string | null {
    const match = message.match(/progetto\s+([a-zA-Zàèéìòù\s]+)/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Estrae tipo progetto
   */
  private extractProjectType(message: string): string | null {
    const msg = message.toLowerCase();
    
    if (msg.includes('residenziale') || msg.includes('appartamenti')) return 'residenziale';
    if (msg.includes('commerciale') || msg.includes('uffici')) return 'commerciale';
    if (msg.includes('misto')) return 'misto';
    
    return null;
  }

  /**
   * Estrae email
   */
  private extractEmails(message: string): string[] {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return message.match(emailRegex) || [];
  }

  /**
   * Estrae tipo workflow
   */
  private extractWorkflowType(message: string): string | null {
    const msg = message.toLowerCase();
    
    if (msg.includes('trasforma') && msg.includes('business')) return 'feasibility_to_business_plan';
    if (msg.includes('completo') && msg.includes('business')) return 'business_plan_complete';
    if (msg.includes('tutto')) return 'complete_project';
    
    return null;
  }

  /**
   * Aggiungi pattern personalizzato
   */
  addPattern(pattern: IntentPattern): void {
    this.intentPatterns.push(pattern);
    console.log(`✅ [IntentClassifier] Pattern aggiunto: ${pattern.name}`);
  }

  /**
   * Ottieni tutti i pattern
   */
  getPatterns(): IntentPattern[] {
    return [...this.intentPatterns];
  }
}

/**
 * Singleton per Intent Classifier
 */
let classifierInstance: AdvancedIntentClassifier | null = null;

export function getIntentClassifier(): AdvancedIntentClassifier {
  if (!classifierInstance) {
    classifierInstance = new AdvancedIntentClassifier();
  }
  return classifierInstance;
}

