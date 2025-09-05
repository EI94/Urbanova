import { z } from 'zod';
/**
 * Sistema di Audit per Urbanova
 *
 * Questo sistema fornisce:
 * - Tracciamento di tutti gli eventi critici
 * - Audit trail per compliance
 * - Salvataggio su database per errori 5xx
 * - Integrazione con sistema di logging
 */
export declare const AuditLevelSchema: z.ZodEnum<["info", "warn", "error", "critical"]>;
export declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    traceId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
    level: z.ZodEnum<["info", "warn", "error", "critical"]>;
    eventType: z.ZodString;
    timestamp: z.ZodDefault<z.ZodDate>;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    toolRunId: z.ZodOptional<z.ZodString>;
    route: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodString>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    payloadHash: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    environment: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        name: string;
        code?: string | undefined;
        stack?: string | undefined;
    }, {
        message: string;
        name: string;
        code?: string | undefined;
        stack?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: Date;
    level: "error" | "info" | "warn" | "critical";
    eventType: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
    projectId?: string | undefined;
    version?: string | undefined;
    userId?: string | undefined;
    error?: {
        message: string;
        name: string;
        code?: string | undefined;
        stack?: string | undefined;
    } | undefined;
    sessionId?: string | undefined;
    toolRunId?: string | undefined;
    environment?: string | undefined;
    requestId?: string | undefined;
    route?: string | undefined;
    method?: string | undefined;
    statusCode?: number | undefined;
    traceId?: string | undefined;
    payloadHash?: string | undefined;
}, {
    id: string;
    level: "error" | "info" | "warn" | "critical";
    eventType: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
    projectId?: string | undefined;
    version?: string | undefined;
    timestamp?: Date | undefined;
    userId?: string | undefined;
    error?: {
        message: string;
        name: string;
        code?: string | undefined;
        stack?: string | undefined;
    } | undefined;
    sessionId?: string | undefined;
    toolRunId?: string | undefined;
    environment?: string | undefined;
    requestId?: string | undefined;
    route?: string | undefined;
    method?: string | undefined;
    statusCode?: number | undefined;
    traceId?: string | undefined;
    payloadHash?: string | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditLevel = z.infer<typeof AuditLevelSchema>;
declare class AuditSystem {
    private config;
    private auditBuffer;
    private flushTimer?;
    constructor();
    audit(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;
    auditError5xx(route: string, method: string, statusCode: number, error: Error, context: {
        userId?: string;
        projectId?: string;
        sessionId?: string;
        requestId?: string;
        ipAddress?: string;
        userAgent?: string;
        payload?: any;
    }): Promise<void>;
    auditSecurityEvent(eventType: string, context: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        route?: string;
        details?: any;
    }): Promise<void>;
    auditUserAction(action: string, context: {
        userId: string;
        projectId?: string;
        sessionId?: string;
        details?: any;
    }): Promise<void>;
    auditSystemEvent(eventType: string, context: {
        level: AuditLevel;
        details?: any;
    }): Promise<void>;
    private generateId;
    private generateTraceId;
    private hashPayload;
    private startFlushTimer;
    private flushBuffer;
    private saveToDatabase;
    private saveToFile;
    destroy(): void;
}
export declare const audit: AuditSystem;
/**
 * Wrapper per API routes con audit automatico
 */
export declare function withAudit<T>(route: string, method: string, handler: () => Promise<T>): any;
export {};
//# sourceMappingURL=audit.d.ts.map