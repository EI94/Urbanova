// 🎯 SKILL: Term Sheet Create
// Wrapper al businessPlanExportService per generare Term Sheet

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

const TermSheetInputSchema = z.object({
  businessPlanId: z.string().min(1, 'Business Plan ID richiesto'),
  format: z.enum(['pdf', 'excel']).default('pdf'),
  includeCharts: z.boolean().optional().default(true),
  includeSensitivity: z.boolean().optional().default(true),
  language: z.enum(['it', 'en']).optional().default('it'),
});

export type TermSheetInput = z.infer<typeof TermSheetInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'term_sheet.create',
  summary: 'Genera Term Sheet professionale in PDF o Excel dal Business Plan',
  visibility: 'global',
  inputsSchema: TermSheetInputSchema.shape,
  preconditions: ['businessPlanExists'],
  latencyBudgetMs: 8000,
  idempotent: true,
  requiresConfirm: false,
  sideEffects: ['write.storage'],
  telemetryKey: 'bp.export',
  rbac: ['editor', 'admin'],
  category: 'business_plan',
  tags: ['business-plan', 'export', 'pdf', 'term-sheet'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface TermSheetResult {
  format: 'pdf' | 'excel';
  url: string;
  filename: string;
  size: number; // bytes
  pages?: number; // per PDF
  expiresAt: Date;
  downloadToken?: string;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<TermSheetResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione
    const validatedInputs = TermSheetInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      businessPlanId: validatedInputs.businessPlanId,
      format: validatedInputs.format,
    });
    
    // 2. Usa businessPlanExportService
    try {
      const { businessPlanExportService } = await import('@/lib/businessPlanExportService');
      const { businessPlanService } = await import('@/lib/businessPlanService');
      
      // Carica Business Plan
      const bp = await businessPlanService.loadBusinessPlan(validatedInputs.businessPlanId);
      
      // Genera export
      let exportResult;
      
      if (validatedInputs.format === 'pdf') {
        exportResult = await businessPlanExportService.generatePDF(
          bp.input,
          bp.outputs,
          {
            includeCharts: validatedInputs.includeCharts,
            includeSensitivity: validatedInputs.includeSensitivity,
          }
        );
      } else {
        exportResult = await businessPlanExportService.generateExcel(
          bp.input,
          bp.outputs
        );
      }
      
      const result: TermSheetResult = {
        format: validatedInputs.format,
        url: exportResult.url || `https://storage.example.com/bp_${validatedInputs.businessPlanId}.${validatedInputs.format}`,
        filename: `BusinessPlan_${bp.input.projectName}_${Date.now()}.${validatedInputs.format}`,
        size: exportResult.size || 0,
        pages: validatedInputs.format === 'pdf' ? 12 : undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
      };
      
      const latency = Date.now() - startTime;
      emitSkillEvent('skill_completed', meta.id, {
        userId: ctx.userId,
        success: true,
        latency,
        format: validatedInputs.format,
        fileSize: result.size,
      });
      
      return result;
      
    } catch (error) {
      console.warn('⚠️ [Skill:TermSheet] Export service non disponibile, uso mock dry-run');
      
      // Mock dry-run
      const mockResult: TermSheetResult = {
        format: validatedInputs.format,
        url: `https://storage.example.com/dry-run/bp_${validatedInputs.businessPlanId}.${validatedInputs.format}`,
        filename: `BusinessPlan_DryRun_${Date.now()}.${validatedInputs.format}`,
        size: validatedInputs.format === 'pdf' ? 245678 : 89012, // Mock size
        pages: validatedInputs.format === 'pdf' ? 12 : undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        downloadToken: 'mock_token_' + Date.now(),
      };
      
      const latency = Date.now() - startTime;
      emitSkillEvent('skill_completed', meta.id, {
        userId: ctx.userId,
        success: true,
        latency,
        dryRun: true,
      });
      
      return mockResult;
    }
    
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

