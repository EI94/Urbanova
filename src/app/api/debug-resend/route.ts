import { NextRequest, NextResponse } from 'next/server';

import { resendDebugService } from '@/lib/resendDebugService';

export async function POST(request: NextRequest) {
  try {
    const { to, name, subject, message } = await request.json();

    console.log('🔍 DEBUG RESEND - Dati ricevuti:', { to, subject });

    // Validazione input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Campi email, oggetto e messaggio sono obbligatori' },
        { status: 400 }
      );
    }

    // DEBUG COMPLETO RESEND
    console.log('🔄 Debug completo Resend...');

    const debugResult = await resendDebugService.sendEmailWithDebug({
      to,
      name,
      subject,
      message,
      reportTitle: 'Debug Resend',
      reportUrl: 'https://urbanova.life/debug',
    });

    console.log('📊 Risultato debug Resend:', debugResult);

    return NextResponse.json({
      success: true,
      message: 'Debug Resend completato',
      data: debugResult,
    });
  } catch (error) {
    console.error('❌ Errore debug Resend:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il debug di Resend',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG RESEND - Test dominio...');

    // TEST DOMINIO RESEND
    const domainTestResult = await resendDebugService.testResendDomain();

    console.log('📊 Test dominio risultato:', domainTestResult);

    return NextResponse.json({
      success: true,
      message: 'Test dominio Resend completato',
      data: domainTestResult,
    });
  } catch (error) {
    console.error('❌ Errore test dominio Resend:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il test dominio di Resend',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
