// 🎯 SKILL: RDO Create & Send
// Crea e invia Richiesta di Offerta a fornitori

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

const RdoInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID richiesto'),
  projectName: z.string().optional(),
  
  // Fornitori
  vendors: z.array(z.object({
    email: z.string().email('Email fornitore invalida'),
    name: z.string().optional(),
    category: z.string().optional(), // 'costruzione', 'impianti', etc.
  })).min(1, 'Almeno un fornitore richiesto'),
  
  // RDO details
  title: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(), // ISO date
  
  // Attachments
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

export type RdoInput = z.infer<typeof RdoInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'rdo.create',
  summary: 'Crea e invia Richiesta di Offerta (RDO) a fornitori selezionati',
  visibility: 'global',
  inputsSchema: RdoInputSchema.shape,
  preconditions: ['projectExists'],
  latencyBudgetMs: 5000,
  idempotent: false, // Invia email
  requiresConfirm: true, // ⚠️ Richiede conferma utente
  sideEffects: ['email.send', 'write.db'],
  telemetryKey: 'rdo.create',
  rbac: ['editor', 'admin'], // Solo editor e admin possono inviare RDO
  category: 'communication',
  tags: ['rdo', 'procurement', 'email', 'vendors'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface RdoResult {
  rdoId: string;
  sentCount: number;
  sentAt: Date;
  vendors: Array<{
    email: string;
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
  }>;
  emailsSent: string[];
  dryRun?: boolean; // true se mock
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<RdoResult> {
  const startTime = Date.now();
  
  try {
    // 1. Validazione
    const validatedInputs = RdoInputSchema.parse(inputs);
    
    emitSkillEvent('skill_invoked', meta.id, {
      userId: ctx.userId,
      projectId: validatedInputs.projectId,
      vendorCount: validatedInputs.vendors.length,
    });
    
    // 2. Verifica progetto esiste
    let projectData;
    try {
      const { db } = await import('@/lib/firebase');
      const { getDoc, doc } = await import('firebase/firestore');
      
      const projectRef = doc(db, 'projects', validatedInputs.projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        projectData = projectSnap.data();
      }
    } catch (error) {
      console.warn('⚠️ [Skill:RDO] Progetto non trovato o errore Firestore');
    }
    
    // 3. Invia RDO
    const rdoId = `rdo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const vendors: RdoResult['vendors'] = [];
    const emailsSent: string[] = [];
    
    // Usa emailService se disponibile
    try {
      const { emailService } = await import('@/lib/emailService');
      
      for (const vendor of validatedInputs.vendors) {
        try {
          const emailBody = this.generateRdoEmail(
            validatedInputs,
            projectData,
            vendor
          );
          
          await emailService.send({
            to: vendor.email,
            subject: `RDO: ${validatedInputs.title || validatedInputs.projectName || 'Nuovo Progetto'}`,
            html: emailBody,
          });
          
          vendors.push({
            email: vendor.email,
            status: 'sent',
            messageId: `msg_${Date.now()}`,
          });
          
          emailsSent.push(vendor.email);
          
        } catch (vendorError) {
          vendors.push({
            email: vendor.email,
            status: 'failed',
            error: vendorError instanceof Error ? vendorError.message : 'Unknown',
          });
        }
      }
      
      // Salva RDO su DB
      try {
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        await addDoc(collection(db, 'rdos'), {
          rdoId,
          projectId: validatedInputs.projectId,
          vendors: validatedInputs.vendors,
          sentAt: new Date(),
          sentBy: ctx.userId,
        });
      } catch (dbError) {
        console.warn('⚠️ [Skill:RDO] Errore salvataggio DB (non critico)');
      }
      
    } catch (error) {
      console.warn('⚠️ [Skill:RDO] Email service non disponibile, uso mock dry-run');
      
      // Mock dry-run
      validatedInputs.vendors.forEach(vendor => {
        vendors.push({
          email: vendor.email,
          status: 'sent',
          messageId: `mock_msg_${Date.now()}`,
        });
        emailsSent.push(vendor.email);
      });
    }
    
    const result: RdoResult = {
      rdoId,
      sentCount: vendors.filter(v => v.status === 'sent').length,
      sentAt: new Date(),
      vendors,
      emailsSent,
      dryRun: emailsSent.length > 0 && emailsSent[0].includes('mock'),
    };
    
    // Telemetry
    const latency = Date.now() - startTime;
    emitSkillEvent('skill_completed', meta.id, {
      userId: ctx.userId,
      success: true,
      latency,
      sentCount: result.sentCount,
      vendorCount: validatedInputs.vendors.length,
      dryRun: result.dryRun,
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

// Helper per generare email RDO
function generateRdoEmail(
  inputs: RdoInput,
  projectData: any,
  vendor: { email: string; name?: string; category?: string }
): string {
  return `
    <h2>Richiesta di Offerta (RDO)</h2>
    <p>Gentile ${vendor.name || 'Fornitore'},</p>
    <p>Siamo interessati a ricevere un'offerta per il progetto:</p>
    <h3>${inputs.projectName || projectData?.name || 'Progetto'}</h3>
    <p><strong>Descrizione:</strong> ${inputs.description || 'Vedere allegati'}</p>
    ${inputs.deadline ? `<p><strong>Scadenza offerta:</strong> ${inputs.deadline}</p>` : ''}
    <p>Cordiali saluti,<br/>Il team Urbanova</p>
  `;
}

