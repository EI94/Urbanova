import { z } from 'zod';
/**
 * Sistema di Logging Strutturato Urbanova
 *
 * Questo sistema fornisce:
 * - Logging strutturato con Zod validation
 * - Supporto per eventi, utenti, progetti, sessioni
 * - Integrazione con Slack per alert critici
 * - Audit trail per compliance
 */
export declare const LogLevelSchema: z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>;
export declare const LogEventSchema: z.ZodObject<{
    level: z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>;
    message: z.ZodString;
    timestamp: z.ZodDefault<z.ZodDate>;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    toolRunId: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    environment: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
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
    duration: z.ZodOptional<z.ZodNumber>;
    memoryUsage: z.ZodOptional<z.ZodNumber>;
    requestId: z.ZodOptional<z.ZodString>;
    route: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodString>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    userAgent: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    timestamp: Date;
    level: "error" | "info" | "warn" | "debug" | "fatal";
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
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
    duration?: number | undefined;
    meta?: Record<string, any> | undefined;
    toolRunId?: string | undefined;
    environment?: string | undefined;
    memoryUsage?: number | undefined;
    requestId?: string | undefined;
    route?: string | undefined;
    method?: string | undefined;
    statusCode?: number | undefined;
}, {
    message: string;
    level: "error" | "info" | "warn" | "debug" | "fatal";
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
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
    duration?: number | undefined;
    meta?: Record<string, any> | undefined;
    toolRunId?: string | undefined;
    environment?: string | undefined;
    memoryUsage?: number | undefined;
    requestId?: string | undefined;
    route?: string | undefined;
    method?: string | undefined;
    statusCode?: number | undefined;
}>;
export type LogEvent = z.infer<typeof LogEventSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;
interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableSlack: boolean;
    enableAudit: boolean;
    slackWebhookUrl?: string;
    environment: string;
    version: string;
}
export declare class StructuredLogger {
    private config;
    private logBuffer;
    private bufferSize;
    private flushInterval;
    private flushTimer?;
    constructor(config?: Partial<LoggerConfig>);
    debug(message: string, context?: Partial<LogEvent>): void;
    info(message: string, context?: Partial<LogEvent>): void;
    warn(message: string, context?: Partial<LogEvent>): void;
    error(message: string, context?: Partial<LogEvent>): void;
    fatal(message: string, context?: Partial<LogEvent>): void;
    private log;
    private shouldLog;
    private logToConsole;
    private formatContext;
    private sendSlackAlert;
    private addToBuffer;
    private startFlushTimer;
    private flushBuffer;
    destroy(): void;
}
export declare const logger: StructuredLogger;
/**
 * Crea un logger con contesto predefinito
 */
export declare function createContextLogger(context: Partial<LogEvent>): {
    debug: (message: string, additionalContext?: Partial<LogEvent>) => void;
    info: (message: string, additionalContext?: Partial<LogEvent>) => void;
    warn: (message: string, additionalContext?: Partial<LogEvent>) => void;
    error: (message: string, additionalContext?: Partial<LogEvent>) => void;
    fatal: (message: string, additionalContext?: Partial<LogEvent>) => void;
};
/**
 * Logger per API routes
 */
export declare function createApiLogger(route: string, method: string, requestId: string): {
    debug: (message: string, additionalContext?: Partial<LogEvent>) => void;
    info: (message: string, additionalContext?: Partial<LogEvent>) => void;
    warn: (message: string, additionalContext?: Partial<LogEvent>) => void;
    error: (message: string, additionalContext?: Partial<LogEvent>) => void;
    fatal: (message: string, additionalContext?: Partial<LogEvent>) => void;
};
/**
 * Logger per tool runs
 */
export declare function createToolLogger(toolRunId: string, userId?: string, projectId?: string): {
    debug: (message: string, additionalContext?: Partial<LogEvent>) => void;
    info: (message: string, additionalContext?: Partial<LogEvent>) => void;
    warn: (message: string, additionalContext?: Partial<LogEvent>) => void;
    error: (message: string, additionalContext?: Partial<LogEvent>) => void;
    fatal: (message: string, additionalContext?: Partial<LogEvent>) => void;
};
/**
 * Logger per sessioni utente
 */
export declare function createSessionLogger(sessionId: string, userId?: string): {
    debug: (message: string, additionalContext?: Partial<LogEvent>) => void;
    info: (message: string, additionalContext?: Partial<LogEvent>) => void;
    warn: (message: string, additionalContext?: Partial<LogEvent>) => void;
    error: (message: string, additionalContext?: Partial<LogEvent>) => void;
    fatal: (message: string, additionalContext?: Partial<LogEvent>) => void;
};
export {};
//# sourceMappingURL=log.d.ts.map