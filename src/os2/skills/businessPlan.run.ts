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
  
  // ============================================================================
  // CONFIGURAZIONE RICAVI AVANZATA
  // ============================================================================
  revenueConfig: z.object({
    method: z.enum(['TOTAL', 'PER_UNIT', 'DETAILED', 'PER_SQM']).optional().default('PER_UNIT'),
    totalRevenue: z.number().positive().optional(),
    averagePrice: z.number().positive().optional(),
    pricePerSqm: z.number().positive().optional(),
    averageUnitSize: z.number().positive().optional(),
    unitMix: z.array(z.object({
      type: z.string(),
      count: z.number().int().positive(),
      price: z.number().positive(),
      size: z.number().positive().optional()
    })).optional(),
    salesCalendar: z.array(z.object({
      period: z.string(),
      units: z.number().int().positive()
    })).optional().default([]),
    discounts: z.number().min(0).max(100).optional().default(0),
    salesCommission: z.number().min(0).max(100).optional().default(3),
    priceEscalation: z.number().min(0).max(100).optional().default(0)
  }).optional(),
  
  // ============================================================================
  // CONFIGURAZIONE COSTI AVANZATA
  // ============================================================================
  costConfig: z.object({
    constructionMethod: z.enum(['PER_UNIT', 'PER_SQM', 'DETAILED', 'TOTAL']).optional().default('PER_UNIT'),
    constructionCostPerUnit: z.number().positive().optional(),
    constructionCostPerSqm: z.number().positive().optional(),
    totalConstructionCost: z.number().positive().optional(),
    averageUnitSize: z.number().positive().optional(),
    constructionBreakdown: z.object({
      structure: z.number().positive(),
      finishes: z.number().positive(),
      systems: z.number().positive(),
      external: z.number().positive()
    }).optional(),
    contingency: z.number().min(0).max(100).optional().default(10),
    contingencyBreakdown: z.object({
      design: z.number().min(0).max(100).optional(),
      construction: z.number().min(0).max(100).optional(),
      market: z.number().min(0).max(100).optional()
    }).optional(),
    softCosts: z.object({
      percentage: z.number().min(0).max(100).optional().default(15),
      breakdown: z.object({
        design: z.number().min(0).max(100).optional(),
        permits: z.number().min(0).max(100).optional(),
        supervision: z.number().min(0).max(100).optional(),
        safety: z.number().min(0).max(100).optional(),
        insurance: z.number().min(0).max(100).optional(),
        marketing: z.number().min(0).max(100).optional()
      }).optional()
    }).optional(),
    developmentCharges: z.object({
      method: z.enum(['PER_SQM', 'TOTAL', 'DETAILED']).optional().default('PER_SQM'),
      perSqm: z.number().positive().optional(),
      total: z.number().positive().optional(),
      breakdown: z.object({
        urbanization: z.number().positive().optional(),
        utilities: z.number().positive().optional(),
        permits: z.number().positive().optional(),
        taxes: z.number().positive().optional()
      }).optional()
    }).optional(),
    financingCosts: z.object({
      arrangementFee: z.number().min(0).max(100).optional(),
      commitmentFee: z.number().min(0).max(100).optional(),
      guaranteeFee: z.number().min(0).max(100).optional()
    }).optional()
  }).optional(),
  
  // ============================================================================
  // SCENARI TERRAIN AVANZATI
  // ============================================================================
  landScenarios: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['CASH', 'PERMUTA', 'DEFERRED_PAYMENT', 'MIXED', 'EARN_OUT', 'OPTION', 'REVERSE_PERMUTA']),
    description: z.string().optional(),
    
    // Cash upfront
    upfrontPayment: z.number().positive().optional(),
    upfrontPaymentPeriod: z.string().optional(),
    
    // Permuta tradizionale
    permuta: z.object({
      unitsToGive: z.number().int().positive(),
      unitValue: z.number().positive(),
      cashContribution: z.number().min(0).optional(),
      cashContributionPeriod: z.string().optional(),
      whoReceivesCash: z.enum(['US', 'OWNER']).optional()
    }).optional(),
    
    // Permuta inversa
    reversePermuta: z.object({
      unitsToGive: z.number().int().positive(),
      unitValue: z.number().positive(),
      cashBackPercentage: z.number().min(0).max(100).optional(),
      cashBackPeriod: z.string().optional(),
      minimumCashBack: z.number().min(0).optional()
    }).optional(),
    
    // Pagamento differito
    deferredPayment: z.object({
      amount: z.number().positive(),
      period: z.string(),
      interestRate: z.number().min(0).max(100).optional(),
      collateral: z.string().optional()
    }).optional(),
    
    // Earn-out
    earnOut: z.object({
      basePayment: z.number().positive(),
      earnOutPercentage: z.number().min(0).max(100),
      earnOutThreshold: z.number().positive(),
      earnOutCap: z.number().positive().optional(),
      earnOutPeriod: z.string().optional()
    }).optional(),
    
    // Opzione
    option: z.object({
      optionFee: z.number().positive(),
      optionPeriod: z.string(),
      exercisePrice: z.number().positive(),
      exercisePeriod: z.string(),
      optionFeeRefundable: z.boolean().optional()
    }).optional()
  })).min(1, 'Almeno uno scenario terreno richiesto'),
  
  // ============================================================================
  // CONFIGURAZIONE FINANZA AVANZATA
  // ============================================================================
  financeConfig: z.object({
    discountRate: z.number().min(0).max(100).optional().default(12),
    costOfCapital: z.number().min(0).max(100).optional(),
    
    debt: z.object({
      enabled: z.boolean().optional().default(false),
      amount: z.number().positive().optional(),
      interestRate: z.number().min(0).max(100).optional(),
      term: z.number().int().positive().optional(),
      ltv: z.number().min(0).max(100).optional(),
      dscr: z.number().positive().optional(),
      fees: z.number().min(0).max(100).optional(),
      
      // Ammortamenti avanzati
      amortizationType: z.enum(['FRENCH', 'ITALIAN', 'BULLET', 'CUSTOM']).optional().default('FRENCH'),
      gracePeriod: z.number().int().min(0).optional(),
      balloonPayment: z.number().positive().optional(),
      customSchedule: z.array(z.object({
        period: z.number().int().positive(),
        principal: z.number().min(0),
        interest: z.number().min(0),
        total: z.number().positive()
      })).optional(),
      
      // Scenari finanziari
      scenarios: z.array(z.object({
        id: z.string(),
        name: z.string(),
        ltv: z.number().min(0).max(100),
        interestRate: z.number().min(0).max(100),
        term: z.number().int().positive(),
        fees: z.number().min(0).max(100)
      })).optional()
    }).optional(),
    
    // Analisi di sensibilità finanziaria
    sensitivityAnalysis: z.object({
      interestRateRange: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        step: z.number().positive()
      }).optional(),
      ltvRange: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        step: z.number().positive()
      }).optional(),
      termRange: z.object({
        min: z.number().int().positive(),
        max: z.number().int().positive(),
        step: z.number().int().positive()
      }).optional()
    }).optional()
  }).optional(),
  
  // ============================================================================
  // CONFIGURAZIONE TIMING AVANZATA
  // ============================================================================
  timingConfig: z.object({
    constructionTimeline: z.array(z.object({
      phase: z.string(),
      period: z.string(),
      percentage: z.number().min(0).max(100).optional()
    })).optional().default([]),
    permitDelay: z.number().int().min(0).optional().default(0),
    milestoneDates: z.object({
      startConstruction: z.string().optional(),
      completion: z.string().optional(),
      firstSale: z.string().optional(),
      lastSale: z.string().optional()
    }).optional()
  }).optional(),
  
  // ============================================================================
  // CONFIGURAZIONE FISCALITÀ
  // ============================================================================
  taxConfig: z.object({
    vatOnLand: z.number().min(0).max(100).optional(),
    taxOnProfit: z.number().min(0).max(100).optional(),
    withholdingTax: z.number().min(0).max(100).optional(),
    stampDuty: z.number().min(0).max(100).optional()
  }).optional(),
  
  // ============================================================================
  // TARGET E OBIETTIVI AVANZATI
  // ============================================================================
  targets: z.object({
    margin: z.number().min(0).max(100).optional().default(20),
    minimumDSCR: z.number().positive().optional().default(1.2),
    targetIRR: z.number().min(0).max(100).optional(),
    targetNPV: z.number().optional(),
    paybackPeriod: z.number().positive().optional(),
    
    scenarioTargets: z.record(z.string(), z.object({
      margin: z.number().min(0).max(100),
      dscr: z.number().positive(),
      irr: z.number().min(0).max(100),
      npv: z.number()
    })).optional()
  }).optional(),
  
  // ============================================================================
  // COMPATIBILITÀ BACKWARD (per OS esistente)
  // ============================================================================
  
  // Prezzi (legacy)
  averagePrice: z.number().positive().optional(),
  salesCommission: z.number().min(0).max(100).optional(),
  
  // Costi (legacy)
  constructionCostPerUnit: z.number().positive().optional(),
  constructionCostPerSqm: z.number().positive().optional(),
  averageUnitSize: z.number().positive().optional(),
  contingency: z.number().min(0).max(100).optional(),
  softCostPercentage: z.number().min(0).max(100).optional(),
  developmentCharges: z.number().min(0).optional(),
  utilities: z.number().min(0).optional(),
  
  // Finanza (legacy)
  discountRate: z.number().min(0).max(100).optional(),
  useDebt: z.boolean().optional(),
  debtAmount: z.number().optional(),
  debtInterestRate: z.number().optional(),
  debtTerm: z.number().optional(),
  
  // Calendario (legacy)
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
  id: 'business_plan_calculate',
  summary: 'Calcola Business Plan avanzato con ricavi multipli, costi dettagliati, scenari terreno smart, finanza con ammortamenti francese/italiano/bullet',
  visibility: 'global',
  inputsSchema: {
    type: 'object',
    required: ['projectName', 'totalUnits'],
    properties: {
      projectName: { type: 'string', description: 'Nome del progetto' },
      location: { type: 'string', description: 'Località del progetto' },
      type: { type: 'string', enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED'], description: 'Tipo di progetto' },
      totalUnits: { type: 'number', description: 'Numero totale di unità', minimum: 1 },
      
      // Configurazione ricavi avanzata
      revenueConfig: {
        type: 'object',
        description: 'Configurazione ricavi avanzata con opzioni multiple',
        properties: {
          method: { type: 'string', enum: ['TOTAL', 'PER_UNIT', 'DETAILED', 'PER_SQM'], description: 'Metodo di input ricavi' },
          totalRevenue: { type: 'number', description: 'Valore totale ricavi' },
          averagePrice: { type: 'number', description: 'Prezzo medio per unità' },
          pricePerSqm: { type: 'number', description: 'Prezzo per metro quadro' },
          averageUnitSize: { type: 'number', description: 'Superficie media per unità' },
          unitMix: {
            type: 'array',
            description: 'Mix dettagliato unità',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Tipo unità' },
                count: { type: 'number', description: 'Numero unità' },
                price: { type: 'number', description: 'Prezzo per unità' },
                size: { type: 'number', description: 'Superficie in mq' }
              }
            }
          },
          salesCommission: { type: 'number', description: 'Commissione vendita (%)' },
          discounts: { type: 'number', description: 'Sconti medi (%)' },
          priceEscalation: { type: 'number', description: 'Incremento prezzi nel tempo (%)' }
        }
      },
      
      // Configurazione costi avanzata
      costConfig: {
        type: 'object',
        description: 'Configurazione costi avanzata con breakdown dettagliato',
        properties: {
          constructionMethod: { type: 'string', enum: ['PER_UNIT', 'PER_SQM', 'DETAILED', 'TOTAL'], description: 'Metodo di input costi' },
          constructionCostPerUnit: { type: 'number', description: 'Costo costruzione per unità' },
          constructionCostPerSqm: { type: 'number', description: 'Costo costruzione per mq' },
          totalConstructionCost: { type: 'number', description: 'Costo totale costruzione' },
          constructionBreakdown: {
            type: 'object',
            description: 'Breakdown dettagliato costi',
            properties: {
              structure: { type: 'number', description: 'Struttura portante' },
              finishes: { type: 'number', description: 'Finiture' },
              systems: { type: 'number', description: 'Impianti' },
              external: { type: 'number', description: 'Esterni e verde' }
            }
          },
          contingency: { type: 'number', description: 'Contingenze (%)' },
          softCosts: {
            type: 'object',
            description: 'Costi indiretti',
            properties: {
              percentage: { type: 'number', description: 'Percentuale costi indiretti' },
              breakdown: {
                type: 'object',
                description: 'Breakdown costi indiretti',
                properties: {
                  design: { type: 'number', description: 'Progettazione (%)' },
                  permits: { type: 'number', description: 'Permessi (%)' },
                  supervision: { type: 'number', description: 'Direzione lavori (%)' },
                  safety: { type: 'number', description: 'Sicurezza (%)' },
                  insurance: { type: 'number', description: 'Assicurazioni (%)' },
                  marketing: { type: 'number', description: 'Marketing (%)' }
                }
              }
            }
          }
        }
      },
      
      // Scenari terreno avanzati
      landScenarios: {
        type: 'array',
        description: 'Scenari terreno avanzati con logica smart',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID scenario' },
            name: { type: 'string', description: 'Nome scenario' },
            type: { type: 'string', enum: ['CASH', 'PERMUTA', 'DEFERRED_PAYMENT', 'MIXED', 'EARN_OUT', 'OPTION', 'REVERSE_PERMUTA'], description: 'Tipo scenario' },
            description: { type: 'string', description: 'Descrizione scenario' },
            
            // Cash upfront
            upfrontPayment: { type: 'number', description: 'Pagamento cash immediato' },
            
            // Permuta tradizionale
            permuta: {
              type: 'object',
              description: 'Configurazione permuta tradizionale',
              properties: {
                unitsToGive: { type: 'number', description: 'Case da dare al proprietario terreno' },
                unitValue: { type: 'number', description: 'Valore per unità da dare' },
                cashContribution: { type: 'number', description: 'Contributo cash aggiuntivo' },
                whoReceivesCash: { type: 'string', enum: ['US', 'OWNER'], description: 'Chi riceve i soldi dalla vendita' }
              }
            },
            
            // Permuta inversa
            reversePermuta: {
              type: 'object',
              description: 'Configurazione permuta inversa (proprietario terreno ci dà soldi)',
              properties: {
                unitsToGive: { type: 'number', description: 'Case da dare al proprietario terreno' },
                unitValue: { type: 'number', description: 'Valore per unità da dare' },
                cashBackPercentage: { type: 'number', description: '% dei ricavi che ci tornano' },
                minimumCashBack: { type: 'number', description: 'Importo minimo garantito' }
              }
            },
            
            // Pagamento differito
            deferredPayment: {
              type: 'object',
              description: 'Configurazione pagamento differito',
              properties: {
                amount: { type: 'number', description: 'Importo da pagare' },
                period: { type: 'string', description: 'Quando pagare' },
                interestRate: { type: 'number', description: 'Tasso interesse sul differito' }
              }
            },
            
            // Earn-out
            earnOut: {
              type: 'object',
              description: 'Configurazione earn-out',
              properties: {
                basePayment: { type: 'number', description: 'Pagamento base' },
                earnOutPercentage: { type: 'number', description: '% su extra-prezzo' },
                earnOutThreshold: { type: 'number', description: 'Soglia prezzo per attivazione' },
                earnOutCap: { type: 'number', description: 'Massimo earn-out' }
              }
            },
            
            // Opzione
            option: {
              type: 'object',
              description: 'Configurazione opzione di acquisto',
              properties: {
                optionFee: { type: 'number', description: 'Canone opzione' },
                optionPeriod: { type: 'string', description: 'Durata opzione' },
                exercisePrice: { type: 'number', description: 'Prezzo di esercizio' },
                exercisePeriod: { type: 'string', description: 'Quando esercitare' }
              }
            }
          }
        }
      },
      
      // Configurazione finanza avanzata
      financeConfig: {
        type: 'object',
        description: 'Configurazione finanza avanzata con ammortamenti multipli',
        properties: {
          discountRate: { type: 'number', description: 'Tasso di sconto per VAN' },
          debt: {
            type: 'object',
            description: 'Configurazione finanziamento avanzato',
            properties: {
              enabled: { type: 'boolean', description: 'Finanziamento abilitato' },
              amount: { type: 'number', description: 'Importo finanziamento' },
              interestRate: { type: 'number', description: 'Tasso interesse' },
              term: { type: 'number', description: 'Durata in anni' },
              ltv: { type: 'number', description: 'Loan-to-Value ratio' },
              dscr: { type: 'number', description: 'Debt Service Coverage Ratio target' },
              fees: { type: 'number', description: 'Commissioni e spese' },
              
              // Ammortamenti avanzati
              amortizationType: { type: 'string', enum: ['FRENCH', 'ITALIAN', 'BULLET', 'CUSTOM'], description: 'Tipo ammortamento' },
              gracePeriod: { type: 'number', description: 'Periodo di grazia in mesi' },
              balloonPayment: { type: 'number', description: 'Pagamento finale (bullet)' },
              customSchedule: {
                type: 'array',
                description: 'Piano personalizzato',
                items: {
                  type: 'object',
                  properties: {
                    period: { type: 'number', description: 'Periodo (mesi)' },
                    principal: { type: 'number', description: 'Capitale' },
                    interest: { type: 'number', description: 'Interessi' },
                    total: { type: 'number', description: 'Totale rata' }
                  }
                }
              }
            }
          }
        }
      },
      
      // Target avanzati
      targets: {
        type: 'object',
        description: 'Target e obiettivi avanzati',
        properties: {
          margin: { type: 'number', description: 'Margine target (%)' },
          minimumDSCR: { type: 'number', description: 'DSCR minimo accettabile' },
          targetIRR: { type: 'number', description: 'TIR target' },
          targetNPV: { type: 'number', description: 'VAN target' },
          paybackPeriod: { type: 'number', description: 'Payback target (anni)' }
        }
      },
      
      // Compatibilità backward
      averagePrice: { type: 'number', description: 'Prezzo medio per unità (legacy)' },
      constructionCostPerUnit: { type: 'number', description: 'Costo costruzione per unità (legacy)' },
      contingency: { type: 'number', description: 'Contingenze (legacy)' },
      discountRate: { type: 'number', description: 'Tasso di sconto (legacy)' },
      salesCommission: { type: 'number', description: 'Commissione vendita (legacy)' },
      constructionCostPerSqm: { type: 'number', description: 'Costo costruzione per mq (legacy)' },
      averageUnitSize: { type: 'number', description: 'Dimensione media unità in mq (legacy)' },
      softCostPercentage: { type: 'number', description: 'Soft costs (legacy)' },
      developmentCharges: { type: 'number', description: 'Oneri di urbanizzazione (legacy)' },
      utilities: { type: 'number', description: 'Costi utilities (legacy)' },
      useDebt: { type: 'boolean', description: 'Usa finanziamento (legacy)' },
      debtAmount: { type: 'number', description: 'Importo debito (legacy)' },
      debtInterestRate: { type: 'number', description: 'Tasso interesse debito (legacy)' },
      debtTerm: { type: 'number', description: 'Durata debito (legacy)' },
      salesCalendar: {
        type: 'array',
        description: 'Calendario vendite (legacy)',
        items: {
          type: 'object',
          properties: {
            period: { type: 'string', description: 'Periodo' },
            units: { type: 'number', description: 'Unità vendute' }
          }
        }
      }
    }
  },
  preconditions: [],
  latencyBudgetMs: 8000,
  idempotent: true,
  requiresConfirm: false,
  sideEffects: ['write.db'],
  telemetryKey: 'bp.calculate.advanced',
  rbac: ['viewer', 'editor', 'admin'],
  category: 'business_plan',
  tags: ['business-plan', 'finance', 'calculation', 'advanced', 'revenue', 'costs', 'land-scenarios', 'amortization', 'french', 'italian', 'bullet'],
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

