import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware per catturare errori 5xx e inviare alert Slack
 * 
 * Questo middleware:
 * - Intercetta tutte le richieste API
 * - Cattura errori 5xx e li invia al sistema di alert
 * - Implementa rate limiting per IP
 * - Fornisce logging strutturato
 */

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 richieste per minuto
const RATE_LIMIT_MAX_ERRORS = 10; // 10 errori 5xx per minuto

// Store per rate limiting (in produzione usare Redis)
const rateLimitStore = new Map<string, { count: number; errors: number; resetTime: number }>();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(ip: string, isError: boolean = false): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset o nuovo IP
    rateLimitStore.set(key, {
      count: 1,
      errors: isError ? 1 : 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Incrementa contatori
  current.count++;
  if (isError) {
    current.errors++;
  }

  // Controlla limiti
  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  if (isError && current.errors > RATE_LIMIT_MAX_ERRORS) {
    return true;
  }

  return false;
}

async function sendErrorAlert(
  request: NextRequest,
  response: NextResponse,
  error?: Error
): Promise<void> {
  try {
    const ip = getClientIP(request);
    const route = request.nextUrl.pathname;
    const method = request.method;
    const statusCode = response.status;

    // Invia alert al sistema interno
    await fetch(`${request.nextUrl.origin}/api/internal/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
        'user-agent': request.headers.get('user-agent') || 'unknown',
      },
      body: JSON.stringify({
        route,
        method,
        statusCode,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent'),
      }),
    });

  } catch (alertError) {
    // Non bloccare la risposta per errori di alert
    console.error('Errore nell\'invio alert:', alertError);
  }
}

// ============================================================================
// MIDDLEWARE PRINCIPALE
// ============================================================================

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const route = request.nextUrl.pathname;
  const method = request.method;

  // Log della richiesta
  console.log(`[${new Date().toISOString()}] INFO API Request | route:${route} | method:${method} | ip:${ip}`);

  // Controlla rate limiting
  if (isRateLimited(ip)) {
    console.warn(`[${new Date().toISOString()}] WARN Rate limit exceeded | route:${route} | method:${method} | ip:${ip}`);

    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    // Continua con la richiesta
    const response = NextResponse.next();

    // Calcola durata
    const duration = Date.now() - startTime;

    // Log della risposta
    console.log(`[${new Date().toISOString()}] INFO API Response | route:${route} | method:${method} | status:${response.status} | duration:${duration}ms | ip:${ip}`);

    // Controlla se è un errore 5xx
    if (response.status >= 500 && response.status < 600) {
      console.error(`[${new Date().toISOString()}] ERROR 5xx Error detected | route:${route} | method:${method} | status:${response.status} | duration:${duration}ms | ip:${ip}`);

      // Controlla rate limiting per errori
      if (isRateLimited(ip, true)) {
        console.warn(`[${new Date().toISOString()}] WARN Error rate limit exceeded | route:${route} | method:${method} | ip:${ip}`);
      } else {
        // Invia alert Slack
        await sendErrorAlert(request, response);
      }
    }

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[${new Date().toISOString()}] ERROR Middleware error | route:${route} | method:${method} | duration:${duration}ms | ip:${ip}`, error);

    // Invia alert per errori del middleware
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );

    await sendErrorAlert(request, errorResponse, error as Error);

    return errorResponse;
  }
}

// ============================================================================
// CONFIGURAZIONE MIDDLEWARE
// ============================================================================

export const config = {
  matcher: [
    // Intercetta tutte le API routes
    '/api/:path*',
    // Escludi health check e alert interni
    '/((?!api/health|api/internal/alerts).*)',
  ],
};
