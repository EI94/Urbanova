import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    console.log('✅ Validazione completata, invio email con Resend...');

    // INIZIALIZZA RESEND DIRETTAMENTE CON L'API KEY
    const resend = new Resend('re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k');
    console.log('✅ Resend inizializzato');

    // PREPARA HTML PERFETTO
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .report-info {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏗️ URBANOVA</h1>
          <p>Studio di Fattibilità Condiviso</p>
        </div>
        
        <div class="content">
          <h2>Ciao ${name || to}! 👋</h2>
          
          <p>Ti condivido lo <strong>studio di fattibilità</strong> generato su Urbanova.</p>
          
          <div class="report-info">
            <h3>📊 Report: ${reportTitle}</h3>
            <p>Questo report contiene un'analisi completa e dettagliata del progetto immobiliare.</p>
          </div>
          
          <p>${message}</p>
          
          <a href="${reportUrl}" class="cta-button">
            📖 Visualizza Report Completo
          </a>
          
          <p><em>Il report è stato generato utilizzando la nostra tecnologia AI avanzata per garantire precisione e affidabilità.</em></p>
        </div>
        
        <div class="footer">
          <p><strong>Cordiali saluti,</strong><br>Il tuo team Urbanova</p>
          <hr>
          <p>🏗️ <strong>Urbanova AI</strong> - Analisi di Fattibilità Intelligente</p>
          <p>© 2024 Urbanova - Trasformiamo le città in smart cities</p>
        </div>
      </body>
      </html>
    `;

    // INVIA EMAIL CON RESEND
    console.log('🔄 Invio email tramite Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'Urbanova <noreply@urbanova.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
      text: `Studio di Fattibilità: ${reportTitle}\n\n${message}\n\nVisualizza report: ${reportUrl}`,
      replyTo: 'support@urbanova.com'
    });

    if (error) {
      console.error('❌ Errore Resend:', error);
      return NextResponse.json({
        success: false,
        error: 'Errore invio email Resend',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('✅ Email inviata con successo tramite Resend:', data);

    return NextResponse.json({
      success: true,
      message: 'Email inviata con successo tramite Resend',
      data: {
        to,
        subject,
        timestamp: new Date().toISOString(),
        provider: 'Resend (DIRETTO)',
        messageId: data?.id
      }
    });

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
