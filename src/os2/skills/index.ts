// 🎓 SKILLS CATALOG - Export di tutte le skill OS 2.0
// Centralizza registrazione e export skill

import { Skill, SkillMeta } from './SkillCatalog';

// LAZY: Import dinamico per evitare TDZ durante bundle - NON importare subito
// import * as businessPlanRun from './businessPlan.run';
// import * as sensitivityRun from './sensitivity.run';
// ... tutti gli altri

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
// SKILL EXPORTS - LAZY LOADING
// ============================================================================

/**
 * Catalog di tutte le skill disponibili in OS 2.0
 * LAZY: Caricato solo quando necessario per evitare TDZ durante bundle
 */
let _SKILLS: Skill[] | null = null;

// LAZY ASYNC: Carica skill modules solo quando necessario con import() asincrono
// NON usare require() perché webpack lo valuta comunque durante bundle
export async function getSKILLSAsync(): Promise<Skill[]> {
  if (!_SKILLS) {
    // Carica skill modules solo quando necessario - ASYNC import
    const [
      businessPlanRun,
      sensitivityRun,
      termSheetCreate,
      rdoCreate,
      salRecord,
      salesProposal,
      projectSave,
      projectCreate,
      budgetSuppliersTools,
    ] = await Promise.all([
      import('./businessPlan.run'),
      import('./sensitivity.run'),
      import('./termSheet.create'),
      import('./rdo.create'),
      import('./sal.record'),
      import('./sales.proposal'),
      import('./project.save'),
      import('./project.create'),
      import('./budgetSuppliers.tools'),
    ]);
    
    _SKILLS = [
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
      
      // Budget Suppliers Skills
      createSkill(budgetSuppliersTools.generateBoQMeta, budgetSuppliersTools.generateBoQInvoke),
      createSkill(budgetSuppliersTools.launchRFPMeta, budgetSuppliersTools.launchRFPInvoke),
      createSkill(budgetSuppliersTools.ingestOfferMeta, budgetSuppliersTools.ingestOfferInvoke),
      createSkill(budgetSuppliersTools.compareOffersMeta, budgetSuppliersTools.compareOffersInvoke),
      createSkill(budgetSuppliersTools.createBundleContractMeta, budgetSuppliersTools.createBundleContractInvoke),
      createSkill(budgetSuppliersTools.syncBusinessPlanMeta, budgetSuppliersTools.syncBusinessPlanInvoke),
    ];
  }
  return _SKILLS;
}

// Sync wrapper per compatibilità - SOLO se _SKILLS è già caricato
export function getSKILLS(): Skill[] {
  if (!_SKILLS) {
    throw new Error('SKILLS not loaded. Call getSKILLSAsync() first or ensure skills are loaded.');
  }
  return _SKILLS;
}

// Export per compatibilità - RIMOSSO completamente perché new Proxy() viene valutato durante bundle
// Usa getSKILLS() direttamente invece di SKILLS
// Se qualcuno importa SKILLS, restituisce array vuoto (compatibilità)
export const SKILLS: Skill[] = [];

/**
 * Metadata di tutte le skill (per discovery) - LAZY ASYNC
 */
export async function getSKILL_METASAsync(): Promise<SkillMeta[]> {
  const skills = await getSKILLSAsync();
  return skills.map(skill => skill.meta);
}

// Sync wrapper per compatibilità - SOLO se _SKILLS è già caricato
export function getSKILL_METAS(): SkillMeta[] {
  if (!_SKILLS) {
    throw new Error('SKILLS not loaded. Call getSKILLSAsync() first.');
  }
  return _SKILLS.map(skill => skill.meta);
}

// Export per compatibilità - RIMOSSO export const SKILL_METAS perché viene valutato durante bundle
// Usa getSKILL_METAS() direttamente invece di SKILL_METAS
export const SKILL_METAS: SkillMeta[] = [];

/**
 * Conta skill per categoria - LAZY ASYNC
 */
export async function getSkillsByCategoryAsync(): Promise<Record<string, number>> {
  const skills = await getSKILLSAsync();
  return skills.reduce((acc, skill) => {
    const category = skill.meta.category || 'general';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filtra skill per visibility - LAZY ASYNC
 */
export async function getGlobalSkillsAsync(): Promise<Skill[]> {
  const skills = await getSKILLSAsync();
  return skills.filter(s => s.meta.visibility === 'global');
}

/**
 * Filtra skill per context - LAZY ASYNC
 */
export async function getContextSkillsAsync(context: string): Promise<Skill[]> {
  const skills = await getSKILLSAsync();
  return skills.filter(s => 
    typeof s.meta.visibility === 'object' && 
    s.meta.visibility.context === context
  );
}

/**
 * Filtra skill per RBAC - LAZY ASYNC
 */
export async function getSkillsByRoleAsync(role: 'viewer' | 'editor' | 'admin'): Promise<Skill[]> {
  const skills = await getSKILLSAsync();
  return skills.filter(s => 
    !s.meta.rbac || s.meta.rbac.includes(role)
  );
}

/**
 * Trova skill per ID - LAZY ASYNC
 */
export async function findSkillAsync(skillId: string): Promise<Skill | undefined> {
  const skills = await getSKILLSAsync();
  return skills.find(s => s.meta.id === skillId);
}

// Sync wrappers per compatibilità - SOLO se _SKILLS è già caricato
export function getSkillsByCategory(): Record<string, number> {
  if (!_SKILLS) throw new Error('SKILLS not loaded');
  return _SKILLS.reduce((acc, skill) => {
    const category = skill.meta.category || 'general';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function getGlobalSkills(): Skill[] {
  if (!_SKILLS) throw new Error('SKILLS not loaded');
  return _SKILLS.filter(s => s.meta.visibility === 'global');
}

export function getContextSkills(context: string): Skill[] {
  if (!_SKILLS) throw new Error('SKILLS not loaded');
  return _SKILLS.filter(s => 
    typeof s.meta.visibility === 'object' && 
    s.meta.visibility.context === context
  );
}

export function getSkillsByRole(role: 'viewer' | 'editor' | 'admin'): Skill[] {
  if (!_SKILLS) throw new Error('SKILLS not loaded');
  return _SKILLS.filter(s => 
    !s.meta.rbac || s.meta.rbac.includes(role)
  );
}

export function findSkill(skillId: string): Skill | undefined {
  if (!_SKILLS) throw new Error('SKILLS not loaded');
  return _SKILLS.find(s => s.meta.id === skillId);
}

// Default export - LAZY ASYNC (function, non valutata durante bundle)
// Export la function async direttamente, non chiamarla!
export default getSKILLSAsync;

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

