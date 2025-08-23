import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

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

    // Invia email tramite il servizio
    const success = await emailService.sendReportSharingEmail(emailData);

    if (success) {
      console.log('✅ Email inviata con successo a:', to);
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo',
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          provider: emailService.getServiceInfo().provider
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

// Funzione helper per inviare email reali (da implementare)
async function sendRealEmail(emailData: any) {
  // TODO: Integrare con Resend o altro servizio email
  // Esempio con Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: 'Urbanova <noreply@urbanova.com>',
    to: [emailData.to],
    subject: emailData.subject,
    html: generateEmailHTML(emailData),
    text: emailData.message
  });

  if (error) {
    throw new Error(`Errore Resend: ${error.message}`);
  }

  return data;
  */
}

// Funzione per generare HTML email (da implementare)
function generateEmailHTML(emailData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailData.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">Urbanova</h1>
        <p style="color: white; text-align: center; margin: 10px 0 0 0; opacity: 0.9;">Piattaforma Smart City</p>
      </div>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h2 style="color: #1e293b; margin-top: 0;">Studio di Fattibilità Condiviso</h2>
        <p style="margin-bottom: 20px;">Ciao ${emailData.name || emailData.to}!</p>
        
        <p>Ti è stato condiviso uno studio di fattibilità su Urbanova:</p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="color: #3b82f6; margin-top: 0;">${emailData.reportTitle}</h3>
          <p style="margin-bottom: 15px;">Il report contiene:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Analisi finanziaria completa</li>
            <li>Valutazione ROI e rischi</li>
            <li>Analisi AI integrata</li>
            <li>Raccomandazioni strategiche</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${emailData.reportUrl}" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Visualizza Report Completo
          </a>
        </div>
        
        <p style="margin-bottom: 20px;">Puoi accedere al report completo direttamente su Urbanova utilizzando il link sopra.</p>
        
        <p style="margin-bottom: 0;">Cordiali saluti,<br><strong>Il tuo team Urbanova</strong></p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Questa email è stata inviata da Urbanova.<br>
          Se non hai richiesto questo report, puoi ignorare questa email.
        </p>
      </div>
    </body>
    </html>
  `;
}
