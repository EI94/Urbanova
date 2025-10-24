/**
 * 📋 BUDGET SUPPLIERS AUDIT LOG
 * 
 * Sistema di audit log mirato per operazioni Budget & Suppliers
 */

import { db } from '../../../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { BudgetSuppliersRole, BudgetSuppliersPermission } from '../budgetSuppliers/lib/permissions';

/**
 * Tipi di operazioni Budget Suppliers
 */
export enum BudgetSuppliersAuditAction {
  // BoQ Operations
  CREATE_BOQ = 'create_boq',
  EDIT_BOQ = 'edit_boq',
  DELETE_BOQ = 'delete_boq',
  
  // Item Operations
  CREATE_ITEM = 'create_item',
  EDIT_ITEM = 'edit_item',
  DELETE_ITEM = 'delete_item',
  
  // RFP Operations
  CREATE_RFP = 'create_rfp',
  EDIT_RFP = 'edit_rfp',
  DELETE_RFP = 'delete_rfp',
  SEND_RFP_INVITATIONS = 'send_rfp_invitations',
  
  // Offer Operations
  SUBMIT_OFFER = 'submit_offer',
  EDIT_OFFER = 'edit_offer',
  DELETE_OFFER = 'delete_offer',
  
  // Comparison & Award Operations
  COMPARE_OFFERS = 'compare_offers',
  AWARD_CONTRACT = 'award_contract',
  
  // Contract Operations
  CREATE_CONTRACT = 'create_contract',
  EDIT_CONTRACT = 'edit_contract',
  SIGN_CONTRACT = 'sign_contract',
  
  // Progress Operations
  RECORD_SAL = 'record_sal',
  CREATE_VARIATION = 'create_variation',
  APPROVE_VARIATION = 'approve_variation',
  
  // Business Plan Operations
  SYNC_BUSINESS_PLAN = 'sync_business_plan',
  
  // System Operations
  EXPORT_DATA = 'export_data',
  VIEW_AUDIT_LOGS = 'view_audit_logs'
}

/**
 * Livelli di criticità per operazioni
 */
export enum AuditCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Evento audit Budget Suppliers
 */
export interface BudgetSuppliersAuditEvent {
  id?: string;
  
  // Who
  userId: string;
  userEmail?: string;
  userRole: BudgetSuppliersRole;
  
  // What
  action: BudgetSuppliersAuditAction;
  entityType: 'boq' | 'item' | 'rfp' | 'offer' | 'contract' | 'sal' | 'variation' | 'business_plan' | 'system';
  entityId: string;
  entityName?: string;
  
  // When
  timestamp: Date;
  
  // Where/Context
  projectId: string;
  projectName?: string;
  rfpId?: string;
  vendorId?: string;
  
  // How
  permission: BudgetSuppliersPermission;
  criticality: AuditCriticality;
  
  // Details
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changes?: string[];
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  
  // Vendor-specific
  vendorScope?: {
    rfpId: string;
    vendorId: string;
    token?: string;
  };
}

/**
 * Filtri per query audit log Budget Suppliers
 */
export interface BudgetSuppliersAuditFilters {
  userId?: string;
  projectId?: string;
  entityType?: string;
  action?: BudgetSuppliersAuditAction;
  userRole?: BudgetSuppliersRole;
  criticality?: AuditCriticality;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  success?: boolean;
}

/**
 * Statistiche audit
 */
export interface BudgetSuppliersAuditStats {
  totalEvents: number;
  eventsByAction: Record<BudgetSuppliersAuditAction, number>;
  eventsByRole: Record<BudgetSuppliersRole, number>;
  eventsByCriticality: Record<AuditCriticality, number>;
  successRate: number;
  errorRate: number;
  mostActiveUsers: Array<{ userId: string; count: number }>;
  mostModifiedEntities: Array<{ entityId: string; entityType: string; count: number }>;
}

/**
 * Budget Suppliers Audit Log Service
 */
export class BudgetSuppliersAuditLog {
  private collectionName = 'budget_suppliers_audit_log';
  
  /**
   * Log evento Budget Suppliers
   */
  public async log(event: Omit<BudgetSuppliersAuditEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      console.log('📋 [BudgetSuppliersAudit] Log evento:', {
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        userId: event.userId,
        userRole: event.userRole,
        criticality: event.criticality
      });
      
      // Filtra campi undefined per evitare errori Firestore
      const cleanEvent = Object.fromEntries(
        Object.entries(event).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cleanEvent,
        timestamp: serverTimestamp(),
      });
      
      console.log('✅ [BudgetSuppliersAudit] Evento salvato:', docRef.id);
      return docRef.id;
      
    } catch (error: any) {
      console.error('❌ [BudgetSuppliersAudit] Errore salvataggio evento:', error);
      throw new Error(`Errore salvataggio audit log: ${error.message}`);
    }
  }
  
  /**
   * Log operazione critica con dettagli completi
   */
  public async logCriticalOperation(
    userId: string,
    userEmail: string,
    userRole: BudgetSuppliersRole,
    action: BudgetSuppliersAuditAction,
    entityType: BudgetSuppliersAuditEvent['entityType'],
    entityId: string,
    entityName: string,
    projectId: string,
    permission: BudgetSuppliersPermission,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    options?: {
      projectName?: string;
      rfpId?: string;
      vendorId?: string;
      vendorScope?: BudgetSuppliersAuditEvent['vendorScope'];
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      duration?: number;
      errorMessage?: string;
    }
  ): Promise<string> {
    
    const criticality = this.getActionCriticality(action);
    const changes = this.calculateChanges(oldValues, newValues);
    
    const event: Omit<BudgetSuppliersAuditEvent, 'id' | 'timestamp'> = {
      userId,
      userEmail,
      userRole,
      action,
      entityType,
      entityId,
      entityName,
      projectId,
      projectName: options?.projectName,
      rfpId: options?.rfpId,
      vendorId: options?.vendorId,
      permission,
      criticality,
      oldValues,
      newValues,
      changes,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      sessionId: options?.sessionId,
      duration: options?.duration,
      success: !options?.errorMessage,
      errorMessage: options?.errorMessage,
      vendorScope: options?.vendorScope
    };
    
    return await this.log(event);
  }
  
  /**
   * Log operazione semplice
   */
  public async logSimpleOperation(
    userId: string,
    userRole: BudgetSuppliersRole,
    action: BudgetSuppliersAuditAction,
    entityType: BudgetSuppliersAuditEvent['entityType'],
    entityId: string,
    projectId: string,
    permission: BudgetSuppliersPermission,
    success: boolean = true,
    errorMessage?: string
  ): Promise<string> {
    
    const criticality = this.getActionCriticality(action);
    
    const event: Omit<BudgetSuppliersAuditEvent, 'id' | 'timestamp'> = {
      userId,
      userRole,
      action,
      entityType,
      entityId,
      projectId,
      permission,
      criticality,
      success,
      errorMessage
    };
    
    return await this.log(event);
  }
  
  /**
   * Query eventi audit
   */
  public async query(filters: BudgetSuppliersAuditFilters = {}): Promise<BudgetSuppliersAuditEvent[]> {
    try {
      console.log('🔍 [BudgetSuppliersAudit] Query eventi:', filters);
      
      let q = query(collection(db, this.collectionName));
      
      // Applica filtri
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId));
      }
      
      if (filters.entityType) {
        q = query(q, where('entityType', '==', filters.entityType));
      }
      
      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }
      
      if (filters.userRole) {
        q = query(q, where('userRole', '==', filters.userRole));
      }
      
      if (filters.criticality) {
        q = query(q, where('criticality', '==', filters.criticality));
      }
      
      if (filters.success !== undefined) {
        q = query(q, where('success', '==', filters.success));
      }
      
      if (filters.dateFrom) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      
      if (filters.dateTo) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
      }
      
      // Ordina per timestamp decrescente
      q = query(q, orderBy('timestamp', 'desc'));
      
      // Limita risultati
      if (filters.limit) {
        q = query(q, firestoreLimit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      const events: BudgetSuppliersAuditEvent[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as BudgetSuppliersAuditEvent);
      });
      
      console.log('✅ [BudgetSuppliersAudit] Query completata:', events.length, 'eventi');
      return events;
      
    } catch (error: any) {
      console.error('❌ [BudgetSuppliersAudit] Errore query:', error);
      throw new Error(`Errore query audit log: ${error.message}`);
    }
  }
  
  /**
   * Ottieni statistiche audit
   */
  public async getStats(filters: BudgetSuppliersAuditFilters = {}): Promise<BudgetSuppliersAuditStats> {
    try {
      console.log('📊 [BudgetSuppliersAudit] Calcolo statistiche:', filters);
      
      const events = await this.query(filters);
      
      const stats: BudgetSuppliersAuditStats = {
        totalEvents: events.length,
        eventsByAction: {} as Record<BudgetSuppliersAuditAction, number>,
        eventsByRole: {} as Record<BudgetSuppliersRole, number>,
        eventsByCriticality: {} as Record<AuditCriticality, number>,
        successRate: 0,
        errorRate: 0,
        mostActiveUsers: [],
        mostModifiedEntities: []
      };
      
      // Calcola statistiche
      let successCount = 0;
      let errorCount = 0;
      const userCounts: Record<string, number> = {};
      const entityCounts: Record<string, { entityType: string; count: number }> = {};
      
      for (const event of events) {
        // Conteggi per azione
        stats.eventsByAction[event.action] = (stats.eventsByAction[event.action] || 0) + 1;
        
        // Conteggi per ruolo
        stats.eventsByRole[event.userRole] = (stats.eventsByRole[event.userRole] || 0) + 1;
        
        // Conteggi per criticità
        stats.eventsByCriticality[event.criticality] = (stats.eventsByCriticality[event.criticality] || 0) + 1;
        
        // Success/Error rates
        if (event.success) {
          successCount++;
        } else {
          errorCount++;
        }
        
        // Utenti più attivi
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
        
        // Entità più modificate
        const entityKey = `${event.entityType}:${event.entityId}`;
        entityCounts[entityKey] = {
          entityType: event.entityType,
          count: (entityCounts[entityKey]?.count || 0) + 1
        };
      }
      
      // Calcola rates
      stats.successRate = events.length > 0 ? (successCount / events.length) * 100 : 0;
      stats.errorRate = events.length > 0 ? (errorCount / events.length) * 100 : 0;
      
      // Top utenti attivi
      stats.mostActiveUsers = Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Top entità modificate
      stats.mostModifiedEntities = Object.entries(entityCounts)
        .map(([entityKey, data]) => ({
          entityId: entityKey.split(':')[1],
          entityType: data.entityType,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      console.log('✅ [BudgetSuppliersAudit] Statistiche calcolate');
      return stats;
      
    } catch (error: any) {
      console.error('❌ [BudgetSuppliersAudit] Errore calcolo statistiche:', error);
      throw new Error(`Errore calcolo statistiche: ${error.message}`);
    }
  }
  
  /**
   * Determina criticità operazione
   */
  private getActionCriticality(action: BudgetSuppliersAuditAction): AuditCriticality {
    const criticalityMap: Record<BudgetSuppliersAuditAction, AuditCriticality> = {
      // Operazioni critiche
      [BudgetSuppliersAuditAction.DELETE_BOQ]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.DELETE_ITEM]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.DELETE_RFP]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.DELETE_OFFER]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.SIGN_CONTRACT]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.SYNC_BUSINESS_PLAN]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.EXPORT_DATA]: AuditCriticality.CRITICAL,
      [BudgetSuppliersAuditAction.VIEW_AUDIT_LOGS]: AuditCriticality.CRITICAL,
      
      // Operazioni ad alto impatto
      [BudgetSuppliersAuditAction.CREATE_CONTRACT]: AuditCriticality.HIGH,
      [BudgetSuppliersAuditAction.EDIT_CONTRACT]: AuditCriticality.HIGH,
      [BudgetSuppliersAuditAction.AWARD_CONTRACT]: AuditCriticality.HIGH,
      [BudgetSuppliersAuditAction.APPROVE_VARIATION]: AuditCriticality.HIGH,
      [BudgetSuppliersAuditAction.SEND_RFP_INVITATIONS]: AuditCriticality.HIGH,
      
      // Operazioni a medio impatto
      [BudgetSuppliersAuditAction.CREATE_RFP]: AuditCriticality.MEDIUM,
      [BudgetSuppliersAuditAction.EDIT_RFP]: AuditCriticality.MEDIUM,
      [BudgetSuppliersAuditAction.COMPARE_OFFERS]: AuditCriticality.MEDIUM,
      [BudgetSuppliersAuditAction.CREATE_VARIATION]: AuditCriticality.MEDIUM,
      [BudgetSuppliersAuditAction.RECORD_SAL]: AuditCriticality.MEDIUM,
      
      // Operazioni a basso impatto
      [BudgetSuppliersAuditAction.CREATE_BOQ]: AuditCriticality.LOW,
      [BudgetSuppliersAuditAction.EDIT_BOQ]: AuditCriticality.LOW,
      [BudgetSuppliersAuditAction.CREATE_ITEM]: AuditCriticality.LOW,
      [BudgetSuppliersAuditAction.EDIT_ITEM]: AuditCriticality.LOW,
      [BudgetSuppliersAuditAction.SUBMIT_OFFER]: AuditCriticality.LOW,
      [BudgetSuppliersAuditAction.EDIT_OFFER]: AuditCriticality.LOW,
    };
    
    return criticalityMap[action] || AuditCriticality.LOW;
  }
  
  /**
   * Calcola differenze tra valori vecchi e nuovi
   */
  private calculateChanges(
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
  ): string[] {
    if (!oldValues || !newValues) {
      return [];
    }
    
    const changes: string[] = [];
    
    // Confronta tutti i campi
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];
      
      if (oldValue !== newValue) {
        changes.push(`${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
      }
    }
    
    return changes;
  }
  
  /**
   * Esporta audit log
   */
  public async export(filters: BudgetSuppliersAuditFilters = {}): Promise<{
    events: BudgetSuppliersAuditEvent[];
    stats: BudgetSuppliersAuditStats;
    exportDate: Date;
  }> {
    try {
      console.log('📤 [BudgetSuppliersAudit] Esportazione audit log:', filters);
      
      const events = await this.query(filters);
      const stats = await this.getStats(filters);
      
      return {
        events,
        stats,
        exportDate: new Date()
      };
      
    } catch (error: any) {
      console.error('❌ [BudgetSuppliersAudit] Errore esportazione:', error);
      throw new Error(`Errore esportazione audit log: ${error.message}`);
    }
  }
}

// Singleton instance
export const budgetSuppliersAuditLog = new BudgetSuppliersAuditLog();

// Utility functions per logging rapido
export const BudgetSuppliersAudit = {
  
  /**
   * Log operazione critica
   */
  async logCritical(
    userId: string,
    userEmail: string,
    userRole: BudgetSuppliersRole,
    action: BudgetSuppliersAuditAction,
    entityType: BudgetSuppliersAuditEvent['entityType'],
    entityId: string,
    entityName: string,
    projectId: string,
    permission: BudgetSuppliersPermission,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    options?: {
      projectName?: string;
      rfpId?: string;
      vendorId?: string;
      vendorScope?: BudgetSuppliersAuditEvent['vendorScope'];
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      duration?: number;
      errorMessage?: string;
    }
  ): Promise<string> {
    return await budgetSuppliersAuditLog.logCriticalOperation(
      userId, userEmail, userRole, action, entityType, entityId, entityName,
      projectId, permission, oldValues, newValues, options
    );
  },
  
  /**
   * Log operazione semplice
   */
  async logSimple(
    userId: string,
    userRole: BudgetSuppliersRole,
    action: BudgetSuppliersAuditAction,
    entityType: BudgetSuppliersAuditEvent['entityType'],
    entityId: string,
    projectId: string,
    permission: BudgetSuppliersPermission,
    success: boolean = true,
    errorMessage?: string
  ): Promise<string> {
    return await budgetSuppliersAuditLog.logSimpleOperation(
      userId, userRole, action, entityType, entityId, projectId, permission, success, errorMessage
    );
  },
  
  /**
   * Query eventi
   */
  async query(filters: BudgetSuppliersAuditFilters = {}): Promise<BudgetSuppliersAuditEvent[]> {
    return await budgetSuppliersAuditLog.query(filters);
  },
  
  /**
   * Ottieni statistiche
   */
  async getStats(filters: BudgetSuppliersAuditFilters = {}): Promise<BudgetSuppliersAuditStats> {
    return await budgetSuppliersAuditLog.getStats(filters);
  },
  
  /**
   * Esporta audit log
   */
  async export(filters: BudgetSuppliersAuditFilters = {}): Promise<{
    events: BudgetSuppliersAuditEvent[];
    stats: BudgetSuppliersAuditStats;
    exportDate: Date;
  }> {
    return await budgetSuppliersAuditLog.export(filters);
  }
};
