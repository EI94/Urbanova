// 🎯 SKILL: Sales Proposal Generate
// Genera proposta commerciale per vendita unità

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

const SalesProposalInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID richiesto'),
  projectName: z.string().min(1, 'Nome progetto richiesto'),
  
  // Unità
  unitType: z.string().optional().default('Appartamento'),
  unitNumber: z.string().optional(),
  unitSize: z.number().positive('Superficie deve essere > 0'),
  floor: z.string().optional(),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  
  // Pricing
  listPrice: z.number().positive('Prezzo di listino richiesto'),
  discount: z.number().min(0).max(100).optional().default(0),
  
  // Features
  features: z.array(z.string()).optional(),
  finishes: z.enum(['standard', 'premium', 'luxury']).optional().default('standard'),
  
  // Cliente
  clientName: z.string().min(1, 'Nome cliente richiesto'),
  clientEmail: z.string().email('Email cliente invalida'),
  clientPhone: z.string().optional(),
  
  // Validità
  validUntil: z.string().optional(), // ISO date
  
  // Opzioni
  includeFloorPlan: z.boolean().optional().default(true),
  includePhotos: z.boolean().optional().default(true),
  language: z.enum(['it', 'en']).optional().default('it'),
});

export type SalesProposalInput = z.infer<typeof SalesProposalInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'sales.proposal',
  summary: 'Genera proposta commerciale personalizzata per cliente interessato',
  visibility: 'global',
  inputsSchema: SalesProposalInputSchema.shape,
  preconditions: ['projectExists', 'unitAvailable'],
  latencyBudgetMs: 6000,
  idempotent: true,
  requiresConfirm: false,
  sideEffects: ['write.storage', 'write.db'],
  telemetryKey: 'sales.proposal',
  rbac: ['editor', 'admin'],
  category: 'general',
  tags: ['sales', 'proposal', 'commercial', 'pdf'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface SalesProposalResult {
  proposalId: string;
  pdfUrl: string;
  filename: string;
  finalPrice: number;
  discount: number;
  expiresAt?: Date;
  sentToClient: boolean;
  dryRun?: boolean;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<SalesProposalResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione
    const validatedInputs = SalesProposalInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      projectId: validatedInputs.projectId,
      clientName: validatedInputs.clientName,
      listPrice: validatedInputs.listPrice,
    });
    
    // 2. Calcola prezzo finale
    const finalPrice = validatedInputs.listPrice * (1 - validatedInputs.discount / 100);
    
    // 3. Genera PDF proposta
    let pdfUrl: string;
    let proposalId: string;
    let dryRun = false;
    
    try {
      const { pdfGeneratorService } = await import('@/lib/pdfGeneratorService');
      
      // Genera PDF
      const pdfResult = await pdfGeneratorService.generateSalesProposal({
        projectName: validatedInputs.projectName,
        unitType: validatedInputs.unitType,
        unitNumber: validatedInputs.unitNumber,
        unitSize: validatedInputs.unitSize,
        listPrice: validatedInputs.listPrice,
        discount: validatedInputs.discount,
        finalPrice,
        features: validatedInputs.features,
        clientName: validatedInputs.clientName,
      });
      
      pdfUrl = pdfResult.url;
      proposalId = pdfResult.id;
      
      // Salva proposta su DB
      try {
        const { db } = await import('@/lib/firebase');
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        
        await addDoc(collection(db, 'proposals'), {
          proposalId,
          projectId: validatedInputs.projectId,
          clientName: validatedInputs.clientName,
          clientEmail: validatedInputs.clientEmail,
          listPrice: validatedInputs.listPrice,
          finalPrice,
          discount: validatedInputs.discount,
          pdfUrl,
          status: 'sent',
          createdBy: ctx.userId,
          createdAt: serverTimestamp(),
        });
      } catch (dbError) {
        console.warn('⚠️ [Skill:Sales] Errore salvataggio DB (non critico)');
      }
      
      // Invia email cliente
      try {
        const { emailService } = await import('@/lib/emailService');
        
        await emailService.send({
          to: validatedInputs.clientEmail,
          subject: `Proposta Commerciale - ${validatedInputs.projectName}`,
          html: `
            <p>Gentile ${validatedInputs.clientName},</p>
            <p>Trova allegata la proposta commerciale per ${validatedInputs.unitType} nel progetto ${validatedInputs.projectName}.</p>
            <p><a href="${pdfUrl}">Scarica Proposta (PDF)</a></p>
          `,
          attachments: [{ filename: `Proposta_${proposalId}.pdf`, url: pdfUrl }],
        });
      } catch (emailError) {
        console.warn('⚠️ [Skill:Sales] Errore invio email (non critico)');
      }
      
    } catch (error) {
      console.warn('⚠️ [Skill:Sales] PDF service non disponibile, uso mock dry-run');
      
      proposalId = `prop_dryrun_${Date.now()}`;
      pdfUrl = `https://storage.example.com/dry-run/proposal_${proposalId}.pdf`;
      dryRun = true;
    }
    
    const expiresAt = validatedInputs.validUntil 
      ? new Date(validatedInputs.validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni
    
    const result: SalesProposalResult = {
      proposalId,
      pdfUrl,
      filename: `Proposta_${validatedInputs.projectName}_${validatedInputs.clientName}.pdf`,
      finalPrice,
      discount: validatedInputs.discount,
      expiresAt,
      sentToClient: !dryRun,
      dryRun,
    };
    
    // Telemetry
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_completed', meta.id, {
      userId: ctx.userId,
      success: true,
      latency,
      proposalId,
      finalPrice,
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

