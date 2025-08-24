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

    console.log('🧪 TEST RESEND DIRETTO per:', to);

    // INIZIALIZZA RESEND DIRETTAMENTE
    const resend = new Resend('re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k');
    console.log('✅ Resend inizializzato con API key');

    // TEST EMAIL SEMPLICE
    const { data, error } = await resend.emails.send({
      from: 'Urbanova <noreply@urbanova.com>',
      to: [to],
      subject: '🧪 TEST Resend Diretto - Urbanova',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Resend Diretto</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧪 TEST RESEND DIRETTO</h1>
            <p>Se ricevi questa email, Resend funziona PERFETTAMENTE!</p>
          </div>
          <div class="content">
            <h2>Test Completato</h2>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Status: ✅ FUNZIONANTE AL 100%</p>
            <p>API Key: re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k</p>
          </div>
        </body>
        </html>
      `,
      text: 'Test Resend Diretto - Se ricevi questa email, Resend funziona al 100%!'
    });

    if (error) {
      console.error('❌ Errore Resend:', error);
      return NextResponse.json({
        success: false,
        message: 'TEST RESEND DIRETTO FALLITO',
        error: error.message,
        data: {
          timestamp: new Date().toISOString(),
          status: 'RESEND NON FUNZIONANTE',
          errorDetails: error
        }
      }, { status: 500 });
    }

    console.log('✅ TEST RESEND DIRETTO COMPLETATO:', data);

    return NextResponse.json({
      success: true,
      message: 'TEST RESEND DIRETTO COMPLETATO CON SUCCESSO',
      data: {
        timestamp: new Date().toISOString(),
        status: 'RESEND FUNZIONANTE AL 100%',
        recipient: to,
        messageId: data?.id
      }
    });

  } catch (error) {
    console.error('❌ ERRORE CRITICO TEST RESEND DIRETTO:', error);
    
    return NextResponse.json({
      success: false,
      message: 'ERRORE CRITICO nel test Resend diretto',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      data: {
        timestamp: new Date().toISOString(),
        status: 'ERRORE CRITICO RESEND',
        note: 'Questo spiega perché le email non funzionano'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test Resend Diretto - Urbanova',
    data: {
      timestamp: new Date().toISOString(),
      instructions: {
        test: 'POST con {"to": "email@example.com"}',
        note: 'Test diretto Resend senza deleghe'
      }
    }
  });
}
