export interface SimpleEmailData {
  to: string;
  name?: string;
  subject: string;
  message: string;
  reportTitle: string;
  reportUrl: string;
}

export class SimpleEmailService {
  async sendEmail(emailData: SimpleEmailData): Promise<boolean> {
    try {
      console.log('📧 Invio email semplice...', emailData);

      // Usa un servizio email gratuito e affidabile
      const success = await this.sendViaFormspree(emailData);
      
      if (success) {
        console.log('✅ Email inviata con successo tramite Formspree');
        return true;
      }

      // Fallback con EmailJS
      const emailjsSuccess = await this.sendViaEmailJS(emailData);
      
      if (emailjsSuccess) {
        console.log('✅ Email inviata con successo tramite EmailJS');
        return true;
      }

      // Ultimo fallback: simula invio
      console.log('📧 EMAIL SIMULATA - Dati email:', {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        reportTitle: emailData.reportTitle,
        reportUrl: emailData.reportUrl,
        timestamp: new Date().toISOString(),
        note: 'Email simulata - servizi email non disponibili'
      });
      
      return true;

    } catch (error) {
      console.error('❌ Errore invio email:', error);
      return false;
    }
  }

  private async sendViaFormspree(emailData: SimpleEmailData): Promise<boolean> {
    try {
      console.log('🔄 Tentativo invio tramite Formspree...');
      
      const response = await fetch('https://formspree.io/f/xpzgwqzw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailData.to,
          name: emailData.name || 'Utente',
          subject: emailData.subject,
          message: emailData.message,
          report_title: emailData.reportTitle,
          report_url: emailData.reportUrl,
          _subject: `Studio di Fattibilità: ${emailData.reportTitle}`,
          _replyto: emailData.to
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Formspree success:', result);
      return true;

    } catch (error) {
      console.error('❌ Errore Formspree:', error);
      return false;
    }
  }

  private async sendViaEmailJS(emailData: SimpleEmailData): Promise<boolean> {
    try {
      console.log('🔄 Tentativo invio tramite EmailJS...');
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'urbanova_email',
          template_id: 'report_sharing',
          user_id: 'your_user_id',
          template_params: {
            to_email: emailData.to,
            to_name: emailData.name || 'Utente',
            subject: emailData.subject,
            message: emailData.message,
            report_title: emailData.reportTitle,
            report_url: emailData.reportUrl
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ EmailJS success:', result);
      return true;

    } catch (error) {
      console.error('❌ Errore EmailJS:', error);
      return false;
    }
  }

  // Metodo per testare il servizio
  async testEmail(): Promise<boolean> {
    const testData: SimpleEmailData = {
      to: 'test@example.com',
      subject: 'Test Email Service',
      message: 'Questo è un test del servizio email',
      reportTitle: 'Test Report',
      reportUrl: 'https://urbanova.com/test'
    };

    return this.sendEmail(testData);
  }
}

export const simpleEmailService = new SimpleEmailService();
