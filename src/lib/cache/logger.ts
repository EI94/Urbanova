/**
 * Sistema di Logging Production-Ready
 * Winston logger con rotazione file, formattazione e livelli
 */

import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';

// Crea directory logs se non esiste
const logsDir = path.join(process.cwd(), 'logs');
fs.mkdir(logsDir, { recursive: true }).catch(() => {
  // Directory già esiste
});

// Formato personalizzato per i log
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Formato per console (più leggibile)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level} ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Configurazione trasporti
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat
  }),
  
  // File transport per tutti i log
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'debug',
    format: customFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // File transport per errori
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // File transport per warning
  new winston.transports.File({
    filename: path.join(logsDir, 'warn.log'),
    level: 'warn',
    format: customFormat,
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 3,
    tailable: true
  })
];

// Aggiungi transport per access log se richiesto
if (process.env.ENABLE_ACCESS_LOG === 'true') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      tailable: true
    })
  );
}

// Crea logger principale
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
});

// Logger specializzato per API
export const apiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'api.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      tailable: true
    })
  ],
  exitOnError: false
});

// Logger specializzato per database
export const dbLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'database.log'),
      maxsize: 15 * 1024 * 1024, // 15MB
      maxFiles: 5,
      tailable: true
    })
  ],
  exitOnError: false
});

// Logger specializzato per cache
export const cacheLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'cache.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
      tailable: true
    })
  ],
  exitOnError: false
});

// Logger specializzato per performance
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
      tailable: true
    })
  ],
  exitOnError: false
});

// Interfaccia per log strutturati
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  query?: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
  error?: Error;
  [key: string]: any;
}

// Funzioni di utilità per logging
export class LoggerService {
  /**
   * Log di richiesta API
   */
  static logApiRequest(context: LogContext): void {
    apiLogger.info('API Request', {
      method: context.method,
      endpoint: context.endpoint,
      ip: context.ip,
      userAgent: context.userAgent,
      userId: context.userId,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di risposta API
   */
  static logApiResponse(context: LogContext): void {
    apiLogger.info('API Response', {
      method: context.method,
      endpoint: context.endpoint,
      statusCode: context.statusCode,
      responseTime: context.responseTime,
      userId: context.userId,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di errore API
   */
  static logApiError(context: LogContext): void {
    apiLogger.error('API Error', {
      method: context.method,
      endpoint: context.endpoint,
      statusCode: context.statusCode,
      error: context.error?.message,
      stack: context.error?.stack,
      userId: context.userId,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di query database
   */
  static logDbQuery(query: string, params: any[], duration: number): void {
    dbLogger.info('Database Query', {
      query: query.substring(0, 200), // Tronca query lunghe
      params: params.length,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di errore database
   */
  static logDbError(query: string, error: Error, params: any[]): void {
    dbLogger.error('Database Error', {
      query: query.substring(0, 200),
      params: params.length,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di operazione cache
   */
  static logCacheOperation(operation: string, key: string, hit: boolean, duration?: number): void {
    cacheLogger.info('Cache Operation', {
      operation,
      key: key.substring(0, 100), // Tronca chiavi lunghe
      hit,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di errore cache
   */
  static logCacheError(operation: string, key: string, error: Error): void {
    cacheLogger.error('Cache Error', {
      operation,
      key: key.substring(0, 100),
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di performance
   */
  static logPerformance(operation: string, duration: number, details?: Record<string, any>): void {
    performanceLogger.info('Performance', {
      operation,
      duration,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di sicurezza
   */
  static logSecurity(event: string, context: LogContext): void {
    logger.warn('Security Event', {
      event,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di business logic
   */
  static logBusinessEvent(event: string, context: LogContext): void {
    logger.info('Business Event', {
      event,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log di audit
   */
  static logAudit(action: string, context: LogContext): void {
    logger.info('Audit', {
      action,
      ...context,
      timestamp: new Date().toISOString()
    });
  }
}

// Middleware per Express
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Aggiungi request ID al request
  req.requestId = requestId;
  
  // Log richiesta
  LoggerService.logApiRequest({
    method: req.method,
    endpoint: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    requestId,
    query: req.query,
    params: req.params,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Override res.end per loggare la risposta
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const duration = Date.now() - startTime;
    
    LoggerService.logApiResponse({
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      responseTime: duration,
      userId: req.user?.id,
      requestId
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Funzione per loggare errori non gestiti
export const setupErrorHandling = (): void => {
  // Log errori non gestiti
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // In produzione, esci dal processo
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Log promise rejection non gestite
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
  });

  // Log warning
  process.on('warning', (warning) => {
    logger.warn('Process Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
      timestamp: new Date().toISOString()
    });
  });
};

// Inizializza error handling
setupErrorHandling();

export default logger;
