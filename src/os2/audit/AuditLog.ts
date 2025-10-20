// 📋 AUDIT LOG - Persistence e export eventi OS 2.0
// Traccia: who, what, when, mode, planId, diffs

import { db } from '../../lib/firebase';
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
import { OsMode } from '../planner/ActionPlan';

/**
 * Evento audit
 */
export interface AuditEvent {
  id?: string;
  
  // Who
  userId: string;
  userEmail?: string;
  userRole?: string;
  
  // What
  action: string; // 'executed', 'skipped', 'confirmed', 'rejected', 'preview_shown'
  skillId: string;
  skillName?: string;
  
  // When
  timestamp: Date;
  
  // Where/Context
  planId: string;
  stepIndex: number;
  projectId?: string;
  projectName?: string;
  
  // How
  osMode: OsMode;
  
  // Details
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  diffs?: {
    before?: unknown;
    after?: unknown;
    changes?: string[];
  };
  
  // Metadata
  sideEffects?: string[];
  duration?: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Filtri per query audit log
 */
export interface AuditLogFilters {
  userId?: string;
  projectId?: string;
  skillId?: string;
  action?: string;
  osMode?: OsMode;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

/**
 * Audit Log Service
 */
export class AuditLogService {
  private collectionName = 'os2_audit_log';
  
  /**
   * Log evento
   */
  public async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Temporaneamente disabilitato per test
      console.log(`📋 [AuditLog] Evento simulato: ${event.action} - ${event.skillId} (${event.osMode})`);
      return `audit_${Date.now()}`;
      
      // Filtra campi undefined per evitare errori Firestore
      const cleanEvent = Object.fromEntries(
        Object.entries(event).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cleanEvent,
        timestamp: serverTimestamp(),
      });
      
      console.log(`📋 [AuditLog] Evento registrato: ${event.action} - ${event.skillId} (${event.osMode})`);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ [AuditLog] Errore log evento:', error);
      throw error;
    }
  }
  
  /**
   * Get eventi con filtri
   */
  public async getEvents(filters: AuditLogFilters = {}): Promise<AuditEvent[]> {
    try {
      let q = query(collection(db, this.collectionName));
      
      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId));
      }
      
      if (filters.skillId) {
        q = query(q, where('skillId', '==', filters.skillId));
      }
      
      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }
      
      if (filters.osMode) {
        q = query(q, where('osMode', '==', filters.osMode));
      }
      
      if (filters.dateFrom) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      
      if (filters.dateTo) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
      }
      
      // Order by timestamp desc
      q = query(q, orderBy('timestamp', 'desc'));
      
      // Limit
      if (filters.limit) {
        q = query(q, firestoreLimit(filters.limit));
      }
      
      const snapshot = await getDocs(q);
      
      const events: AuditEvent[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        } as AuditEvent;
      });
      
      console.log(`📋 [AuditLog] Caricati ${events.length} eventi`);
      
      return events;
      
    } catch (error) {
      console.error('❌ [AuditLog] Errore get events:', error);
      return [];
    }
  }
  
  /**
   * Get eventi per progetto
   */
  public async getProjectAudit(projectId: string, limit: number = 100): Promise<AuditEvent[]> {
    return this.getEvents({ projectId, limit });
  }
  
  /**
   * Get eventi per plan
   */
  public async getPlanAudit(planId: string): Promise<AuditEvent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('planId', '==', planId),
        orderBy('stepIndex', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        } as AuditEvent;
      });
      
    } catch (error) {
      console.error('❌ [AuditLog] Errore get plan audit:', error);
      return [];
    }
  }
  
  /**
   * Export audit log come CSV
   */
  public async exportToCsv(filters: AuditLogFilters = {}): Promise<string> {
    const events = await this.getEvents(filters);
    
    // CSV Headers
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'User Email',
      'Action',
      'Skill ID',
      'Skill Name',
      'OS Mode',
      'Plan ID',
      'Step Index',
      'Project ID',
      'Project Name',
      'Success',
      'Side Effects',
      'Duration (ms)',
      'Error',
    ];
    
    // CSV Rows
    const rows = events.map(event => [
      event.id || '',
      event.timestamp.toISOString(),
      event.userId,
      event.userEmail || '',
      event.action,
      event.skillId,
      event.skillName || '',
      event.osMode,
      event.planId,
      event.stepIndex.toString(),
      event.projectId || '',
      event.projectName || '',
      event.success !== undefined ? event.success.toString() : '',
      event.sideEffects?.join('; ') || '',
      event.duration?.toString() || '',
      event.errorMessage || '',
    ]);
    
    // Generate CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    console.log(`📋 [AuditLog] CSV generato: ${events.length} righe`);
    
    return csv;
  }
  
  /**
   * Export audit log per progetto
   */
  public async exportProjectAuditCsv(projectId: string): Promise<string> {
    return this.exportToCsv({ projectId });
  }
  
  /**
   * Get statistiche audit
   */
  public async getStats(filters: AuditLogFilters = {}): Promise<{
    totalEvents: number;
    byAction: Record<string, number>;
    bySkill: Record<string, number>;
    byMode: Record<string, number>;
    successRate: number;
  }> {
    const events = await this.getEvents(filters);
    
    const byAction: Record<string, number> = {};
    const bySkill: Record<string, number> = {};
    const byMode: Record<string, number> = {};
    let successCount = 0;
    
    events.forEach(event => {
      // Count by action
      byAction[event.action] = (byAction[event.action] || 0) + 1;
      
      // Count by skill
      bySkill[event.skillId] = (bySkill[event.skillId] || 0) + 1;
      
      // Count by mode
      byMode[event.osMode] = (byMode[event.osMode] || 0) + 1;
      
      // Count success
      if (event.success) {
        successCount++;
      }
    });
    
    return {
      totalEvents: events.length,
      byAction,
      bySkill,
      byMode,
      successRate: events.length > 0 ? successCount / events.length : 0,
    };
  }
}

/**
 * Singleton Audit Log Service
 */
let auditLogInstance: AuditLogService;

export function getAuditLog(): AuditLogService {
  if (!auditLogInstance) {
    auditLogInstance = new AuditLogService();
  }
  return auditLogInstance;
}

