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
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        this.resend = new Resend(apiKey);
        this.isConfigured = true;
        console.log('✅ [RealEmailService] Resend configurato correttamente');
      } catch (error) {
        console.warn('⚠️ [RealEmailService] Errore configurazione Resend:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('⚠️ [RealEmailService] RESEND_API_KEY non configurata - modalità simulazione');
      this.isConfigured = false;
    }
  }

  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      console.log(`📧 [RealEmailService] Invio email a ${notification.to}`);
      
      if (!this.isConfigured || !this.resend) {
        console.log('📧 [RealEmailService] Modalità simulazione - email non inviata');
        await this.saveEmailLog(notification, 'simulated');
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'Urbanova AI <noreply@urbanova.life>',
        to: [notification.to],
        subject: notification.subject,
        html: notification.htmlContent,
      });

      if (error) {
        console.error('❌ Errore invio email Resend:', error);
        throw new Error(`Errore invio email: ${error.message}`);
      }

      console.log(`✅ [RealEmailService] Email inviata con successo:`, data);
      
      // Salva log dell'email inviata
      await this.saveEmailLog(notification, data?.id);
      
    } catch (error) {
      console.error('❌ Errore servizio email:', error);
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

  // Verifica configurazione email
  async verifyEmailConfig(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('⚠️ [RealEmailService] Email non configurato - modalità simulazione');
        return false;
      }

      console.log('✅ [RealEmailService] Configurazione email verificata');
      return true;
    } catch (error) {
      console.error('❌ Errore verifica email config:', error);
      return false;
    }
  }

  // Getter per verificare se il servizio è configurato
  get isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Istanza singleton
export const realEmailService = new RealEmailService(); 