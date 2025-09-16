/**
 * API Health Check Production-Ready
 * Monitoring completo di database, cache, e servizi esterni
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { redisClient } from '@/lib/cache/redisClient';
import { LoggerService } from '@/lib/cache/logger';

// Interfaccia per lo stato di un servizio
interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  details?: Record<string, any>;
}

// Interfaccia per la risposta health check
interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  services: ServiceStatus[];
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
  responseTime: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log della richiesta
  LoggerService.logApiRequest({
    method: 'GET',
    endpoint: '/api/health',
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    requestId
  });

  try {
    const services: ServiceStatus[] = [];
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Health check Database
    try {
      const dbHealth = await db.healthCheck();
      services.push({
        name: 'database',
        status: dbHealth.status,
        latency: dbHealth.latency,
        error: dbHealth.error,
        details: dbHealth.stats
      });
      
      if (dbHealth.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (dbHealth.status === 'degraded') {
        overallStatus = 'degraded';
      }
    } catch (error) {
      services.push({
        name: 'database',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      overallStatus = 'unhealthy';
    }

    // Health check Redis
    try {
      const redisHealth = await redisClient.healthCheck();
      services.push({
        name: 'redis',
        status: redisHealth.status,
        latency: redisHealth.latency,
        error: redisHealth.error
      });
      
      if (redisHealth.status === 'unhealthy') {
        overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      }
    } catch (error) {
      services.push({
        name: 'redis',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }

    // Health check File System
    try {
      const fs = require('fs').promises;
      const testFile = '/tmp/health-check-test';
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      services.push({
        name: 'filesystem',
        status: 'healthy'
      });
    } catch (error) {
      services.push({
        name: 'filesystem',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }

    // Health check Memory
    try {
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const freeMem = require('os').freemem();
      const usedMem = totalMem - freeMem;
      const memPercentage = (usedMem / totalMem) * 100;
      
      services.push({
        name: 'memory',
        status: memPercentage > 90 ? 'unhealthy' : memPercentage > 80 ? 'degraded' : 'healthy',
        details: {
          used: Math.round(usedMem / 1024 / 1024), // MB
          total: Math.round(totalMem / 1024 / 1024), // MB
          percentage: Math.round(memPercentage)
        }
      });
      
      if (memPercentage > 90) {
        overallStatus = 'unhealthy';
      } else if (memPercentage > 80 && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    } catch (error) {
      services.push({
        name: 'memory',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }

    // Health check CPU (simulato)
    try {
      const cpuUsage = process.cpuUsage();
      const cpuPercentage = (cpuUsage.user + cpuUsage.system) / 1000000; // Converti da microsecondi
      
      services.push({
        name: 'cpu',
        status: cpuPercentage > 80 ? 'unhealthy' : cpuPercentage > 60 ? 'degraded' : 'healthy',
        details: {
          usage: Math.round(cpuPercentage)
        }
      });
      
      if (cpuPercentage > 80) {
        overallStatus = 'unhealthy';
      } else if (cpuPercentage > 60 && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    } catch (error) {
      services.push({
        name: 'cpu',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }

    // Ottieni informazioni di sistema
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * 100;

    const responseData: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      services,
      system: {
        memory: {
          used: Math.round(usedMem / 1024 / 1024), // MB
          total: Math.round(totalMem / 1024 / 1024), // MB
          percentage: Math.round(memPercentage)
        },
        cpu: {
          usage: Math.round((process.cpuUsage().user + process.cpuUsage().system) / 1000000)
        }
      },
      responseTime: Date.now() - startTime
    };

    // Determina status code HTTP
    const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503;

    // Log della risposta
    LoggerService.logApiResponse({
      method: 'GET',
      endpoint: '/api/health',
      statusCode,
      responseTime: responseData.responseTime,
      requestId
    });

    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    LoggerService.logApiError({
      method: 'GET',
      endpoint: '/api/health',
      statusCode: 500,
      error: error as Error,
      requestId
    });

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: 'Errore durante il controllo dello stato del sistema',
      responseTime: executionTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    
    // Log della richiesta
    LoggerService.logApiRequest({
      method: 'POST',
      endpoint: '/api/health',
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestId,
      body
    });

    // Health check dettagliato con parametri specifici
    const { services: requestedServices = ['all'] } = body;
    
    const services: ServiceStatus[] = [];
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Esegui health check solo per i servizi richiesti
    if (requestedServices.includes('all') || requestedServices.includes('database')) {
      try {
        const dbHealth = await db.healthCheck();
        services.push({
          name: 'database',
          status: dbHealth.status,
          latency: dbHealth.latency,
          error: dbHealth.error,
          details: dbHealth.stats
        });
        
        if (dbHealth.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (dbHealth.status === 'degraded') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        services.push({
          name: 'database',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        overallStatus = 'unhealthy';
      }
    }

    if (requestedServices.includes('all') || requestedServices.includes('redis')) {
      try {
        const redisHealth = await redisClient.healthCheck();
        services.push({
          name: 'redis',
          status: redisHealth.status,
          latency: redisHealth.latency,
          error: redisHealth.error
        });
        
        if (redisHealth.status === 'unhealthy') {
          overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
        }
      } catch (error) {
        services.push({
          name: 'redis',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      }
    }

    const responseData: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      services,
      system: {
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        },
        cpu: {
          usage: 0
        }
      },
      responseTime: Date.now() - startTime
    };

    // Determina status code HTTP
    const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503;

    // Log della risposta
    LoggerService.logApiResponse({
      method: 'POST',
      endpoint: '/api/health',
      statusCode,
      responseTime: responseData.responseTime,
      requestId
    });

    return NextResponse.json(responseData, { status: statusCode });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    LoggerService.logApiError({
      method: 'POST',
      endpoint: '/api/health',
      statusCode: 500,
      error: error as Error,
      requestId
    });

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: 'Errore durante il controllo dello stato del sistema',
      responseTime: executionTime
    }, { status: 500 });
  }
}