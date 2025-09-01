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

// ============================================================================
// SCHEMA ZOD PER LOGGING
// ============================================================================

export const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'fatal']);

export const LogEventSchema = z.object({
  // Livello di log
  level: LogLevelSchema,
  
  // Messaggio principale
  message: z.string(),
  
  // Timestamp
  timestamp: z.date().default(() => new Date()),
  
  // Identificatori contestuali
  userId: z.string().optional(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  toolRunId: z.string().optional(),
  
  // Metadati aggiuntivi
  meta: z.record(z.any()).optional(),
  
  // Informazioni di sistema
  environment: z.string().optional(),
  version: z.string().optional(),
  
  // Tracciamento errori
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  
  // Performance metrics
  duration: z.number().optional(), // in milliseconds
  memoryUsage: z.number().optional(), // in MB
  
  // Request context
  requestId: z.string().optional(),
  route: z.string().optional(),
  method: z.string().optional(),
  statusCode: z.number().optional(),
  
  // User agent e IP
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type LogEvent = z.infer<typeof LogEventSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;

// ============================================================================
// CONFIGURAZIONE LOGGER
// ============================================================================

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSlack: boolean;
  enableAudit: boolean;
  slackWebhookUrl?: string;
  environment: string;
  version: string;
}

class StructuredLogger {
  private config: LoggerConfig;
  private logBuffer: LogEvent[] = [];
  private bufferSize = 100;
  private flushInterval = 30000; // 30 secondi
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
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

  debug(message: string, context?: Partial<LogEvent>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Partial<LogEvent>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Partial<LogEvent>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Partial<LogEvent>) {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Partial<LogEvent>) {
    this.log('fatal', message, context);
  }

  // ============================================================================
  // LOGGING STRUTTURATO
  // ============================================================================

  private log(level: LogLevel, message: string, context?: Partial<LogEvent>) {
    // Controlla se il livello è abilitato
    if (!this.shouldLog(level)) {
      return;
    }

    try {
      // Crea evento di log
      const logEvent: LogEvent = {
        level,
        message,
        timestamp: new Date(),
        environment: this.config.environment,
        version: this.config.version,
        ...context,
      };

      // Valida con Zod
      const validatedEvent = LogEventSchema.parse(logEvent);

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

    } catch (error) {
      // Fallback per errori di validazione
      console.error('Errore nel logging strutturato:', error);
      console.error('Evento originale:', { level, message, context });
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private logToConsole(event: LogEvent) {
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

  private formatContext(event: LogEvent): string {
    const parts: string[] = [];
    
    if (event.userId) parts.push(`user:${event.userId}`);
    if (event.projectId) parts.push(`project:${event.projectId}`);
    if (event.sessionId) parts.push(`session:${event.sessionId}`);
    if (event.toolRunId) parts.push(`toolRun:${event.toolRunId}`);
    if (event.route) parts.push(`route:${event.route}`);
    if (event.statusCode) parts.push(`status:${event.statusCode}`);
    if (event.duration) parts.push(`duration:${event.duration}ms`);
    
    return parts.length > 0 ? ` | ${parts.join(' | ')}` : '';
  }

  // ============================================================================
  // SLACK ALERTS
  // ============================================================================

  private async sendSlackAlert(event: LogEvent) {
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
        if (event.userId) contextFields.push({ title: 'User ID', value: event.userId, short: true });
        if (event.projectId) contextFields.push({ title: 'Project ID', value: event.projectId, short: true });
        if (event.route) contextFields.push({ title: 'Route', value: event.route, short: true });
        if (event.statusCode) contextFields.push({ title: 'Status Code', value: event.statusCode.toString(), short: true });
        
        slackMessage.attachments[0].fields.push(...contextFields);
      }

      // Aggiungi stack trace se presente
      if (event.error?.stack) {
        slackMessage.attachments[0].fields.push({
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

    } catch (error) {
      console.error('Errore nell\'invio alert Slack:', error);
    }
  }

  // ============================================================================
  // AUDIT BUFFER
  // ============================================================================

  private addToBuffer(event: LogEvent) {
    this.logBuffer.push(event);
    
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private async flushBuffer() {
    if (this.logBuffer.length === 0) {
      return;
    }

    try {
      // TODO: Implementa salvataggio su database o file
      // Per ora, logga il buffer
      console.log(`📊 Flushing ${this.logBuffer.length} log events to audit`);
      
      // Reset buffer
      this.logBuffer = [];
      
    } catch (error) {
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

// ============================================================================
// INSTANCE GLOBALE
// ============================================================================

export const logger = new StructuredLogger();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Crea un logger con contesto predefinito
 */
export function createContextLogger(context: Partial<LogEvent>) {
  return {
    debug: (message: string, additionalContext?: Partial<LogEvent>) => 
      logger.debug(message, { ...context, ...additionalContext }),
    info: (message: string, additionalContext?: Partial<LogEvent>) => 
      logger.info(message, { ...context, ...additionalContext }),
    warn: (message: string, additionalContext?: Partial<LogEvent>) => 
      logger.warn(message, { ...context, ...additionalContext }),
    error: (message: string, additionalContext?: Partial<LogEvent>) => 
      logger.error(message, { ...context, ...additionalContext }),
    fatal: (message: string, additionalContext?: Partial<LogEvent>) => 
      logger.fatal(message, { ...context, ...additionalContext }),
  };
}

/**
 * Logger per API routes
 */
export function createApiLogger(route: string, method: string, requestId: string) {
  return createContextLogger({
    route,
    method,
    requestId,
  });
}

/**
 * Logger per tool runs
 */
export function createToolLogger(toolRunId: string, userId?: string, projectId?: string) {
  return createContextLogger({
    toolRunId,
    userId,
    projectId,
  });
}

/**
 * Logger per sessioni utente
 */
export function createSessionLogger(sessionId: string, userId?: string) {
  return createContextLogger({
    sessionId,
    userId,
  });
}
