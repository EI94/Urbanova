// Planner - Urbanova OS
// import { Plan, PlanMode } from '@urbanova/types';
// import { CHAT_INTENT_PATTERNS } from '@urbanova/types';

// Mock types
type Plan = any;
type PlanMode = any;
const CHAT_INTENT_PATTERNS = {} as any;

export class Planner {
  /**
   * Classifica il testo in entrata come QNA o ACTION
   */
  classify(text: string): Plan {
    const trimmedText = text.trim();

    // Override per dryrun
    if (trimmedText.toLowerCase().includes('/dryrun')) {
      return {
        mode: 'ACTION',
        intent: 'dryrun',
        args: { originalText: trimmedText },
        confidence: 1.0,
      };
    }

    // Presenza di slash → ACTION
    if (trimmedText.startsWith('/')) {
      return this.parseSlashCommand(trimmedText);
    }

    // Keyword-based classification per capability core
    const coreCapabilityIntent = this.detectCoreCapabilityIntent(trimmedText);
    if (coreCapabilityIntent) {
      return {
        mode: 'ACTION',
        intent: coreCapabilityIntent.intent,
        args: coreCapabilityIntent.args,
        confidence: 0.9,
        projectId: this.extractProjectAlias(trimmedText),
      };
    }

    // Keyword-based classification generica
    const keywords = this.extractKeywords(trimmedText);

    if (this.isActionKeywords(keywords)) {
      return {
        mode: 'ACTION',
        intent: this.extractIntent(keywords),
        args: this.extractArgs(trimmedText),
        confidence: 0.8,
        projectId: this.extractProjectAlias(trimmedText),
      };
    }

    // Default: QNA
    const projectId = this.extractProjectAlias(trimmedText);
    const plan: Plan = {
      mode: 'QNA',
      confidence: 0.6,
    };

    if (projectId) {
      plan.projectId = projectId;
    }

    return plan;
  }

  /**
   * Rileva intent per capability core basato su pattern specifici
   */
  private detectCoreCapabilityIntent(text: string): { intent: string; args: any } | null {
    const lowerText = text.toLowerCase();

    console.log(`[Planner] DetectCoreCapabilityIntent - Text: "${text}"`);
    console.log(`[Planner] Lower text: "${lowerText}"`);

    // Project Summary patterns
    const summaryPatterns = CHAT_INTENT_PATTERNS.summary;
    console.log(`[Planner] Summary patterns:`, summaryPatterns);

    for (const pattern of summaryPatterns) {
      if (lowerText.includes(pattern)) {
        console.log(`[Planner] Found summary pattern: "${pattern}"`);
        const projectId = this.extractProjectAlias(text);
        console.log(`[Planner] Extracted projectId:`, projectId);
        return {
          intent: 'project.get_summary',
          args: projectId ? { projectId } : {},
        };
      }
    }

    // Sensitivity patterns
    const sensitivityPatterns = CHAT_INTENT_PATTERNS.sensitivity;
    console.log(`[Planner] Sensitivity patterns:`, sensitivityPatterns);

    for (const pattern of sensitivityPatterns) {
      if (lowerText.includes(pattern)) {
        console.log(`[Planner] Found sensitivity pattern: "${pattern}"`);
        // Estrai deltas se specificati
        const deltas = this.extractSensitivityDeltas(text);
        const projectId = this.extractProjectAlias(text);
        console.log(`[Planner] Extracted deltas:`, deltas, 'projectId:', projectId);
        return {
          intent: 'feasibility.run_sensitivity',
          args: {
            deltas,
            ...(projectId && { projectId }),
          },
        };
      }
    }

    console.log(`[Planner] No core capability patterns found`);
    return null;
  }

  /**
   * Estrae deltas di sensibilità dal testo
   */
  private extractSensitivityDeltas(text: string): number[] {
    // Pattern: ±5/±10, ±5, ±10, 5/10, etc.
    const deltaMatches = text.match(/(?:±?)(\d+)(?:\/±?(\d+))?/g);

    if (deltaMatches) {
      const deltas: number[] = [];

      for (const match of deltaMatches) {
        const numbers = match.match(/\d+/g);
        if (numbers) {
          numbers.forEach(num => {
            const delta = parseInt(num) / 100; // Converti 5% in 0.05
            if (delta >= 0.01 && delta <= 0.2) {
              // Bounds 1%-20%
              deltas.push(-delta, delta); // Aggiungi sia positivo che negativo
            }
          });
        }
      }

      if (deltas.length > 0) {
        // Rimuovi duplicati e ordina
        return [...new Set(deltas)].sort((a, b) => a - b);
      }
    }

    // Default deltas se non specificati
    return [-0.1, -0.05, 0.05, 0.1];
  }

  /**
   * Estrae alias progetto dal testo
   */
  private extractProjectAlias(text: string): string | undefined {
    // Pattern: "Progetto A", "Project B", "progetto X"
    const projectMatch = text.match(/progetto\s+([A-Za-z0-9]+)/i);
    if (projectMatch) {
      return projectMatch[1];
    }

    // Pattern: "sul Progetto A", "nel Progetto B"
    const projectMatch2 = text.match(/(?:su|nel|sul)\s+progetto\s+([A-Za-z0-9]+)/i);
    if (projectMatch2) {
      return projectMatch2[1];
    }

    return undefined;
  }

  /**
   * Estrae parole chiave dal testo
   */
  private extractKeywords(text: string): string[] {
    const stopWords = [
      'il',
      'la',
      'di',
      'da',
      'in',
      'con',
      'su',
      'per',
      'tra',
      'fra',
      'a',
      'e',
      'o',
      'ma',
      'se',
      'che',
      'come',
      'quando',
      'dove',
      'perché',
    ];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  /**
   * Determina se le parole chiave indicano un'azione
   */
  private isActionKeywords(keywords: string[]): boolean {
    const actionWords = [
      'crea',
      'creare',
      'creato',
      'creazione',
      'modifica',
      'modificare',
      'modificato',
      'elimina',
      'eliminare',
      'eliminato',
      'invia',
      'inviare',
      'inviato',
      'scarica',
      'scaricare',
      'scaricato',
      'aggiorna',
      'aggiornare',
      'aggiornato',
      'pubblica',
      'pubblicare',
      'pubblicato',
      'approva',
      'approvare',
      'approvato',
      'rifiuta',
      'rifiutare',
      'rifiutato',
      'esegui',
      'eseguire',
      'eseguito',
      'avvia',
      'avviare',
      'avviato',
      'ferma',
      'fermare',
      'fermato',
      'riavvia',
      'riavviare',
      'riavviato',
    ];

    return keywords.some(keyword => actionWords.includes(keyword));
  }

  /**
   * Estrae l'intent dalle parole chiave
   */
  private extractIntent(keywords: string[]): string {
    // Mapping semplice parole chiave → intent
    const intentMap: Record<string, string> = {
      crea: 'create',
      creare: 'create',
      modifica: 'update',
      modificare: 'update',
      elimina: 'delete',
      eliminare: 'delete',
      invia: 'send',
      inviare: 'send',
      scarica: 'download',
      scaricare: 'download',
      aggiorna: 'update',
      aggiornare: 'update',
      pubblica: 'publish',
      pubblicare: 'publish',
      approva: 'approve',
      approvare: 'approve',
      rifiuta: 'reject',
      rifiutare: 'reject',
      esegui: 'execute',
      eseguire: 'execute',
      avvia: 'start',
      avviare: 'start',
      ferma: 'stop',
      fermare: 'stop',
      riavvia: 'restart',
      riavviare: 'restart',
    };

    for (const keyword of keywords) {
      if (intentMap[keyword]) {
        return intentMap[keyword];
      }
    }

    return 'unknown';
  }

  /**
   * Estrae argomenti dal testo
   */
  private extractArgs(text: string): any {
    const args: any = {};

    // Estrai numeri
    const numbers = text.match(/\d+/g);
    if (numbers) {
      args.numbers = numbers.map(n => parseInt(n));
    }

    // Estrai email
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emails) {
      args.emails = emails;
    }

    // Estrai URL
    const urls = text.match(/https?:\/\/[^\s]+/g);
    if (urls) {
      args.urls = urls;
    }

    // Estrai date
    const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
    if (dates) {
      args.dates = dates;
    }

    return args;
  }

  /**
   * Parsa comandi slash
   */
  private parseSlashCommand(text: string): Plan {
    const parts = text.split(/\s+/);
    const command = parts[0]?.substring(1); // Rimuovi "/"

    if (!command) {
      return {
        mode: 'ACTION',
        intent: 'unknown',
        args: {},
        confidence: 0.5,
      };
    }

    // Parse args nel formato key:value
    const args: any = {};
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part && part.includes(':')) {
        const [key, value] = part.split(':');
        if (key && value) {
          // Converti tipi comuni
          if (value === 'true') {
            args[key] = true;
          } else if (value === 'false') {
            args[key] = false;
          } else if (!isNaN(Number(value)) && value.trim() !== '') {
            args[key] = Number(value);
          } else {
            args[key] = value;
          }
        }
      }
    }

    const projectId = this.extractProjectAlias(text);
    const plan: Plan = {
      mode: 'ACTION',
      intent: command, // Mantieni il comando completo (es. "echo.say")
      args,
      confidence: 0.95,
    };

    if (projectId) {
      plan.projectId = projectId;
    }

    return plan;
  }
}

// Singleton instance
export const planner = new Planner();
