import { NextRequest, NextResponse } from 'next/server';
import { realResendEmailService } from '@/lib/realResendEmailService';

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

    // Invia email tramite il servizio Resend REALE
    const success = await realResendEmailService.sendEmail(emailData);

    if (success) {
      console.log('✅ Email inviata con successo con Resend REALE a:', to);
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo tramite Resend',
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          provider: 'Resend (REALE)',
          serviceStatus: realResendEmailService.getServiceStatus()
        }
      });
    } else {
      throw new Error('Impossibile inviare l\'email tramite Resend');
    }

  } catch (error) {
    console.error('❌ Errore critico invio email Resend:', error);
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
