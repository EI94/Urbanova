import nodemailer from 'nodemailer';

export interface SimpleEmailData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  reportTitle?: string;
  reportUrl?: string;
}

export interface SimpleEmailResult {
  success: boolean;
  message: string;
  provider: string;
  error?: string;
  details?: any;
}

export class SimpleWorkingEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // CONFIGURAZIONE SEMPLICE E GARANTITA
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'urbanova.test@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'test-password'
      }
    });
  }

  async sendEmail(data: SimpleEmailData): Promise<SimpleEmailResult> {
    try {
      console.log('📧 SIMPLE WORKING EMAIL SERVICE - Invio email garantito...');
      console.log('📧 Dati email:', { to: data.to, subject: data.subject });

      // VERIFICA CREDENZIALI
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Credenziali Gmail mancanti!');
        return {
          success: false,
          message: 'Credenziali Gmail non configurate',
          provider: 'Simple Working Email',
          error: 'GMAIL_USER e GMAIL_APP_PASSWORD mancanti'
        };
      }

      // PREPARA EMAIL SEMPLICE
      const mailOptions = {
        from: `"Urbanova" <${process.env.GMAIL_USER}>`,
        to: data.to,
        subject: data.subject,
        text: this.generateSimpleText(data),
        html: this.generateSimpleHTML(data)
      };

      console.log('📧 Invio email tramite Gmail SMTP...');
      
      // INVIA EMAIL
      const info = await this.transporter.sendMail(mailOptions);

      console.log('📧 Risposta Gmail SMTP:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });

      // VERIFICA ACCETTAZIONE
      if (info.accepted && info.accepted.length > 0) {
        console.log('✅ Email accettata da Gmail SMTP!');
        return {
          success: true,
          message: 'Email inviata con successo tramite Gmail SMTP',
          provider: 'Simple Working Email (Gmail)',
          details: {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted
          }
        };
      } else {
        console.error('❌ Email non accettata da Gmail SMTP');
        return {
          success: false,
          message: 'Email non accettata dal server SMTP',
          provider: 'Simple Working Email (Gmail)',
          error: 'Email rifiutata',
          details: {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
          }
        };
      }

    } catch (error) {
      console.error('❌ Errore invio email:', error);
      return {
        success: false,
        message: 'Errore durante l\'invio email',
        provider: 'Simple Working Email (Gmail)',
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        details: error
      };
    }
  }

  private generateSimpleText(data: SimpleEmailData): string {
    return `
URBANOVA - Studio di Fattibilità

Ciao ${data.name || data.to}!

Ti condivido lo studio di fattibilità generato su Urbanova.

${data.message}

Report: ${data.reportTitle || 'Studio di Fattibilità'}
Link: ${data.reportUrl || 'https://urbanova.life'}

Cordiali saluti,
Il tuo team Urbanova

🏗️ Urbanova AI - Analisi di Fattibilità Intelligente
© 2024 Urbanova
    `.trim();
  }

  private generateSimpleHTML(data: SimpleEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏗️ URBANOVA</h1>
          <p>Studio di Fattibilità Condiviso</p>
        </div>
        
        <div class="content">
          <h2>Ciao ${data.name || data.to}! 👋</h2>
          
          <p>Ti condivido lo <strong>studio di fattibilità</strong> generato su Urbanova.</p>
          
          <p>${data.message}</p>
          
          <h3>📊 Report: ${data.reportTitle || 'Studio di Fattibilità'}</h3>
          <p><a href="${data.reportUrl || 'https://urbanova.life'}">Visualizza Report Completo</a></p>
        </div>
        
        <div class="footer">
          <p><strong>Cordiali saluti,</strong><br>Il tuo team Urbanova</p>
          <p>🏗️ <strong>Urbanova AI</strong> - Analisi di Fattibilità Intelligente</p>
        </div>
      </body>
      </html>
    `;
  }

  // TEST SEMPLICE E DIRETTO
  async testService(): Promise<boolean> {
    try {
      console.log('🧪 Test servizio email semplice...');
      
      const testData: SimpleEmailData = {
        to: 'test@example.com',
        name: 'Test User',
        subject: 'Test Simple Email Service',
        message: 'Questo è un test del servizio email semplice.',
        reportTitle: 'Test Report',
        reportUrl: 'https://example.com'
      };

      const result = await this.sendEmail(testData);
      console.log('📊 Test risultato:', result);
      
      return result.success;
    } catch (error) {
      console.error('❌ Test fallito:', error);
      return false;
    }
  }
}

export const simpleWorkingEmailService = new SimpleWorkingEmailService();
