'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ReminderService = void 0;
/**
 * Reminder Service
 *
 * Gestione completa reminder:
 * - WhatsApp via Twilio
 * - Email via SendGrid
 * - SMS via Twilio
 * - Template personalizzati
 * - Scheduling automatico
 * - Tracking delivery
 */
class ReminderService {
  constructor() {
    this.reminders = new Map();
    this.templates = new Map();
    this.initializeTemplates();
    this.initializeClients();
  }
  /**
   * Inizializza template
   */
  initializeTemplates() {
    // Template KYC Upload
    this.templates.set('kyc_upload', {
      id: 'kyc_upload',
      name: 'KYC Upload Reminder',
      description: 'Reminder per upload documenti KYC',
      channels: ['email', 'whatsapp'],
      subject: 'Documenti KYC richiesti - Urbanova',
      content: {
        email: {
          subject: 'Documenti KYC richiesti per {{projectName}}',
          body: `
            Gentile {{buyerName}},
            
            Per procedere con il progetto {{projectName}}, abbiamo bisogno di alcuni documenti.
            
            Tipi di documento richiesti: {{documentTypes}}
            Link upload: {{uploadLink}}
            Scadenza: {{expiresIn}} giorni
            
            Grazie per la collaborazione.
            Team Urbanova
          `,
        },
        whatsapp: {
          body: `Ciao {{buyerName}}! 📋

Per il progetto {{projectName}} abbiamo bisogno di alcuni documenti:
{{documentTypes}}

📤 Upload: {{uploadLink}}
⏰ Scadenza: {{expiresIn}} giorni

Grazie! 🏠`,
        },
      },
    });
    // Template Appointment Reminder
    this.templates.set('appointment_reminder', {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      description: 'Reminder appuntamento',
      channels: ['email', 'whatsapp'],
      subject: 'Promemoria appuntamento - Urbanova',
      content: {
        email: {
          subject: 'Promemoria: {{appointmentType}} - {{when}}',
          body: `
            Gentile {{buyerName}},
            
            Le ricordiamo l'appuntamento per {{appointmentType}}.
            
            Data: {{when}}
            Luogo: {{location}}
            {{#if icsUrl}}Calendario: {{icsUrl}}{{/if}}
            
            Cordiali saluti,
            Team Urbanova
          `,
        },
        whatsapp: {
          body: `Ciao {{buyerName}}! 📅

Promemoria appuntamento:
{{appointmentType}}
📅 {{when}}
📍 {{location}}
{{#if icsUrl}}📄 Calendario: {{icsUrl}}{{/if}}

A presto! 🏠`,
        },
      },
    });
    // Template Appointment Confirmation
    this.templates.set('appointment_confirmation', {
      id: 'appointment_confirmation',
      name: 'Appointment Confirmation',
      description: 'Conferma appuntamento',
      channels: ['email', 'whatsapp'],
      subject: 'Conferma appuntamento - Urbanova',
      content: {
        email: {
          subject: 'Confermato: {{appointmentType}} - {{when}}',
          body: `
            Gentile {{buyerName}},
            
            L'appuntamento per {{appointmentType}} è stato confermato.
            
            Data: {{when}}
            Luogo: {{location}}
            {{#if icsUrl}}Calendario: {{icsUrl}}{{/if}}
            {{#if googleEventUrl}}Google Calendar: {{googleEventUrl}}{{/if}}
            
            Cordiali saluti,
            Team Urbanova
          `,
        },
        whatsapp: {
          body: `Ciao {{buyerName}}! ✅

Appuntamento confermato:
{{appointmentType}}
📅 {{when}}
📍 {{location}}
{{#if icsUrl}}📄 Calendario: {{icsUrl}}{{/if}}

Perfetto! 🏠`,
        },
      },
    });
    // Template Payment Reminder
    this.templates.set('payment_reminder', {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      description: 'Reminder pagamento',
      channels: ['email', 'whatsapp'],
      subject: 'Promemoria pagamento - Urbanova',
      content: {
        email: {
          subject: 'Promemoria pagamento: {{milestone}} - {{amount}}',
          body: `
            Gentile {{buyerName}},
            
            Le ricordiamo il pagamento per {{milestone}}.
            
            Importo: {{amount}}
            Scadenza: {{dueDate}}
            Pagamento: {{paymentUrl}}
            
            Cordiali saluti,
            Team Urbanova
          `,
        },
        whatsapp: {
          body: `Ciao {{buyerName}}! 💰

Promemoria pagamento:
{{milestone}}
💶 {{amount}}
⏰ Scadenza: {{dueDate}}
💳 Pagamento: {{paymentUrl}}

Grazie! 🏠`,
        },
      },
    });
    // Template Payment Reminder SMS
    this.templates.set('payment_reminder_sms', {
      id: 'payment_reminder_sms',
      name: 'Payment Reminder SMS',
      description: 'Reminder pagamento SMS',
      channels: ['sms'],
      content: {
        sms: {
          body: `Urbanova: Promemoria pagamento {{milestone}} - {{amount}}. Scadenza: {{dueDate}}.`,
        },
      },
    });
  }
  /**
   * Inizializza client
   */
  initializeClients() {
    // Simulazione Twilio
    this.twilioClient = {
      sendWhatsApp: async (to, body) => {
        console.log(`📱 Twilio WhatsApp - To: ${to}, Body: ${body.substring(0, 50)}...`);
        return {
          sid: `msg_${Date.now()}`,
          status: 'delivered',
          sentAt: new Date(),
        };
      },
      sendSMS: async (to, body) => {
        console.log(`📱 Twilio SMS - To: ${to}, Body: ${body.substring(0, 50)}...`);
        return {
          sid: `msg_${Date.now()}`,
          status: 'delivered',
          sentAt: new Date(),
        };
      },
    };
    // Simulazione SendGrid
    this.sendgridClient = {
      sendEmail: async (to, subject, body) => {
        console.log(`📧 SendGrid Email - To: ${to}, Subject: ${subject}`);
        return {
          messageId: `msg_${Date.now()}`,
          status: 'sent',
          sentAt: new Date(),
        };
      },
    };
  }
  /**
   * Schedula reminder
   */
  async scheduleReminder(request) {
    const reminder = {
      id: `rem_${Date.now()}`,
      appointmentId: request.appointmentId,
      buyerId: request.buyerId,
      channel: request.channel,
      template: request.template,
      scheduledAt: request.scheduledAt,
      data: request.data,
      status: 'scheduled',
      createdAt: new Date(),
      sentAt: null,
      deliveryStatus: null,
      errorMessage: null,
    };
    this.reminders.set(reminder.id, reminder);
    console.log(
      `⏰ Reminder Scheduled - ID: ${reminder.id}, Channel: ${request.channel}, Template: ${request.template}`
    );
    return reminder;
  }
  /**
   * Invia reminder
   */
  async sendReminder(reminderId, channels = ['whatsapp', 'email']) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }
    const results = [];
    for (const channel of channels) {
      try {
        let sent = false;
        switch (channel) {
          case 'whatsapp':
            sent = await this.sendWhatsApp(
              reminder.data.to || reminder.data.phone,
              reminder.template,
              reminder.data
            );
            break;
          case 'email':
            sent = await this.sendEmail(
              reminder.data.to || reminder.data.email,
              reminder.template,
              reminder.data
            );
            break;
          case 'sms':
            sent = await this.sendSMS(
              reminder.data.to || reminder.data.phone,
              reminder.template,
              reminder.data
            );
            break;
        }
        results.push({ channel, sent });
        if (sent) {
          reminder.status = 'sent';
          reminder.sentAt = new Date();
          reminder.deliveryStatus = 'delivered';
        }
      } catch (error) {
        results.push({
          channel,
          sent: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        reminder.status = 'failed';
        reminder.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    reminder.updatedAt = new Date();
    console.log(`📢 Reminder Sent - ID: ${reminderId}, Results: ${JSON.stringify(results)}`);
    return { reminderId, results };
  }
  /**
   * Invia WhatsApp
   */
  async sendWhatsApp(to, template, data) {
    const templateObj = this.templates.get(template);
    if (!templateObj || !templateObj.content.whatsapp) {
      throw new Error(`WhatsApp template ${template} not found`);
    }
    const body = this.renderTemplate(templateObj.content.whatsapp.body, data);
    const result = await this.twilioClient.sendWhatsApp(to, body);
    return result.status === 'delivered';
  }
  /**
   * Invia Email
   */
  async sendEmail(to, template, data) {
    const templateObj = this.templates.get(template);
    if (!templateObj || !templateObj.content.email) {
      throw new Error(`Email template ${template} not found`);
    }
    const subject = this.renderTemplate(templateObj.content.email.subject, data);
    const body = this.renderTemplate(templateObj.content.email.body, data);
    const result = await this.sendgridClient.sendEmail(to, subject, body);
    return result.status === 'sent';
  }
  /**
   * Invia SMS
   */
  async sendSMS(to, template, data) {
    const templateObj = this.templates.get(template);
    if (!templateObj || !templateObj.content.sms) {
      throw new Error(`SMS template ${template} not found`);
    }
    const body = this.renderTemplate(templateObj.content.sms.body, data);
    const result = await this.twilioClient.sendSMS(to, body);
    return result.status === 'delivered';
  }
  /**
   * Crea reminder pagamento
   */
  async createPaymentReminder(request) {
    const reminderId = `pay_rem_${Date.now()}`;
    const paymentUrl = `https://pay.urbanova.com/payment/${reminderId}`;
    const reminder = {
      id: reminderId,
      appointmentId: null,
      buyerId: request.buyerId,
      channel: 'email',
      template: 'payment_reminder',
      scheduledAt: new Date(),
      data: {
        milestone: request.milestone,
        amount: `€${request.amount.toFixed(2)}`,
        dueDate: request.dueDate.toISOString(),
        paymentUrl,
        requireConfirmation: request.requireConfirmation !== false,
      },
      status: 'scheduled',
      createdAt: new Date(),
      sentAt: null,
      deliveryStatus: null,
      errorMessage: null,
    };
    this.reminders.set(reminder.id, reminder);
    console.log(`💰 Payment Reminder Created - ID: ${reminderId}, Milestone: ${request.milestone}`);
    return {
      id: reminderId,
      paymentUrl,
    };
  }
  /**
   * Ottieni reminder
   */
  async getReminder(reminderId) {
    return this.reminders.get(reminderId) || null;
  }
  /**
   * Lista reminder
   */
  async listReminders(filters = {}) {
    let reminders = Array.from(this.reminders.values());
    if (filters.buyerId) {
      reminders = reminders.filter(rem => rem.buyerId === filters.buyerId);
    }
    if (filters.appointmentId) {
      reminders = reminders.filter(rem => rem.appointmentId === filters.appointmentId);
    }
    if (filters.status) {
      reminders = reminders.filter(rem => rem.status === filters.status);
    }
    if (filters.channel) {
      reminders = reminders.filter(rem => rem.channel === filters.channel);
    }
    return reminders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * Aggiorna status reminder
   */
  async updateReminderStatus(reminderId, status) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }
    reminder.status = status;
    reminder.updatedAt = new Date();
    if (status === 'sent') {
      reminder.sentAt = new Date();
    }
    console.log(`🔄 Reminder Status Updated - ID: ${reminderId}, Status: ${status}`);
    return reminder;
  }
  /**
   * Elimina reminder
   */
  async deleteReminder(reminderId) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      return false;
    }
    this.reminders.delete(reminderId);
    console.log(`🗑️ Reminder Deleted - ID: ${reminderId}`);
    return true;
  }
  /**
   * Render template
   */
  renderTemplate(template, data) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], data);
      return value !== undefined ? value : match;
    });
  }
  /**
   * Aggiungi template
   */
  async addTemplate(template) {
    this.templates.set(template.id, template);
    console.log(`📝 Template Added - ID: ${template.id}, Name: ${template.name}`);
  }
  /**
   * Ottieni template
   */
  async getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }
  /**
   * Lista template
   */
  async listTemplates() {
    return Array.from(this.templates.values());
  }
}
exports.ReminderService = ReminderService;
//# sourceMappingURL=reminderService.js.map
