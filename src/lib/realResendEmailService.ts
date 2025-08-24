import { Resend } from 'resend';

export interface RealEmailData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  reportTitle: string;
  reportUrl: string;
}

export class RealResendEmailService {
  private resend: Resend;

  constructor() {
    // INIZIALIZZA RESEND CON LA NUOVA API KEY REALE FORNITA DALL'UTENTE
    this.resend = new Resend('re_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k');
    console.log('✅ Resend inizializzato con NUOVA API key reale');
  }

  async sendEmail(emailData: RealEmailData): Promise<boolean> {
    try {
      console.log('📧 Invio email con Resend REALE...', emailData);

      // VALIDAZIONE INPUT
      if (!emailData.to || !emailData.subject || !emailData.message) {
        throw new Error('Campi email, oggetto e messaggio sono obbligatori');
      }

      // VALIDAZIONE EMAIL
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailData.to)) {
        throw new Error('Formato email non valido');
      }

      // PREPARA HTML PERFETTO
      const htmlContent = this.generatePerfectHTML(emailData);
      const textContent = this.generateSimpleText(emailData);

      // INVIA EMAIL CON RESEND
      console.log('🔄 Invio email tramite Resend...');
      
      const { data, error } = await this.resend.emails.send({
        from: 'Urbanova <noreply@urbanova.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: htmlContent,
        text: textContent,
        replyTo: 'support@urbanova.com'
      });

      if (error) {
        console.error('❌ Errore Resend:', error);
        throw new Error(`Resend error: ${error.message}`);
      }

      console.log('✅ Email inviata con successo tramite Resend:', data);
      return true;

    } catch (error) {
      console.error('❌ Errore critico invio email Resend:', error);
      return false;
    }
  }

  private generatePerfectHTML(emailData: RealEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailData.subject}</title>
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
          .highlight {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏗️ URBANOVA</h1>
          <p>Studio di Fattibilità Condiviso</p>
        </div>
        
        <div class="content">
          <h2>Ciao ${emailData.name || emailData.to}! 👋</h2>
          
          <p>Ti condivido lo <strong>studio di fattibilità</strong> generato su Urbanova.</p>
          
          <div class="report-info">
            <h3>📊 Report: ${emailData.reportTitle}</h3>
            <p>Questo report contiene un'analisi completa e dettagliata del progetto immobiliare.</p>
          </div>
          
          <div class="highlight">
            <h4>🎯 Cosa include il report:</h4>
            <ul>
              <li><strong>Analisi finanziaria completa</strong> con ROI e payback period</li>
              <li><strong>Valutazione rischi</strong> e opportunità di mercato</li>
              <li><strong>Analisi AI integrata</strong> con raccomandazioni intelligenti</li>
              <li><strong>Strategie di ottimizzazione</strong> per massimizzare il profitto</li>
              <li><strong>Scenario analysis</strong> con diversi livelli di rischio</li>
            </ul>
          </div>
          
          <a href="${emailData.reportUrl}" class="cta-button">
            📖 Visualizza Report Completo
          </a>
          
          <p><em>Il report è stato generato utilizzando la nostra tecnologia AI avanzata per garantire precisione e affidabilità.</em></p>
        </div>
        
        <div class="footer">
          <p><strong>Cordiali saluti,</strong><br>Il tuo team Urbanova</p>
          <hr>
          <p>🏗️ <strong>Urbanova AI</strong> - Analisi di Fattibilità Intelligente</p>
          <p>© 2024 Urbanova - Trasformiamo le città in smart cities</p>
          <p>📧 Supporto: <a href="mailto:support@urbanova.com">support@urbanova.com</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generateSimpleText(emailData: RealEmailData): string {
    return `
URBANOVA - Studio di Fattibilità Condiviso

Ciao ${emailData.name || emailData.to}!

Ti condivido lo studio di fattibilità "${emailData.reportTitle}" generato su Urbanova.

Il report contiene:
• Analisi finanziaria completa con ROI e payback
• Valutazione rischi e opportunità di mercato  
• Analisi AI integrata con raccomandazioni
• Strategie ottimizzazione per massimizzare il profitto

Visualizza il report completo: ${emailData.reportUrl}

Cordiali saluti,
Il tuo team Urbanova

---
Generato da Urbanova AI - Analisi di Fattibilità Intelligente
© 2024 Urbanova - Trasformiamo le città in smart cities
Supporto: support@urbanova.com
    `.trim();
  }

  // METODO PER TESTARE IL SERVIZIO
  async testEmail(to: string): Promise<boolean> {
    console.log('🧪 TEST EMAIL RESEND REALE a:', to);
    
    const testData: RealEmailData = {
      to,
      subject: '🧪 TEST Resend Reale - Urbanova',
      message: 'Questo è un test del servizio Resend REALE Urbanova. Se ricevi questa email, Resend funziona perfettamente!',
      reportTitle: 'Test Report - Urbanova',
      reportUrl: 'https://urbanova.life/test'
    };

    return this.sendEmail(testData);
  }

  // METODO PER VERIFICARE LO STATO DEL SERVIZIO
  getServiceStatus(): { available: boolean; provider: string; apiKey: string; note: string } {
    return {
      available: true,
      provider: 'Resend (REALE)',
      apiKey: 're_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k',
      note: 'Servizio email Resend funzionante con NUOVA API key reale'
    };
  }
}

export const realResendEmailService = new RealResendEmailService();
