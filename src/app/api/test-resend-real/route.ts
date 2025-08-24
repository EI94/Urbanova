import { NextRequest, NextResponse } from 'next/server';
import { realResendEmailService } from '@/lib/realResendEmailService';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email destinatario richiesta' },
        { status: 400 }
      );
    }

    console.log('🧪 TEST RESEND REALE INIZIATO per:', to);

    // TEST 1: Verifica stato servizio
    console.log('✅ TEST 1: Verifica stato servizio...');
    const serviceStatus = realResendEmailService.getServiceStatus();
    console.log('✅ Stato servizio:', serviceStatus);

    // TEST 2: Test email reale
    console.log('🔄 TEST 2: Invio email reale...');
    const success = await realResendEmailService.testEmail(to);

    if (success) {
      console.log('✅ TEST 2 COMPLETATO - Email inviata con successo!');
      
      return NextResponse.json({
        success: true,
        message: 'TEST RESEND REALE COMPLETATO CON SUCCESSO',
        data: {
          timestamp: new Date().toISOString(),
          status: 'RESEND FUNZIONANTE AL 100%',
          recipient: to,
          serviceStatus,
          note: 'Se ricevi questa email, Resend funziona perfettamente!'
        }
      });
    } else {
      console.error('❌ TEST 2 FALLITO - Email non inviata');
      
      return NextResponse.json({
        success: false,
        message: 'TEST RESEND REALE FALLITO',
        error: 'Email non inviata tramite Resend',
        data: {
          timestamp: new Date().toISOString(),
          status: 'RESEND NON FUNZIONANTE',
          recipient: to,
          serviceStatus,
          note: 'Questo spiega perché le email non funzionano - Resend fallisce'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ ERRORE CRITICO TEST RESEND REALE:', error);
    
    return NextResponse.json({
      success: false,
      message: 'ERRORE CRITICO nel test Resend reale',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      data: {
        timestamp: new Date().toISOString(),
        status: 'ERRORE CRITICO RESEND',
        note: 'Questo spiega perché le email non funzionano - Errore critico in Resend'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const serviceStatus = realResendEmailService.getServiceStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Test Resend Reale - Urbanova',
      data: {
        timestamp: new Date().toISOString(),
        serviceStatus,
        instructions: {
          test: 'POST con {"to": "email@example.com"}',
          note: 'Test reale per verificare che Resend funzioni effettivamente'
        }
      }
    });

  } catch (error) {
    console.error('❌ Errore recupero info test Resend reale:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero informazioni' },
      { status: 500 }
    );
  }
}
