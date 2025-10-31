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

export function getSKILLS(): Skill[] {
  if (!_SKILLS) {
    // Carica skill modules solo quando necessario
    const businessPlanRun = require('./businessPlan.run');
    const sensitivityRun = require('./sensitivity.run');
    const termSheetCreate = require('./termSheet.create');
    const rdoCreate = require('./rdo.create');
    const salRecord = require('./sal.record');
    const salesProposal = require('./sales.proposal');
    const projectSave = require('./project.save');
    const projectCreate = require('./project.create');
    const budgetSuppliersTools = require('./budgetSuppliers.tools');
    
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

// Export per compatibilità - PROXY LAZY: nessuna valutazione durante bundle
export const SKILLS = new Proxy([] as Skill[], {
  get(target, prop) {
    // Quando qualcuno accede a SKILLS, carica le skill se necessario
    const skills = getSKILLS();
    // Delega tutte le proprietà all'array reale
    const value = (skills as any)[prop];
    return typeof value === 'function' ? value.bind(skills) : value;
  }
}) as Skill[];

/**
 * Metadata di tutte le skill (per discovery) - LAZY
 */
export function getSKILL_METAS(): SkillMeta[] {
  return getSKILLS().map(skill => skill.meta);
}

// Export per compatibilità - RIMOSSO export const SKILL_METAS perché viene valutato durante bundle
// Usa getSKILL_METAS() direttamente invece di SKILL_METAS
export const SKILL_METAS: SkillMeta[] = [];

/**
 * Conta skill per categoria
 */
export function getSkillsByCategory(): Record<string, number> {
  return getSKILLS().reduce((acc, skill) => {
    const category = skill.meta.category || 'general';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filtra skill per visibility
 */
export function getGlobalSkills(): Skill[] {
  return getSKILLS().filter(s => s.meta.visibility === 'global');
}

/**
 * Filtra skill per context
 */
export function getContextSkills(context: string): Skill[] {
  return getSKILLS().filter(s => 
    typeof s.meta.visibility === 'object' && 
    s.meta.visibility.context === context
  );
}

/**
 * Filtra skill per RBAC
 */
export function getSkillsByRole(role: 'viewer' | 'editor' | 'admin'): Skill[] {
  return getSKILLS().filter(s => 
    !s.meta.rbac || s.meta.rbac.includes(role)
  );
}

/**
 * Trova skill per ID
 */
export function findSkill(skillId: string): Skill | undefined {
  return getSKILLS().find(s => s.meta.id === skillId);
}

// Default export - LAZY (function, non valutata durante bundle)
// Export la function direttamente, non chiamarla!
export default getSKILLS;

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

