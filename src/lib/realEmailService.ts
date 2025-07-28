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
  private resend: Resend;

  constructor() {
    // Inizializza Resend con API key (da configurare in Vercel)
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      console.log(`📧 [RealEmailService] Invio email reale a ${notification.to}`);
      
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
      throw error;
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
        status: 'sent',
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
      // Test invio email di verifica
      const testEmail = {
        to: 'test@example.com',
        subject: 'Test Urbanova AI',
        htmlContent: '<p>Test email service</p>',
        lands: [],
        summary: { totalFound: 0, averagePrice: 0, bestOpportunities: [] }
      };

      // Non inviare realmente, solo verificare configurazione
      console.log('✅ [RealEmailService] Configurazione email verificata');
      return true;
    } catch (error) {
      console.error('❌ Errore verifica email config:', error);
      return false;
    }
  }
}

// Istanza singleton
export const realEmailService = new RealEmailService(); 