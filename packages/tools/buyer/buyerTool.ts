import {
  Buyer,
  BuyerDocument,
  Appointment,
  AppointmentLocation,
  AppointmentParticipant,
  AppointmentReminder,
  ICSFile,
  ICSEvent,
  BuyerJWTLink,
  CollectKYCRequest,
  CollectKYCResponse,
  ScheduleFittingsRequest,
  ScheduleFittingsResponse,
  RemindPaymentRequest,
  RemindPaymentResponse,
  GetBuyerInfoResponse,
  ListAppointmentsResponse,
  GenerateICSResponse,
  SendReminderResponse,
  UpdatePrivacyResponse,
} from '@urbanova/types';

import { KYCService } from './kycService';
import { AppointmentService } from './appointmentService';
import { ICSService } from './icsService';
import { ReminderService } from './reminderService';
import { PrivacyService } from './privacyService';
import { JWTService } from './jwtService';
import { GoogleCalendarService } from './googleCalendarService';

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

export class BuyerTool {
  private kycService: KYCService;
  private appointmentService: AppointmentService;
  private icsService: ICSService;
  private reminderService: ReminderService;
  private privacyService: PrivacyService;
  private jwtService: JWTService;
  private googleCalendarService: GoogleCalendarService;

  constructor() {
    this.kycService = new KYCService();
    this.appointmentService = new AppointmentService();
    this.icsService = new ICSService();
    this.reminderService = new ReminderService();
    this.privacyService = new PrivacyService();
    this.jwtService = new JWTService();
    this.googleCalendarService = new GoogleCalendarService();
  }

  /**
   * Collect KYC - Raccoglie documenti KYC con link upload Doc Hunter
   */
  async collectKYC(
    projectId: string,
    buyerId?: string,
    documentTypes: string[] = ['identity', 'income', 'bank_statement'],
    options: {
      sendEmail?: boolean;
      sendWhatsApp?: boolean;
      retentionDays?: number;
    } = {}
  ): Promise<CollectKYCResponse> {
    console.log(`🔐 Collect KYC - Project: ${projectId}, Buyer: ${buyerId || 'new'}`);

    try {
      // 1. Crea o recupera buyer
      const buyer = buyerId
        ? await this.privacyService.getBuyer(buyerId)
        : await this.privacyService.createBuyer(projectId);

      if (!buyer) {
        throw new Error('Impossibile creare o recuperare il buyer');
      }

      // 2. Genera JWT link per upload
      const uploadLink = await this.jwtService.generateUploadLink({
        buyerId: buyer.id,
        projectId,
        documentTypes,
        expiresIn: options.retentionDays || 7,
        permissions: ['upload', 'view'],
      });

      // 3. Crea richiesta KYC
      const kycRequest = await this.kycService.createKYCRequest({
        buyerId: buyer.id,
        projectId,
        documentTypes,
        uploadLink: uploadLink.url,
        status: 'pending',
      });

      // 4. Invia notifiche
      const notifications = [];

      if (options.sendEmail !== false) {
        const emailSent = await this.reminderService.sendEmail(
          buyer.email,
          'kyc_upload',
          {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            projectName: projectId,
            uploadLink: uploadLink.url,
            documentTypes,
            expiresIn: options.retentionDays || 7,
          }
        );
        notifications.push({ channel: 'email', sent: emailSent });
      }

      if (options.sendWhatsApp !== false) {
        const whatsappSent = await this.reminderService.sendWhatsApp(
          buyer.phone,
          'kyc_upload',
          {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            projectName: projectId,
            uploadLink: uploadLink.url,
            documentTypes: documentTypes.join(', '),
            expiresIn: options.retentionDays || 7,
          }
        );
        notifications.push({ channel: 'whatsapp', sent: whatsappSent });
      }

      return {
        success: true,
        buyerId: buyer.id,
        uploadLinks: [uploadLink],
        kycStatus: 'pending',
        kycRequestId: kycRequest.id,
        uploadLink: uploadLink.url,
        expiresAt: uploadLink.expiresAt,
        notifications,
        message: 'KYC collection initiated successfully',
      };
    } catch (error) {
      console.error('❌ Collect KYC error:', error);
      return {
        success: false,
        buyerId: buyerId || '',
        uploadLinks: [],
        kycStatus: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to initiate KYC collection',
        expiresAt: new Date(),
      };
    }
  }

  /**
   * Schedule Fittings - Schedula appuntamenti finiture con ICS
   */
  async scheduleFittings(
    buyerId: string,
    when: Date,
    location: AppointmentLocation,
    type: 'fitting' | 'visit' | 'consultation',
    participants: AppointmentParticipant[] = [],
    reminders: {
      whatsapp?: boolean;
      email?: boolean;
      sms?: boolean;
    } = {},
    options: {
      generateICS?: boolean;
      syncGoogleCalendar?: boolean;
      sendConfirmation?: boolean;
    } = {}
  ): Promise<ScheduleFittingsResponse> {
    console.log(`📅 Schedule Fittings - Buyer: ${buyerId}, When: ${when.toISOString()}`);

    try {
      // 1. Recupera buyer
      const buyer = await this.privacyService.getBuyer(buyerId);
      if (!buyer) {
        throw new Error(`Buyer ${buyerId} not found`);
      }

      // 2. Crea appuntamento
      const appointment = await this.appointmentService.createAppointment({
        buyerId,
        when,
        location,
        type,
        participants: [
          {
            id: `participant_${Date.now()}`,
            name: `${buyer.firstName} ${buyer.lastName}`,
            email: buyer.email,
            phone: buyer.phone,
            role: 'buyer',
            confirmed: false,
          },
          ...participants,
        ],
        status: 'scheduled',
        createdBy: 'system',
      });

      // 3. Genera ICS se richiesto
      let icsFile: ICSFile | null = null;
      if (options.generateICS !== false) {
        icsFile = await this.icsService.generateICS({
          appointmentId: appointment.id,
          includeAttachments: true,
          includeRecurrence: false,
          timezone: 'Europe/Rome',
        });
      }

      // 4. Sincronizza Google Calendar se richiesto
      let googleEvent: any = null;
      if (options.syncGoogleCalendar) {
        googleEvent = await this.googleCalendarService.createEvent({
          appointmentId: appointment.id,
          buyerId,
          when,
          location,
          type,
          participants: appointment.participants,
        });
      }

      // 5. Configura reminder
      const reminderConfigs = [];
      if (reminders.whatsapp !== false) {
        reminderConfigs.push({
          channel: 'whatsapp',
          template: 'appointment_reminder',
          scheduledAt: new Date(when.getTime() - 24 * 60 * 60 * 1000), // 24h prima
          data: {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            appointmentType: type,
            when: when.toISOString(),
            location: location.address || location.virtualUrl,
          },
        });
      }

      if (reminders.email !== false) {
        reminderConfigs.push({
          channel: 'email',
          template: 'appointment_reminder',
          scheduledAt: new Date(when.getTime() - 24 * 60 * 60 * 1000), // 24h prima
          data: {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            appointmentType: type,
            when: when.toISOString(),
            location: location.address || location.virtualUrl,
            icsUrl: icsFile?.downloadUrl,
          },
        });
      }

      // Crea reminder
      const createdReminders = await Promise.all(
        reminderConfigs.map(config =>
          this.reminderService.scheduleReminder({
            appointmentId: appointment.id,
            buyerId,
            ...config,
          } as any)
        )
      );

      // 6. Invia conferma se richiesto
      const confirmations = [];
      if (options.sendConfirmation !== false) {
        if (reminders.whatsapp !== false) {
          const whatsappConfirmation = await this.reminderService.sendWhatsApp(
            buyer.phone,
            'appointment_confirmation',
            {
              buyerName: `${buyer.firstName} ${buyer.lastName}`,
              appointmentType: type,
              when: when.toISOString(),
              location: location.address || location.virtualUrl,
              icsUrl: icsFile?.downloadUrl,
            }
          );
          confirmations.push({ channel: 'whatsapp', sent: whatsappConfirmation });
        }

        if (reminders.email !== false) {
          const emailConfirmation = await this.reminderService.sendEmail(
            buyer.email,
            'appointment_confirmation',
            {
              buyerName: `${buyer.firstName} ${buyer.lastName}`,
              appointmentType: type,
              when: when.toISOString(),
              location: location.address || location.virtualUrl,
              icsUrl: icsFile?.downloadUrl,
              googleEventUrl: googleEvent?.htmlLink,
            }
          );
          confirmations.push({ channel: 'email', sent: emailConfirmation });
        }
      }

      return {
        success: true,
        appointment,
        ...(icsFile && { icsFile }),
        ...(googleEvent && { googleEvent }),
        confirmationSent: confirmations.length > 0,
        message: 'Appointment scheduled successfully',
      };
    } catch (error) {
      console.error('❌ Schedule Fittings error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to schedule appointment',
      };
    }
  }

  /**
   * Remind Payment - Invia reminder pagamento con conferma
   */
  async remindPayment(
    buyerId: string,
    milestone: string,
    amount: number,
    dueDate: Date,
    options: {
      sendWhatsApp?: boolean;
      sendEmail?: boolean;
      sendSMS?: boolean;
      requireConfirmation?: boolean;
    } = {}
  ): Promise<RemindPaymentResponse> {
    console.log(
      `💰 Remind Payment - Buyer: ${buyerId}, Milestone: ${milestone}, Amount: €${amount}`
    );

    try {
      // 1. Recupera buyer
      const buyer = await this.privacyService.getBuyer(buyerId);
      if (!buyer) {
        throw new Error(`Buyer ${buyerId} not found`);
      }

      // 2. Crea reminder pagamento
      const reminder = await this.reminderService.createPaymentReminder({
        buyerId,
        milestone,
        amount,
        dueDate,
        requireConfirmation: options.requireConfirmation !== false,
      });

      // 3. Invia notifiche
      const notifications = [];

      if (options.sendWhatsApp !== false) {
        const whatsappSent = await this.reminderService.sendWhatsApp(
          buyer.phone,
          'payment_reminder',
          {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            milestone,
            amount: `€${amount.toFixed(2)}`,
            dueDate: dueDate.toISOString(),
            paymentUrl: reminder.paymentUrl,
          }
        );
        notifications.push({ channel: 'whatsapp', sent: whatsappSent });
      }

      if (options.sendEmail !== false) {
        const emailSent = await this.reminderService.sendEmail(
          buyer.email,
          'payment_reminder',
          {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            milestone,
            amount: `€${amount.toFixed(2)}`,
            dueDate: dueDate.toISOString(),
            paymentUrl: reminder.paymentUrl,
          }
        );
        notifications.push({ channel: 'email', sent: emailSent });
      }

      if (options.sendSMS) {
        const smsSent = await this.reminderService.sendSMS(
          buyer.phone,
          'payment_reminder_sms',
          {
            buyerName: `${buyer.firstName} ${buyer.lastName}`,
            milestone,
            amount: `€${amount.toFixed(2)}`,
            dueDate: dueDate.toISOString(),
          }
        );
        notifications.push({ channel: 'sms', sent: smsSent });
      }

      return {
        success: true,
        reminderId: reminder.id,
        notifications,
        paymentUrl: reminder.paymentUrl,
        message: 'Payment reminder sent successfully',
      };
    } catch (error) {
      console.error('❌ Remind Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send payment reminder',
      };
    }
  }

  /**
   * Get Buyer Info - Ottieni informazioni acquirente
   */
  async getBuyerInfo(buyerId: string): Promise<GetBuyerInfoResponse> {
    console.log(`👤 Get Buyer Info - Buyer: ${buyerId}`);

    try {
      const buyer = await this.privacyService.getBuyer(buyerId);
      if (!buyer) {
        throw new Error(`Buyer ${buyerId} not found`);
      }

      const appointments = await this.appointmentService.getBuyerAppointments(buyerId);
      const kycStatus = await this.kycService.getKYCStatus(buyerId);
      const privacySettings = await this.privacyService.getPrivacySettings(buyerId);

      return {
        success: true,
        buyer,
        appointments,
        kycStatus,
        privacySettings,
        message: 'Buyer info retrieved successfully',
      };
    } catch (error) {
      console.error('❌ Get Buyer Info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve buyer info',
      };
    }
  }

  /**
   * List Appointments - Lista appuntamenti acquirente
   */
  async listAppointments(
    buyerId: string,
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    fromDate?: Date,
    toDate?: Date
  ): Promise<ListAppointmentsResponse> {
    console.log(`📋 List Appointments - Buyer: ${buyerId}, Status: ${status || 'all'}`);

    try {
      const appointments = await this.appointmentService.listAppointments({
        ...(buyerId && { buyerId }),
        ...(status && { status }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      });

      return {
        success: true,
        appointments,
        count: appointments.length,
        message: 'Appointments retrieved successfully',
      };
    } catch (error) {
      console.error('❌ List Appointments error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve appointments',
      };
    }
  }

  /**
   * Generate ICS - Genera file ICS per appuntamento
   */
  async generateICS(
    appointmentId: string,
    options: {
      includeAttachments?: boolean;
      includeRecurrence?: boolean;
      timezone?: string;
    } = {}
  ): Promise<GenerateICSResponse> {
    console.log(`📄 Generate ICS - Appointment: ${appointmentId}`);

    try {
      const icsFile = await this.icsService.generateICS({
        appointmentId,
        includeAttachments: options.includeAttachments !== false,
        includeRecurrence: options.includeRecurrence || false,
        timezone: options.timezone || 'Europe/Rome',
      });

      return {
        success: true,
        icsFile,
        message: 'ICS file generated successfully',
      };
    } catch (error) {
      console.error('❌ Generate ICS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to generate ICS file',
      };
    }
  }

  /**
   * Send Reminder - Invia reminder manuale
   */
  async sendReminder(
    reminderId: string,
    channels: ('whatsapp' | 'email' | 'sms')[] = ['whatsapp', 'email']
  ): Promise<SendReminderResponse> {
    console.log(`📢 Send Reminder - Reminder: ${reminderId}, Channels: ${channels.join(', ')}`);

    try {
      const reminder = await this.reminderService.getReminder(reminderId);
      if (!reminder) {
        throw new Error(`Reminder ${reminderId} not found`);
      }

      const results = await this.reminderService.sendReminder(reminderId, channels);

      return {
        success: true,
        reminderId,
        results,
        message: 'Reminder sent successfully',
      };
    } catch (error) {
      console.error('❌ Send Reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send reminder',
      };
    }
  }

  /**
   * Update Privacy - Aggiorna impostazioni privacy
   */
  async updatePrivacy(
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
  ): Promise<UpdatePrivacyResponse> {
    console.log(`🔒 Update Privacy - Buyer: ${buyerId}`);

    try {
      const updatedSettings = await this.privacyService.updatePrivacySettings(
        buyerId,
        retentionPolicy,
        dataSubjectRights
      );

      return {
        success: true,
        privacySettings: updatedSettings as any,
        message: 'Privacy settings updated successfully',
      };
    } catch (error) {
      console.error('❌ Update Privacy error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update privacy settings',
      };
    }
  }
}
