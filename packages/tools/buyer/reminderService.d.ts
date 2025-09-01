import {
  AppointmentReminder,
  ReminderTemplate,
  ReminderChannel,
  ReminderStatus,
} from '@urbanova/types';
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
export declare class ReminderService {
  private reminders;
  private templates;
  private twilioClient;
  private sendgridClient;
  constructor();
  /**
   * Inizializza template
   */
  private initializeTemplates;
  /**
   * Inizializza client
   */
  private initializeClients;
  /**
   * Schedula reminder
   */
  scheduleReminder(request: {
    appointmentId: string;
    buyerId: string;
    channel: ReminderChannel;
    template: string;
    scheduledAt: Date;
    data: any;
  }): Promise<AppointmentReminder>;
  /**
   * Invia reminder
   */
  sendReminder(
    reminderId: string,
    channels?: ReminderChannel[]
  ): Promise<{
    reminderId: string;
    results: {
      channel: ReminderChannel;
      sent: boolean;
      error?: string;
    }[];
  }>;
  /**
   * Invia WhatsApp
   */
  sendWhatsApp(to: string, template: string, data: any): Promise<boolean>;
  /**
   * Invia Email
   */
  sendEmail(to: string, template: string, data: any): Promise<boolean>;
  /**
   * Invia SMS
   */
  sendSMS(to: string, template: string, data: any): Promise<boolean>;
  /**
   * Crea reminder pagamento
   */
  createPaymentReminder(request: {
    buyerId: string;
    milestone: string;
    amount: number;
    dueDate: Date;
    requireConfirmation?: boolean;
  }): Promise<{
    id: string;
    paymentUrl: string;
  }>;
  /**
   * Ottieni reminder
   */
  getReminder(reminderId: string): Promise<AppointmentReminder | null>;
  /**
   * Lista reminder
   */
  listReminders(filters?: {
    buyerId?: string;
    appointmentId?: string;
    status?: ReminderStatus;
    channel?: ReminderChannel;
  }): Promise<AppointmentReminder[]>;
  /**
   * Aggiorna status reminder
   */
  updateReminderStatus(reminderId: string, status: ReminderStatus): Promise<AppointmentReminder>;
  /**
   * Elimina reminder
   */
  deleteReminder(reminderId: string): Promise<boolean>;
  /**
   * Render template
   */
  private renderTemplate;
  /**
   * Aggiungi template
   */
  addTemplate(template: ReminderTemplate): Promise<void>;
  /**
   * Ottieni template
   */
  getTemplate(templateId: string): Promise<ReminderTemplate | null>;
  /**
   * Lista template
   */
  listTemplates(): Promise<ReminderTemplate[]>;
}
//# sourceMappingURL=reminderService.d.ts.map
