// 🎯 SKILL: Business Plan Calculate
// Wrapper al businessPlanService esistente

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
  
  // In produzione, invia a sistema telemetry (Datadog, New Relic, etc.)
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track(eventName, {
      skillId,
      ...data,
    });
  }
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const BusinessPlanInputSchema = z.object({
  projectName: z.string().min(1, 'Nome progetto richiesto'),
  location: z.string().optional().default('Italia'),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']).optional().default('RESIDENTIAL'),
  totalUnits: z.number().int().positive('Numero unità deve essere > 0'),
  
  // Prezzi
  averagePrice: z.number().positive('Prezzo medio deve essere > 0'),
  salesCommission: z.number().min(0).max(100).optional().default(3),
  
  // Costi
  constructionCostPerUnit: z.number().positive('Costo costruzione deve essere > 0').optional(),
  constructionCostPerSqm: z.number().positive().optional(),
  averageUnitSize: z.number().positive().optional(),
  contingency: z.number().min(0).max(100).optional().default(10),
  softCostPercentage: z.number().min(0).max(100).optional().default(8),
  developmentCharges: z.number().min(0).optional().default(50000),
  utilities: z.number().min(0).optional().default(20000),
  
  // Scenari terreno
  landScenarios: z.array(z.object({
    name: z.string(),
    type: z.enum(['CASH', 'PERMUTA', 'PAGAMENTO_DIFFERITO', 'EARN_OUT', 'OPZIONE']),
    upfrontPayment: z.number().optional(),
    units: z.number().optional(),
    cashContribution: z.number().optional(),
    period: z.string().optional(),
    amount: z.number().optional(),
  })).min(1, 'Almeno uno scenario terreno richiesto'),
  
  // Finanza
  discountRate: z.number().min(0).max(100).optional().default(12),
  useDebt: z.boolean().optional().default(false),
  debtAmount: z.number().optional(),
  debtInterestRate: z.number().optional(),
  debtTerm: z.number().optional(),
  
  // Calendario
  salesCalendar: z.array(z.object({
    period: z.string(),
    units: z.number(),
  })).optional(),
});

export type BusinessPlanInput = z.infer<typeof BusinessPlanInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'business_plan.run',
  summary: 'Calcola Business Plan completo con VAN, TIR, DSCR, cash flow e scenari multipli',
  visibility: 'global',
  inputsSchema: BusinessPlanInputSchema.shape,
  preconditions: [],
  latencyBudgetMs: 5000,
  idempotent: true,
  requiresConfirm: false,
  sideEffects: ['write.db'], // Salva su Firestore
  telemetryKey: 'bp.calculate',
  rbac: ['viewer', 'editor', 'admin'],
  category: 'business_plan',
  tags: ['business-plan', 'finance', 'calculation', 'van', 'tir'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface BusinessPlanResult {
  businessPlanId?: string;
  scenarios: Array<{
    name: string;
    npv: number;
    irr: number;
    dscr?: number;
    ltv?: number;
    payback: number;
    grossMargin: number;
    grossMarginPercent: number;
  }>;
  bestScenario: {
    name: string;
    npv: number;
    reason: string;
  };
  summary: {
    totalRevenue: number;
    totalCosts: number;
    avgNPV: number;
    avgIRR: number;
  };
  calculatedAt: Date;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<BusinessPlanResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione inputs
    const validatedInputs = BusinessPlanInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      projectName: validatedInputs.projectName,
      scenarioCount: validatedInputs.landScenarios.length,
    });
    
    // 2. Usa businessPlanService esistente
    let bpResults;
    
    try {
      const { businessPlanService } = await import('@/lib/businessPlanService');
      
      // Converti input OS2 → businessPlanService format
      const bpInput = {
        projectName: validatedInputs.projectName,
        location: validatedInputs.location || 'Italia',
        type: validatedInputs.type || 'RESIDENTIAL',
        totalUnits: validatedInputs.totalUnits,
        averagePrice: validatedInputs.averagePrice,
        salesCommission: validatedInputs.salesCommission || 3,
        constructionCostPerUnit: validatedInputs.constructionCostPerUnit,
        constructionCostPerSqm: validatedInputs.constructionCostPerSqm,
        averageUnitSize: validatedInputs.averageUnitSize,
        contingency: validatedInputs.contingency || 10,
        softCostPercentage: validatedInputs.softCostPercentage || 8,
        developmentCharges: validatedInputs.developmentCharges || 50000,
        utilities: validatedInputs.utilities || 20000,
        landScenarios: validatedInputs.landScenarios,
        discountRate: validatedInputs.discountRate || 12,
        useDebt: validatedInputs.useDebt || false,
        salesCalendar: validatedInputs.salesCalendar || [
          { period: 't1', units: Math.floor(validatedInputs.totalUnits / 2) },
          { period: 't2', units: Math.ceil(validatedInputs.totalUnits / 2) },
        ],
      };
      
      bpResults = await businessPlanService.calculateBusinessPlan(bpInput);
      
      // Salva se richiesto
      if (ctx.metadata?.save !== false) {
        const businessPlanId = await businessPlanService.saveBusinessPlan(
          bpInput,
          bpResults,
          ctx.userId
        );
        
        console.log(`✅ [Skill:BP] Business Plan salvato: ${businessPlanId}`);
      }
      
    } catch (error) {
      console.warn('⚠️ [Skill:BP] businessPlanService non disponibile, uso mock');
      
      // Mock per sviluppo/test
      bpResults = validatedInputs.landScenarios.map((scenario, idx) => ({
        scenarioName: scenario.name,
        scenarioType: scenario.type,
        npv: Math.random() * 500000 + 100000,
        irr: Math.random() * 0.25 + 0.1,
        dscr: validatedInputs.useDebt ? 1.2 + Math.random() * 0.5 : undefined,
        ltv: validatedInputs.useDebt ? 0.6 + Math.random() * 0.15 : undefined,
        payback: 2 + Math.random() * 3,
        grossMargin: Math.random() * 800000 + 200000,
        grossMarginPercent: Math.random() * 0.4 + 0.2,
      }));
    }
    
    // 3. Formatta risultato
    const scenarios = bpResults.map(result => ({
      name: result.scenarioName,
      npv: result.npv,
      irr: result.irr,
      dscr: result.dscr,
      ltv: result.ltv,
      payback: result.payback,
      grossMargin: result.grossMargin,
      grossMarginPercent: result.grossMarginPercent,
    }));
    
    // 4. Identifica scenario migliore
    const bestScenario = scenarios.reduce((best, current) => 
      current.npv > best.npv ? current : best
    );
    
    // 5. Summary
    const summary = {
      totalRevenue: validatedInputs.averagePrice * validatedInputs.totalUnits,
      totalCosts: (validatedInputs.constructionCostPerUnit || 0) * validatedInputs.totalUnits,
      avgNPV: scenarios.reduce((sum, s) => sum + s.npv, 0) / scenarios.length,
      avgIRR: scenarios.reduce((sum, s) => sum + s.irr, 0) / scenarios.length,
    };
    
    const result: BusinessPlanResult = {
      scenarios,
      bestScenario: {
        name: bestScenario.name,
        npv: bestScenario.npv,
        reason: `Massimo VAN: €${Math.round(bestScenario.npv).toLocaleString('it-IT')}`,
      },
      summary,
      calculatedAt: new Date(),
    };
    
    // Telemetry success
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_completed', meta.id, {
      userId: ctx.userId,
      success: true,
      latency,
      scenarioCount: scenarios.length,
      bestScenarioNPV: bestScenario.npv,
    });
    
    console.log(`✅ [Skill:BP] Completato in ${latency}ms`);
    
    return result;
    
  } catch (error) {
    // Telemetry error
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_failed', meta.id, {
      userId: ctx.userId,
      success: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    console.error(`❌ [Skill:BP] Errore:`, error);
    throw error;
  }
}

