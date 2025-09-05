import { ToolActionSpec, ToolContext } from '@urbanova/types';
export declare class SecurityManager {
    /**
     * Verifica se l'utente ha i permessi per eseguire l'action
     */
    checkRole(action: ToolActionSpec, context: ToolContext): boolean;
    /**
     * Verifica se l'utente può accedere al progetto specificato
     */
    checkProjectAccess(context: ToolContext): boolean;
    /**
     * Verifica se l'utente può accedere al workspace
     */
    checkWorkspaceAccess(context: ToolContext): boolean;
    /**
     * Verifica completa dei permessi per un'action
     */
    checkPermissions(action: ToolActionSpec, context: ToolContext): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Verifica se l'action richiede conferma
     */
    requiresConfirmation(action: ToolActionSpec): boolean;
    /**
     * Verifica se l'action è long-running
     */
    isLongRunning(action: ToolActionSpec): boolean;
    /**
     * Ottiene il timeout per l'action
     */
    getActionTimeout(action: ToolActionSpec): number;
}
export declare const securityManager: SecurityManager;
//# sourceMappingURL=security.d.ts.map