// 🧠 PLANNER - Sistema di pianificazione intelligente per OS 2.0
// Converte intent + entities in ActionPlan eseguibile

import {
  ActionPlan,
  OsActionStep,
  PlannerInput,
  createActionPlan,
} from './ActionPlan';
import { SkillCatalog } from '../skills/SkillCatalog';
import { getMemoryStore } from '../memory/MemoryStore';
import type { ProjectMemory, UserMemory } from '../memory/types';

/**
 * Planner intelligente che genera ActionPlan da intent/entities
 */
export class Planner {
  // LAZY: Inizializzati solo quando accessati per evitare TDZ
  private _skillCatalog: SkillCatalog | null = null;
  private _memoryStore: ReturnType<typeof getMemoryStore> | null = null;
  
  constructor() {
    // Niente inizializzazione qui - tutto lazy
  }
  
  private get skillCatalog() {
    if (!this._skillCatalog) {
      this._skillCatalog = SkillCatalog.getInstance();
    }
    return this._skillCatalog;
  }
  
  private get memoryStore() {
    if (!this._memoryStore) {
      this._memoryStore = getMemoryStore();
    }
    return this._memoryStore;
  }
  
  /**
   * Genera un ActionPlan da input utente
   */
  public async plan(input: PlannerInput): Promise<ActionPlan> {
    console.log(`🧠 [Planner] Pianificazione per intent: ${input.intent}`);
    
    // Carica memoria per defaults intelligenti
    const projectMemory = await this.loadProjectMemory(input);
    const userMemory = await this.loadUserMemory(input);
    
    console.log(`💾 [Planner] Memoria caricata:`, {
      hasProjectDefaults: !!projectMemory?.defaults,
      hasUserPreferences: !!userMemory?.preferences,
    });
    
    // Seleziona la strategia di pianificazione basata sull'intent
    const steps = await this.planForIntent(input);
    
    // Identifica assumptions
    const assumptions = this.identifyAssumptions(input);
    
    // Identifica risks
    const risks = this.identifyRisks(steps, input);
    
    // Calcola durata stimata
    const estimatedDurationMs = this.estimateDuration(steps);
    
    const plan = createActionPlan(
      this.generateGoal(input),
      steps,
      {
        assumptions,
        risks,
        metadata: {
          intent: input.intent,
          entities: input.entities,
          confidence: this.calculatePlanConfidence(input, steps),
          estimatedDurationMs,
        },
      }
    );
    
    console.log(`✅ [Planner] Plan generato: ${plan.id} con ${steps.length} step`);
    
    return plan;
  }
  
  /**
   * Pianifica step basandosi sull'intent
   */
  private async planForIntent(input: PlannerInput): Promise<OsActionStep[]> {
    const { intent, entities } = input;
    
    // Business Plan intents
    if (intent === 'business_plan' || intent === 'business_plan_creation') {
      return this.planBusinessPlan(entities);
    }
    
    if (intent === 'sensitivity_analysis') {
      return this.planSensitivityAnalysis(entities);
    }
    
    if (intent === 'business_plan_export') {
      return this.planBusinessPlanExport(entities);
    }
    
    // Feasibility intents
    if (intent === 'feasibility_analysis') {
      return this.planFeasibilityAnalysis(entities);
    }
    
    // Communication intents
    if (intent === 'rdo_send' || intent === 'send_rdo') {
      return this.planRdoSend(entities);
    }
    
    if (intent === 'email_send') {
      return this.planEmailSend(entities);
    }
    
    // Query intents
    if (intent === 'project_query' || intent === 'project_consultation') {
      return this.planProjectQuery(entities);
    }
    
    if (intent === 'project_list') {
      return this.planProjectList(entities);
    }
    
    // Default: general inquiry
    return this.planGeneralInquiry(entities, input.userMessage);
  }
  
  /**
   * Piano per Business Plan completo
   */
  private planBusinessPlan(entities: Record<string, unknown>): OsActionStep[] {
    const steps: OsActionStep[] = [];
    
    // Step 1: Calcola Business Plan (usa skill reale)
    steps.push({
      skillId: 'business_plan.run',
      inputs: {
        projectName: entities.projectName || 'Progetto Senza Nome',
        totalUnits: entities.units || entities.totalUnits || 4,
        averagePrice: entities.salePrice || entities.averagePrice || 390000,
        constructionCostPerUnit: entities.constructionCost || entities.constructionCostPerUnit || 200000,
        landScenarios: entities.landScenarios || [
          { name: 'Cash Upfront', type: 'CASH', upfrontPayment: 220000 },
        ],
        location: entities.location || 'Italia',
        type: entities.type || 'RESIDENTIAL',
      },
      idempotent: true,
      name: 'Calcola Business Plan',
      description: 'Calcolo VAN, TIR, DSCR per tutti gli scenari',
    });
    
    return steps;
  }
  
  /**
   * Piano per Sensitivity Analysis
   */
  private planSensitivityAnalysis(entities: Record<string, unknown>): OsActionStep[] {
    return [
      {
        skillId: 'sensitivity.run',
        inputs: {
          businessPlanId: entities.businessPlanId,
          projectId: entities.projectId,
          variable: entities.variable || 'price',
          range: entities.range || 15,
          baseScenario: entities.baseScenario,
        },
        idempotent: true,
        name: 'Analisi Sensitivity',
        description: `Variazione ${entities.variable || 'price'} ±${entities.range || 15}%`,
      },
    ];
  }
  
  /**
   * Piano per Export Business Plan
   */
  private planBusinessPlanExport(entities: Record<string, unknown>): OsActionStep[] {
    return [
      {
        skillId: 'term_sheet.create',
        inputs: {
          businessPlanId: entities.businessPlanId || 'latest',
          format: entities.format || 'pdf',
          includeCharts: entities.includeCharts !== false,
          includeSensitivity: entities.includeSensitivity !== false,
        },
        idempotent: true,
        name: 'Genera Term Sheet',
        description: `Generazione Term Sheet ${entities.format || 'pdf'}`,
      },
    ];
  }
  
  /**
   * Piano per Feasibility Analysis
   */
  private planFeasibilityAnalysis(entities: Record<string, unknown>): OsActionStep[] {
    const steps: OsActionStep[] = [];
    
    // Step 1: Analizza
    steps.push({
      skillId: 'feasibility.analyze',
      inputs: {
        landArea: entities.landArea || 1000,
        constructionCostPerSqm: entities.constructionCostPerSqm || 2000,
        salePrice: entities.salePrice || 5000,
      },
      idempotent: true,
      name: 'Analisi Fattibilità',
      description: 'Calcolo ROI, margini, payback',
    });
    
    // Step 2: Salva
    if (entities.save !== false) {
      steps.push({
        skillId: 'feasibility.save',
        inputs: {
          data: { type: 'feasibility' },
        },
        idempotent: false,
        name: 'Salva Analisi',
        description: 'Salvataggio su Firestore',
      });
    }
    
    return steps;
  }
  
  /**
   * Piano per invio RDO
   */
  private planRdoSend(entities: Record<string, unknown>): OsActionStep[] {
    const vendors = entities.vendors as Array<{ email: string }> | string[] | undefined;
    const vendorCount = Array.isArray(vendors) ? vendors.length : 0;
    
    return [
      {
        skillId: 'rdo.create',
        inputs: {
          projectId: entities.projectId || 'unknown',
          projectName: entities.projectName,
          vendors: Array.isArray(vendors) 
            ? vendors.map(v => typeof v === 'string' ? { email: v } : v)
            : [],
          title: entities.title,
          description: entities.description,
        },
        confirm: true, // ⚠️ Richiede conferma
        idempotent: false,
        name: 'Crea e Invia RDO',
        description: `Invio RDO a ${vendorCount} fornitori`,
      },
    ];
  }
  
  /**
   * Piano per invio email
   */
  private planEmailSend(entities: Record<string, unknown>): OsActionStep[] {
    return [
      {
        skillId: 'email.send',
        inputs: {
          to: entities.to || '',
          subject: entities.subject || 'Messaggio da Urbanova',
          body: entities.body || '',
        },
        confirm: true, // ⚠️ Richiede conferma
        idempotent: false,
        name: 'Invia Email',
        description: `Email a ${entities.to}`,
      },
    ];
  }
  
  /**
   * Piano per query progetti
   */
  private planProjectQuery(entities: Record<string, unknown>): OsActionStep[] {
    return [
      {
        skillId: 'project.query',
        inputs: {
          filters: entities.filters || {},
        },
        idempotent: true,
        name: 'Query Progetti',
        description: 'Ricerca progetti con filtri',
      },
    ];
  }
  
  /**
   * Piano per lista progetti
   */
  private planProjectList(entities: Record<string, unknown>): OsActionStep[] {
    return [
      {
        skillId: 'project.list',
        inputs: {},
        idempotent: true,
        name: 'Lista Progetti',
        description: 'Elenca tutti i progetti utente',
      },
    ];
  }
  
  /**
   * Piano per general inquiry (fallback) - Risposta conversazionale
   */
  private planGeneralInquiry(entities: Record<string, unknown>, userMessage: string): OsActionStep[] {
    // Per messaggi semplici come "Ciao", non eseguiamo skill tecnici
    // ma forniamo una risposta conversazionale diretta
    return [
      {
        skillId: 'conversation.general',
        inputs: {
          userMessage: userMessage || 'Messaggio generico',
          responseType: 'greeting'
        },
        idempotent: true,
        name: 'Risposta Conversazionale',
        description: 'Risposta amichevole e conversazionale',
      },
    ];
  }
  
  /**
   * Genera goal leggibile per il plan
   */
  private generateGoal(input: PlannerInput): string {
    const { intent, entities } = input;
    
    if (intent === 'business_plan') {
      return `Crea Business Plan per "${entities.projectName || 'progetto'}"`;
    }
    
    if (intent === 'sensitivity_analysis') {
      return `Analisi sensitivity su ${entities.variable || 'prezzi'}`;
    }
    
    if (intent === 'rdo_send') {
      return `Invia RDO a ${(entities.vendors as string[] | undefined)?.length || 0} fornitori`;
    }
    
    if (intent === 'feasibility_analysis') {
      return `Analisi fattibilità immobiliare`;
    }
    
    return `Esegui: ${intent}`;
  }
  
  /**
   * Identifica assumptions fatte dal planner
   */
  private identifyAssumptions(input: PlannerInput): string[] {
    const assumptions: string[] = [];
    const { entities } = input;
    
    if (!entities.projectName) {
      assumptions.push('Nome progetto non specificato, uso default');
    }
    
    if (!entities.units) {
      assumptions.push('Numero unità non specificato, assumo 4');
    }
    
    if (entities.save === undefined) {
      assumptions.push('Salvataggio automatico abilitato');
    }
    
    return assumptions;
  }
  
  /**
   * Identifica rischi potenziali
   */
  private identifyRisks(steps: OsActionStep[], input: PlannerInput): string[] {
    const risks: string[] = [];
    
    // Controlla step che richiedono conferma
    const confirmableSteps = steps.filter(s => s.confirm);
    if (confirmableSteps.length > 0) {
      risks.push(`${confirmableSteps.length} step richiedono conferma utente`);
    }
    
    // Controlla step con side effects
    const nonIdempotentSteps = steps.filter(s => !s.idempotent);
    if (nonIdempotentSteps.length > 0) {
      risks.push(`${nonIdempotentSteps.length} step non idempotenti (modificano dati)`);
    }
    
    // Controlla dati mancanti
    if (Object.keys(input.entities).length < 3) {
      risks.push('Pochi dati forniti, potrebbero servire integrazioni');
    }
    
    return risks;
  }
  
  /**
   * Stima durata totale del plan
   */
  private estimateDuration(steps: OsActionStep[]): number {
    let totalMs = 0;
    
    for (const step of steps) {
      const skill = this.skillCatalog.get(step.skillId);
      if (skill) {
        totalMs += skill.meta.latencyBudgetMs || 1000;
      } else {
        totalMs += 1000; // Default 1s
      }
    }
    
    return totalMs;
  }
  
  /**
   * Calcola confidence del plan
   */
  private calculatePlanConfidence(input: PlannerInput, steps: OsActionStep[]): number {
    let confidence = 0.9; // Base confidence
    
    // Riduci confidence se dati mancanti
    const entityCount = Object.keys(input.entities).length;
    if (entityCount < 3) {
      confidence -= 0.1;
    }
    
    // Riduci confidence se ci sono step sconosciuti
    const unknownSkills = steps.filter(s => !this.skillCatalog.has(s.skillId));
    if (unknownSkills.length > 0) {
      confidence -= 0.2 * unknownSkills.length;
    }
    
    return Math.max(0.5, Math.min(1.0, confidence));
  }
  
  /**
   * Carica memoria del progetto
   */
  private async loadProjectMemory(input: PlannerInput): Promise<ProjectMemory | null> {
    try {
      if (input.userContext.projectId) {
        return await this.memoryStore.getProjectMemory(input.userContext.projectId);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ [Planner] Errore caricamento memoria progetto:', error);
      return null;
    }
  }
  
  /**
   * Carica memoria dell'utente
   */
  private async loadUserMemory(input: PlannerInput): Promise<UserMemory | null> {
    try {
      return await this.memoryStore.getUserMemory(input.userContext.userId);
    } catch (error) {
      console.warn('⚠️ [Planner] Errore caricamento memoria utente:', error);
      return null;
    }
  }
}

