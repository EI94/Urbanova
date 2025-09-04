import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@urbanova/infra';

/**
 * Endpoint interno per gestione alert Slack
 * 
 * Questo endpoint:
 * - Aggrega errori 5xx e invia batch a Slack
 * - Gestisce rate limiting per evitare spam
 * - Fornisce statistiche su errori
 */

// ============================================================================
// TIPI E INTERFACCE
// ============================================================================

interface ErrorAlert {
  id: string;
  timestamp: Date;
  route: string;
  method: string;
  statusCode: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  projectId?: string;
  sessionId?: string;
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
  payloadHash?: string;
}

interface SlackAlertBatch {
  errors: ErrorAlert[];
  count: number;
  timeWindow: string;
  environment: string;
}

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ALERT_BATCH_SIZE = 5;
const ALERT_TIME_WINDOW = 5 * 60 * 1000; // 5 minuti
const MAX_ALERTS_PER_HOUR = 20;

// Buffer per aggregare errori
const errorBuffer: ErrorAlert[] = [];
const alertCounts = new Map<string, number>(); // IP -> count
const lastAlertTime = new Map<string, number>(); // IP -> timestamp

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function hashPayload(payload: any): string {
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

function shouldSendAlert(ipAddress: string): boolean {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  // Reset counter se è passata un'ora
  if (!lastAlertTime.has(ipAddress) || lastAlertTime.get(ipAddress)! < hourAgo) {
    alertCounts.set(ipAddress, 0);
    lastAlertTime.set(ipAddress, now);
  }
  
  const currentCount = alertCounts.get(ipAddress) || 0;
  return currentCount < MAX_ALERTS_PER_HOUR;
}

function incrementAlertCount(ipAddress: string): void {
  const currentCount = alertCounts.get(ipAddress) || 0;
  alertCounts.set(ipAddress, currentCount + 1);
  lastAlertTime.set(ipAddress, Date.now());
}

// ============================================================================
// SLACK INTEGRATION
// ============================================================================

async function sendSlackAlert(batch: SlackAlertBatch): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    logger.warn('SLACK_WEBHOOK_URL non configurato, alert non inviato', '');
    return false;
  }

  try {
    const color = batch.count >= 10 ? '#ff0000' : '#ff6600';
    const emoji = batch.count >= 10 ? '🚨' : '⚠️';
    
    const slackMessage = {
      text: `${emoji} Urbanova 5xx Error Spike Alert`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Error Count',
              value: batch.count.toString(),
              short: true,
            },
            {
              title: 'Time Window',
              value: batch.timeWindow,
              short: true,
            },
            {
              title: 'Environment',
              value: batch.environment,
              short: true,
            },
            {
              title: 'Affected Routes',
              value: [...new Set(batch.errors.map(e => e.route))].join(', '),
              short: false,
            },
          ],
        },
      ],
    };

    // Aggiungi dettagli sui primi 3 errori
    if (batch.errors.length > 0) {
      const errorDetails = batch.errors.slice(0, 3).map(error => 
        `• ${error.method} ${error.route} (${error.statusCode}) - ${error.error.message}`
      ).join('\n');
      
      slackMessage.attachments[0]?.fields?.push({
        title: 'Recent Errors',
        value: `\`\`\`${errorDetails}\`\`\``,
        short: false,
      });
    }

    // Invia a Slack
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
    }

    logger.info('Alert Slack inviato con successo', `errorCount: ${batch.count}, timeWindow: ${batch.timeWindow}`);

    return true;

  } catch (error) {
    logger.error('Errore nell\'invio alert Slack', `error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      route, 
      method, 
      statusCode, 
      error, 
      userId, 
      projectId, 
      sessionId,
      payload 
    } = body;

    // Valida che sia un errore 5xx
    if (!statusCode || statusCode < 500 || statusCode >= 600) {
      return NextResponse.json(
        { error: 'Solo errori 5xx sono supportati' },
        { status: 400 }
      );
    }

    // Estrai IP e User Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Controlla rate limiting
    if (!shouldSendAlert(ipAddress)) {
      logger.warn('Rate limit raggiunto per alert Slack', `ipAddress: ${ipAddress}`);
      return NextResponse.json(
        { error: 'Rate limit raggiunto' },
        { status: 429 }
      );
    }

    // Crea alert
    const alert: ErrorAlert = {
      id: generateRequestId(),
      timestamp: new Date(),
      route: route || 'unknown',
      method: method || 'unknown',
      statusCode,
      error: {
        name: error?.name || 'UnknownError',
        message: error?.message || 'Unknown error',
        stack: error?.stack,
      },
      userId,
      projectId,
      sessionId,
      requestId: generateRequestId(),
      userAgent,
      ipAddress,
      payloadHash: payload ? hashPayload(payload) : undefined,
    } as ErrorAlert;

    // Aggiungi al buffer
    errorBuffer.push(alert);

    // Log dell'errore
    logger.error('Errore 5xx rilevato', `route: ${alert.route}, method: ${alert.method}, statusCode: ${alert.statusCode}, error: ${alert.error.message}`);

    // Controlla se inviare alert batch
    if (errorBuffer.length >= ALERT_BATCH_SIZE) {
      const batch: SlackAlertBatch = {
        errors: [...errorBuffer],
        count: errorBuffer.length,
        timeWindow: `${ALERT_TIME_WINDOW / 1000 / 60} minutes`,
        environment: process.env.NODE_ENV || 'development',
      };

      const sent = await sendSlackAlert(batch);
      
      if (sent) {
        incrementAlertCount(ipAddress);
        errorBuffer.length = 0; // Clear buffer
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Alert registrato',
      alertId: alert.id,
      bufferSize: errorBuffer.length,
    });

  } catch (error) {
    logger.error('Errore nell\'endpoint alert', `error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Statistiche sugli alert
    const stats = {
      bufferSize: errorBuffer.length,
      alertCounts: Object.fromEntries(alertCounts),
      lastAlertTimes: Object.fromEntries(lastAlertTime),
      environment: process.env.NODE_ENV || 'development',
      slackConfigured: !!SLACK_WEBHOOK_URL,
    };

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('Errore nel recupero statistiche alert', `error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
