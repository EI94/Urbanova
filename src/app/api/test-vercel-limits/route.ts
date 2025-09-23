/**
 * Test Limiti Vercel per Import ISTAT
 * Verifica timeout, memory, network limits
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testando limiti Vercel...');
    
    // Test 1: Memory usage
    const memoryUsage = process.memoryUsage();
    console.log('📊 Memory usage:', memoryUsage);
    
    // Test 2: Network request timeout
    console.log('🌐 Testando network request...');
    const networkStart = Date.now();
    
    try {
      const response = await fetch('https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv', {
        method: 'HEAD', // Solo header per testare connessione
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Urbanova/1.0)'
        }
      });
      
      const networkTime = Date.now() - networkStart;
      console.log(`✅ Network test: ${response.status} in ${networkTime}ms`);
      
      return NextResponse.json({
        success: true,
        message: 'Test limiti Vercel completato',
        data: {
          memoryUsage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
            external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
          },
          networkTest: {
            status: response.status,
            timeMs: networkTime,
            headers: Object.fromEntries(response.headers.entries())
          },
          vercelLimits: {
            maxMemory: '1024MB',
            maxTimeout: '60s',
            maxPayload: '4.5MB',
            environment: process.env.VERCEL_ENV || 'unknown'
          },
          executionTime: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (networkError: any) {
      const networkTime = Date.now() - networkStart;
      console.error('❌ Network test failed:', networkError.message);
      
      return NextResponse.json({
        success: false,
        message: 'Network test failed',
        error: networkError.message,
        data: {
          memoryUsage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
          },
          networkTest: {
            error: networkError.message,
            timeMs: networkTime,
            code: networkError.code
          },
          executionTime: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error: any) {
    console.error('❌ Test limiti Vercel failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Testando download ISTAT completo...');
    
    // Test download completo del dataset ISTAT
    const downloadStart = Date.now();
    
    const response = await fetch('https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Urbanova/1.0)',
        'Accept': 'text/csv,text/plain,*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const downloadTime = Date.now() - downloadStart;
    
    console.log(`✅ Download completato: ${csvData.length} caratteri in ${downloadTime}ms`);
    
    // Test parsing
    const parseStart = Date.now();
    const lines = csvData.split('\n');
    const parseTime = Date.now() - parseStart;
    
    console.log(`✅ Parsing completato: ${lines.length} righe in ${parseTime}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Test download ISTAT completato',
      data: {
        download: {
          sizeBytes: csvData.length,
          sizeKB: Math.round(csvData.length / 1024),
          timeMs: downloadTime,
          speedKBps: Math.round(csvData.length / 1024 / (downloadTime / 1000))
        },
        parsing: {
          lines: lines.length,
          timeMs: parseTime,
          avgTimePerLine: Math.round(parseTime / lines.length * 100) / 100
        },
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
        },
        executionTime: Date.now() - startTime,
        sample: lines.slice(0, 3) // Prime 3 righe per debug
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Test download ISTAT failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
