import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      checks: {
        database: await checkDatabase(),
        external_apis: await checkExternalAPIs(),
        memory: checkMemory(),
        disk: checkDisk(),
      },
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ...healthStatus,
        response_time_ms: responseTime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

async function checkDatabase(): Promise<{ status: string; details?: any }> {
  try {
    // Mock database check - replace with actual database health check
    // Example: await db.query('SELECT 1')

    return {
      status: 'healthy',
      details: {
        connection: 'active',
        response_time_ms: Math.random() * 10,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
    };
  }
}

async function checkExternalAPIs(): Promise<{ status: string; details?: any }> {
  try {
    // Check critical external APIs
    const apis = [
      { name: 'Stripe', url: 'https://api.stripe.com/v1/charges', timeout: 5000 },
      { name: 'Firebase', url: 'https://firebase.googleapis.com', timeout: 5000 },
      { name: 'Google Cloud', url: 'https://storage.googleapis.com', timeout: 5000 },
    ];

    const results = await Promise.allSettled(
      apis.map(async api => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), api.timeout);

        try {
          const response = await fetch(api.url, {
            method: 'HEAD',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          return {
            name: api.name,
            status: response.ok ? 'healthy' : 'unhealthy',
            status_code: response.status,
          };
        } catch (error) {
          clearTimeout(timeoutId);
          return {
            name: api.name,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Connection failed',
          };
        }
      })
    );

    const apiResults = results.map((result, index) => ({
      ...(result.status === 'fulfilled'
        ? result.value
        : {
            name: apis[index]?.name || 'unknown',
            status: 'unhealthy',
            error: result.reason?.message || 'Unknown error',
          }),
    }));

    const healthyCount = apiResults.filter(api => api.status === 'healthy').length;
    const totalCount = apiResults.length;

    return {
      status: healthyCount === totalCount ? 'healthy' : 'degraded',
      details: {
        healthy_apis: healthyCount,
        total_apis: totalCount,
        apis: apiResults,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'External API check failed',
      },
    };
  }
}

function checkMemory(): { status: string; details: any } {
  try {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const freeMem = totalMem - usedMem;
    const usagePercent = (usedMem / totalMem) * 100;

    return {
      status: usagePercent < 90 ? 'healthy' : 'warning',
      details: {
        heap_used_mb: Math.round(usedMem / 1024 / 1024),
        heap_total_mb: Math.round(totalMem / 1024 / 1024),
        heap_free_mb: Math.round(freeMem / 1024 / 1024),
        usage_percent: Math.round(usagePercent * 100) / 100,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Memory check failed',
      },
    };
  }
}

function checkDisk(): { status: string; details: any } {
  try {
    // Mock disk check - in production, use actual disk space check
    // Example: require('fs').statSync('/').size

    return {
      status: 'healthy',
      details: {
        available_space_mb: 1024 * 1024, // Mock value
        usage_percent: 45, // Mock value
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Disk check failed',
      },
    };
  }
}

// ============================================================================
// READINESS CHECK
// ============================================================================

export async function HEAD(request: NextRequest) {
  // Simple readiness check for load balancers
  try {
    // Quick checks without external API calls
    const quickChecks = {
      memory: checkMemory(),
      disk: checkDisk(),
    };

    const allHealthy = Object.values(quickChecks).every(check => check.status === 'healthy');

    return new NextResponse(null, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
