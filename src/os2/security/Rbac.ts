// 🔐 RBAC - Role-Based Access Control per OS 2.0
// Policy enforcement per skill: viewer, editor, admin

import { SkillMeta } from '../skills/SkillCatalog';

/**
 * Ruoli utente
 */
export type UserRole = 'viewer' | 'editor' | 'admin';

/**
 * Permessi per risorsa
 */
export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';

/**
 * Policy RBAC
 */
interface RbacPolicy {
  role: UserRole;
  permissions: Permission[];
  canExecuteSkills: string[]; // Skill IDs allowed
  restrictedSkills: string[]; // Skill IDs denied
}

/**
 * Matrice permessi per ruolo
 */
const ROLE_POLICIES: Record<UserRole, RbacPolicy> = {
  viewer: {
    role: 'viewer',
    permissions: ['read', 'execute'], // Solo lettura e skill safe
    canExecuteSkills: [
      'business_plan.run',      // ✅ Può calcolare BP
      'sensitivity.run',         // ✅ Può fare sensitivity
      'project.query',           // ✅ Può query progetti
      'feasibility.analyze',     // ✅ Può analizzare fattibilità
    ],
    restrictedSkills: [
      'rdo.create',              // ❌ NON può inviare RDO
      'sal.record',              // ❌ NON può registrare SAL
      'email.send',              // ❌ NON può inviare email
      'payment.process',         // ❌ NON può processare pagamenti
      'data.delete',             // ❌ NON può eliminare dati
      'term_sheet.create',       // ❌ NON può creare term sheet
    ],
  },
  
  editor: {
    role: 'editor',
    permissions: ['read', 'write', 'execute'], // Lettura, scrittura, esecuzione
    canExecuteSkills: [
      'business_plan.run',
      'sensitivity.run',
      'term_sheet.create',       // ✅ Può creare term sheet
      'rdo.create',              // ✅ Può inviare RDO
      'sal.record',              // ✅ Può registrare SAL
      'sales.proposal',          // ✅ Può creare proposte
      'email.send',              // ✅ Può inviare email
      'project.query',
      'feasibility.analyze',
    ],
    restrictedSkills: [
      'payment.process',         // ❌ NON può processare pagamenti
      'data.delete',             // ❌ NON può eliminare dati (solo admin)
      'user.manage',             // ❌ NON può gestire utenti
    ],
  },
  
  admin: {
    role: 'admin',
    permissions: ['read', 'write', 'execute', 'delete', 'admin'], // Tutti i permessi
    canExecuteSkills: ['*'], // Può eseguire TUTTE le skill
    restrictedSkills: [], // Nessuna restrizione
  },
};

/**
 * Risultato check permessi
 */
export interface RbacCheckResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
}

/**
 * RBAC Enforcer
 */
export class RbacEnforcer {
  /**
   * Check se un ruolo può eseguire una skill
   */
  public canExecuteSkill(
    userRoles: UserRole[],
    skillId: string,
    skillMeta?: SkillMeta
  ): RbacCheckResult {
    // Admin ha sempre accesso
    if (userRoles.includes('admin')) {
      return { allowed: true };
    }
    
    // Ottieni ruolo più alto
    const highestRole = this.getHighestRole(userRoles);
    const policy = ROLE_POLICIES[highestRole];
    
    // Check se skill è nella whitelist
    if (policy.canExecuteSkills.includes('*') || policy.canExecuteSkills.includes(skillId)) {
      // Check se skill è anche nella blacklist (precedenza alla blacklist)
      if (policy.restrictedSkills.includes(skillId)) {
        return {
          allowed: false,
          reason: `Ruolo '${highestRole}' non ha permessi per eseguire ${skillId}`,
          requiredRole: this.getRequiredRole(skillId),
        };
      }
      
      return { allowed: true };
    }
    
    // Check skill meta RBAC se disponibile
    if (skillMeta?.rbac) {
      const hasRequiredRole = skillMeta.rbac.some(requiredRole => 
        userRoles.includes(requiredRole as UserRole)
      );
      
      if (hasRequiredRole) {
        return { allowed: true };
      }
      
      return {
        allowed: false,
        reason: `Skill ${skillId} richiede uno di questi ruoli: ${skillMeta.rbac.join(', ')}`,
        requiredRole: skillMeta.rbac[skillMeta.rbac.length - 1] as UserRole, // Lowest required
      };
    }
    
    // Default: deny se non in whitelist
    return {
      allowed: false,
      reason: `Ruolo '${highestRole}' non ha permessi per eseguire ${skillId}`,
      requiredRole: this.getRequiredRole(skillId),
    };
  }
  
  /**
   * Check se ruolo ha un permesso
   */
  public hasPermission(userRoles: UserRole[], permission: Permission): boolean {
    const highestRole = this.getHighestRole(userRoles);
    const policy = ROLE_POLICIES[highestRole];
    
    return policy.permissions.includes(permission);
  }
  
  /**
   * Ottieni ruolo più alto
   */
  private getHighestRole(roles: UserRole[]): UserRole {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('editor')) return 'editor';
    return 'viewer';
  }
  
  /**
   * Ottieni ruolo richiesto per una skill
   */
  private getRequiredRole(skillId: string): UserRole {
    // Check quale ruolo può eseguire questa skill
    for (const [role, policy] of Object.entries(ROLE_POLICIES)) {
      if (policy.canExecuteSkills.includes('*') || 
          policy.canExecuteSkills.includes(skillId)) {
        return role as UserRole;
      }
    }
    
    return 'admin'; // Default: richiede admin
  }
  
  /**
   * Filtra skill eseguibili per ruolo
   */
  public filterExecutableSkills(
    userRoles: UserRole[],
    skillIds: string[]
  ): string[] {
    return skillIds.filter(skillId => 
      this.canExecuteSkill(userRoles, skillId).allowed
    );
  }
  
  /**
   * Get policy per ruolo
   */
  public getPolicy(role: UserRole): RbacPolicy {
    return ROLE_POLICIES[role];
  }
}

/**
 * Singleton RBAC Enforcer
 */
let rbacInstance: RbacEnforcer;

export function getRbacEnforcer(): RbacEnforcer {
  if (!rbacInstance) {
    rbacInstance = new RbacEnforcer();
  }
  return rbacInstance;
}

