import { z } from 'zod';

/**
 * Buyer Types - Sistema Buyer Concierge Urbanova
 *
 * Definisce tutti i tipi per:
 * - Buyer Management (KYC, PII, Privacy)
 * - Appointment Management (ICS, Google Calendar)
 * - Reminder System (WhatsApp, Email, SMS)
 * - Upload Management (Doc Hunter integration)
 */

// ============================================================================
// BUYER TYPES - Gestione acquirente
// ============================================================================

/**
 * Dati essenziali acquirente
 */
export interface Buyer {
  id: string;
  projectId: string;

  // Dati essenziali (sempre richiesti)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Dati opzionali
  preferences?: BuyerPreferences;
  notes?: string;

  // KYC e documenti
  kycStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  documents: BuyerDocument[];

  // Privacy e consensi
  consentGiven: boolean;
  consentDate: Date;
  retentionPolicy: RetentionPolicy;
  dataSubjectRights: DataSubjectRights;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export const zBuyer = z.object({
  id: z.string(),
  projectId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  preferences: z
    .object({
      preferredContact: z.enum(['email', 'phone', 'whatsapp']),
      language: z.string().default('it'),
      timezone: z.string().default('Europe/Rome'),
      notifications: z.object({
        email: z.boolean().default(true),
        whatsapp: z.boolean().default(true),
        sms: z.boolean().default(false),
      }),
    })
    .optional(),
  notes: z.string().optional(),
  kycStatus: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  documents: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      filename: z.string(),
      url: z.string(),
      uploadedAt: z.date(),
      validatedAt: z.date().optional(),
      status: z.enum(['pending', 'validated', 'rejected']),
    })
  ),
  consentGiven: z.boolean(),
  consentDate: z.date(),
  retentionPolicy: z.object({
    retentionPeriod: z.number(),
    autoDelete: z.boolean(),
    projectBased: z.boolean(),
    consentBased: z.boolean(),
  }),
  dataSubjectRights: z.object({
    rightToAccess: z.boolean(),
    rightToRectification: z.boolean(),
    rightToErasure: z.boolean(),
    rightToPortability: z.boolean(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActivityAt: z.date(),
});

/**
 * Preferenze acquirente
 */
export interface BuyerPreferences {
  preferredContact: 'email' | 'phone' | 'whatsapp';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
}

export const zBuyerPreferences = z.object({
  preferredContact: z.enum(['email', 'phone', 'whatsapp']),
  language: z.string(),
  timezone: z.string(),
  notifications: z.object({
    email: z.boolean(),
    whatsapp: z.boolean(),
    sms: z.boolean(),
  }),
});

/**
 * Documento acquirente
 */
export interface BuyerDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  validatedAt?: Date;
  status: 'pending' | 'validated' | 'rejected';
  docHunterId?: string;
  validationNotes?: string;
}

export const zBuyerDocument = z.object({
  id: z.string(),
  type: z.string(),
  filename: z.string(),
  url: z.string(),
  uploadedAt: z.date(),
  validatedAt: z.date().optional(),
  status: z.enum(['pending', 'validated', 'rejected']),
  docHunterId: z.string().optional(),
  validationNotes: z.string().optional(),
});

/**
 * Policy retention
 */
export interface RetentionPolicy {
  retentionPeriod: number; // giorni
  autoDelete: boolean;
  projectBased: boolean;
  consentBased: boolean;
}

export const zRetentionPolicy = z.object({
  retentionPeriod: z.number(),
  autoDelete: z.boolean(),
  projectBased: z.boolean(),
  consentBased: z.boolean(),
});

/**
 * Diritti soggetto dati (GDPR)
 */
export interface DataSubjectRights {
  rightToAccess: boolean;
  rightToRectification: boolean;
  rightToErasure: boolean;
  rightToPortability: boolean;
}

export const zDataSubjectRights = z.object({
  rightToAccess: z.boolean(),
  rightToRectification: z.boolean(),
  rightToErasure: z.boolean(),
  rightToPortability: z.boolean(),
});

// ============================================================================
// JWT LINKS TYPES - Link sicuri temporanei
// ============================================================================

/**
 * JWT Link per accesso sicuro
 */
export interface BuyerJWTLink {
  id: string;
  buyerId: string;
  projectId: string;
  purpose: 'upload' | 'appointment' | 'payment' | 'access';
  token: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export const zBuyerJWTLink = z.object({
  id: z.string(),
  buyerId: z.string(),
  projectId: z.string(),
  purpose: z.enum(['upload', 'appointment', 'payment', 'access']),
  token: z.string(),
  expiresAt: z.date(),
  used: z.boolean(),
  usedAt: z.date().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// APPOINTMENT TYPES - Gestione appuntamenti
// ============================================================================

/**
 * Appuntamento
 */
export interface Appointment {
  id: string;
  buyerId: string;
  projectId: string;
  type: 'fitting' | 'visit' | 'consultation' | 'payment' | 'delivery';
  title: string;
  description: string;
  location: AppointmentLocation;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  participants: AppointmentParticipant[];
  reminders: AppointmentReminder[];
  notes?: string;
  attachments?: AppointmentAttachment[];
  icsFile?: ICSFile;
  googleEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const zAppointment = z.object({
  id: z.string(),
  buyerId: z.string(),
  projectId: z.string(),
  type: z.enum(['fitting', 'visit', 'consultation', 'payment', 'delivery']),
  title: z.string(),
  description: z.string(),
  location: z.object({
    type: z.enum(['physical', 'virtual', 'hybrid']),
    address: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    virtualUrl: z.string().optional(),
    instructions: z.string().optional(),
  }),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  participants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      role: z.string(),
      confirmed: z.boolean().default(false),
    })
  ),
  reminders: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['whatsapp', 'email', 'sms']),
      template: z.string(),
      scheduledAt: z.date(),
      sentAt: z.date().optional(),
      status: z.enum(['scheduled', 'sent', 'failed', 'confirmed']),
      recipient: z.string(),
      message: z.string().optional(),
      confirmationReceived: z.boolean().optional(),
    })
  ),
  notes: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
  icsFile: z
    .object({
      id: z.string(),
      filename: z.string(),
      content: z.string(),
      generatedAt: z.date(),
    })
    .optional(),
  googleEventId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Località appuntamento
 */
export interface AppointmentLocation {
  type: 'physical' | 'virtual' | 'hybrid';
  address?: string;
  coordinates?: { lat: number; lng: number };
  virtualUrl?: string;
  instructions?: string;
}

export const zAppointmentLocation = z.object({
  type: z.enum(['physical', 'virtual', 'hybrid']),
  address: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  virtualUrl: z.string().optional(),
  instructions: z.string().optional(),
});

/**
 * Partecipante appuntamento
 */
export interface AppointmentParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  confirmed: boolean;
}

export const zAppointmentParticipant = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.string(),
  confirmed: z.boolean(),
});

/**
 * Allegato appuntamento
 */
export interface AppointmentAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
}

export const zAppointmentAttachment = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string(),
  type: z.string(),
});

// ============================================================================
// ICS TYPES - File ICS (RFC 5545)
// ============================================================================

/**
 * File ICS
 */
export interface ICSFile {
  id: string;
  filename: string;
  content: string;
  events: ICSEvent[];
  generatedAt: Date;
  expiresAt?: Date;
}

export const zICSFile = z.object({
  id: z.string(),
  filename: z.string(),
  content: z.string(),
  events: z.array(
    z.object({
      uid: z.string(),
      summary: z.string(),
      description: z.string(),
      location: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      timezone: z.string(),
      attendees: z.array(
        z.object({
          name: z.string(),
          email: z.string(),
          role: z.string(),
        })
      ),
      organizer: z.object({
        name: z.string(),
        email: z.string(),
      }),
      attachments: z
        .array(
          z.object({
            filename: z.string(),
            url: z.string(),
            mimeType: z.string(),
          })
        )
        .optional(),
      recurrence: z
        .object({
          freq: z.string(),
          interval: z.number(),
          until: z.date().optional(),
        })
        .optional(),
    })
  ),
  generatedAt: z.date(),
  expiresAt: z.date().optional(),
});

/**
 * Evento ICS
 */
export interface ICSEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  attendees: ICSAttendee[];
  organizer: ICSOrganizer;
  attachments?: ICSAttachment[];
  recurrence?: ICSRecurrence;
}

export const zICSEvent = z.object({
  uid: z.string(),
  summary: z.string(),
  description: z.string(),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  timezone: z.string(),
  attendees: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      role: z.string(),
    })
  ),
  organizer: z.object({
    name: z.string(),
    email: z.string(),
  }),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        url: z.string(),
        mimeType: z.string(),
      })
    )
    .optional(),
  recurrence: z
    .object({
      freq: z.string(),
      interval: z.number(),
      until: z.date().optional(),
    })
    .optional(),
});

/**
 * Partecipante ICS
 */
export interface ICSAttendee {
  name: string;
  email: string;
  role: string;
}

export const zICSAttendee = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string(),
});

/**
 * Organizzatore ICS
 */
export interface ICSOrganizer {
  name: string;
  email: string;
}

export const zICSOrganizer = z.object({
  name: z.string(),
  email: z.string(),
});

/**
 * Allegato ICS
 */
export interface ICSAttachment {
  filename: string;
  url: string;
  mimeType: string;
}

export const zICSAttachment = z.object({
  filename: z.string(),
  url: z.string(),
  mimeType: z.string(),
});

/**
 * Ricorrenza ICS
 */
export interface ICSRecurrence {
  freq: string;
  interval: number;
  until?: Date;
}

export const zICSRecurrence = z.object({
  freq: z.string(),
  interval: z.number(),
  until: z.date().optional(),
});

// ============================================================================
// REMINDER TYPES - Sistema reminder
// ============================================================================

/**
 * Reminder appuntamento
 */
export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: 'whatsapp' | 'email' | 'sms';
  template: string;
  scheduledAt: Date;
  sentAt?: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'confirmed';
  recipient: string;
  message?: string;
  confirmationReceived?: boolean;
}

export const zAppointmentReminder = z.object({
  id: z.string(),
  appointmentId: z.string(),
  type: z.enum(['whatsapp', 'email', 'sms']),
  template: z.string(),
  scheduledAt: z.date(),
  sentAt: z.date().optional(),
  status: z.enum(['scheduled', 'sent', 'failed', 'confirmed']),
  recipient: z.string(),
  message: z.string().optional(),
  confirmationReceived: z.boolean().optional(),
});

/**
 * Template reminder
 */
export interface ReminderTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
  language: string;
  isActive: boolean;
}

export const zReminderTemplate = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['whatsapp', 'email', 'sms']),
  subject: z.string().optional(),
  body: z.string(),
  variables: z.array(z.string()),
  language: z.string(),
  isActive: z.boolean(),
});

// ============================================================================
// GOOGLE CALENDAR TYPES - Integrazione Google Calendar
// ============================================================================

/**
 * Configurazione Google Calendar
 */
export interface GoogleCalendarConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  syncDirection: 'bidirectional' | 'to_google' | 'from_google';
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual';
}

export const zGoogleCalendarConfig = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
  syncDirection: z.enum(['bidirectional', 'to_google', 'from_google']),
  conflictResolution: z.enum(['local_wins', 'remote_wins', 'manual']),
});

/**
 * Risultato autenticazione Google
 */
export interface GoogleAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

export const zGoogleAuthResult = z.object({
  success: z.boolean(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  error: z.string().optional(),
});

/**
 * Evento Google Calendar
 */
export interface GoogleEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  attendees: GoogleAttendee[];
  organizer: GoogleOrganizer;
  htmlLink: string;
}

export const zGoogleEvent = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string(),
  location: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  attendees: z.array(
    z.object({
      email: z.string(),
      displayName: z.string(),
      responseStatus: z.string(),
    })
  ),
  organizer: z.object({
    email: z.string(),
    displayName: z.string(),
  }),
  htmlLink: z.string(),
});

/**
 * Partecipante Google Calendar
 */
export interface GoogleAttendee {
  email: string;
  displayName: string;
  responseStatus: string;
}

export const zGoogleAttendee = z.object({
  email: z.string(),
  displayName: z.string(),
  responseStatus: z.string(),
});

/**
 * Organizzatore Google Calendar
 */
export interface GoogleOrganizer {
  email: string;
  displayName: string;
}

export const zGoogleOrganizer = z.object({
  email: z.string(),
  displayName: z.string(),
});

// ============================================================================
// REQUEST/RESPONSE TYPES - API
// ============================================================================

/**
 * Request KYC collection
 */
export interface CollectKYCRequest {
  projectId: string;
  buyerId?: string;
  documentTypes: string[];
  options?: {
    sendEmail?: boolean;
    sendWhatsApp?: boolean;
    retentionDays?: number;
  };
}

export const zCollectKYCRequest = z.object({
  projectId: z.string(),
  buyerId: z.string().optional(),
  documentTypes: z.array(z.string()),
  options: z
    .object({
      sendEmail: z.boolean().optional(),
      sendWhatsApp: z.boolean().optional(),
      retentionDays: z.number().optional(),
    })
    .optional(),
});

/**
 * Response KYC collection
 */
export interface CollectKYCResponse {
  success: boolean;
  buyerId: string;
  uploadLinks: BuyerJWTLink[];
  kycStatus: string;
  expiresAt: Date;
}

export const zCollectKYCResponse = z.object({
  success: z.boolean(),
  buyerId: z.string(),
  uploadLinks: z.array(zBuyerJWTLink),
  kycStatus: z.string(),
  expiresAt: z.date(),
});

/**
 * Request scheduling fittings
 */
export interface ScheduleFittingsRequest {
  buyerId: string;
  when: Date;
  location: AppointmentLocation;
  type: 'fitting' | 'visit' | 'consultation';
  participants?: AppointmentParticipant[];
  reminders?: {
    whatsapp?: boolean;
    email?: boolean;
    sms?: boolean;
  };
  options?: {
    generateICS?: boolean;
    syncGoogleCalendar?: boolean;
    sendConfirmation?: boolean;
  };
}

export const zScheduleFittingsRequest = z.object({
  buyerId: z.string(),
  when: z.date(),
  location: zAppointmentLocation,
  type: z.enum(['fitting', 'visit', 'consultation']),
  participants: z.array(zAppointmentParticipant).optional(),
  reminders: z
    .object({
      whatsapp: z.boolean().optional(),
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
    })
    .optional(),
  options: z
    .object({
      generateICS: z.boolean().optional(),
      syncGoogleCalendar: z.boolean().optional(),
      sendConfirmation: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Response scheduling fittings
 */
export interface ScheduleFittingsResponse {
  success: boolean;
  appointment: Appointment;
  icsFile?: ICSFile;
  googleEvent?: GoogleEvent;
  confirmationSent: boolean;
}

export const zScheduleFittingsResponse = z.object({
  success: z.boolean(),
  appointment: zAppointment,
  icsFile: zICSFile.optional(),
  googleEvent: zGoogleEvent.optional(),
  confirmationSent: z.boolean(),
});

/**
 * Request payment reminder
 */
export interface RemindPaymentRequest {
  buyerId: string;
  milestone: string;
  amount: number;
  dueDate: Date;
  options?: {
    sendWhatsApp?: boolean;
    sendEmail?: boolean;
    sendSMS?: boolean;
    requireConfirmation?: boolean;
  };
}

export const zRemindPaymentRequest = z.object({
  buyerId: z.string(),
  milestone: z.string(),
  amount: z.number(),
  dueDate: z.date(),
  options: z
    .object({
      sendWhatsApp: z.boolean().optional(),
      sendEmail: z.boolean().optional(),
      sendSMS: z.boolean().optional(),
      requireConfirmation: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Response payment reminder
 */
export interface RemindPaymentResponse {
  success: boolean;
  reminderId: string;
  sentChannels: string[];
  confirmationRequired: boolean;
  confirmationReceived: boolean;
}

export const zRemindPaymentResponse = z.object({
  success: z.boolean(),
  reminderId: z.string(),
  sentChannels: z.array(z.string()),
  confirmationRequired: z.boolean(),
  confirmationReceived: z.boolean(),
});
