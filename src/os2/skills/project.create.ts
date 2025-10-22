// 🆕 PROJECT CREATE - Crea nuovo progetto

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

const ProjectCreateInputSchema = z.object({
  projectName: z.string().min(1, 'Nome progetto richiesto'),
  location: z.string().optional(),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED', 'LAND']).optional().default('RESIDENTIAL'),
  description: z.string().optional(),
  
  // Parametri iniziali
  landArea: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  units: z.number().int().positive().optional(),
  
  // Tags
  tags: z.array(z.string()).optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateInputSchema>;

// ============================================================================
// SKILL METADATA
// ============================================================================

export const meta: SkillMeta = {
  id: 'project_create',
  summary: 'Crea un nuovo progetto immobiliare',
  visibility: 'global',
  inputsSchema: {
    type: 'object',
    required: ['projectName'],
    properties: {
      projectName: { 
        type: 'string', 
        description: 'Nome del nuovo progetto'
      },
      location: { 
        type: 'string', 
        description: 'Località del progetto (es: "Milano", "Roma")'
      },
      type: { 
        type: 'string', 
        enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED', 'LAND'],
        description: 'Tipo di progetto'
      },
      description: { 
        type: 'string', 
        description: 'Descrizione del progetto'
      },
      landArea: { 
        type: 'number', 
        description: 'Superficie terreno in mq'
      },
      budget: { 
        type: 'number', 
        description: 'Budget disponibile in €'
      },
      units: { 
        type: 'number', 
        description: 'Numero di unità previste'
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
  idempotent: false,
  requiresConfirm: false,
  sideEffects: ['write.db'],
  telemetryKey: 'project.create',
  rbac: ['editor', 'admin'],
  category: 'general',
  tags: ['project', 'create', 'new'],
};

// ============================================================================
// SKILL RESULT
// ============================================================================

export interface ProjectCreateResult {
  projectId: string;
  projectName: string;
  location?: string;
  type: string;
  createdAt: Date;
  message: string;
}

// ============================================================================
// SKILL IMPLEMENTATION
// ============================================================================

export async function invoke(
  inputs: unknown,
  ctx: SkillExecutionContext
): Promise<ProjectCreateResult> {
  console.log(`🆕 [Skill:Project.Create] Creazione progetto per ${ctx.userId}`);
  
  const validatedInputs = ProjectCreateInputSchema.parse(inputs);
  
  emitSkillEvent('project.create.started', meta.id, {
    userId: ctx.userId,
    projectName: validatedInputs.projectName,
  });
  
  // TODO: Implementare creazione reale su Firestore
  // Per ora, mock che simula creazione
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`✅ [Skill:Project.Create] Progetto "${validatedInputs.projectName}" creato con ID: ${projectId}`);
  
  emitSkillEvent('project.create.completed', meta.id, {
    userId: ctx.userId,
    projectId,
    projectName: validatedInputs.projectName,
  });
  
  return {
    projectId,
    projectName: validatedInputs.projectName,
    location: validatedInputs.location,
    type: validatedInputs.type,
    createdAt: new Date(),
    message: `Progetto "${validatedInputs.projectName}" creato con successo!`,
  };
}

