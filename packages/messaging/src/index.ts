// Messaging services
export interface MessagingService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
  sendWhatsApp(to: string, message: string): Promise<void>;
}

// SendGrid service
export class SendGridService implements MessagingService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Mock implementation
    console.log(`SendGrid Email to ${to}: ${subject}`);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    // Not supported by SendGrid
    throw new Error('SMS not supported by SendGrid');
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    // Not supported by SendGrid
    throw new Error('WhatsApp not supported by SendGrid');
  }
}

// Twilio service
export class TwilioService implements MessagingService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Not supported by Twilio
    throw new Error('Email not supported by Twilio');
  }

  async sendSMS(to: string, message: string): Promise<void> {
    // Mock implementation
    console.log(`Twilio SMS to ${to}: ${message}`);
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    // Mock implementation
    console.log(`Twilio WhatsApp to ${to}: ${message}`);
  }
}
