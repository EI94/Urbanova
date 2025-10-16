// 🎯 SKILL: Sensitivity Analysis
// Wrapper per sensitivity analysis del Business Plan

import { z } from 'zod';
import { SkillMeta, SkillExecutionContext } from './SkillCatalog';

// ============================================================================
// TELEMETRY
// ============================================================================

function emitSkillEvent(
  eventName: string,
  skillId: string,
  data: Record<string, unknown>
): void {
  console.log(`📊 [Telemetry] ${eventName}:${skillId}`, data);
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const SensitivityInputSchema = z.object({
  businessPlanId: z.string().min(1, 'Business Plan ID richiesto').optional(),
  projectId: z.string().min(1).optional(),
  projectName: z.string().optional(),
  
  // Base scenario data (se non caricato da businessPlanId)
  baseScenario: z.object({
    averagePrice: z.number().positive(),
    constructionCostPerUnit: z.number().positive(),
    totalUnits: z.number().int().positive(),
    landCost: z.number().positive(),
    discountRate: z.number().min(0).max(100),
  }).optional(),
  
  // Variabili da analizzare
  variable: z.enum(['price', 'cost', 'rate', 'time', 'all']).default('price'),
  range: z.number().min(1).max(50).default(15), // ±15%
  
  // Opzioni
  steps: z.number().int().min(3).max(20).optional().default(11), // Numero di punti da calcolare
});

export type SensitivityInput = z.infer<typeof SensitivityInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'sensitivity.run',
  summary: 'Esegue analisi di sensitivity su variabili chiave del Business Plan',
  visibility: 'global',
  inputsSchema: SensitivityInputSchema.shape,
  preconditions: [], // Può creare sensitivity anche senza BP salvato
  latencyBudgetMs: 3000,
  idempotent: true,
  requiresConfirm: false,
  sideEffects: [],
  telemetryKey: 'bp.sensitivity',
  rbac: ['viewer', 'editor', 'admin'],
  category: 'business_plan',
  tags: ['business-plan', 'sensitivity', 'analysis', 'risk'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface SensitivityResult {
  variable: string;
  range: number;
  baseValue: number;
  breakeven: number; // % dove NPV = 0
  scenarios: Array<{
    delta: number; // -15, -10, -5, 0, 5, 10, 15
    value: number; // Valore variabile
    npv: number;
    irr: number;
    margin: number;
  }>;
  riskAnalysis: {
    probabilityNegativeNPV: number; // % probabilità NPV < 0
    safetyMargin: number; // % buffer prima di NPV < 0
    volatilityImpact: string; // 'low' | 'medium' | 'high'
  };
  recommendations: string[];
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<SensitivityResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione
    const validatedInputs = SensitivityInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      variable: validatedInputs.variable,
      range: validatedInputs.range,
    });
    
    // 2. Carica scenario base
    let baseScenario = validatedInputs.baseScenario;
    
    if (!baseScenario && validatedInputs.businessPlanId) {
      try {
        const { businessPlanService } = await import('@/lib/businessPlanService');
        const bp = await businessPlanService.loadBusinessPlan(validatedInputs.businessPlanId);
        
        // Usa primo scenario come base
        if (bp.outputs && bp.outputs.length > 0) {
          baseScenario = {
            averagePrice: bp.input.averagePrice,
            constructionCostPerUnit: bp.input.constructionCostPerUnit || 
              (bp.input.constructionCostPerSqm || 0) * (bp.input.averageUnitSize || 100),
            totalUnits: bp.input.totalUnits,
            landCost: bp.input.landScenarios[0]?.upfrontPayment || 0,
            discountRate: bp.input.discountRate,
          };
        }
      } catch (error) {
        console.warn('⚠️ [Skill:Sensitivity] Impossibile caricare BP, uso mock');
      }
    }
    
    // Default mock se non disponibile
    if (!baseScenario) {
      baseScenario = {
        averagePrice: 400000,
        constructionCostPerUnit: 200000,
        totalUnits: 4,
        landCost: 220000,
        discountRate: 12,
      };
    }
    
    // 3. Calcola sensitivity
    const { variable, range, steps } = validatedInputs;
    const scenarios = [];
    const step = (range * 2) / (steps - 1);
    
    for (let i = 0; i < steps; i++) {
      const delta = -range + (i * step);
      const multiplier = 1 + (delta / 100);
      
      let modifiedScenario = { ...baseScenario };
      
      // Applica variazione
      if (variable === 'price') {
        modifiedScenario.averagePrice *= multiplier;
      } else if (variable === 'cost') {
        modifiedScenario.constructionCostPerUnit *= multiplier;
      } else if (variable === 'rate') {
        modifiedScenario.discountRate *= multiplier;
      }
      
      // Calcola NPV semplificato
      const revenue = modifiedScenario.averagePrice * modifiedScenario.totalUnits;
      const costs = modifiedScenario.constructionCostPerUnit * modifiedScenario.totalUnits + 
                    modifiedScenario.landCost;
      const grossMargin = revenue - costs;
      
      // NPV semplificato (senza cash flow dettagliato)
      const discountFactor = 1 / Math.pow(1 + modifiedScenario.discountRate / 100, 3);
      const npv = grossMargin * discountFactor;
      const irr = (grossMargin / costs) * 100;
      
      scenarios.push({
        delta: Math.round(delta * 10) / 10,
        value: variable === 'price' ? modifiedScenario.averagePrice :
               variable === 'cost' ? modifiedScenario.constructionCostPerUnit :
               modifiedScenario.discountRate,
        npv,
        irr,
        margin: grossMargin,
      });
    }
    
    // 4. Trova breakeven
    let breakeven = 0;
    for (let i = 0; i < scenarios.length - 1; i++) {
      if (scenarios[i].npv < 0 && scenarios[i + 1].npv >= 0) {
        // Interpolazione lineare
        const x1 = scenarios[i].delta;
        const y1 = scenarios[i].npv;
        const x2 = scenarios[i + 1].delta;
        const y2 = scenarios[i + 1].npv;
        
        breakeven = x1 - (y1 * (x2 - x1)) / (y2 - y1);
        break;
      }
    }
    
    // 5. Risk analysis
    const negativeScenarios = scenarios.filter(s => s.npv < 0);
    const probabilityNegativeNPV = (negativeScenarios.length / scenarios.length) * 100;
    const safetyMargin = Math.abs(breakeven);
    
    let volatilityImpact: 'low' | 'medium' | 'high';
    if (safetyMargin > 20) volatilityImpact = 'low';
    else if (safetyMargin > 10) volatilityImpact = 'medium';
    else volatilityImpact = 'high';
    
    // 6. Recommendations
    const recommendations: string[] = [];
    
    if (safetyMargin > 15) {
      recommendations.push(`Margine di sicurezza BUONO (${safetyMargin.toFixed(1)}%)`);
    } else if (safetyMargin > 8) {
      recommendations.push(`Margine di sicurezza MEDIO (${safetyMargin.toFixed(1)}%)`);
    } else {
      recommendations.push(`⚠️ Margine di sicurezza BASSO (${safetyMargin.toFixed(1)}%)`);
    }
    
    if (probabilityNegativeNPV < 10) {
      recommendations.push('Rischio complessivo: BASSO');
    } else if (probabilityNegativeNPV < 30) {
      recommendations.push('Rischio complessivo: MEDIO');
    } else {
      recommendations.push('⚠️ Rischio complessivo: ALTO');
    }
    
    const result: SensitivityResult = {
      variable,
      range,
      baseValue: variable === 'price' ? baseScenario.averagePrice :
                 variable === 'cost' ? baseScenario.constructionCostPerUnit :
                 baseScenario.discountRate,
      breakeven,
      scenarios,
      riskAnalysis: {
        probabilityNegativeNPV,
        safetyMargin,
        volatilityImpact,
      },
      recommendations,
    };
    
    // Telemetry
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_completed', meta.id, {
      userId: ctx.userId,
      success: true,
      latency,
      variable,
      range,
      breakeven,
      scenarioCount: scenarios.length,
    });
    
    return result;
    
  } catch (error) {
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_failed', meta.id, {
      userId: ctx.userId,
      success: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    
    throw error;
  }
}

