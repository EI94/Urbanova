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
    console.log('⏰ Cron job Watchlists Runner avviato');
    
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
      watchlistsScanned: 0,
      newListingsFound: 0,
      notificationsSent: 0,
      errors: [] as string[]
    };
    
    // TODO: Implementa logica watchlist
    // 1. Recupera tutte le watchlist attive
    // 2. Esegui scansioni per ogni watchlist
    // 3. Identifica nuovi listing
    // 4. Invia notifiche WhatsApp
    
    console.log('🔍 Scansione watchlist in corso...');
    
    // Simulazione scansione
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    results.watchlistsScanned = 5;
    results.newListingsFound = 3;
    results.notificationsSent = 2;
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Cron job completato in ${duration}ms`);
    console.log('📊 Risultati:', results);
    
    return NextResponse.json({
      success: true,
      message: 'Watchlists Runner completato con successo',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error('❌ Errore cron job Watchlists Runner:', error);
    
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
    console.log('🧪 Test manuale Watchlists Runner');
    
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
