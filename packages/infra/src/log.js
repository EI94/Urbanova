"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.StructuredLogger = exports.LogEventSchema = exports.LogLevelSchema = void 0;
exports.createContextLogger = createContextLogger;
exports.createApiLogger = createApiLogger;
exports.createToolLogger = createToolLogger;
exports.createSessionLogger = createSessionLogger;
const zod_1 = require("zod");
/**
 * Sistema di Logging Strutturato Urbanova
 *
 * Questo sistema fornisce:
 * - Logging strutturato con Zod validation
 * - Supporto per eventi, utenti, progetti, sessioni
 * - Integrazione con Slack per alert critici
 * - Audit trail per compliance
 */
// ============================================================================
// SCHEMA ZOD PER LOGGING
// ============================================================================
exports.LogLevelSchema = zod_1.z.enum(['debug', 'info', 'warn', 'error', 'fatal']);
exports.LogEventSchema = zod_1.z.object({
    // Livello di log
    level: exports.LogLevelSchema,
    // Messaggio principale
    message: zod_1.z.string(),
    // Timestamp
    timestamp: zod_1.z.date().default(() => new Date()),
    // Identificatori contestuali
    userId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    toolRunId: zod_1.z.string().optional(),
    // Metadati aggiuntivi
    meta: zod_1.z.record(zod_1.z.any()).optional(),
    // Informazioni di sistema
    environment: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    // Tracciamento errori
    error: zod_1.z.object({
        name: zod_1.z.string(),
        message: zod_1.z.string(),
        stack: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    // Performance metrics
    duration: zod_1.z.number().optional(), // in milliseconds
    memoryUsage: zod_1.z.number().optional(), // in MB
    // Request context
    requestId: zod_1.z.string().optional(),
    route: zod_1.z.string().optional(),
    method: zod_1.z.string().optional(),
    statusCode: zod_1.z.number().optional(),
    // User agent e IP
    userAgent: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().optional(),
});
class StructuredLogger {
    constructor(config = {}) {
        this.logBuffer = [];
        this.bufferSize = 100;
        this.flushInterval = 30000; // 30 secondi
        this.config = {
            level: process.env.LOG_LEVEL || 'info',
            enableConsole: process.env.NODE_ENV !== 'test',
            enableSlack: !!process.env.SLACK_WEBHOOK_URL,
            enableAudit: process.env.NODE_ENV === 'production',
            slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            ...config,
        };
        // Avvia flush periodico
        if (this.config.enableAudit) {
            this.startFlushTimer();
        }
    }
    // ============================================================================
    // METODI DI LOGGING
    // ============================================================================
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, context) {
        this.log('error', message, context);
    }
    fatal(message, context) {
        this.log('fatal', message, context);
    }
    // ============================================================================
    // LOGGING STRUTTURATO
    // ============================================================================
    log(level, message, context) {
        // Controlla se il livello è abilitato
        if (!this.shouldLog(level)) {
            return;
        }
        try {
            // Crea evento di log
            const logEvent = {
                level,
                message,
                timestamp: new Date(),
                environment: this.config.environment,
                version: this.config.version,
                ...context,
            };
            // Valida con Zod
            const validatedEvent = exports.LogEventSchema.parse(logEvent);
            // Output su console
            if (this.config.enableConsole) {
                this.logToConsole(validatedEvent);
            }
            // Aggiungi al buffer per audit
            if (this.config.enableAudit) {
                this.addToBuffer(validatedEvent);
            }
            // Alert Slack per errori critici
            if (this.config.enableSlack && (level === 'error' || level === 'fatal')) {
                this.sendSlackAlert(validatedEvent);
            }
        }
        catch (error) {
            // Fallback per errori di validazione
            console.error('Errore nel logging strutturato:', error);
            console.error('Evento originale:', { level, message, context });
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    logToConsole(event) {
        const timestamp = event.timestamp.toISOString();
        const level = event.level.toUpperCase().padEnd(5);
        const context = this.formatContext(event);
        const logMessage = `[${timestamp}] ${level} ${event.message}${context}`;
        switch (event.level) {
            case 'debug':
                console.debug(logMessage);
                break;
            case 'info':
                console.info(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
            case 'fatal':
                console.error(logMessage);
                if (event.error) {
                    console.error('Stack trace:', event.error.stack);
                }
                break;
        }
    }
    formatContext(event) {
        const parts = [];
        if (event.userId)
            parts.push(`user:${event.userId}`);
        if (event.projectId)
            parts.push(`project:${event.projectId}`);
        if (event.sessionId)
            parts.push(`session:${event.sessionId}`);
        if (event.toolRunId)
            parts.push(`toolRun:${event.toolRunId}`);
        if (event.route)
            parts.push(`route:${event.route}`);
        if (event.statusCode)
            parts.push(`status:${event.statusCode}`);
        if (event.duration)
            parts.push(`duration:${event.duration}ms`);
        return parts.length > 0 ? ` | ${parts.join(' | ')}` : '';
    }
    // ============================================================================
    // SLACK ALERTS
    // ============================================================================
    async sendSlackAlert(event) {
        if (!this.config.slackWebhookUrl) {
            return;
        }
        try {
            const color = event.level === 'fatal' ? '#ff0000' : '#ff6600';
            const emoji = event.level === 'fatal' ? '🚨' : '⚠️';
            const slackMessage = {
                text: `${emoji} Urbanova ${event.level.toUpperCase()} Alert`,
                attachments: [
                    {
                        color,
                        fields: [
                            {
                                title: 'Message',
                                value: event.message,
                                short: false,
                            },
                            {
                                title: 'Environment',
                                value: event.environment || 'unknown',
                                short: true,
                            },
                            {
                                title: 'Timestamp',
                                value: event.timestamp.toISOString(),
                                short: true,
                            },
                        ],
                    },
                ],
            };
            // Aggiungi campi contestuali se presenti
            if (event.userId || event.projectId || event.route) {
                const contextFields = [];
                if (event.userId)
                    contextFields.push({ title: 'User ID', value: event.userId, short: true });
                if (event.projectId)
                    contextFields.push({ title: 'Project ID', value: event.projectId, short: true });
                if (event.route)
                    contextFields.push({ title: 'Route', value: event.route, short: true });
                if (event.statusCode)
                    contextFields.push({ title: 'Status Code', value: event.statusCode.toString(), short: true });
                slackMessage.attachments[0]?.fields?.push(...contextFields);
            }
            // Aggiungi stack trace se presente
            if (event.error?.stack) {
                slackMessage.attachments[0]?.fields?.push({
                    title: 'Stack Trace',
                    value: `\`\`\`${event.error.stack.substring(0, 1000)}\`\`\``,
                    short: false,
                });
            }
            // Invia a Slack
            await fetch(this.config.slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(slackMessage),
            });
        }
        catch (error) {
            console.error('Errore nell\'invio alert Slack:', error);
        }
    }
    // ============================================================================
    // AUDIT BUFFER
    // ============================================================================
    addToBuffer(event) {
        this.logBuffer.push(event);
        if (this.logBuffer.length >= this.bufferSize) {
            this.flushBuffer();
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flushBuffer();
        }, this.flushInterval);
    }
    async flushBuffer() {
        if (this.logBuffer.length === 0) {
            return;
        }
        try {
            // TODO: Implementa salvataggio su database o file
            // Per ora, logga il buffer
            console.log(`📊 Flushing ${this.logBuffer.length} log events to audit`);
            // Reset buffer
            this.logBuffer = [];
        }
        catch (error) {
            console.error('Errore nel flush del buffer di audit:', error);
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
exports.StructuredLogger = StructuredLogger;
// ============================================================================
// INSTANCE GLOBALE
// ============================================================================
exports.logger = new StructuredLogger();
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Crea un logger con contesto predefinito
 */
function createContextLogger(context) {
    return {
        debug: (message, additionalContext) => exports.logger.debug(message, { ...context, ...additionalContext }),
        info: (message, additionalContext) => exports.logger.info(message, { ...context, ...additionalContext }),
        warn: (message, additionalContext) => exports.logger.warn(message, { ...context, ...additionalContext }),
        error: (message, additionalContext) => exports.logger.error(message, { ...context, ...additionalContext }),
        fatal: (message, additionalContext) => exports.logger.fatal(message, { ...context, ...additionalContext }),
    };
}
/**
 * Logger per API routes
 */
function createApiLogger(route, method, requestId) {
    return createContextLogger({
        route,
        method,
        requestId,
    });
}
/**
 * Logger per tool runs
 */
function createToolLogger(toolRunId, userId, projectId) {
    return createContextLogger({
        toolRunId,
        userId,
        projectId,
    });
}
/**
 * Logger per sessioni utente
 */
function createSessionLogger(sessionId, userId) {
    return createContextLogger({
        sessionId,
        userId,
    });
}
//# sourceMappingURL=log.js.map