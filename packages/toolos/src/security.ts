// Security Module - Urbanova Tool OS
import { ToolActionSpec, ToolContext } from '@urbanova/types';

export class SecurityManager {
  /**
   * Verifica se l'utente ha i permessi per eseguire l'action
   */
  checkRole(action: ToolActionSpec, context: ToolContext): boolean {
    const requiredRole = action.requiredRole;
    const userRole = context.userRole;

    // Gerarchia dei ruoli (più alto = più permessi)
    const roleHierarchy: Record<string, number> = {
      vendor: 1,
      sales: 2,
      pm: 3,
      owner: 4,
      admin: 5,
    };

    const requiredLevel = roleHierarchy[requiredRole];
    const userLevel = roleHierarchy[userRole];

    if (requiredLevel === undefined || userLevel === undefined) {
      context.logger.warn(`Ruolo non riconosciuto: required=${requiredRole}, user=${userRole}`);
      return false;
    }

    const hasPermission = userLevel >= requiredLevel;

    if (!hasPermission) {
      context.logger.warn(
        `Permesso negato: ${userRole} (livello ${userLevel}) non può eseguire action che richiede ${requiredRole} (livello ${requiredLevel})`
      );
    }

    return hasPermission;
  }

  /**
   * Verifica se l'utente può accedere al progetto specificato
   */
  checkProjectAccess(context: ToolContext): boolean {
    // Per ora, tutti gli utenti autenticati possono accedere ai progetti
    // In futuro, implementare logica di ACL per progetto
    if (!context.projectId) {
      return true; // Nessun progetto specificato, accesso consentito
    }

    // TODO: Implementare verifica ACL per progetto
    // - Verificare se l'utente è membro del workspace del progetto
    // - Verificare se l'utente ha permessi specifici sul progetto
    // - Verificare se il progetto è pubblico/privato

    context.logger.info(
      `Accesso al progetto ${context.projectId} verificato per utente ${context.userId}`
    );
    return true;
  }

  /**
   * Verifica se l'utente può accedere al workspace
   */
  checkWorkspaceAccess(context: ToolContext): boolean {
    // Per ora, tutti gli utenti autenticati possono accedere ai workspace
    // In futuro, implementare logica di ACL per workspace
    if (!context.workspaceId) {
      return false; // Workspace ID richiesto
    }

    // TODO: Implementare verifica ACL per workspace
    // - Verificare se l'utente è membro del workspace
    // - Verificare se l'utente ha permessi specifici sul workspace
    // - Verificare se il workspace è attivo

    context.logger.info(
      `Accesso al workspace ${context.workspaceId} verificato per utente ${context.userId}`
    );
    return true;
  }

  /**
   * Verifica completa dei permessi per un'action
   */
  checkPermissions(
    action: ToolActionSpec,
    context: ToolContext
  ): {
    allowed: boolean;
    reason?: string;
  } {
    // Verifica ruolo
    if (!this.checkRole(action, context)) {
      return {
        allowed: false,
        reason: `Ruolo insufficiente: richiesto ${action.requiredRole}, utente ${context.userRole}`,
      };
    }

    // Verifica accesso workspace
    if (!this.checkWorkspaceAccess(context)) {
      return {
        allowed: false,
        reason: 'Accesso al workspace negato',
      };
    }

    // Verifica accesso progetto (se specificato)
    if (context.projectId && !this.checkProjectAccess(context)) {
      return {
        allowed: false,
        reason: 'Accesso al progetto negato',
      };
    }

    return { allowed: true };
  }

  /**
   * Verifica se l'action richiede conferma
   */
  requiresConfirmation(action: ToolActionSpec): boolean {
    return action.confirm === true;
  }

  /**
   * Verifica se l'action è long-running
   */
  isLongRunning(action: ToolActionSpec): boolean {
    return action.longRunning === true;
  }

  /**
   * Ottiene il timeout per l'action
   */
  getActionTimeout(action: ToolActionSpec): number {
    return action.timeout || 300; // Default 5 minuti
  }
}

// Singleton instance
export const securityManager = new SecurityManager();
