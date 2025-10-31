// 🔄 FALLBACKS - Gestione fallback chain per OS 2.0
// Definisce strategie di fallback quando skill falliscono

import { OsActionStep, StepExecutionResult } from '../planner/ActionPlan';
import { SkillCatalog } from '../skills/SkillCatalog';

/**
 * Strategia di fallback per una skill
 */
export interface FallbackStrategy {
  /** Skill primaria */
  primarySkillId: string;
  
  /** Skill di fallback in ordine di priorità */
  fallbackChain: Array<{
    skillId: string;
    reason: string;
    inputsTransform?: (originalInputs: unknown) => unknown;
  }>;
  
  /** Messaggio per l'utente se tutti i fallback falliscono */
  userPrompt: string;
}

/**
 * Risultato di un tentativo di fallback
 */
export interface FallbackResult {
  /** Se il fallback ha avuto successo */
  success: boolean;
  
  /** Skill usata con successo (se success=true) */
  usedSkillId?: string;
  
  /** Tentativi effettuati */
  attempts: Array<{
    skillId: string;
    success: boolean;
    error?: string;
  }>;
  
  /** Prompt per l'utente (se tutti i fallback falliscono) */
  userPrompt?: string;
  
  /** Metadata sul fallback */
  metadata: {
    primarySkillId: string;
    fallbacksAttempted: number;
    totalLatencyMs: number;
  };
}

/**
 * Fallback Manager - Gestisce chain di fallback
 */
export class FallbackManager {
  private strategies: Map<string, FallbackStrategy> = new Map();
  // LAZY: Inizializzato solo quando accessato per evitare TDZ
  private _skillCatalog: SkillCatalog | null = null;
  
  constructor() {
    // Niente inizializzazione - tutto lazy
  }
  
  private get skillCatalog() {
    if (!this._skillCatalog) {
      this._skillCatalog = SkillCatalog.getInstance();
      // Registra strategie default solo quando catalog viene accessato per la prima volta
      this.registerDefaultStrategies();
    }
    return this._skillCatalog;
  }
  
  /**
   * Registra strategie di fallback predefinite
   */
  private registerDefaultStrategies(): void {
    // Fallback: PDF → HTML report
    this.register({
      primarySkillId: 'term_sheet.create',
      fallbackChain: [
        {
          skillId: 'report.html',
          reason: 'PDF generation fallita, provo HTML report',
          inputsTransform: (inputs: any) => ({
            ...inputs,
            format: 'html',
          }),
        },
        {
          skillId: 'report.text',
          reason: 'HTML fallito, provo report testuale',
          inputsTransform: (inputs: any) => ({
            businessPlanId: inputs.businessPlanId,
            format: 'text',
          }),
        },
      ],
      userPrompt: 'Non riesco a generare il report. Vuoi che ti invii i dati via email?',
    });
    
    // Fallback: RDO → Email generica
    this.register({
      primarySkillId: 'rdo.create',
      fallbackChain: [
        {
          skillId: 'email.send',
          reason: 'RDO service fallito, provo email generica',
          inputsTransform: (inputs: any) => {
            const vendors = inputs.vendors || [];
            return {
              to: vendors.map((v: any) => v.email || v).join(', '),
              subject: `RDO: ${inputs.projectName || 'Progetto'}`,
              body: inputs.description || 'Richiesta di Offerta',
            };
          },
        },
      ],
      userPrompt: 'Non riesco a inviare la RDO. Vuoi che prepari una bozza email manuale?',
    });
    
    // Fallback: Sales Proposal → Email semplice
    this.register({
      primarySkillId: 'sales.proposal',
      fallbackChain: [
        {
          skillId: 'email.send',
          reason: 'PDF proposta fallito, invio email semplice al cliente',
          inputsTransform: (inputs: any) => ({
            to: inputs.clientEmail,
            subject: `Proposta Commerciale - ${inputs.projectName}`,
            body: `Gentile ${inputs.clientName},\n\nPrezzo: €${inputs.listPrice}\nSuperficie: ${inputs.unitSize}mq`,
          }),
        },
      ],
      userPrompt: 'Non riesco a generare la proposta PDF. Vuoi che invii comunque email al cliente?',
    });
    
    // Fallback: Business Plan → Feasibility semplificata
    this.register({
      primarySkillId: 'business_plan.run',
      fallbackChain: [
        {
          skillId: 'feasibility.analyze',
          reason: 'Business Plan service fallito, provo analisi fattibilità semplificata',
          inputsTransform: (inputs: any) => ({
            landArea: inputs.totalUnits * (inputs.averageUnitSize || 100),
            constructionCostPerSqm: inputs.constructionCostPerSqm || 
              (inputs.constructionCostPerUnit / (inputs.averageUnitSize || 100)),
            salePrice: inputs.averagePrice,
          }),
        },
      ],
      userPrompt: 'Non riesco a calcolare il Business Plan completo. Vuoi un\'analisi di fattibilità semplificata?',
    });
    
    console.log(`✅ [FallbackManager] ${this.strategies.size} strategie registrate`);
  }
  
  /**
   * Registra una strategia di fallback
   */
  public register(strategy: FallbackStrategy): void {
    this.strategies.set(strategy.primarySkillId, strategy);
  }
  
  /**
   * Ottiene strategia di fallback per una skill
   */
  public getStrategy(skillId: string): FallbackStrategy | undefined {
    return this.strategies.get(skillId);
  }
  
  /**
   * Esegue chain di fallback per uno step fallito
   */
  public async executeFallbackChain(
    failedStep: OsActionStep,
    failedResult: StepExecutionResult,
    context: any
  ): Promise<FallbackResult> {
    const startTime = Date.now();
    const strategy = this.getStrategy(failedStep.skillId);
    
    if (!strategy) {
      console.log(`⚠️ [Fallback] Nessuna strategia per ${failedStep.skillId}`);
      
      return {
        success: false,
        attempts: [{
          skillId: failedStep.skillId,
          success: false,
          error: failedResult.error?.message || 'Fallito',
        }],
        userPrompt: 'Si è verificato un errore. Vuoi riprovare?',
        metadata: {
          primarySkillId: failedStep.skillId,
          fallbacksAttempted: 0,
          totalLatencyMs: Date.now() - startTime,
        },
      };
    }
    
    console.log(`🔄 [Fallback] Esecuzione fallback chain per ${failedStep.skillId}`);
    
    const attempts: FallbackResult['attempts'] = [];
    
    // Aggiungi tentativo primario fallito
    attempts.push({
      skillId: failedStep.skillId,
      success: false,
      error: failedResult.error?.message || 'Fallito',
    });
    
    // Prova ogni fallback nella chain
    for (const fallback of strategy.fallbackChain) {
      console.log(`🔄 [Fallback] Tentativo fallback: ${fallback.skillId} (${fallback.reason})`);
      
      try {
        // Ottieni skill di fallback
        const fallbackSkill = this.skillCatalog.get(fallback.skillId);
        
        if (!fallbackSkill) {
          console.warn(`⚠️ [Fallback] Skill ${fallback.skillId} non trovata`);
          attempts.push({
            skillId: fallback.skillId,
            success: false,
            error: 'Skill non trovata',
          });
          continue;
        }
        
        // Trasforma inputs se necessario
        const fallbackInputs = fallback.inputsTransform 
          ? fallback.inputsTransform(failedStep.inputs)
          : failedStep.inputs;
        
        // Esegui skill di fallback
        const result = await fallbackSkill.execute(fallbackInputs, context);
        
        // Success!
        console.log(`✅ [Fallback] Successo con ${fallback.skillId}`);
        
        attempts.push({
          skillId: fallback.skillId,
          success: true,
        });
        
        return {
          success: true,
          usedSkillId: fallback.skillId,
          attempts,
          metadata: {
            primarySkillId: failedStep.skillId,
            fallbacksAttempted: attempts.length - 1,
            totalLatencyMs: Date.now() - startTime,
          },
        };
        
      } catch (error) {
        console.error(`❌ [Fallback] ${fallback.skillId} fallito:`, error);
        
        attempts.push({
          skillId: fallback.skillId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Tutti i fallback falliti → chiedi all'utente
    console.log(`❌ [Fallback] Tutti i fallback falliti per ${failedStep.skillId}`);
    
    return {
      success: false,
      attempts,
      userPrompt: strategy.userPrompt,
      metadata: {
        primarySkillId: failedStep.skillId,
        fallbacksAttempted: strategy.fallbackChain.length,
        totalLatencyMs: Date.now() - startTime,
      },
    };
  }
  
  /**
   * Genera step di fallback da uno step fallito
   */
  public generateFallbackStep(
    failedStep: OsActionStep,
    fallbackIndex: number = 0
  ): OsActionStep | null {
    const strategy = this.getStrategy(failedStep.skillId);
    
    if (!strategy || fallbackIndex >= strategy.fallbackChain.length) {
      return null;
    }
    
    const fallback = strategy.fallbackChain[fallbackIndex];
    
    // Trasforma inputs
    const fallbackInputs = fallback.inputsTransform
      ? fallback.inputsTransform(failedStep.inputs)
      : failedStep.inputs;
    
    return {
      skillId: fallback.skillId,
      inputs: fallbackInputs,
      idempotent: failedStep.idempotent,
      name: `Fallback: ${fallback.skillId}`,
      description: fallback.reason,
    };
  }
  
  /**
   * Verifica se una skill ha fallback disponibili
   */
  public hasFallback(skillId: string): boolean {
    return this.strategies.has(skillId);
  }
}

