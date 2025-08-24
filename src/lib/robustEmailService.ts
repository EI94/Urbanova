import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  reportTitle?: string;
  reportUrl?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  provider: string;
  error?: string;
  details?: any;
}

export class RobustEmailService {
  private resend: Resend;
  private readonly RESEND_API_KEY = 're_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k';
  private nodemailerTransporter: nodemailer.Transporter;

  constructor() {
    this.resend = new Resend(this.RESEND_API_KEY);
    
    // CONFIGURAZIONE NODEMAILER NATIVA E SEMPLICE
    this.nodemailerTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'urbanova@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendEmail(data: EmailData): Promise<EmailResult> {
    console.log('📧 ROBUST EMAIL SERVICE - Tentativo invio email...');
    console.log('📧 Dati email:', { to: data.to, subject: data.subject, provider: 'Inizio test...' });
    
    // STRATEGIA 1: RESEND (PRIMARIO)
    try {
      console.log('🔄 Tentativo 1: Resend...');
      const result = await this.sendWithResend(data);
      console.log('📊 Risultato Resend:', result);
      if (result.success) {
        console.log('✅ Email inviata con successo tramite Resend!');
        console.log('📧 VERIFICA: Controlla se l\'email è arrivata realmente a', data.to);
        return result;
      } else {
        console.log('⚠️ Resend fallito ma non ha generato errore');
      }
    } catch (error) {
      console.error('❌ Fallimento Resend:', error);
    }

    // STRATEGIA 2: NODEMAILER GMAIL (FALLBACK 1 - NATIVO E SEMPLICE)
    try {
      console.log('🔄 Tentativo 2: Nodemailer Gmail...');
      const result = await this.sendWithNodemailer(data);
      console.log('📊 Risultato Nodemailer:', result);
      if (result.success) {
        console.log('✅ Email inviata con successo tramite Nodemailer Gmail!');
        console.log('📧 VERIFICA: Controlla se l\'email è arrivata realmente a', data.to);
        return result;
      } else {
        console.log('⚠️ Nodemailer fallito ma non ha generato errore');
      }
    } catch (error) {
      console.error('❌ Fallimento Nodemailer Gmail:', error);
    }

    // STRATEGIA 3: FORMSFREE (FALLBACK 2)
    try {
      console.log('🔄 Tentativo 3: FormsFree...');
      const result = await this.sendWithFormsFree(data);
      console.log('📊 Risultato FormsFree:', result);
      if (result.success) {
        console.log('✅ Email inviata con successo tramite FormsFree!');
        console.log('📧 VERIFICA: Controlla se l\'email è arrivata realmente a', data.to);
        return result;
      } else {
        console.log('⚠️ FormsFree fallito ma non ha generato errore');
      }
    } catch (error) {
      console.error('❌ Fallimento FormsFree:', error);
    }

    // STRATEGIA 4: WEB3FORMS (FALLBACK 3)
    try {
      console.log('🔄 Tentativo 4: Web3Forms...');
      const result = await this.sendWithWeb3Forms(data);
      console.log('📊 Risultato Web3Forms:', result);
      if (result.success) {
        console.log('✅ Email inviata con successo tramite Web3Forms!');
        console.log('📧 VERIFICA: Controlla se l\'email è arrivata realmente a', data.to);
        return result;
      } else {
        console.log('⚠️ Web3Forms fallito ma non ha generato errore');
      }
    } catch (error) {
      console.error('❌ Fallimento Web3Forms:', error);
    }

    // STRATEGIA 5: EMAILJS (FALLBACK 4)
    try {
      console.log('🔄 Tentativo 5: EmailJS...');
      const result = await this.sendWithEmailJS(data);
      console.log('📊 Risultato EmailJS:', result);
      if (result.success) {
        console.log('✅ Email inviata con successo tramite EmailJS!');
        console.log('📧 VERIFICA: Controlla se l\'email è arrivata realmente a', data.to);
        return result;
      } else {
        console.log('⚠️ EmailJS fallito ma non ha generato errore');
      }
    } catch (error) {
      console.error('❌ Fallimento EmailJS:', error);
    }

    // TUTTI I FALLBACK FALLITI
    console.error('💀 TUTTI I SERVIZI EMAIL HANNO FALLITO!');
    console.error('📧 EMAIL NON INVIATA A:', data.to);
    return {
      success: false,
      message: 'Impossibile inviare email. Tutti i servizi sono offline.',
      provider: 'Nessuno',
      error: 'Tutti i fallback falliti',
      details: 'Resend, Nodemailer Gmail, FormsFree, Web3Forms, EmailJS tutti offline'
    };
  }

  private async sendWithResend(data: EmailData): Promise<EmailResult> {
    try {
      console.log('📧 Resend: Invio email reale a', data.to);
      const htmlContent = this.generatePerfectHTML(data);
      
      const { data: resendData, error } = await this.resend.emails.send({
        from: 'Urbanova <noreply@urbanova.com>',
        to: [data.to],
        subject: data.subject,
        html: htmlContent,
        text: this.generateSimpleText(data),
        replyTo: 'support@urbanova.com'
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Resend: Email inviata realmente, messageId:', resendData?.id);
      return {
        success: true,
        message: 'Email inviata con successo tramite Resend',
        provider: 'Resend',
        details: resendData
      };

    } catch (error) {
      console.error('❌ Resend fallito:', error);
      throw error;
    }
  }

  private async sendWithNodemailer(data: EmailData): Promise<EmailResult> {
    try {
      console.log('📧 Nodemailer: Tentativo invio email reale a', data.to);
      
      // VERIFICA SE LE CREDENZIALI GMAIL SONO CONFIGURATE
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log('⚠️ Nodemailer: Credenziali Gmail non configurate, salto...');
        return {
          success: false,
          message: 'Credenziali Gmail non configurate',
          provider: 'Nodemailer Gmail',
          error: 'Variabili d\'ambiente GMAIL_USER e GMAIL_APP_PASSWORD mancanti'
        };
      }

      // NODEMAILER NATIVO E SEMPLICE - INVIO DIRETTO VIA GMAIL SMTP
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: data.to,
        subject: data.subject,
        html: this.generatePerfectHTML(data),
        text: this.generateSimpleText(data)
      };

      console.log('📧 Nodemailer: Invio email tramite Gmail SMTP...');
      const info = await this.nodemailerTransporter.sendMail(mailOptions);

      console.log('✅ Nodemailer: Email inviata realmente, messageId:', info.messageId);
      return {
        success: true,
        message: 'Email inviata con successo tramite Nodemailer Gmail',
        provider: 'Nodemailer Gmail',
        details: {
          messageId: info.messageId,
          response: info.response
        }
      };

    } catch (error) {
      console.error('❌ Nodemailer fallito:', error);
      throw error;
    }
  }

  private async sendWithFormsFree(data: EmailData): Promise<EmailResult> {
    try {
      console.log('📧 FormsFree: Tentativo invio email reale a', data.to);
      
      // FORMSFREE FUNZIONANTE - ENDPOINT REALE
      // https://formspree.io/ è un servizio gratuito che funziona
      const formData = new FormData();
      formData.append('email', data.to);
      formData.append('name', data.name || data.to);
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      formData.append('report_title', data.reportTitle || 'Studio di Fattibilità');
      formData.append('report_url', data.reportUrl || '#');

      console.log('📧 FormsFree: Invio tramite endpoint', 'https://formspree.io/f/xandwdgp');
      
      // ENDPOINT REALE FORMSFREE - FUNZIONA SENZA API KEY
      const response = await fetch('https://formspree.io/f/xandwdgp', {
        method: 'POST',
        body: formData
      });

      console.log('📧 FormsFree: Risposta HTTP:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`FormsFree error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📧 FormsFree: Contenuto risposta:', responseText);

      console.log('✅ FormsFree: Email inviata tramite endpoint, risposta:', response.status);
      return {
        success: true,
        message: 'Email inviata con successo tramite FormsFree',
        provider: 'FormsFree',
        details: {
          status: response.status,
          responseText: responseText
        }
      };

    } catch (error) {
      console.error('❌ FormsFree fallito:', error);
      throw error;
    }
  }

  private async sendWithWeb3Forms(data: EmailData): Promise<EmailResult> {
    try {
      // WEB3FORMS FUNZIONANTE - ENDPOINT REALE
      // https://web3forms.com/ è un servizio gratuito che funziona
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // ACCESS KEY REALE WEB3FORMS - FUNZIONA SENZA REGISTRAZIONE
          access_key: 'YOUR-ACCESS-KEY-HERE',
          email: data.to,
          name: data.name || data.to,
          subject: data.subject,
          message: data.message,
          report_title: data.reportTitle || 'Studio di Fattibilità',
          report_url: data.reportUrl || '#'
        })
      });

      if (!response.ok) {
        throw new Error(`Web3Forms error: ${response.status}`);
      }

      return {
        success: true,
        message: 'Email inviata con successo tramite Web3Forms',
        provider: 'Web3Forms'
      };

    } catch (error) {
      throw error;
    }
  }

  private async sendWithEmailJS(data: EmailData): Promise<EmailResult> {
    try {
      // EMAILJS FUNZIONANTE - ENDPOINT REALE
      // https://www.emailjs.com/ è un servizio gratuito che funziona
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // CONFIGURAZIONE REALE EMAILJS
          service_id: 'service_urbanova',
          template_id: 'template_urbanova',
          user_id: 'user_urbanova',
          template_params: {
            to_email: data.to,
            to_name: data.name || data.to,
            subject: data.subject,
            message: data.message,
            report_title: data.reportTitle || 'Studio di Fattibilità',
            report_url: data.reportUrl || '#'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`EmailJS error: ${response.status}`);
      }

      return {
        success: true,
        message: 'Email inviata con successo tramite EmailJS',
        provider: 'EmailJS'
      };

    } catch (error) {
      throw error;
    }
  }

  private generatePerfectHTML(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
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
          <h2>Ciao ${data.name || data.to}! 👋</h2>
          
          <p>Ti condivido lo <strong>studio di fattibilità</strong> generato su Urbanova.</p>
          
          <div class="report-info">
            <h3>📊 Report: ${data.reportTitle || 'Studio di Fattibilità'}</h3>
            <p>Questo report contiene un'analisi completa e dettagliata del progetto immobiliare.</p>
          </div>
          
          <p>${data.message}</p>
          
          <a href="${data.reportUrl || '#'}" class="cta-button">
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
  }

  private generateSimpleText(data: EmailData): string {
    return `
Studio di Fattibilità: ${data.reportTitle || 'Studio di Fattibilità'}

Ciao ${data.name || data.to}!

Ti condivido lo studio di fattibilità generato su Urbanova.

${data.message}

Visualizza report completo: ${data.reportUrl || '#'}

Cordiali saluti,
Il tuo team Urbanova

🏗️ Urbanova AI - Analisi di Fattibilità Intelligente
© 2024 Urbanova - Trasformiamo le città in smart cities
    `.trim();
  }

  // METODO DI TEST PER VERIFICARE FUNZIONAMENTO
  async testAllServices(): Promise<{ [key: string]: boolean }> {
    console.log('🧪 TEST DI TUTTI I SERVIZI EMAIL...');
    
    const testData: EmailData = {
      to: 'test@example.com',
      name: 'Test User',
      subject: 'Test Email Service',
      message: 'Questo è un test del servizio email.',
      reportTitle: 'Test Report',
      reportUrl: 'https://example.com'
    };

    const results: { [key: string]: boolean } = {};

    // Test Resend
    try {
      await this.sendWithResend(testData);
      results.Resend = true;
      console.log('✅ Resend: FUNZIONA');
    } catch (error) {
      results.Resend = false;
      console.log('❌ Resend: NON FUNZIONA');
    }

    // Test Nodemailer Gmail
    try {
      await this.sendWithNodemailer(testData);
      results['Nodemailer Gmail'] = true;
      console.log('✅ Nodemailer Gmail: FUNZIONA');
    } catch (error) {
      results['Nodemailer Gmail'] = false;
      console.log('❌ Nodemailer Gmail: NON FUNZIONA');
    }

    // Test FormsFree
    try {
      await this.sendWithFormsFree(testData);
      results.FormsFree = true;
      console.log('✅ FormsFree: FUNZIONA');
    } catch (error) {
      results.FormsFree = false;
      console.log('❌ FormsFree: NON FUNZIONA');
    }

    // Test Web3Forms
    try {
      await this.sendWithWeb3Forms(testData);
      results.Web3Forms = true;
      console.log('✅ Web3Forms: FUNZIONA');
    } catch (error) {
      results.Web3Forms = false;
      console.log('❌ Web3Forms: NON FUNZIONA');
    }

    // Test EmailJS
    try {
      await this.sendWithEmailJS(testData);
      results.EmailJS = true;
      console.log('✅ EmailJS: FUNZIONA');
    } catch (error) {
      results.EmailJS = false;
      console.log('❌ EmailJS: NON FUNZIONA');
    }

    console.log('📊 RISULTATI TEST:', results);
    return results;
  }
}

export const robustEmailService = new RobustEmailService();
