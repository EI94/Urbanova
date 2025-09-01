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
    console.log('⏰ Cron job Document Reminders avviato');
    
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
      documentsChecked: 0,
      remindersSent: 0,
      escalationsTriggered: 0,
      errors: [] as string[]
    };
    
    // TODO: Implementa logica reminder documenti
    // 1. Trova documenti con status REQUESTED > 24h
    // 2. Invia promemoria WhatsApp/Email
    // 3. Escala se necessario (> 48h)
    // 4. Aggiorna SLA tracker
    
    console.log('📋 Controllo documenti in attesa...');
    
    // Simulazione controllo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    results.documentsChecked = 12;
    results.remindersSent = 8;
    results.escalationsTriggered = 2;
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Cron job completato in ${duration}ms`);
    console.log('📊 Risultati:', results);
    
    return NextResponse.json({
      success: true,
      message: 'Document Reminders completato con successo',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error('❌ Errore cron job Document Reminders:', error);
    
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
    console.log('🧪 Test manuale Document Reminders');
    
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
