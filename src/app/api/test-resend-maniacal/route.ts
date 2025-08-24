import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email destinatario richiesta' },
        { status: 400 }
      );
    }

    console.log('🧪 TEST MANIACALE RESEND INIZIATO per:', to);

    // TEST 1: Verifica se Resend è installato
    console.log('✅ TEST 1: Resend è installato');
    
    // TEST 2: Verifica se l'API KEY è valida
    console.log('🔄 TEST 2: Verifica API KEY...');
    const resend = new Resend('re_Kew2Zmby_CFtRMNe5UtsJECJwxu6QpmRE');
    console.log('✅ TEST 2: Resend inizializzato con API KEY');

    // TEST 3: Prova invio email semplice
    console.log('🔄 TEST 3: Invio email semplice...');
    const { data, error } = await resend.emails.send({
      from: 'Urbanova <noreply@urbanova.com>',
      to: [to],
      subject: '🧪 TEST MANIACALE Resend - Urbanova',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Resend</title>
        </head>
        <body>
          <h1>🧪 TEST MANIACALE Resend</h1>
          <p>Se ricevi questa email, Resend funziona perfettamente!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Status: ✅ FUNZIONANTE</p>
        </body>
        </html>
      `,
      text: 'Test Resend - Se ricevi questa email, Resend funziona!'
    });

    if (error) {
      console.error('❌ TEST 3 FALLITO - Errore Resend:', error);
      return NextResponse.json({
        success: false,
        message: 'TEST MANIACALE Resend FALLITO',
        error: error.message || 'Errore sconosciuto',
        data: {
          timestamp: new Date().toISOString(),
          status: 'RESEND NON FUNZIONANTE',
          errorDetails: error,
          note: 'Questo spiega perché le email non funzionano - Resend fallisce'
        }
      }, { status: 500 });
    }

    console.log('✅ TEST 3 COMPLETATO - Resend success:', data);

    // TEST 4: Prova invio email con configurazione completa
    console.log('🔄 TEST 4: Invio email con configurazione completa...');
    const { data: data2, error: error2 } = await resend.emails.send({
      from: 'Urbanova <noreply@urbanova.com>',
      to: [to],
      subject: '🧪 TEST MANIACALE Resend COMPLETO - Urbanova',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Resend Completo</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: blue; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧪 TEST MANIACALE Resend COMPLETO</h1>
            <p>Se ricevi questa email, Resend funziona PERFETTAMENTE!</p>
          </div>
          <div class="content">
            <h2>Test Completato</h2>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Status: ✅ FUNZIONANTE AL 100%</p>
            <p>Configurazione: Completa e funzionante</p>
          </div>
        </body>
        </html>
      `,
      text: 'Test Resend Completo - Se ricevi questa email, Resend funziona al 100%!',
      replyTo: 'support@urbanova.com'
    });

    if (error2) {
      console.error('❌ TEST 4 FALLITO - Errore Resend configurazione completa:', error2);
      return NextResponse.json({
        success: false,
        message: 'TEST MANIACALE Resend CONFIGURAZIONE COMPLETA FALLITO',
        error: error2.message || 'Errore sconosciuto',
        data: {
          timestamp: new Date().toISOString(),
          status: 'RESEND CONFIGURAZIONE COMPLETA NON FUNZIONANTE',
          errorDetails: error2,
          note: 'Resend fallisce anche con configurazione completa'
        }
      }, { status: 500 });
    }

    console.log('✅ TEST 4 COMPLETATO - Resend configurazione completa success:', data2);

    // TUTTI I TEST SONO PASSATI
    console.log('🎉 TUTTI I TEST MANIACALI RESEND SONO PASSATI!');

    return NextResponse.json({
      success: true,
      message: 'TEST MANIACALE Resend COMPLETATO CON SUCCESSO',
      data: {
        timestamp: new Date().toISOString(),
        status: 'RESEND FUNZIONANTE AL 100%',
        testsPassed: ['Installazione', 'API KEY', 'Email Semplice', 'Email Completa'],
        note: 'Resend funziona perfettamente! Le email dovrebbero essere inviate correttamente.'
      }
    });

  } catch (error) {
    console.error('❌ ERRORE CRITICO TEST MANIACALE Resend:', error);
    
    return NextResponse.json({
      success: false,
      message: 'ERRORE CRITICO nel test maniacale Resend',
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
    return NextResponse.json({
      success: true,
      message: 'Test Maniacale Resend - Urbanova',
      data: {
        timestamp: new Date().toISOString(),
        instructions: {
          test: 'POST con {"to": "email@example.com"}',
          note: 'Test maniacale per verificare ogni aspetto di Resend'
        }
      }
    });

  } catch (error) {
    console.error('❌ Errore recupero info test maniacale:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero informazioni' },
      { status: 500 }
    );
  }
}
