// 🎯 SKILL: SAL Record
// Registra Stato Avanzamento Lavori

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

const SalInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID richiesto'),
  salNumber: z.number().int().positive('Numero SAL deve essere > 0'),
  
  // Avanzamento
  completionPercentage: z.number().min(0).max(100, 'Percentuale deve essere 0-100'),
  description: z.string().min(10, 'Descrizione troppo breve'),
  
  // Importi
  worksValue: z.number().positive('Valore lavori deve essere > 0'),
  previousPayments: z.number().min(0).optional().default(0),
  
  // Documenti
  photos: z.array(z.string()).optional(), // URL foto
  documents: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
  
  // Firma
  contractorName: z.string().optional(),
  contractorSignature: z.string().optional(), // Base64 o URL
  
  // Note
  notes: z.string().optional(),
});

export type SalInput = z.infer<typeof SalInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'sal.record',
  summary: 'Registra Stato Avanzamento Lavori (SAL) con foto, documenti e firma digitale',
  visibility: { context: 'ProjectManagement' },
  inputsSchema: SalInputSchema.shape,
  preconditions: ['projectExists', 'contractorAssigned'],
  latencyBudgetMs: 4000,
  idempotent: false, // Crea nuovo record SAL
  requiresConfirm: false,
  sideEffects: ['write.db', 'notification.send'],
  telemetryKey: 'sal.record',
  rbac: ['editor', 'admin'],
  category: 'general',
  tags: ['sal', 'construction', 'progress', 'payments'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface SalResult {
  salId: string;
  salNumber: number;
  completionPercentage: number;
  amountDue: number;
  status: 'pending' | 'approved' | 'rejected';
  recordedAt: Date;
  dryRun?: boolean;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<SalResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione
    const validatedInputs = SalInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      projectId: validatedInputs.projectId,
      salNumber: validatedInputs.salNumber,
      completion: validatedInputs.completionPercentage,
    });
    
    // 2. Calcola importo dovuto
    const amountDue = validatedInputs.worksValue - validatedInputs.previousPayments;
    
    // 3. Salva SAL
    let salId: string;
    let dryRun = false;
    
    try {
      const { db } = await import('@/lib/firebase');
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      
      const salData = {
        projectId: validatedInputs.projectId,
        salNumber: validatedInputs.salNumber,
        completionPercentage: validatedInputs.completionPercentage,
        description: validatedInputs.description,
        worksValue: validatedInputs.worksValue,
        previousPayments: validatedInputs.previousPayments,
        amountDue,
        photos: validatedInputs.photos || [],
        documents: validatedInputs.documents || [],
        contractorName: validatedInputs.contractorName,
        status: 'pending',
        recordedBy: ctx.userId,
        recordedAt: serverTimestamp(),
        notes: validatedInputs.notes,
      };
      
      const docRef = await addDoc(collection(db, 'sals'), salData);
      salId = docRef.id;
      
      console.log(`✅ [Skill:SAL] SAL registrato: ${salId}`);
      
      // Invia notifica al project owner
      try {
        const { notificationTriggerService } = await import('@/lib/notificationTriggerService');
        
        await notificationTriggerService.notifySALCreated(
          validatedInputs.projectId,
          salId,
          ctx.userId
        );
      } catch (notifError) {
        console.warn('⚠️ [Skill:SAL] Errore invio notifica (non critico)');
      }
      
    } catch (error) {
      console.warn('⚠️ [Skill:SAL] Firestore non disponibile, uso mock dry-run');
      
      salId = `sal_dryrun_${Date.now()}`;
      dryRun = true;
    }
    
    const result: SalResult = {
      salId,
      salNumber: validatedInputs.salNumber,
      completionPercentage: validatedInputs.completionPercentage,
      amountDue,
      status: 'pending',
      recordedAt: new Date(),
      dryRun,
    };
    
    // Telemetry
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_completed', meta.id, {
      userId: ctx.userId,
      success: true,
      latency,
      salId,
      amountDue,
      dryRun,
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

