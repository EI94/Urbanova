/**
 * 🔒 BUDGET SUPPLIERS RBAC PERMISSIONS
 * 
 * Sistema di controllo accessi basato su ruoli per modulo Budget & Suppliers
 */

import { z } from 'zod';

// Ruoli disponibili
export enum BudgetSuppliersRole {
  OWNER = 'owner',
  PROJECT_MANAGER = 'pm',
  QUANTITY_SURVEYOR = 'qs',
  COST_CONTROLLER = 'cost',
  VIEWER = 'viewer',
  VENDOR = 'vendor'
}

// Permessi disponibili
export enum BudgetSuppliersPermission {
  // BoQ Management
  CREATE_BOQ = 'create_boq',
  EDIT_BOQ = 'edit_boq',
  DELETE_BOQ = 'delete_boq',
  VIEW_BOQ = 'view_boq',
  
  // Item Management
  CREATE_ITEM = 'create_item',
  EDIT_ITEM = 'edit_item',
  DELETE_ITEM = 'delete_item',
  VIEW_ITEM = 'view_item',
  
  // RFP Management
  CREATE_RFP = 'create_rfp',
  EDIT_RFP = 'edit_rfp',
  DELETE_RFP = 'delete_rfp',
  VIEW_RFP = 'view_rfp',
  SEND_RFP_INVITATIONS = 'send_rfp_invitations',
  
  // Offer Management
  SUBMIT_OFFER = 'submit_offer',
  VIEW_OFFER = 'view_offer',
  EDIT_OFFER = 'edit_offer',
  DELETE_OFFER = 'delete_offer',
  
  // Comparison & Award
  COMPARE_OFFERS = 'compare_offers',
  AWARD_CONTRACT = 'award_contract',
  VIEW_COMPARISON = 'view_comparison',
  
  // Contract Management
  CREATE_CONTRACT = 'create_contract',
  EDIT_CONTRACT = 'edit_contract',
  SIGN_CONTRACT = 'sign_contract',
  VIEW_CONTRACT = 'view_contract',
  
  // Progress Management
  RECORD_SAL = 'record_sal',
  CREATE_VARIATION = 'create_variation',
  APPROVE_VARIATION = 'approve_variation',
  VIEW_PROGRESS = 'view_progress',
  
  // Business Plan Sync
  SYNC_BUSINESS_PLAN = 'sync_business_plan',
  VIEW_SYNC_HISTORY = 'view_sync_history',
  
  // Admin
  MANAGE_USERS = 'manage_users',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  EXPORT_DATA = 'export_data'
}

// Scope per operazioni vendor-specifiche
export interface VendorScope {
  rfpId: string;
  vendorId: string;
  token?: string;
}

// Context per controllo permessi
export interface PermissionContext {
  userId: string;
  userRole: BudgetSuppliersRole;
  projectId: string;
  vendorScope?: VendorScope;
  entityId?: string;
  entityType?: 'item' | 'rfp' | 'offer' | 'contract' | 'sal' | 'variation';
}

// Schema per validazione permessi
export const PermissionCheckSchema = z.object({
  userId: z.string(),
  userRole: z.nativeEnum(BudgetSuppliersRole),
  projectId: z.string(),
  permission: z.nativeEnum(BudgetSuppliersPermission),
  vendorScope: z.object({
    rfpId: z.string(),
    vendorId: z.string(),
    token: z.string().optional()
  }).optional(),
  entityId: z.string().optional(),
  entityType: z.enum(['item', 'rfp', 'offer', 'contract', 'sal', 'variation']).optional()
});

// Mappatura ruoli → permessi
const ROLE_PERMISSIONS: Record<BudgetSuppliersRole, BudgetSuppliersPermission[]> = {
  [BudgetSuppliersRole.OWNER]: [
    // Full access
    BudgetSuppliersPermission.CREATE_BOQ,
    BudgetSuppliersPermission.EDIT_BOQ,
    BudgetSuppliersPermission.DELETE_BOQ,
    BudgetSuppliersPermission.VIEW_BOQ,
    BudgetSuppliersPermission.CREATE_ITEM,
    BudgetSuppliersPermission.EDIT_ITEM,
    BudgetSuppliersPermission.DELETE_ITEM,
    BudgetSuppliersPermission.VIEW_ITEM,
    BudgetSuppliersPermission.CREATE_RFP,
    BudgetSuppliersPermission.EDIT_RFP,
    BudgetSuppliersPermission.DELETE_RFP,
    BudgetSuppliersPermission.VIEW_RFP,
    BudgetSuppliersPermission.SEND_RFP_INVITATIONS,
    BudgetSuppliersPermission.VIEW_OFFER,
    BudgetSuppliersPermission.EDIT_OFFER,
    BudgetSuppliersPermission.DELETE_OFFER,
    BudgetSuppliersPermission.COMPARE_OFFERS,
    BudgetSuppliersPermission.AWARD_CONTRACT,
    BudgetSuppliersPermission.VIEW_COMPARISON,
    BudgetSuppliersPermission.CREATE_CONTRACT,
    BudgetSuppliersPermission.EDIT_CONTRACT,
    BudgetSuppliersPermission.SIGN_CONTRACT,
    BudgetSuppliersPermission.VIEW_CONTRACT,
    BudgetSuppliersPermission.RECORD_SAL,
    BudgetSuppliersPermission.CREATE_VARIATION,
    BudgetSuppliersPermission.APPROVE_VARIATION,
    BudgetSuppliersPermission.VIEW_PROGRESS,
    BudgetSuppliersPermission.SYNC_BUSINESS_PLAN,
    BudgetSuppliersPermission.VIEW_SYNC_HISTORY,
    BudgetSuppliersPermission.MANAGE_USERS,
    BudgetSuppliersPermission.VIEW_AUDIT_LOGS,
    BudgetSuppliersPermission.EXPORT_DATA
  ],
  
  [BudgetSuppliersRole.PROJECT_MANAGER]: [
    // Full access except user management
    BudgetSuppliersPermission.CREATE_BOQ,
    BudgetSuppliersPermission.EDIT_BOQ,
    BudgetSuppliersPermission.DELETE_BOQ,
    BudgetSuppliersPermission.VIEW_BOQ,
    BudgetSuppliersPermission.CREATE_ITEM,
    BudgetSuppliersPermission.EDIT_ITEM,
    BudgetSuppliersPermission.DELETE_ITEM,
    BudgetSuppliersPermission.VIEW_ITEM,
    BudgetSuppliersPermission.CREATE_RFP,
    BudgetSuppliersPermission.EDIT_RFP,
    BudgetSuppliersPermission.DELETE_RFP,
    BudgetSuppliersPermission.VIEW_RFP,
    BudgetSuppliersPermission.SEND_RFP_INVITATIONS,
    BudgetSuppliersPermission.VIEW_OFFER,
    BudgetSuppliersPermission.EDIT_OFFER,
    BudgetSuppliersPermission.DELETE_OFFER,
    BudgetSuppliersPermission.COMPARE_OFFERS,
    BudgetSuppliersPermission.AWARD_CONTRACT,
    BudgetSuppliersPermission.VIEW_COMPARISON,
    BudgetSuppliersPermission.CREATE_CONTRACT,
    BudgetSuppliersPermission.EDIT_CONTRACT,
    BudgetSuppliersPermission.SIGN_CONTRACT,
    BudgetSuppliersPermission.VIEW_CONTRACT,
    BudgetSuppliersPermission.RECORD_SAL,
    BudgetSuppliersPermission.CREATE_VARIATION,
    BudgetSuppliersPermission.APPROVE_VARIATION,
    BudgetSuppliersPermission.VIEW_PROGRESS,
    BudgetSuppliersPermission.SYNC_BUSINESS_PLAN,
    BudgetSuppliersPermission.VIEW_SYNC_HISTORY,
    BudgetSuppliersPermission.VIEW_AUDIT_LOGS,
    BudgetSuppliersPermission.EXPORT_DATA
  ],
  
  [BudgetSuppliersRole.QUANTITY_SURVEYOR]: [
    // BoQ and RFP management
    BudgetSuppliersPermission.CREATE_BOQ,
    BudgetSuppliersPermission.EDIT_BOQ,
    BudgetSuppliersPermission.VIEW_BOQ,
    BudgetSuppliersPermission.CREATE_ITEM,
    BudgetSuppliersPermission.EDIT_ITEM,
    BudgetSuppliersPermission.VIEW_ITEM,
    BudgetSuppliersPermission.CREATE_RFP,
    BudgetSuppliersPermission.EDIT_RFP,
    BudgetSuppliersPermission.VIEW_RFP,
    BudgetSuppliersPermission.SEND_RFP_INVITATIONS,
    BudgetSuppliersPermission.VIEW_OFFER,
    BudgetSuppliersPermission.COMPARE_OFFERS,
    BudgetSuppliersPermission.VIEW_COMPARISON,
    BudgetSuppliersPermission.VIEW_CONTRACT,
    BudgetSuppliersPermission.VIEW_PROGRESS,
    BudgetSuppliersPermission.VIEW_SYNC_HISTORY
  ],
  
  [BudgetSuppliersRole.COST_CONTROLLER]: [
    // Cost control and contracts
    BudgetSuppliersPermission.VIEW_BOQ,
    BudgetSuppliersPermission.VIEW_ITEM,
    BudgetSuppliersPermission.VIEW_RFP,
    BudgetSuppliersPermission.VIEW_OFFER,
    BudgetSuppliersPermission.COMPARE_OFFERS,
    BudgetSuppliersPermission.AWARD_CONTRACT,
    BudgetSuppliersPermission.VIEW_COMPARISON,
    BudgetSuppliersPermission.CREATE_CONTRACT,
    BudgetSuppliersPermission.EDIT_CONTRACT,
    BudgetSuppliersPermission.VIEW_CONTRACT,
    BudgetSuppliersPermission.RECORD_SAL,
    BudgetSuppliersPermission.CREATE_VARIATION,
    BudgetSuppliersPermission.APPROVE_VARIATION,
    BudgetSuppliersPermission.VIEW_PROGRESS,
    BudgetSuppliersPermission.SYNC_BUSINESS_PLAN,
    BudgetSuppliersPermission.VIEW_SYNC_HISTORY
  ],
  
  [BudgetSuppliersRole.VIEWER]: [
    // Read-only access
    BudgetSuppliersPermission.VIEW_BOQ,
    BudgetSuppliersPermission.VIEW_ITEM,
    BudgetSuppliersPermission.VIEW_RFP,
    BudgetSuppliersPermission.VIEW_OFFER,
    BudgetSuppliersPermission.VIEW_COMPARISON,
    BudgetSuppliersPermission.VIEW_CONTRACT,
    BudgetSuppliersPermission.VIEW_PROGRESS,
    BudgetSuppliersPermission.VIEW_SYNC_HISTORY
  ],
  
  [BudgetSuppliersRole.VENDOR]: [
    // Limited to own offers
    BudgetSuppliersPermission.SUBMIT_OFFER,
    BudgetSuppliersPermission.VIEW_OFFER
  ]
};

// Classe principale per controllo permessi
export class BudgetSuppliersRBAC {
  
  /**
   * Verifica se un utente ha un permesso specifico
   */
  static async checkPermission(
    context: PermissionContext,
    permission: BudgetSuppliersPermission
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      console.log('🔒 [RBAC] Controllo permesso:', { 
        userId: context.userId, 
        role: context.userRole, 
        permission,
        projectId: context.projectId 
      });
      
      // Validazione input
      const validation = PermissionCheckSchema.safeParse({
        ...context,
        permission
      });
      
      if (!validation.success) {
        return {
          allowed: false,
          reason: `Input non valido: ${validation.error.message}`
        };
      }
      
      // Controllo permessi base per ruolo
      const rolePermissions = ROLE_PERMISSIONS[context.userRole];
      if (!rolePermissions.includes(permission)) {
        return {
          allowed: false,
          reason: `Ruolo ${context.userRole} non ha il permesso ${permission}`
        };
      }
      
      // Controlli specifici per vendor
      if (context.userRole === BudgetSuppliersRole.VENDOR) {
        const vendorCheck = await this.checkVendorPermissions(context, permission);
        if (!vendorCheck.allowed) {
          return vendorCheck;
        }
      }
      
      // Controlli specifici per entità
      if (context.entityId && context.entityType) {
        const entityCheck = await this.checkEntityPermissions(context, permission);
        if (!entityCheck.allowed) {
          return entityCheck;
        }
      }
      
      console.log('✅ [RBAC] Permesso concesso:', { 
        userId: context.userId, 
        permission 
      });
      
      return { allowed: true };
      
    } catch (error: any) {
      console.error('❌ [RBAC] Errore controllo permesso:', error);
      return {
        allowed: false,
        reason: `Errore sistema: ${error.message}`
      };
    }
  }
  
  /**
   * Controlli specifici per vendor
   */
  private static async checkVendorPermissions(
    context: PermissionContext,
    permission: BudgetSuppliersPermission
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    if (!context.vendorScope) {
      return {
        allowed: false,
        reason: 'Vendor scope mancante per operazioni vendor-specifiche'
      };
    }
    
    const { rfpId, vendorId, token } = context.vendorScope;
    
    // Verifica token per operazioni critiche
    if (permission === BudgetSuppliersPermission.SUBMIT_OFFER) {
      if (!token) {
        return {
          allowed: false,
          reason: 'Token mancante per invio offerta'
        };
      }
      
      // Verifica validità token (in produzione useresti database)
      const tokenValid = await this.validateVendorToken(token, rfpId, vendorId);
      if (!tokenValid) {
        return {
          allowed: false,
          reason: 'Token non valido o scaduto'
        };
      }
    }
    
    // Verifica che il vendor possa accedere solo alle proprie offerte
    if (permission === BudgetSuppliersPermission.VIEW_OFFER) {
      const canView = await this.canVendorViewOffer(context.entityId!, vendorId);
      if (!canView) {
        return {
          allowed: false,
          reason: 'Vendor può visualizzare solo le proprie offerte'
        };
      }
    }
    
    return { allowed: true };
  }
  
  /**
   * Controlli specifici per entità
   */
  private static async checkEntityPermissions(
    context: PermissionContext,
    permission: BudgetSuppliersPermission
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    if (!context.entityId || !context.entityType) {
      return { allowed: true };
    }
    
    // Verifica ownership per operazioni di modifica
    const modifyPermissions = [
      BudgetSuppliersPermission.EDIT_ITEM,
      BudgetSuppliersPermission.DELETE_ITEM,
      BudgetSuppliersPermission.EDIT_RFP,
      BudgetSuppliersPermission.DELETE_RFP,
      BudgetSuppliersPermission.EDIT_OFFER,
      BudgetSuppliersPermission.DELETE_OFFER,
      BudgetSuppliersPermission.EDIT_CONTRACT,
      BudgetSuppliersPermission.SIGN_CONTRACT
    ];
    
    if (modifyPermissions.includes(permission)) {
      const isOwner = await this.isEntityOwner(context.entityId, context.entityType, context.userId);
      if (!isOwner) {
        return {
          allowed: false,
          reason: `Utente non è owner dell'entità ${context.entityType}`
        };
      }
    }
    
    return { allowed: true };
  }
  
  /**
   * Valida token vendor
   */
  private static async validateVendorToken(
    token: string,
    rfpId: string,
    vendorId: string
  ): Promise<boolean> {
    try {
      // Simula validazione token (in produzione useresti database)
      console.log('🔑 [RBAC] Validazione token vendor:', { token, rfpId, vendorId });
      
      // Simula controllo token
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Token valido se contiene rfpId e vendorId
      return token.includes(rfpId) && token.includes(vendorId);
      
    } catch (error: any) {
      console.error('❌ [RBAC] Errore validazione token:', error);
      return false;
    }
  }
  
  /**
   * Verifica se vendor può visualizzare offerta
   */
  private static async canVendorViewOffer(
    offerId: string,
    vendorId: string
  ): Promise<boolean> {
    try {
      // Simula controllo ownership offerta (in produzione useresti database)
      console.log('👁️ [RBAC] Controllo accesso offerta:', { offerId, vendorId });
      
      // Simula controllo
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Vendor può vedere solo le proprie offerte
      return offerId.includes(vendorId);
      
    } catch (error: any) {
      console.error('❌ [RBAC] Errore controllo accesso offerta:', error);
      return false;
    }
  }
  
  /**
   * Verifica ownership entità
   */
  private static async isEntityOwner(
    entityId: string,
    entityType: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Simula controllo ownership (in produzione useresti database)
      console.log('👤 [RBAC] Controllo ownership:', { entityId, entityType, userId });
      
      // Simula controllo
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Simula ownership basato su ID
      return entityId.includes(userId) || entityId.includes('admin');
      
    } catch (error: any) {
      console.error('❌ [RBAC] Errore controllo ownership:', error);
      return false;
    }
  }
  
  /**
   * Ottieni permessi per ruolo
   */
  static getRolePermissions(role: BudgetSuppliersRole): BudgetSuppliersPermission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
  
  /**
   * Verifica se ruolo ha permesso
   */
  static hasRolePermission(role: BudgetSuppliersRole, permission: BudgetSuppliersPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }
  
  /**
   * Ottieni ruoli che hanno un permesso specifico
   */
  static getRolesWithPermission(permission: BudgetSuppliersPermission): BudgetSuppliersRole[] {
    const roles: BudgetSuppliersRole[] = [];
    
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(permission)) {
        roles.push(role as BudgetSuppliersRole);
      }
    }
    
    return roles;
  }
  
  /**
   * Genera scope vendor per operazioni specifiche
   */
  static generateVendorScope(rfpId: string, vendorId: string): VendorScope {
    const token = `vendor_${rfpId}_${vendorId}_${Date.now()}`;
    
    return {
      rfpId,
      vendorId,
      token
    };
  }
  
  /**
   * Valida context per operazione
   */
  static validateContext(context: PermissionContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!context.userId) {
      errors.push('userId mancante');
    }
    
    if (!context.userRole) {
      errors.push('userRole mancante');
    }
    
    if (!context.projectId) {
      errors.push('projectId mancante');
    }
    
    if (context.userRole === BudgetSuppliersRole.VENDOR && !context.vendorScope) {
      errors.push('vendorScope mancante per ruolo vendor');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Utility functions per controllo rapido
export const BudgetSuppliersPermissions = {
  
  /**
   * Controllo rapido permesso
   */
  async check(
    userId: string,
    userRole: BudgetSuppliersRole,
    projectId: string,
    permission: BudgetSuppliersPermission,
    options?: {
      vendorScope?: VendorScope;
      entityId?: string;
      entityType?: 'item' | 'rfp' | 'offer' | 'contract' | 'sal' | 'variation';
    }
  ): Promise<boolean> {
    const context: PermissionContext = {
      userId,
      userRole,
      projectId,
      vendorScope: options?.vendorScope,
      entityId: options?.entityId,
      entityType: options?.entityType
    };
    
    const result = await BudgetSuppliersRBAC.checkPermission(context, permission);
    return result.allowed;
  },
  
  /**
   * Controllo permessi multipli
   */
  async checkMultiple(
    userId: string,
    userRole: BudgetSuppliersRole,
    projectId: string,
    permissions: BudgetSuppliersPermission[],
    options?: {
      vendorScope?: VendorScope;
      entityId?: string;
      entityType?: 'item' | 'rfp' | 'offer' | 'contract' | 'sal' | 'variation';
    }
  ): Promise<Record<BudgetSuppliersPermission, boolean>> {
    const results: Record<BudgetSuppliersPermission, boolean> = {} as any;
    
    for (const permission of permissions) {
      results[permission] = await this.check(userId, userRole, projectId, permission, options);
    }
    
    return results;
  },
  
  /**
   * Ottieni permessi disponibili per ruolo
   */
  getAvailablePermissions(role: BudgetSuppliersRole): BudgetSuppliersPermission[] {
    return BudgetSuppliersRBAC.getRolePermissions(role);
  },
  
  /**
   * Genera scope vendor
   */
  generateVendorScope(rfpId: string, vendorId: string): VendorScope {
    return BudgetSuppliersRBAC.generateVendorScope(rfpId, vendorId);
  }
};
