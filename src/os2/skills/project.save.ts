// 💾 PROJECT SAVE - Salva progetto corrente con nome personalizzato

import { z } from 'zod';
import { SkillMeta, SkillExecutionContext } from './SkillCatalog';

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

const ProjectSaveInputSchema = z.object({
  projectName: z.string().min(1, 'Nome progetto richiesto'),
  description: z.string().optional(),
  
  // Dati progetto da salvare
  projectData: z.object({
    location: z.string().optional(),
    type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED', 'LAND']).optional(),
    landArea: z.number().optional(),
    units: z.number().optional(),
    businessPlanId: z.string().optional(),
    feasibilityId: z.string().optional(),
  }).optional(),
  
  // Tags
  tags: z.array(z.string()).optional(),
});

export type ProjectSaveInput = z.infer<typeof ProjectSaveInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'project_save',
  summary: 'Salva il progetto corrente con un nome personalizzato',
  visibility: 'global',
  inputsSchema: {
    type: 'object',
    required: ['projectName'],
    properties: {
      projectName: { 
        type: 'string', 
        description: 'Nome con cui salvare il progetto (es: "MilanoTower", "Roma Premium")'
      },
      description: { 
        type: 'string', 
        description: 'Descrizione opzionale del progetto'
      },
      projectData: {
        type: 'object',
        description: 'Dati del progetto da salvare',
        properties: {
          location: { type: 'string' },
          type: { type: 'string', enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED', 'LAND'] },
          landArea: { type: 'number' },
          units: { type: 'number' },
          businessPlanId: { type: 'string' },
          feasibilityId: { type: 'string' },
        }
      },
      tags: {
        type: 'array',
        description: 'Tags per categorizzare il progetto',
        items: { type: 'string' }
      }
    }
  },
  preconditions: [],
  latencyBudgetMs: 2000,
  idempotent: false, // Ogni save è unico
  requiresConfirm: false,
  sideEffects: ['write.db'],
  telemetryKey: 'project.save',
  rbac: ['editor', 'admin'],
  category: 'general',
  tags: ['project', 'save', 'persistence'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface ProjectSaveResult {
  projectId: string;
  projectName: string;
  savedAt: Date;
  message: string;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<ProjectSaveResult> {
  console.log(`💾 [Skill:Project.Save] Salvataggio progetto per ${ctx.userId}`);
  
  const validatedInputs = ProjectSaveInputSchema.parse(inputs);
  
  emitSkillEvent('project.save.started', meta.id, {
    userId: ctx.userId,
    projectName: validatedInputs.projectName,
  });
  
  // TODO: Implementare salvataggio reale su Firestore
  // Per ora, mock che simula salvataggio
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`✅ [Skill:Project.Save] Progetto "${validatedInputs.projectName}" salvato con ID: ${projectId}`);
  
  emitSkillEvent('project.save.completed', meta.id, {
    userId: ctx.userId,
    projectId,
    projectName: validatedInputs.projectName,
  });
  
  return {
    projectId,
    projectName: validatedInputs.projectName,
    savedAt: new Date(),
    message: `Progetto "${validatedInputs.projectName}" salvato con successo!`,
  };
}

