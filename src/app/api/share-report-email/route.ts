import { NextRequest, NextResponse } from 'next/server';
import { workingEmailService } from '@/lib/workingEmailService';

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

    // Invia email tramite il servizio funzionante
    const success = await workingEmailService.sendEmail(emailData);

    if (success) {
      console.log('✅ Email inviata con successo a:', to);
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo',
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          provider: 'Working Email Service',
          services: workingEmailService.getServiceInfo().services
        }
      });
    } else {
      throw new Error('Impossibile inviare l\'email');
    }

  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
