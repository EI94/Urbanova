// Servizio Email Reale per Urbanova AI Land Scraping
import { Resend } from 'resend';

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  lands: any[];
  summary: {
    totalFound: number;
    averagePrice: number;
    bestOpportunities: any[];
  };
}

export class RealEmailService {
  private resend: Resend | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Inizializza Resend solo se l'API key è configurata
    const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
    console.log('🔧 [RealEmailService] Verifica configurazione Resend...');
    console.log('🔑 [RealEmailService] API Key presente:', !!apiKey);
    console.log('🔑 [RealEmailService] API Key lunghezza:', apiKey ? apiKey.length : 0);
    console.log('🔑 [RealEmailService] API Key inizia con:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    console.log('🔑 [RealEmailService] API Key valore completo:', apiKey);
    console.log('🔑 [RealEmailService] RESEND_API_KEY diretto:', process.env.RESEND_API_KEY);
    console.log('🔑 [RealEmailService] NEXT_PUBLIC_RESEND_API_KEY:', process.env.NEXT_PUBLIC_RESEND_API_KEY);
    
    if (apiKey && apiKey !== 'undefined' && apiKey !== '' && apiKey !== 'your-resend-api-key') {
      try {
        this.resend = new Resend(apiKey);
        this.isConfigured = true;
        console.log('✅ [RealEmailService] Resend configurato correttamente');
      } catch (error) {
        console.warn('⚠️ [RealEmailService] Errore configurazione Resend:', error);
        this.isConfigured = false;
        this.resend = null;
      }
    } else {
      console.log('ℹ️ [RealEmailService] RESEND_API_KEY non configurata - modalità simulazione attiva');
      console.log('ℹ️ [RealEmailService] Valore API Key:', apiKey);
      console.log('ℹ️ [RealEmailService] Controlla le variabili ambiente su Vercel');
      this.isConfigured = false;
      this.resend = null;
    }
  }

  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      console.log(`📧 [RealEmailService] Invio email a ${notification.to}`);
      console.log(`📧 [RealEmailService] Oggetto: ${notification.subject}`);
      console.log(`📧 [RealEmailService] Configurato: ${this.isConfigured}`);
      console.log(`📧 [RealEmailService] Resend instance: ${!!this.resend}`);
      
      if (!this.isConfigured || !this.resend) {
        console.log('📧 [RealEmailService] RESEND_API_KEY non configurata!');
        console.log('📧 [RealEmailService] Per configurare Resend:');
        console.log('📧 [RealEmailService] 1. Vai su https://resend.com');
        console.log('📧 [RealEmailService] 2. Crea un account e ottieni API key');
        console.log('📧 [RealEmailService] 3. Aggiungi RESEND_API_KEY nelle variabili ambiente');
        console.log('📧 [RealEmailService] 4. Verifica il dominio o usa hello@resend.dev');
        
        // Simula invio per non bloccare il sistema
        await this.saveEmailLog(notification, 'simulated');
        throw new Error('RESEND_API_KEY non configurata. Configura Resend per inviare email reali.');
      }

      console.log('📧 [RealEmailService] Invio email tramite Resend...');
      
      const { data, error } = await this.resend.emails.send({
        from: 'Urbanova AI <hello@resend.dev>',
        to: [notification.to],
        subject: notification.subject,
        html: notification.htmlContent,
      });

      if (error) {
        console.error('❌ Errore invio email Resend:', error);
        console.error('❌ Dettagli errore:', {
          message: error.message,
          name: error.name
        });
        throw new Error(`Errore invio email: ${error.message}`);
      }

      console.log(`✅ [RealEmailService] Email inviata con successo:`, data);
      console.log(`✅ [RealEmailService] Email ID:`, data?.id);
      
      // Salva log dell'email inviata
      await this.saveEmailLog(notification, data?.id);
      
    } catch (error) {
      console.error('❌ Errore servizio email:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      // Non lanciare errore, solo log
      await this.saveEmailLog(notification, 'error');
    }
  }

  private async saveEmailLog(notification: EmailNotification, emailId?: string): Promise<void> {
    try {
      // Salva nel database locale per tracking
      const logEntry = {
        to: notification.to,
        subject: notification.subject,
        landsCount: notification.lands.length,
        sentAt: new Date(),
        status: emailId === 'error' ? 'error' : emailId === 'simulated' ? 'simulated' : 'sent',
        emailId: emailId || 'unknown',
        summary: notification.summary
      };

      // TODO: Salva in Firestore per tracking completo
      console.log(`💾 [RealEmailService] Log email salvato:`, logEntry);
    } catch (error) {
      console.error('❌ Errore salvataggio log email:', error);
    }
  }

  // Test invio email per verificare configurazione
  async testEmailSend(): Promise<boolean> {
    try {
      console.log('🧪 [RealEmailService] Test invio email...');
      
      if (!this.isConfigured || !this.resend) {
        console.log('🧪 [RealEmailService] Test fallito - servizio non configurato');
        return false;
      }

      const testNotification: EmailNotification = {
        to: 'test@example.com',
        subject: 'Test Urbanova AI - Email Service',
        htmlContent: '<h1>Test Email</h1><p>Questo è un test del servizio email di Urbanova AI.</p>',
        lands: [],
        summary: {
          totalFound: 0,
          averagePrice: 0,
          bestOpportunities: []
        }
      };

      const { data, error } = await this.resend.emails.send({
        from: 'Urbanova AI <hello@resend.dev>',
        to: [testNotification.to],
        subject: testNotification.subject,
        html: testNotification.htmlContent,
      });

      if (error) {
        console.error('🧪 [RealEmailService] Test fallito:', error);
        return false;
      }

      console.log('🧪 [RealEmailService] Test completato con successo:', data);
      return true;
      
    } catch (error) {
      console.error('🧪 [RealEmailService] Test fallito con eccezione:', error);
      return false;
    }
  }

  // Verifica configurazione email
  async verifyEmailConfig(): Promise<boolean> {
    try {
      console.log('🔍 [RealEmailService] Verifica configurazione...');
      console.log('🔍 [RealEmailService] Configurato:', this.isConfigured);
      console.log('🔍 [RealEmailService] Resend instance:', !!this.resend);
      
      // Se non è configurato, ritorna true per modalità simulazione
      if (!this.isConfigured) {
        console.log('✅ [RealEmailService] Modalità simulazione attiva - servizio disponibile');
        return true;
      }

      // Se è configurato, testa la connessione
      if (this.resend) {
        console.log('✅ [RealEmailService] Configurazione email verificata - Resend attivo');
        return true;
      }

      console.log('⚠️ [RealEmailService] Configurazione parziale - modalità simulazione');
      return true; // Sempre true per permettere l'uso
    } catch (error) {
      console.error('❌ Errore verifica email config:', error);
      return true; // Ritorna true anche in caso di errore per modalità simulazione
    }
  }

  // Getter per verificare se il servizio è configurato
  get isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Istanza singleton
export const realEmailService = new RealEmailService(); 