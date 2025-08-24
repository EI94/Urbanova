import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, name, subject, message, reportTitle, reportUrl } = await request.json();

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

    // Prepara i dati per l'invio email
    const emailData = {
      to,
      name,
      subject,
      message,
      reportTitle,
      reportUrl
    };

    // Invia email tramite il servizio email-working
    const response = await fetch(`${request.nextUrl.origin}/api/email-working`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        message: `Studio di Fattibilità: ${emailData.reportTitle}\n\n${emailData.message}\n\nVisualizza report: ${emailData.reportUrl}`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Errore servizio email: ${errorData.error || 'Errore sconosciuto'}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email inviata con successo tramite email-working a:', to);
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo tramite Resend',
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          provider: 'Resend (NUOVA API KEY)',
          messageId: result.data?.messageId
        }
      });
    } else {
      throw new Error('Impossibile inviare l\'email tramite email-working');
    }

  } catch (error) {
    console.error('❌ Errore critico invio email:', error);
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
