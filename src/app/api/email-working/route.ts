import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

    // Validazione input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Campi email, oggetto e messaggio sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    console.log('📧 Invio email con Resend...', { to, subject });

    // INIZIALIZZA RESEND CON LA NUOVA API KEY REALE
    const resend = new Resend('re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k');

    // INVIA EMAIL SEMPLICE
    const { data, error } = await resend.emails.send({
      from: 'Urbanova <noreply@urbanova.com>',
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏗️ URBANOVA</h1>
            <p>${subject}</p>
          </div>
          <div class="content">
            <p>${message}</p>
            <p><em>Inviato da Urbanova AI</em></p>
          </div>
        </body>
        </html>
      `,
      text: message
    });

    if (error) {
      console.error('❌ Errore Resend:', error);
      return NextResponse.json({
        success: false,
        error: 'Errore invio email',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('✅ Email inviata con successo:', data);

    return NextResponse.json({
      success: true,
      message: 'Email inviata con successo',
      data: {
        to,
        subject,
        timestamp: new Date().toISOString(),
        provider: 'Resend',
        messageId: data?.id
      }
    });

  } catch (error) {
    console.error('❌ Errore critico:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email Working Service - Urbanova',
    data: {
      timestamp: new Date().toISOString(),
      instructions: {
        test: 'POST con {"to": "email@example.com", "subject": "Test", "message": "Test message"}',
        note: 'Servizio email semplice e funzionante con Resend - API Key aggiornata'
      }
    }
  });
}
