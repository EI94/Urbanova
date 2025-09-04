import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';
import { RDO, Offer, Comparison } from '@urbanova/types';

/**
 * Servizio Email per Sistema Procurement Urbanova
 *
 * Funzionalità:
 * - Inviti RDO con link JWT sicuri
 * - Notifiche offerte ricevute
 * - Conferme submission
 * - Alert pre-check falliti
 * - Notifiche aggiudicazione
 * - Template HTML professionali
 */

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
  type: 'vendor' | 'project_manager' | 'admin';
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;
  private templates: Map<string, EmailTemplate>;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = createTransport(config);
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Inizializza template email
   */
  private initializeTemplates(): void {
    // Template invito RDO
    this.templates.set('rdo_invitation', {
      subject: 'Invito RDO Urbanova - {{rdoTitle}}',
      html: this.getRDOInvitationHTML(),
      text: this.getRDOInvitationText(),
    });

    // Template conferma offerta
    this.templates.set('offer_confirmation', {
      subject: 'Offerta Ricevuta - RDO {{rdoTitle}}',
      html: this.getOfferConfirmationHTML(),
      text: this.getOfferConfirmationText(),
    });

    // Template notifica PM
    this.templates.set('pm_notification', {
      subject: 'Nuova Offerta Ricevuta - RDO {{rdoTitle}}',
      html: this.getPMNotificationHTML(),
      text: this.getPMNotificationText(),
    });

    // Template pre-check fallito
    this.templates.set('precheck_failed', {
      subject: 'Pre-check Fallito - RDO {{rdoTitle}}',
      html: this.getPreCheckFailedHTML(),
      text: this.getPreCheckFailedText(),
    });

    // Template aggiudicazione
    this.templates.set('award_notification', {
      subject: 'RDO Aggiudicato - {{rdoTitle}}',
      html: this.getAwardNotificationHTML(),
      text: this.getAwardNotificationText(),
    });
  }

  /**
   * Invia invito RDO a vendor
   */
  async sendRDOInvitation(
    rdo: RDO,
    vendor: { id: string; name: string; email: string },
    accessToken: string
  ): Promise<boolean> {
    try {
      console.log(`📧 [EmailService] Invio invito RDO a ${vendor.email}`);

      const template = this.templates.get('rdo_invitation')!;
      const accessLink = `https://urbanova.com/rdo/respond?token=${accessToken}`;

      const emailData = {
        vendorName: vendor.name,
        rdoTitle: rdo.title,
        rdoDescription: rdo.description,
        deadline: rdo.deadline.toLocaleDateString('it-IT'),
        accessLink,
        projectId: rdo.projectId,
        estimatedValue: `€${rdo.metadata.estimatedValue.toLocaleString('it-IT')}`,
        location: rdo.metadata.location,
      };

      const emailContent = this.processTemplate(template, emailData);

      await this.transporter.sendMail({
        from: this.config.from,
        to: vendor.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: this.config.replyTo,
      });

      console.log(`✅ [EmailService] Invito RDO inviato a ${vendor.email}`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Errore invio invito RDO:`, error);
      return false;
    }
  }

  /**
   * Invia conferma offerta ricevuta
   */
  async sendOfferConfirmation(
    offer: Offer,
    rdo: RDO,
    vendor: { name: string; email: string }
  ): Promise<boolean> {
    try {
      console.log(`📧 [EmailService] Invio conferma offerta a ${vendor.email}`);

      const template = this.templates.get('offer_confirmation')!;

      const emailData = {
        vendorName: vendor.name,
        rdoTitle: rdo.title,
        offerId: offer.id,
        totalPrice: `€${offer.totalPrice.toLocaleString('it-IT')}`,
        totalTime: `${offer.totalTime} giorni`,
        qualityScore: `${offer.qualityScore}/10`,
        submittedAt: offer.submittedAt.toLocaleDateString('it-IT'),
        rdoDeadline: rdo.deadline.toLocaleDateString('it-IT'),
      };

      const emailContent = this.processTemplate(template, emailData);

      await this.transporter.sendMail({
        from: this.config.from,
        to: vendor.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: this.config.replyTo,
      });

      console.log(`✅ [EmailService] Conferma offerta inviata a ${vendor.email}`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Errore invio conferma offerta:`, error);
      return false;
    }
  }

  /**
   * Notifica project manager nuova offerta
   */
  async notifyProjectManager(
    offer: Offer,
    rdo: RDO,
    vendor: { name: string; email: string },
    pmEmail: string
  ): Promise<boolean> {
    try {
      console.log(`📧 [EmailService] Notifica PM nuova offerta da ${vendor.email}`);

      const template = this.templates.get('pm_notification')!;

      const emailData = {
        pmName: 'Project Manager',
        vendorName: vendor.name,
        rdoTitle: rdo.title,
        rdoId: rdo.id,
        offerId: offer.id,
        totalPrice: `€${offer.totalPrice.toLocaleString('it-IT')}`,
        totalTime: `${offer.totalTime} giorni`,
        qualityScore: `${offer.qualityScore}/10`,
        submittedAt: offer.submittedAt.toLocaleDateString('it-IT'),
        totalOffers: 'N/A', // Sarebbe da recuperare dal DB
        rdoDeadline: rdo.deadline.toLocaleDateString('it-IT'),
        dashboardLink: `https://urbanova.com/dashboard/rdo/${rdo.id}`,
      };

      const emailContent = this.processTemplate(template, emailData);

      await this.transporter.sendMail({
        from: this.config.from,
        to: pmEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: this.config.replyTo,
      });

      console.log(`✅ [EmailService] Notifica PM inviata a ${pmEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Errore notifica PM:`, error);
      return false;
    }
  }

  /**
   * Notifica pre-check fallito
   */
  async notifyPreCheckFailed(
    vendor: { name: string; email: string },
    rdo: RDO,
    issues: string[],
    pmEmail: string
  ): Promise<boolean> {
    try {
      console.log(`📧 [EmailService] Notifica pre-check fallito per ${vendor.email}`);

      const template = this.templates.get('precheck_failed')!;

      const emailData = {
        vendorName: vendor.name,
        rdoTitle: rdo.title,
        rdoId: rdo.id,
        issues: issues.join(', '),
        deadline: rdo.deadline.toLocaleDateString('it-IT'),
        pmEmail,
        supportEmail: 'procurement-support@urbanova.com',
      };

      const emailContent = this.processTemplate(template, emailData);

      // Notifica vendor
      await this.transporter.sendMail({
        from: this.config.from,
        to: vendor.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        replyTo: this.config.replyTo,
      });

      // Notifica PM
      await this.transporter.sendMail({
        from: this.config.from,
        to: pmEmail,
        subject: `ALERT: Pre-check fallito per ${vendor.name}`,
        html: this.getPreCheckFailedPMHTML(emailData),
        text: this.getPreCheckFailedPMText(emailData),
        replyTo: this.config.replyTo,
      });

      console.log(`✅ [EmailService] Notifiche pre-check fallito inviate`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Errore notifica pre-check fallito:`, error);
      return false;
    }
  }

  /**
   * Notifica aggiudicazione
   */
  async notifyAward(
    rdo: RDO,
    winningVendor: { name: string; email: string },
    losingVendors: { name: string; email: string }[],
    pmEmail: string
  ): Promise<boolean> {
    try {
      console.log(`📧 [EmailService] Notifica aggiudicazione RDO ${rdo.id}`);

      const template = this.templates.get('award_notification')!;

      // Notifica vincitore
      const winnerData = {
        vendorName: winningVendor.name,
        rdoTitle: rdo.title,
        rdoId: rdo.id,
        awardDate: new Date().toLocaleDateString('it-IT'),
        nextSteps: 'Contattare il project manager per i dettagli contrattuali',
        contactEmail: pmEmail,
      };

      const winnerEmail = this.processTemplate(template, winnerData);

      await this.transporter.sendMail({
        from: this.config.from,
        to: winningVendor.email,
        subject: `🎉 CONGRATULAZIONI! RDO Aggiudicato - ${rdo.title}`,
        html: winnerEmail.html,
        text: winnerEmail.text,
        replyTo: this.config.replyTo,
      });

      // Notifica perdenti
      const loserTemplate = {
        subject: 'RDO {{rdoTitle}} - Esito Valutazione',
        html: this.getLoserNotificationHTML(),
        text: this.getLoserNotificationText(),
      };

      for (const vendor of losingVendors) {
        const loserData = {
          vendorName: vendor.name,
          rdoTitle: rdo.title,
          rdoId: rdo.id,
          feedback: 'Grazie per la partecipazione. La sua offerta è stata valutata positivamente.',
          futureOpportunities: 'La invitiamo a partecipare alle prossime gare Urbanova.',
        };

        const loserEmail = this.processTemplate(loserTemplate, loserData);

        await this.transporter.sendMail({
          from: this.config.from,
          to: vendor.email,
          subject: loserEmail.subject,
          html: loserEmail.html,
          text: loserEmail.text,
          replyTo: this.config.replyTo,
        });
      }

      console.log(`✅ [EmailService] Notifiche aggiudicazione inviate`);
      return true;
    } catch (error) {
      console.error(`❌ [EmailService] Errore notifica aggiudicazione:`, error);
      return false;
    }
  }

  /**
   * Processa template con dati
   */
  private processTemplate(template: EmailTemplate, data: any): EmailTemplate {
    let processed = { ...template };

    // Sostituisci placeholder
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      processed.subject = processed.subject.replace(placeholder, data[key]);
      processed.html = processed.html.replace(placeholder, data[key]);
      processed.text = processed.text.replace(placeholder, data[key]);
    });

    return processed;
  }

  /**
   * Template HTML invito RDO
   */
  private getRDOInvitationHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invito RDO Urbanova</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Invito RDO Urbanova</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{vendorName}},</h2>
            
            <p>Sei stato invitato a partecipare alla seguente Richiesta di Offerta:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>{{rdoTitle}}</h3>
              <p><strong>Descrizione:</strong> {{rdoDescription}}</p>
              <p><strong>Progetto:</strong> {{projectId}}</p>
              <p><strong>Valore stimato:</strong> {{estimatedValue}}</p>
              <p><strong>Località:</strong> {{location}}</p>
              <p><strong>Scadenza:</strong> {{deadline}}</p>
            </div>
            
            <p>Per partecipare, clicca sul pulsante qui sotto:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{accessLink}}" class="button">📝 Compila Offerta</a>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Il link è valido fino alla scadenza dell'RDO</li>
              <li>Assicurati di compilare tutti i campi richiesti</li>
              <li>Puoi salvare e completare l'offerta in più sessioni</li>
            </ul>
            
            <p>Per supporto tecnico: <a href="mailto:procurement-support@urbanova.com">procurement-support@urbanova.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
            <p>Questo messaggio è stato inviato automaticamente</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo invito RDO
   */
  private getRDOInvitationText(): string {
    return `
      Invito RDO Urbanova
    
      Ciao {{vendorName}},
      
      Sei stato invitato a partecipare alla seguente Richiesta di Offerta:
      
      Titolo: {{rdoTitle}}
      Descrizione: {{rdoDescription}}
      Progetto: {{projectId}}
      Valore stimato: {{estimatedValue}}
      Località: {{location}}
      Scadenza: {{deadline}}
      
      Per partecipare, visita: {{accessLink}}
      
      Il link è valido fino alla scadenza dell'RDO.
      
      Per supporto: procurement-support@urbanova.com
      
      © 2024 Urbanova
    `;
  }

  /**
   * Template HTML conferma offerta
   */
  private getOfferConfirmationHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Offerta Ricevuta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Offerta Ricevuta</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{vendorName}},</h2>
            
            <p>La tua offerta per l'RDO <strong>{{rdoTitle}}</strong> è stata ricevuta con successo!</p>
            
            <div class="summary">
              <h3>Riepilogo Offerta</h3>
              <p><strong>ID Offerta:</strong> {{offerId}}</p>
              <p><strong>Prezzo Totale:</strong> {{totalPrice}}</p>
              <p><strong>Tempo Consegna:</strong> {{totalTime}}</p>
              <p><strong>Punteggio Qualità:</strong> {{qualityScore}}</p>
              <p><strong>Inviata il:</strong> {{submittedAt}}</p>
            </div>
            
            <p><strong>Prossimi passi:</strong></p>
            <ul>
              <li>La tua offerta sarà valutata dal team Urbanova</li>
              <li>Riceverai notifiche sullo stato di avanzamento</li>
              <li>Il risultato finale sarà comunicato entro {{rdoDeadline}}</li>
            </ul>
            
            <p>Per domande: <a href="mailto:procurement-support@urbanova.com">procurement-support@urbanova.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo conferma offerta
   */
  private getOfferConfirmationText(): string {
    return `
      Offerta Ricevuta
    
      Ciao {{vendorName}},
      
      La tua offerta per l'RDO {{rdoTitle}} è stata ricevuta con successo!
      
      Riepilogo:
      - ID Offerta: {{offerId}}
      - Prezzo Totale: {{totalPrice}}
      - Tempo Consegna: {{totalTime}}
      - Punteggio Qualità: {{qualityScore}}
      - Inviata il: {{submittedAt}}
      
      Prossimi passi:
      - La tua offerta sarà valutata
      - Riceverai notifiche sullo stato
      - Il risultato finale sarà comunicato entro {{rdoDeadline}}
      
      Per domande: procurement-support@urbanova.com
      
      © 2024 Urbanova
    `;
  }

  /**
   * Template HTML notifica PM
   */
  private getPMNotificationHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuova Offerta Ricevuta</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 Nuova Offerta Ricevuta</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{pmName}},</h2>
            
            <p>È stata ricevuta una nuova offerta per l'RDO <strong>{{rdoTitle}}</strong>.</p>
            
            <div class="summary">
              <h3>Dettagli Offerta</h3>
              <p><strong>Vendor:</strong> {{vendorName}}</p>
              <p><strong>ID Offerta:</strong> {{offerId}}</p>
              <p><strong>Prezzo Totale:</strong> {{totalPrice}}</p>
              <p><strong>Tempo Consegna:</strong> {{totalTime}}</p>
              <p><strong>Punteggio Qualità:</strong> {{qualityScore}}</p>
              <p><strong>Inviata il:</strong> {{submittedAt}}</p>
              <p><strong>Totale Offerte:</strong> {{totalOffers}}</p>
            </div>
            
            <p><strong>Scadenza RDO:</strong> {{rdoDeadline}}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardLink}}" class="button">📊 Visualizza Dashboard</a>
            </div>
            
            <p>Per gestire l'RDO: <a href="{{dashboardLink}}">{{dashboardLink}}</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo notifica PM
   */
  private getPMNotificationText(): string {
    return `
      Nuova Offerta Ricevuta
    
      Ciao {{pmName}},
      
      È stata ricevuta una nuova offerta per l'RDO {{rdoTitle}}.
      
      Dettagli:
      - Vendor: {{vendorName}}
      - ID Offerta: {{offerId}}
      - Prezzo Totale: {{totalPrice}}
      - Tempo Consegna: {{totalTime}}
      - Punteggio Qualità: {{qualityScore}}
      - Inviata il: {{submittedAt}}
      - Totale Offerte: {{totalOffers}}
      
      Scadenza RDO: {{rdoDeadline}}
      
      Dashboard: {{dashboardLink}}
      
      © 2024 Urbanova
    `;
  }

  /**
   * Template HTML pre-check fallito
   */
  private getPreCheckFailedHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pre-check Fallito</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Pre-check Fallito</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{vendorName}},</h2>
            
            <p>Il pre-check per l'RDO <strong>{{rdoTitle}}</strong> è fallito.</p>
            
            <div class="alert">
              <h3>Problemi Rilevati</h3>
              <p>{{issues}}</p>
            </div>
            
            <p><strong>Scadenza RDO:</strong> {{deadline}}</p>
            
            <p><strong>Azioni richieste:</strong></p>
            <ul>
              <li>Aggiorna i documenti scaduti</li>
              <li>Verifica la validità delle certificazioni</li>
              <li>Contatta il supporto se necessario</li>
            </ul>
            
            <p>Per supporto: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            <p>Project Manager: <a href="mailto:{{pmEmail}}">{{pmEmail}}</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo pre-check fallito
   */
  private getPreCheckFailedText(): string {
    return `
      Pre-check Fallito
    
      Ciao {{vendorName}},
      
      Il pre-check per l'RDO {{rdoTitle}} è fallito.
      
      Problemi rilevati: {{issues}}
      
      Scadenza RDO: {{deadline}}
      
      Azioni richieste:
      - Aggiorna i documenti scaduti
      - Verifica la validità delle certificazioni
      - Contatta il supporto se necessario
      
      Supporto: {{supportEmail}}
      Project Manager: {{pmEmail}}
      
      © 2024 Urbanova
    `;
  }

  /**
   * Template HTML pre-check fallito per PM
   */
  private getPreCheckFailedPMHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ALERT: Pre-check Fallito</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 ALERT: Pre-check Fallito</h1>
          </div>
          
          <div class="content">
            <h2>Project Manager,</h2>
            
            <p>Il pre-check per l'RDO <strong>{{rdoTitle}}</strong> è fallito per il vendor <strong>{{vendorName}}</strong>.</p>
            
            <div class="alert">
              <h3>Problemi Rilevati</h3>
              <p>{{issues}}</p>
            </div>
            
            <p><strong>RDO ID:</strong> {{rdoId}}</p>
            <p><strong>Scadenza:</strong> {{deadline}}</p>
            
            <p><strong>Azioni richieste:</strong></p>
            <ul>
              <li>Contatta il vendor per aggiornamenti</li>
              <li>Valuta se procedere con override</li>
              <li>Considera alternative se necessario</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo pre-check fallito per PM
   */
  private getPreCheckFailedPMText(data: any): string {
    return `
      ALERT: Pre-check Fallito
    
      Project Manager,
      
      Il pre-check per l'RDO {{rdoTitle}} è fallito per il vendor {{vendorName}}.
      
      Problemi rilevati: {{issues}}
      
      RDO ID: {{rdoId}}
      Scadenza: {{deadline}}
      
      Azioni richieste:
      - Contatta il vendor per aggiornamenti
      - Valuta se procedere con override
      - Considera alternative se necessario
    `;
  }

  /**
   * Template HTML notifica aggiudicazione
   */
  private getAwardNotificationHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>RDO Aggiudicato</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .success { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 RDO Aggiudicato</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{vendorName}},</h2>
            
            <p><strong>Congratulazioni!</strong> Hai vinto l'RDO <strong>{{rdoTitle}}</strong>!</p>
            
            <div class="success">
              <h3>Dettagli Aggiudicazione</h3>
              <p><strong>RDO ID:</strong> {{rdoId}}</p>
              <p><strong>Data Aggiudicazione:</strong> {{awardDate}}</p>
            </div>
            
            <p><strong>Prossimi passi:</strong></p>
            <p>{{nextSteps}}</p>
            
            <p>Contatto: <a href="mailto:{{contactEmail}}">{{contactEmail}}</a></p>
            
            <p>Benvenuto nella famiglia Urbanova! 🎉</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo notifica aggiudicazione
   */
  private getAwardNotificationText(): string {
    return `
      RDO Aggiudicato
    
      Ciao {{vendorName}},
      
      Congratulazioni! Hai vinto l'RDO {{rdoTitle}}!
      
      Dettagli:
      - RDO ID: {{rdoId}}
      - Data Aggiudicazione: {{awardDate}}
      
      Prossimi passi: {{nextSteps}}
      
      Contatto: {{contactEmail}}
      
      Benvenuto nella famiglia Urbanova! 🎉
      
      © 2024 Urbanova
    `;
  }

  /**
   * Template HTML notifica perdente
   */
  private getLoserNotificationHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Esito Valutazione RDO</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8fafc; }
          .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Esito Valutazione RDO</h1>
          </div>
          
          <div class="content">
            <h2>Ciao {{vendorName}},</h2>
            
            <p>Grazie per aver partecipato all'RDO <strong>{{rdoTitle}}</strong>.</p>
            
            <div class="info">
              <h3>Feedback</h3>
              <p>{{feedback}}</p>
              
              <h3>Opportunità Future</h3>
              <p>{{futureOpportunities}}</p>
            </div>
            
            <p>La tua partecipazione è molto apprezzata e speriamo di collaborare in futuro.</p>
            
            <p>Per domande: <a href="mailto:procurement-support@urbanova.com">procurement-support@urbanova.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Urbanova - Sistema Procurement Avanzato</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template testo notifica perdente
   */
  private getLoserNotificationText(): string {
    return `
      Esito Valutazione RDO
    
      Ciao {{vendorName}},
      
      Grazie per aver partecipato all'RDO {{rdoTitle}}.
      
      Feedback: {{feedback}}
      
      Opportunità Future: {{futureOpportunities}}
      
      La tua partecipazione è molto apprezzata e speriamo di collaborare in futuro.
      
      Per domande: procurement-support@urbanova.com
      
      © 2024 Urbanova
    `;
  }

  /**
   * Test connessione email
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ [EmailService] Connessione email verificata');
      return true;
    } catch (error) {
      console.error('❌ [EmailService] Errore connessione email:', error);
      return false;
    }
  }

  /**
   * Health check del servizio
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const connectionOk = await this.testConnection();

      return {
        status: connectionOk ? 'healthy' : 'unhealthy',
        details: {
          connection: connectionOk ? 'ok' : 'failed',
          templates: this.templates.size,
          config: {
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            from: this.config.from,
          },
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: (error as any).message },
      };
    }
  }
}
