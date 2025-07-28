// Servizio Email per Urbanova AI Land Scraping
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';

export interface EmailConfig {
  id?: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    maxResults: number;
    includeStats: boolean;
    includeContactInfo: boolean;
  };
}

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

export class EmailService {
  private readonly COLLECTION = 'emailConfigs';

  // Salva configurazione email
  async saveEmailConfig(email: string, preferences?: Partial<EmailConfig['preferences']>): Promise<string> {
    try {
      const config: Omit<EmailConfig, 'id'> = {
        email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          frequency: 'weekly',
          maxResults: 5,
          includeStats: true,
          includeContactInfo: true,
          ...preferences
        }
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), config);
      console.log(`✅ Email config salvata: ${email}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Errore salvataggio email config:', error);
      throw error;
    }
  }

  // Ottieni configurazione email
  async getEmailConfig(email: string): Promise<EmailConfig | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as EmailConfig;
    } catch (error) {
      console.error('❌ Errore recupero email config:', error);
      return null;
    }
  }

  // Aggiorna configurazione email
  async updateEmailConfig(id: string, updates: Partial<EmailConfig>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      console.log(`✅ Email config aggiornata: ${id}`);
    } catch (error) {
      console.error('❌ Errore aggiornamento email config:', error);
      throw error;
    }
  }

  // Invia email (simulato per ora, da collegare a servizio reale)
  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      console.log(`📧 [EmailService] Invio email a ${notification.to}`);
      console.log(`📧 [EmailService] Oggetto: ${notification.subject}`);
      
      // TODO: Collegare a servizio email reale (SendGrid, AWS SES, etc.)
      // Per ora simuliamo l'invio
      await this.simulateEmailSending(notification);
      
      // Salva log dell'email inviata
      await this.saveEmailLog(notification);
      
      console.log(`✅ [EmailService] Email inviata con successo`);
    } catch (error) {
      console.error('❌ Errore invio email:', error);
      throw error;
    }
  }

  private async simulateEmailSending(notification: EmailNotification): Promise<void> {
    // Simula delay di invio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Log dettagliato per debug
    console.log(`📧 [EmailService] Contenuto email:`);
    console.log(`   - Destinatario: ${notification.to}`);
    console.log(`   - Oggetto: ${notification.subject}`);
    console.log(`   - Terreni trovati: ${notification.lands.length}`);
    console.log(`   - Prezzo medio: €${notification.summary.averagePrice.toLocaleString()}`);
  }

  private async saveEmailLog(notification: EmailNotification): Promise<void> {
    try {
      await addDoc(collection(db, 'emailLogs'), {
        to: notification.to,
        subject: notification.subject,
        landsCount: notification.lands.length,
        sentAt: new Date(),
        status: 'sent'
      });
    } catch (error) {
      console.error('❌ Errore salvataggio log email:', error);
    }
  }

  // Verifica se email è già configurata
  async isEmailConfigured(email: string): Promise<boolean> {
    const config = await this.getEmailConfig(email);
    return config !== null;
  }

  // Ottieni tutte le email configurate
  async getAllEmailConfigs(): Promise<EmailConfig[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailConfig[];
    } catch (error) {
      console.error('❌ Errore recupero email configs:', error);
      return [];
    }
  }
}

// Istanza singleton
export const emailService = new EmailService(); 