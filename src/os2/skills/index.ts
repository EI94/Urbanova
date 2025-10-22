// 🎓 SKILLS CATALOG - Export di tutte le skill OS 2.0
// Centralizza registrazione e export skill

import { Skill, SkillMeta } from './SkillCatalog';
import * as businessPlanRun from './businessPlan.run';
import * as sensitivityRun from './sensitivity.run';
import * as termSheetCreate from './termSheet.create';
import * as rdoCreate from './rdo.create';
import * as salRecord from './sal.record';
import * as salesProposal from './sales.proposal';
import * as projectSave from './project.save';
import * as projectCreate from './project.create';

// ============================================================================
// SKILL WRAPPER
// ============================================================================

/**
 * Wrapper che converte skill function-based in Skill interface-based
 */
function createSkill<TInput = unknown, TOutput = unknown>(
  meta: SkillMeta,
  invokeFn: (inputs: TInput, ctx: any) => Promise<TOutput>
): Skill<TInput, TOutput> {
  return {
    meta,
    execute: invokeFn,
  };
}

// ============================================================================
// SKILL EXPORTS
// ============================================================================

/**
 * Catalog di tutte le skill disponibili in OS 2.0
 */
export const SKILLS: Skill[] = [
  // Business Plan Skills
  createSkill(businessPlanRun.meta, businessPlanRun.invoke),
  createSkill(sensitivityRun.meta, sensitivityRun.invoke),
  createSkill(termSheetCreate.meta, termSheetCreate.invoke),
  
  // Project Management Skills
  createSkill(projectSave.meta, projectSave.invoke),
  createSkill(projectCreate.meta, projectCreate.invoke),
  
  // Procurement Skills
  createSkill(rdoCreate.meta, rdoCreate.invoke),
  
  // Construction Management Skills
  createSkill(salRecord.meta, salRecord.invoke),
  
  // Sales Skills
  createSkill(salesProposal.meta, salesProposal.invoke),
];

/**
 * Metadata di tutte le skill (per discovery)
 */
export const SKILL_METAS: SkillMeta[] = SKILLS.map(skill => skill.meta);

/**
 * Conta skill per categoria
 */
export function getSkillsByCategory(): Record<string, number> {
  return SKILLS.reduce((acc, skill) => {
    const category = skill.meta.category || 'general';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filtra skill per visibility
 */
export function getGlobalSkills(): Skill[] {
  return SKILLS.filter(s => s.meta.visibility === 'global');
}

/**
 * Filtra skill per context
 */
export function getContextSkills(context: string): Skill[] {
  return SKILLS.filter(s => 
    typeof s.meta.visibility === 'object' && 
    s.meta.visibility.context === context
  );
}

/**
 * Filtra skill per RBAC
 */
export function getSkillsByRole(role: 'viewer' | 'editor' | 'admin'): Skill[] {
  return SKILLS.filter(s => 
    !s.meta.rbac || s.meta.rbac.includes(role)
  );
}

/**
 * Trova skill per ID
 */
export function findSkill(skillId: string): Skill | undefined {
  return SKILLS.find(s => s.meta.id === skillId);
}

// Default export
export default SKILLS;

// Re-export types
export type {
  BusinessPlanInput,
  BusinessPlanResult,
} from './businessPlan.run';

export type {
  SensitivityInput,
  SensitivityResult,
} from './sensitivity.run';

export type {
  TermSheetInput,
  TermSheetResult,
} from './termSheet.create';

export type {
  RdoInput,
  RdoResult,
} from './rdo.create';

export type {
  SalInput,
  SalResult,
} from './sal.record';

export type {
  SalesProposalInput,
  SalesProposalResult,
} from './sales.proposal';

export type {
  ProjectSaveInput,
  ProjectSaveResult,
} from './project.save';

export type {
  ProjectCreateInput,
  ProjectCreateResult,
} from './project.create';

