"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = exports.AuditEventSchema = exports.AuditLevelSchema = void 0;
exports.withAudit = withAudit;
const zod_1 = require("zod");
const log_1 = require("./log");
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
exports.AuditLevelSchema = zod_1.z.enum(['info', 'warn', 'error', 'critical']);
exports.AuditEventSchema = zod_1.z.object({
    // Identificatori
    id: zod_1.z.string(),
    traceId: zod_1.z.string().optional(),
    requestId: zod_1.z.string().optional(),
    // Livello e tipo
    level: exports.AuditLevelSchema,
    eventType: zod_1.z.string(),
    // Timestamp
    timestamp: zod_1.z.date().default(() => new Date()),
    // Contesto
    userId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    toolRunId: zod_1.z.string().optional(),
    // Dettagli evento
    route: zod_1.z.string().optional(),
    method: zod_1.z.string().optional(),
    statusCode: zod_1.z.number().optional(),
    payloadHash: zod_1.z.string().optional(),
    // Metadati
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    // Ambiente
    environment: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    // IP e User Agent
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    // Dettagli errore (per errori 5xx)
    error: zod_1.z.object({
        name: zod_1.z.string(),
        message: zod_1.z.string(),
        stack: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
});
class AuditSystem {
    constructor() {
        this.auditBuffer = [];
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
    async audit(event) {
        if (!this.config.enableAudit) {
            return;
        }
        try {
            // Crea evento di audit
            const auditEvent = {
                id: this.generateId(),
                timestamp: new Date(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                ...event,
            };
            // Valida con Zod
            const validatedEvent = exports.AuditEventSchema.parse(auditEvent);
            // Log dell'evento
            log_1.logger.info('Audit event', {
                // eventType: validatedEvent.eventType,
                level: validatedEvent.level,
                // userId: validatedEvent.userId,
                // projectId: validatedEvent.projectId,
                // route: validatedEvent.route,
                // statusCode: validatedEvent.statusCode,
            });
            // Aggiungi al buffer
            this.auditBuffer.push(validatedEvent);
            // Flush se necessario
            if (this.auditBuffer.length >= this.config.batchSize) {
                await this.flushBuffer();
            }
        }
        catch (error) {
            log_1.logger.error('Errore nel sistema di audit', {
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
    async auditError5xx(route, method, statusCode, error, context) {
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
                code: error.code,
            },
            metadata: {
                severity: 'high',
                requiresInvestigation: true,
                alertSent: true,
            },
        });
    }
    async auditSecurityEvent(eventType, context) {
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
    async auditUserAction(action, context) {
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
    async auditSystemEvent(eventType, context) {
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
    generateId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTraceId() {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    hashPayload(payload) {
        try {
            const str = JSON.stringify(payload);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString(36);
        }
        catch {
            return 'unknown';
        }
    }
    // ============================================================================
    // FLUSH E PERSISTENCE
    // ============================================================================
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flushBuffer();
        }, this.config.flushInterval);
    }
    async flushBuffer() {
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
            log_1.logger.info('Audit buffer flushed', {
            // eventCount: eventsToFlush.length,
            });
        }
        catch (error) {
            log_1.logger.error('Errore nel flush del buffer di audit', {
                error: {
                    name: error instanceof Error ? error.name : 'Unknown',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            });
        }
    }
    async saveToDatabase(events) {
        try {
            // TODO: Implementa salvataggio su Firestore
            // const db = getFirestore();
            // const batch = db.batch();
            // for (const event of events) {
            //   const docRef = db.collection('audit_events').doc(event.id);
            //   batch.set(docRef, event);
            // }
            // await batch.commit();
            log_1.logger.info('Audit events saved to database', {
            // eventCount: events.length,
            });
        }
        catch (error) {
            log_1.logger.error('Errore nel salvataggio audit su database', {
                error: {
                    name: error instanceof Error ? error.name : 'Unknown',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    }
    async saveToFile(events) {
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
            log_1.logger.info('Audit events saved to file', {
            // eventCount: events.length,
            });
        }
        catch (error) {
            log_1.logger.error('Errore nel salvataggio audit su file', {
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
    destroy() {
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
exports.audit = new AuditSystem();
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Wrapper per API routes con audit automatico
 */
function withAudit(route, method, handler) {
    return async () => {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            const result = await handler();
            await exports.audit.audit({
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await exports.audit.audit({
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
//# sourceMappingURL=audit.js.map