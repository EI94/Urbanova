import {
  AppointmentLocation,
  AppointmentParticipant,
  CollectKYCResponse,
  ScheduleFittingsResponse,
  RemindPaymentResponse,
  GetBuyerInfoResponse,
  ListAppointmentsResponse,
  GenerateICSResponse,
  SendReminderResponse,
  UpdatePrivacyResponse,
} from '@urbanova/types';
/**
 * Buyer Concierge Tool
 *
 * Sistema completo per gestione acquirente:
 * - KYC con upload reali Doc Hunter
 * - Appuntamenti con ICS RFC 5545
 * - Google Calendar integration
 * - Reminder automatici WhatsApp/Email
 * - Privacy by design GDPR compliant
 * - JWT links sicuri temporanei
 */
export declare class BuyerTool {
  private kycService;
  private appointmentService;
  private icsService;
  private reminderService;
  private privacyService;
  private jwtService;
  private googleCalendarService;
  constructor();
  /**
   * Collect KYC - Raccoglie documenti KYC con link upload Doc Hunter
   */
  collectKYC(
    projectId: string,
    buyerId?: string,
    documentTypes?: string[],
    options?: {
      sendEmail?: boolean;
      sendWhatsApp?: boolean;
      retentionDays?: number;
    }
  ): Promise<CollectKYCResponse>;
  /**
   * Schedule Fittings - Schedula appuntamenti finiture con ICS
   */
  scheduleFittings(
    buyerId: string,
    when: Date,
    location: AppointmentLocation,
    type: 'fitting' | 'visit' | 'consultation',
    participants?: AppointmentParticipant[],
    reminders?: {
      whatsapp?: boolean;
      email?: boolean;
      sms?: boolean;
    },
    options?: {
      generateICS?: boolean;
      syncGoogleCalendar?: boolean;
      sendConfirmation?: boolean;
    }
  ): Promise<ScheduleFittingsResponse>;
  /**
   * Remind Payment - Invia reminder pagamento con conferma
   */
  remindPayment(
    buyerId: string,
    milestone: string,
    amount: number,
    dueDate: Date,
    options?: {
      sendWhatsApp?: boolean;
      sendEmail?: boolean;
      sendSMS?: boolean;
      requireConfirmation?: boolean;
    }
  ): Promise<RemindPaymentResponse>;
  /**
   * Get Buyer Info - Ottieni informazioni acquirente
   */
  getBuyerInfo(buyerId: string): Promise<GetBuyerInfoResponse>;
  /**
   * List Appointments - Lista appuntamenti acquirente
   */
  listAppointments(
    buyerId: string,
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    fromDate?: Date,
    toDate?: Date
  ): Promise<ListAppointmentsResponse>;
  /**
   * Generate ICS - Genera file ICS per appuntamento
   */
  generateICS(
    appointmentId: string,
    options?: {
      includeAttachments?: boolean;
      includeRecurrence?: boolean;
      timezone?: string;
    }
  ): Promise<GenerateICSResponse>;
  /**
   * Send Reminder - Invia reminder manuale
   */
  sendReminder(
    reminderId: string,
    channels?: ('whatsapp' | 'email' | 'sms')[]
  ): Promise<SendReminderResponse>;
  /**
   * Update Privacy - Aggiorna impostazioni privacy
   */
  updatePrivacy(
    buyerId: string,
    retentionPolicy?: {
      retentionPeriod?: number;
      autoDelete?: boolean;
      projectBased?: boolean;
    },
    dataSubjectRights?: {
      rightToAccess?: boolean;
      rightToRectification?: boolean;
      rightToErasure?: boolean;
      rightToPortability?: boolean;
    }
  ): Promise<UpdatePrivacyResponse>;
}
//# sourceMappingURL=buyerTool.d.ts.map
