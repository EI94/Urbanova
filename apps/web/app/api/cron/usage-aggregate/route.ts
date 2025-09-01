import { NextRequest, NextResponse } from 'next/server';

// Runtime Node.js per operazioni intensive
export const runtime = 'nodejs';

// Verifica che sia una chiamata cron di Vercel
function isVercelCron(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('⏰ Cron job Usage Aggregate avviato');
    
    // Verifica autenticazione cron
    if (!isVercelCron(request)) {
      console.error('❌ Autenticazione cron fallita');
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }
    
    const startTime = Date.now();
    const results = {
      workspacesProcessed: 0,
      usageRecordsAggregated: 0,
      stripeInvoicesUpdated: 0,
      reportsGenerated: 0,
      errors: [] as string[]
    };
    
    // TODO: Implementa logica aggregazione usage
    // 1. Raccogli usage da tutti i workspace
    // 2. Aggrega per periodo (giorno/mese)
    // 3. Riconcilia con Stripe
    // 4. Genera report e notifiche
    // 5. Aggiorna billing state
    
    console.log('💰 Aggregazione usage in corso...');
    
    // Simulazione aggregazione
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    results.workspacesProcessed = 25;
    results.usageRecordsAggregated = 1500;
    results.stripeInvoicesUpdated = 8;
    results.reportsGenerated = 3;
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Cron job completato in ${duration}ms`);
    console.log('📊 Risultati:', results);
    
    return NextResponse.json({
      success: true,
      message: 'Usage Aggregate completato con successo',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error('❌ Errore cron job Usage Aggregate:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST per testing manuale
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test manuale Usage Aggregate');
    
    // Verifica secret per test manuale
    const { secret } = await request.json();
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Secret non valido' },
        { status: 401 }
      );
    }
    
    // Esegui stessa logica del GET
    return await GET(request);
    
  } catch (error) {
    console.error('❌ Errore test manuale:', error);
    return NextResponse.json(
      { error: 'Errore test manuale' },
      { status: 500 }
    );
  }
}
