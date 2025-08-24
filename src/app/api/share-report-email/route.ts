import { NextRequest, NextResponse } from 'next/server';
import { simpleWorkingEmailService } from '@/lib/simpleWorkingEmailService';

export async function POST(request: NextRequest) {
  try {
    const { to, name, subject, message, reportTitle, reportUrl } = await request.json();

    console.log('📧 SHARE-REPORT-EMAIL - Dati ricevuti:', { to, subject, reportTitle });

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

    console.log('✅ Validazione completata, invio email con servizio semplice e garantito...');

    // USA IL SERVIZIO EMAIL SEMPLICE E GARANTITO
    const emailResult = await simpleWorkingEmailService.sendEmail({
      to,
      name,
      subject,
      message,
      reportTitle,
      reportUrl
    });

    console.log('📊 Risultato invio email:', emailResult);

    if (emailResult.success) {
      console.log('✅ Email inviata con successo tramite:', emailResult.provider);
      
      return NextResponse.json({
        success: true,
        message: emailResult.message,
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          provider: emailResult.provider,
          details: emailResult.details,
          note: 'VERIFICA CHE L\'EMAIL SIA ARRIVATA REALMENTE!'
        }
      });
    } else {
      console.error('❌ Invio email fallito:', emailResult.error);
      
      return NextResponse.json({
        success: false,
        error: emailResult.message,
        details: emailResult.details,
        timestamp: new Date().toISOString()
      }, { status: 500 });
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
