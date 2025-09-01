import { NextRequest, NextResponse } from 'next/server';

import { realEmailService } from '@/lib/realEmailService';

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
      return NextResponse.json({ error: 'Formato email non valido' }, { status: 400 });
    }

    console.log('✅ Validazione completata, invio email con servizio funzionante...');

    // GENERA HTML PER L'EMAIL
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: white; 
            padding: 30px; 
            border: 1px solid #e5e7eb; 
            border-radius: 0 0 10px 10px; 
          }
          .report-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #6b7280; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏗️ URBANOVA</h1>
          <p>Studio di Fattibilità Condiviso</p>
        </div>
        
        <div class="content">
          <h2>Ciao ${name || 'utente'}!</h2>
          
          <p>Ti è stato condiviso uno studio di fattibilità generato su Urbanova.</p>
          
          <div class="report-info">
            <h3>📋 Dettagli Report</h3>
            <p><strong>Titolo:</strong> ${reportTitle || 'Studio di Fattibilità'}</p>
            <p><strong>Messaggio:</strong> ${message}</p>
          </div>
          
          <p>Per visualizzare il report completo, clicca sul pulsante qui sotto:</p>
          
          <a href="${reportUrl || 'https://urbanova.life'}" class="button">
            📊 Visualizza Report
          </a>
          
          <p><em>Se il pulsante non funziona, copia e incolla questo link nel browser:</em></p>
          <p style="word-break: break-all; color: #3b82f6;">${reportUrl || 'https://urbanova.life'}</p>
        </div>
        
        <div class="footer">
          <p>🏗️ Urbanova AI - Analisi di Fattibilità Intelligente</p>
          <p>© 2024 Urbanova. Tutti i diritti riservati.</p>
        </div>
      </body>
      </html>
    `;

    // USA IL SERVIZIO EMAIL FUNZIONANTE CHE USA RESEND
    await realEmailService.sendEmail({
      to,
      subject,
      htmlContent,
      lands: [], // Non necessario per questo caso
      summary: {
        totalFound: 0,
        averagePrice: 0,
        bestOpportunities: [],
      },
    });

    console.log('✅ Email inviata con successo tramite realEmailService (Resend)!');

    return NextResponse.json({
      success: true,
      message: 'Email inviata con successo tramite Resend',
      data: {
        to,
        subject,
        timestamp: new Date().toISOString(),
        provider: 'Resend (realEmailService)',
        note: 'Email inviata tramite il servizio funzionante di Land Scraping AI!',
      },
    });
  } catch (error) {
    console.error('❌ Errore critico invio email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
