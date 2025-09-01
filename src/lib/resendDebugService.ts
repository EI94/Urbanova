import { Resend } from 'resend';

export interface ResendDebugData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  reportTitle?: string;
  reportUrl?: string;
}

export interface ResendDebugResult {
  success: boolean;
  message: string;
  provider: string;
  error?: string;
  details?: any;
  debugInfo?: any;
}

export class ResendDebugService {
  private resend: Resend;
  private readonly RESEND_API_KEY = 're_jpHbTT42_AtqjMBMxrp2u773kKofMZw9k';

  constructor() {
    this.resend = new Resend(this.RESEND_API_KEY);
  }

  async sendEmailWithDebug(data: ResendDebugData): Promise<ResendDebugResult> {
    try {
      console.log('🔍 RESEND DEBUG SERVICE - Analisi completa...');
      console.log('📧 Dati email:', { to: data.to, subject: data.subject });
      console.log('🔑 API Key Resend:', this.RESEND_API_KEY);

      // VERIFICA STATO SERVIZIO RESEND
      console.log('🔄 Verifica stato servizio Resend...');

      // TEST 1: VERIFICA DOMINIO
      console.log('🔍 Test 1: Verifica dominio mittente...');
      const fromDomain = 'noreply@urbanova.com';
      console.log('📧 Dominio mittente:', fromDomain);

      // TEST 2: VERIFICA DESTINATARIO
      console.log('🔍 Test 2: Verifica destinatario...');
      console.log('📧 Destinatario:', data.to);

      // TEST 3: PREPARA EMAIL SEMPLICE
      console.log('🔍 Test 3: Preparazione email semplice...');
      const simpleEmail = {
        from: 'Urbanova <noreply@urbanova.com>',
        to: [data.to],
        subject: `TEST RESEND: ${data.subject}`,
        html: this.generateSimpleHTML(data),
        text: this.generateSimpleText(data),
      };

      console.log('📧 Email preparata:', {
        from: simpleEmail.from,
        to: simpleEmail.to,
        subject: simpleEmail.subject,
      });

      // TEST 4: INVIO EMAIL CON RESEND
      console.log('🔍 Test 4: Invio email tramite Resend...');
      console.log('📧 Opzioni email:', simpleEmail);

      const { data: resendData, error } = await this.resend.emails.send(simpleEmail);

      console.log('📊 Risposta Resend completa:', { resendData, error });

      if (error) {
        console.error('❌ Resend ha restituito errore:', error);
        return {
          success: false,
          message: 'Resend ha restituito errore',
          provider: 'Resend (Debug)',
          error: error.message,
          details: error,
          debugInfo: {
            apiKey: this.RESEND_API_KEY,
            fromDomain: fromDomain,
            toEmail: data.to,
            errorType: error.name,
            errorCode: 'unknown',
          },
        };
      }

      if (resendData) {
        console.log('✅ Resend ha accettato la richiesta:', resendData);
        console.log('📧 Message ID:', resendData.id);
        console.log('📧 Stato: accettato');

        return {
          success: true,
          message: 'Resend ha accettato la richiesta',
          provider: 'Resend (Debug)',
          details: resendData,
          debugInfo: {
            apiKey: this.RESEND_API_KEY,
            fromDomain: fromDomain,
            toEmail: data.to,
            messageId: resendData.id,
            status: 'accepted',
            warning: "VERIFICA SE L'EMAIL È ARRIVATA REALMENTE!",
          },
        };
      }

      // CASO STRANO: NESSUN ERRORE MA NESSUN DATO
      console.error('⚠️ CASO STRANO: Resend non ha restituito errori ma nemmeno dati!');
      return {
        success: false,
        message: 'Resend non ha restituito errori ma nemmeno dati',
        provider: 'Resend (Debug)',
        error: 'Risposta ambigua da Resend',
        details: { resendData, error },
        debugInfo: {
          apiKey: this.RESEND_API_KEY,
          fromDomain: fromDomain,
          toEmail: data.to,
          warning: 'Resend accetta ma non invia email!',
        },
      };
    } catch (error) {
      console.error('❌ Errore critico Resend Debug:', error);
      return {
        success: false,
        message: 'Errore critico durante il debug di Resend',
        provider: 'Resend (Debug)',
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        details: error,
        debugInfo: {
          apiKey: this.RESEND_API_KEY,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          stack: error instanceof Error ? error.stack : 'No stack',
        },
      };
    }
  }

  // TEST DOMINIO RESEND
  async testResendDomain(): Promise<ResendDebugResult> {
    try {
      console.log('🔍 Test dominio Resend...');

      // TEST CON EMAIL SEMPLICISSIMA
      const testEmail = {
        from: 'Urbanova <noreply@urbanova.com>',
        to: ['test@example.com'],
        subject: 'Test Dominio Resend',
        html: '<h1>Test</h1><p>Questo è un test del dominio Resend.</p>',
        text: 'Test dominio Resend',
      };

      console.log('📧 Test email:', testEmail);

      const { data, error } = await this.resend.emails.send(testEmail);

      console.log('📊 Test dominio risultato:', { data, error });

      if (error) {
        return {
          success: false,
          message: 'Test dominio fallito',
          provider: 'Resend (Test Dominio)',
          error: error.message,
          details: error,
        };
      }

      return {
        success: true,
        message: 'Test dominio riuscito',
        provider: 'Resend (Test Dominio)',
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Test dominio fallito con errore',
        provider: 'Resend (Test Dominio)',
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        details: error,
      };
    }
  }

  private generateSimpleHTML(data: ResendDebugData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.subject}</title>
      </head>
      <body>
        <h1>🏗️ URBANOVA</h1>
        <h2>Test Resend Debug</h2>
        <p>Ciao ${data.name || data.to}!</p>
        <p>${data.message}</p>
        <p>Questo è un test per capire perché Resend non invia email.</p>
        <hr>
        <p><strong>Debug Info:</strong></p>
        <ul>
          <li>Destinatario: ${data.to}</li>
          <li>Oggetto: ${data.subject}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
      </body>
      </html>
    `;
  }

  private generateSimpleText(data: ResendDebugData): string {
    return `
URBANOVA - Test Resend Debug

Ciao ${data.name || data.to}!

${data.message}

Questo è un test per capire perché Resend non invia email.

Debug Info:
- Destinatario: ${data.to}
- Oggetto: ${data.subject}
- Timestamp: ${new Date().toISOString()}

Cordiali saluti,
Team Urbanova
    `.trim();
  }
}

export const resendDebugService = new ResendDebugService();
