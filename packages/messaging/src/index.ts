// Messaging service interfaces and implementations

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SMSMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string;
  template?: {
    name: string;
    parameters: string[];
  };
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// Email service
export class EmailService {
  async sendEmail(message: EmailMessage): Promise<MessageResult> {
    // Mock implementation
    console.log('Sending email:', message.subject, 'to:', message.to);
    return {
      success: true,
      messageId: `email_${Date.now()}`,
      timestamp: new Date()
    };
  }

  async sendBulkEmails(messages: EmailMessage[]): Promise<MessageResult[]> {
    // Mock implementation
    return messages.map(message => ({
      success: true,
      messageId: `email_${Date.now()}`,
      timestamp: new Date()
    }));
  }
}

// SMS service
export class SMSService {
  async sendSMS(message: SMSMessage): Promise<MessageResult> {
    // Mock implementation
    console.log('Sending SMS to:', message.to);
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      timestamp: new Date()
    };
  }
}

// WhatsApp service
export class WhatsAppService {
  async sendMessage(message: WhatsAppMessage): Promise<MessageResult> {
    // Mock implementation
    console.log('Sending WhatsApp message to:', message.to);
    return {
      success: true,
      messageId: `whatsapp_${Date.now()}`,
      timestamp: new Date()
    };
  }

  async sendTemplate(template: WhatsAppMessage): Promise<MessageResult> {
    // Mock implementation
    console.log('Sending WhatsApp template:', template.template?.name);
    return {
      success: true,
      messageId: `whatsapp_template_${Date.now()}`,
      timestamp: new Date()
    };
  }
}

// Unified messaging service
export class MessagingService {
  private emailService: EmailService;
  private smsService: SMSService;
  private whatsappService: WhatsAppService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.whatsappService = new WhatsAppService();
  }

  async sendEmail(message: EmailMessage): Promise<MessageResult> {
    return this.emailService.sendEmail(message);
  }

  async sendSMS(message: SMSMessage): Promise<MessageResult> {
    return this.smsService.sendSMS(message);
  }

  async sendWhatsApp(message: WhatsAppMessage): Promise<MessageResult> {
    return this.whatsappService.sendMessage(message);
  }
}
