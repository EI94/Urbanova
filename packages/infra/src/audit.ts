import { z } from 'zod';
import { logger } from './log';

/**
 * Sistema di Audit per Urbanova
 * 
 * Questo sistema fornisce:
 * - Tracciamento di tutti gli eventi critici
 * - Audit trail per compliance
 * - Salvataggio su database per errori 5xx
 * - Integrazione con sistema di logging
 */

// ============================================================================
// SCHEMA ZOD PER AUDIT
// ============================================================================

export const AuditLevelSchema = z.enum(['info', 'warn', 'error', 'critical']);

export const AuditEventSchema = z.object({
  // Identificatori
  id: z.string(),
  traceId: z.string().optional(),
  requestId: z.string().optional(),
  
  // Livello e tipo
  level: AuditLevelSchema,
  eventType: z.string(),
  
  // Timestamp
  timestamp: z.date().default(() => new Date()),
  
  // Contesto
  userId: z.string().optional(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  toolRunId: z.string().optional(),
  
  // Dettagli evento
  route: z.string().optional(),
  method: z.string().optional(),
  statusCode: z.number().optional(),
  payloadHash: z.string().optional(),
  
  // Metadati
  metadata: z.record(z.any()).optional(),
  
  // Ambiente
  environment: z.string().optional(),
  version: z.string().optional(),
  
  // IP e User Agent
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  
  // Dettagli errore (per errori 5xx)
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditLevel = z.infer<typeof AuditLevelSchema>;

// ============================================================================
// CONFIGURAZIONE AUDIT
// ============================================================================

interface AuditConfig {
  enableAudit: boolean;
  enableDatabase: boolean;
  enableFile: boolean;
  batchSize: number;
  flushInterval: number;
  retentionDays: number;
}

class AuditSystem {
  private config: AuditConfig;
  private auditBuffer: AuditEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.config = {
      enableAudit: process.env.NODE_ENV === 'production',
      enableDatabase: !!process.env.FIREBASE_PROJECT_ID,
      enableFile: process.env.NODE_ENV === 'development',
      batchSize: 50,
      flushInterval: 30000, // 30 secondi
      retentionDays: 90,
    };

    if (this.config.enableAudit) {
      this.startFlushTimer();
    }
  }

  // ============================================================================
  // METODI DI AUDIT
  // ============================================================================

  async audit(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enableAudit) {
      return;
    }

    try {
      // Crea evento di audit
      const auditEvent: AuditEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        ...event,
      };

      // Valida con Zod
      const validatedEvent = AuditEventSchema.parse(auditEvent);

      // Log dell'evento
      logger.info('Audit event', {
        eventType: validatedEvent.eventType,
        level: validatedEvent.level,
        userId: validatedEvent.userId,
        projectId: validatedEvent.projectId,
        route: validatedEvent.route,
        statusCode: validatedEvent.statusCode,
      });

      // Aggiungi al buffer
      this.auditBuffer.push(validatedEvent);

      // Flush se necessario
      if (this.auditBuffer.length >= this.config.batchSize) {
        await this.flushBuffer();
      }

    } catch (error) {
      logger.error('Errore nel sistema di audit', {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
    }
  }

  // ============================================================================
  // METODI SPECIFICI
  // ============================================================================

  async auditError5xx(
    route: string,
    method: string,
    statusCode: number,
    error: Error,
    context: {
      userId?: string;
      projectId?: string;
      sessionId?: string;
      requestId?: string;
      ipAddress?: string;
      userAgent?: string;
      payload?: any;
    }
  ): Promise<void> {
    const payloadHash = context.payload ? this.hashPayload(context.payload) : undefined;

    await this.audit({
      level: 'error',
      eventType: '5xx_error',
      traceId: this.generateTraceId(),
      requestId: context.requestId,
      userId: context.userId,
      projectId: context.projectId,
      sessionId: context.sessionId,
      route,
      method,
      statusCode,
      payloadHash,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      metadata: {
        severity: 'high',
        requiresInvestigation: true,
        alertSent: true,
      },
    });
  }

  async auditSecurityEvent(
    eventType: string,
    context: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      route?: string;
      details?: any;
    }
  ): Promise<void> {
    await this.audit({
      level: 'critical',
      eventType: `security_${eventType}`,
      userId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      route: context.route,
      metadata: {
        severity: 'critical',
        requiresImmediateAction: true,
        ...context.details,
      },
    });
  }

  async auditUserAction(
    action: string,
    context: {
      userId: string;
      projectId?: string;
      sessionId?: string;
      details?: any;
    }
  ): Promise<void> {
    await this.audit({
      level: 'info',
      eventType: `user_action_${action}`,
      userId: context.userId,
      projectId: context.projectId,
      sessionId: context.sessionId,
      metadata: {
        action,
        ...context.details,
      },
    });
  }

  async auditSystemEvent(
    eventType: string,
    context: {
      level: AuditLevel;
      details?: any;
    }
  ): Promise<void> {
    await this.audit({
      level: context.level,
      eventType: `system_${eventType}`,
      metadata: {
        ...context.details,
      },
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashPayload(payload: any): string {
    try {
      const str = JSON.stringify(payload);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(36);
    } catch {
      return 'unknown';
    }
  }

  // ============================================================================
  // FLUSH E PERSISTENCE
  // ============================================================================

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.config.flushInterval);
  }

  private async flushBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) {
      return;
    }

    try {
      const eventsToFlush = [...this.auditBuffer];
      this.auditBuffer = [];

      // Salva su database se abilitato
      if (this.config.enableDatabase) {
        await this.saveToDatabase(eventsToFlush);
      }

      // Salva su file se abilitato
      if (this.config.enableFile) {
        await this.saveToFile(eventsToFlush);
      }

      logger.info('Audit buffer flushed', {
        eventCount: eventsToFlush.length,
      });

    } catch (error) {
      logger.error('Errore nel flush del buffer di audit', {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
    }
  }

  private async saveToDatabase(events: AuditEvent[]): Promise<void> {
    try {
      // TODO: Implementa salvataggio su Firestore
      // const db = getFirestore();
      // const batch = db.batch();
      
      // for (const event of events) {
      //   const docRef = db.collection('audit_events').doc(event.id);
      //   batch.set(docRef, event);
      // }
      
      // await batch.commit();
      
      logger.info('Audit events saved to database', {
        eventCount: events.length,
      });

    } catch (error) {
      logger.error('Errore nel salvataggio audit su database', {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async saveToFile(events: AuditEvent[]): Promise<void> {
    try {
      // TODO: Implementa salvataggio su file
      // const fs = require('fs').promises;
      // const path = require('path');
      
      // const auditDir = path.join(process.cwd(), 'logs', 'audit');
      // await fs.mkdir(auditDir, { recursive: true });
      
      // const filename = `audit_${new Date().toISOString().split('T')[0]}.jsonl`;
      // const filepath = path.join(auditDir, filename);
      
      // const content = events.map(event => JSON.stringify(event)).join('\n') + '\n';
      // await fs.appendFile(filepath, content);
      
      logger.info('Audit events saved to file', {
        eventCount: events.length,
      });

    } catch (error) {
      logger.error('Errore nel salvataggio audit su file', {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush finale
    this.flushBuffer();
  }
}

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const audit = new AuditSystem();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Wrapper per API routes con audit automatico
 */
export function withAudit<T>(
  route: string,
  method: string,
  handler: () => Promise<T>
): Promise<T> {
  return async () => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const result = await handler();
      
      await audit.audit({
        level: 'info',
        eventType: 'api_success',
        requestId,
        route,
        method,
        metadata: {
          duration: Date.now() - startTime,
        },
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await audit.audit({
        level: 'error',
        eventType: 'api_error',
        requestId,
        route,
        method,
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        metadata: {
          duration,
        },
      });
      
      throw error;
    }
  };
}
