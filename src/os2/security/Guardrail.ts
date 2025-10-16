// 🛡️ GUARDRAIL - Protezione esecuzione con dry-run
// Previene side effects accidentali con preview e rollback

import { OsActionStep } from '../planner/ActionPlan';
import { SkillMeta } from '../skills/SkillCatalog';

/**
 * Side effect pericoloso
 */
export type DangerousSideEffect = 
  | 'write.db'
  | 'email.send'
  | 'order.create'
  | 'payment.process'
  | 'data.delete'
  | 'api.external';

/**
 * Risultato dry-run
 */
export interface DryRunResult {
  safe: boolean;
  sideEffects: DangerousSideEffect[];
  warnings: string[];
  estimatedImpact: {
    recordsAffected?: number;
    emailsToSend?: number;
    costEstimate?: number;
    irreversible?: boolean;
  };
  preview: {
    before?: unknown;
    after?: unknown;
    diff?: unknown;
  };
}

/**
 * Guardrail configuration
 */
export interface GuardrailConfig {
  enableDryRun: boolean;
  allowedSideEffects: DangerousSideEffect[];
  blockDangerous: boolean;
  requirePreviewFor: DangerousSideEffect[];
}

/**
 * Default configuration (strict)
 */
const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  enableDryRun: true,
  allowedSideEffects: [], // Nessun side effect allowed di default
  blockDangerous: true,
  requirePreviewFor: ['write.db', 'email.send', 'order.create', 'payment.process', 'data.delete'],
};

/**
 * Guardrail Engine
 */
export class GuardrailEngine {
  private config: GuardrailConfig;
  
  constructor(config: Partial<GuardrailConfig> = {}) {
    this.config = { ...DEFAULT_GUARDRAIL_CONFIG, ...config };
    console.log('🛡️ [Guardrail] Inizializzato con config:', this.config);
  }
  
  /**
   * Analizza step e determina se è safe
   */
  public async analyzeSafety(
    step: OsActionStep,
    skillMeta?: SkillMeta
  ): Promise<DryRunResult> {
    const sideEffects = this.extractSideEffects(step, skillMeta);
    const warnings: string[] = [];
    
    // Check side effects pericolosi
    const dangerousSideEffects = sideEffects.filter(se => 
      this.isDangerousSideEffect(se)
    );
    
    // Generate warnings
    if (dangerousSideEffects.includes('email.send')) {
      warnings.push('⚠️ Questa azione invierà email esterne');
    }
    
    if (dangerousSideEffects.includes('write.db')) {
      warnings.push('⚠️ Questa azione modificherà il database');
    }
    
    if (dangerousSideEffects.includes('order.create')) {
      warnings.push('⚠️ Questa azione creerà un ordine');
    }
    
    if (dangerousSideEffects.includes('payment.process')) {
      warnings.push('⚠️ Questa azione processerà un pagamento');
    }
    
    if (dangerousSideEffects.includes('data.delete')) {
      warnings.push('⚠️ Questa azione eliminerà dati (irreversibile)');
    }
    
    // Estimate impact
    const estimatedImpact = this.estimateImpact(step, sideEffects);
    
    // Generate preview (dry-run simulation)
    const preview = await this.generatePreview(step, skillMeta);
    
    // Safe se:
    // 1. Nessun side effect pericoloso
    // 2. O tutti i side effects sono allowed
    const safe = dangerousSideEffects.length === 0 || 
      dangerousSideEffects.every(se => this.config.allowedSideEffects.includes(se));
    
    return {
      safe,
      sideEffects: dangerousSideEffects,
      warnings,
      estimatedImpact,
      preview,
    };
  }
  
  /**
   * Esegue dry-run di uno step
   */
  public async dryRun(
    step: OsActionStep,
    skillMeta?: SkillMeta
  ): Promise<DryRunResult> {
    console.log(`🧪 [Guardrail] Dry-run per ${step.skillId}...`);
    
    const result = await this.analyzeSafety(step, skillMeta);
    
    // Log result
    console.log(`🧪 [Guardrail] Dry-run completato:`, {
      safe: result.safe,
      sideEffects: result.sideEffects.length,
      warnings: result.warnings.length,
    });
    
    return result;
  }
  
  /**
   * Estrae side effects da step e skill meta
   */
  private extractSideEffects(
    step: OsActionStep,
    skillMeta?: SkillMeta
  ): DangerousSideEffect[] {
    const effects: DangerousSideEffect[] = [];
    
    // Da skill meta
    if (skillMeta?.sideEffects) {
      skillMeta.sideEffects.forEach(se => {
        if (this.isDangerousSideEffect(se as any)) {
          effects.push(se as DangerousSideEffect);
        }
      });
    }
    
    // Da step inputs (euristica)
    const inputs = step.inputs as any;
    
    if (inputs?.to || inputs?.email || inputs?.recipients) {
      if (!effects.includes('email.send')) {
        effects.push('email.send');
      }
    }
    
    if (inputs?.orderId || inputs?.createOrder) {
      if (!effects.includes('order.create')) {
        effects.push('order.create');
      }
    }
    
    if (inputs?.amount || inputs?.payment) {
      if (!effects.includes('payment.process')) {
        effects.push('payment.process');
      }
    }
    
    return effects;
  }
  
  /**
   * Check se side effect è pericoloso
   */
  private isDangerousSideEffect(effect: string): effect is DangerousSideEffect {
    const dangerous: DangerousSideEffect[] = [
      'write.db',
      'email.send',
      'order.create',
      'payment.process',
      'data.delete',
      'api.external',
    ];
    
    return dangerous.includes(effect as DangerousSideEffect);
  }
  
  /**
   * Stima impatto di uno step
   */
  private estimateImpact(
    step: OsActionStep,
    sideEffects: DangerousSideEffect[]
  ): DryRunResult['estimatedImpact'] {
    const impact: DryRunResult['estimatedImpact'] = {};
    
    const inputs = step.inputs as any;
    
    // Email count
    if (sideEffects.includes('email.send')) {
      const recipients = inputs?.vendors?.length || 
        inputs?.recipients?.length || 
        (inputs?.to ? 1 : 0);
      
      impact.emailsToSend = recipients;
    }
    
    // DB writes
    if (sideEffects.includes('write.db')) {
      impact.recordsAffected = 1; // Default: 1 record
    }
    
    // Irreversible operations
    if (sideEffects.includes('data.delete') || sideEffects.includes('payment.process')) {
      impact.irreversible = true;
    }
    
    // Cost estimate (payment)
    if (sideEffects.includes('payment.process')) {
      impact.costEstimate = inputs?.amount || 0;
    }
    
    return impact;
  }
  
  /**
   * Genera preview before/after (simulato)
   */
  private async generatePreview(
    step: OsActionStep,
    skillMeta?: SkillMeta
  ): Promise<DryRunResult['preview']> {
    // In produzione, questo farebbe una query per mostrare stato before/after
    // Per ora, ritorna preview mock
    
    return {
      before: {
        message: 'Stato attuale del sistema',
      },
      after: {
        message: `Stato dopo esecuzione di ${step.skillId}`,
        changes: step.inputs,
      },
      diff: {
        added: Object.keys(step.inputs || {}),
        modified: [],
        deleted: [],
      },
    };
  }
  
  /**
   * Valida se step può essere eseguito
   */
  public canExecute(
    step: OsActionStep,
    skillMeta?: SkillMeta
  ): { allowed: boolean; reason?: string; dryRun?: DryRunResult } {
    const sideEffects = this.extractSideEffects(step, skillMeta);
    const dangerousSideEffects = sideEffects.filter(se => this.isDangerousSideEffect(se));
    
    // Block se ha side effects pericolosi e blockDangerous=true
    if (this.config.blockDangerous && dangerousSideEffects.length > 0) {
      const notAllowed = dangerousSideEffects.filter(se => 
        !this.config.allowedSideEffects.includes(se)
      );
      
      if (notAllowed.length > 0) {
        return {
          allowed: false,
          reason: `Side effects pericolosi non autorizzati: ${notAllowed.join(', ')}`,
        };
      }
    }
    
    return { allowed: true };
  }
}

/**
 * Singleton Guardrail
 */
let guardrailInstance: GuardrailEngine;

export function getGuardrail(config?: Partial<GuardrailConfig>): GuardrailEngine {
  if (!guardrailInstance) {
    guardrailInstance = new GuardrailEngine(config);
  }
  return guardrailInstance;
}

