'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zRemindPaymentResponse =
  exports.zRemindPaymentRequest =
  exports.zScheduleFittingsResponse =
  exports.zScheduleFittingsRequest =
  exports.zCollectKYCResponse =
  exports.zCollectKYCRequest =
  exports.zGoogleOrganizer =
  exports.zGoogleAttendee =
  exports.zGoogleEvent =
  exports.zGoogleAuthResult =
  exports.zGoogleCalendarConfig =
  exports.zReminderTemplate =
  exports.zAppointmentReminder =
  exports.zICSRecurrence =
  exports.zICSAttachment =
  exports.zICSOrganizer =
  exports.zICSAttendee =
  exports.zICSEvent =
  exports.zICSFile =
  exports.zAppointmentAttachment =
  exports.zAppointmentParticipant =
  exports.zAppointmentLocation =
  exports.zAppointment =
  exports.zBuyerJWTLink =
  exports.zDataSubjectRights =
  exports.zRetentionPolicy =
  exports.zBuyerDocument =
  exports.zBuyerPreferences =
  exports.zBuyer =
    void 0;
const zod_1 = require('zod');
exports.zBuyer = zod_1.z.object({
  id: zod_1.z.string(),
  projectId: zod_1.z.string(),
  firstName: zod_1.z.string(),
  lastName: zod_1.z.string(),
  email: zod_1.z.string().email(),
  phone: zod_1.z.string(),
  preferences: zod_1.z
    .object({
      preferredContact: zod_1.z.enum(['email', 'phone', 'whatsapp']),
      language: zod_1.z.string().default('it'),
      timezone: zod_1.z.string().default('Europe/Rome'),
      notifications: zod_1.z.object({
        email: zod_1.z.boolean().default(true),
        whatsapp: zod_1.z.boolean().default(true),
        sms: zod_1.z.boolean().default(false),
      }),
    })
    .optional(),
  notes: zod_1.z.string().optional(),
  kycStatus: zod_1.z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  documents: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string(),
      type: zod_1.z.string(),
      filename: zod_1.z.string(),
      url: zod_1.z.string(),
      uploadedAt: zod_1.z.date(),
      validatedAt: zod_1.z.date().optional(),
      status: zod_1.z.enum(['pending', 'validated', 'rejected']),
    })
  ),
  consentGiven: zod_1.z.boolean(),
  consentDate: zod_1.z.date(),
  retentionPolicy: zod_1.z.object({
    retentionPeriod: zod_1.z.number(),
    autoDelete: zod_1.z.boolean(),
    projectBased: zod_1.z.boolean(),
    consentBased: zod_1.z.boolean(),
  }),
  dataSubjectRights: zod_1.z.object({
    rightToAccess: zod_1.z.boolean(),
    rightToRectification: zod_1.z.boolean(),
    rightToErasure: zod_1.z.boolean(),
    rightToPortability: zod_1.z.boolean(),
  }),
  createdAt: zod_1.z.date(),
  updatedAt: zod_1.z.date(),
  lastActivityAt: zod_1.z.date(),
});
exports.zBuyerPreferences = zod_1.z.object({
  preferredContact: zod_1.z.enum(['email', 'phone', 'whatsapp']),
  language: zod_1.z.string(),
  timezone: zod_1.z.string(),
  notifications: zod_1.z.object({
    email: zod_1.z.boolean(),
    whatsapp: zod_1.z.boolean(),
    sms: zod_1.z.boolean(),
  }),
});
exports.zBuyerDocument = zod_1.z.object({
  id: zod_1.z.string(),
  type: zod_1.z.string(),
  filename: zod_1.z.string(),
  url: zod_1.z.string(),
  uploadedAt: zod_1.z.date(),
  validatedAt: zod_1.z.date().optional(),
  status: zod_1.z.enum(['pending', 'validated', 'rejected']),
  docHunterId: zod_1.z.string().optional(),
  validationNotes: zod_1.z.string().optional(),
});
exports.zRetentionPolicy = zod_1.z.object({
  retentionPeriod: zod_1.z.number(),
  autoDelete: zod_1.z.boolean(),
  projectBased: zod_1.z.boolean(),
  consentBased: zod_1.z.boolean(),
});
exports.zDataSubjectRights = zod_1.z.object({
  rightToAccess: zod_1.z.boolean(),
  rightToRectification: zod_1.z.boolean(),
  rightToErasure: zod_1.z.boolean(),
  rightToPortability: zod_1.z.boolean(),
});
exports.zBuyerJWTLink = zod_1.z.object({
  id: zod_1.z.string(),
  buyerId: zod_1.z.string(),
  projectId: zod_1.z.string(),
  purpose: zod_1.z.enum(['upload', 'appointment', 'payment', 'access']),
  token: zod_1.z.string(),
  expiresAt: zod_1.z.date(),
  used: zod_1.z.boolean(),
  usedAt: zod_1.z.date().optional(),
  ipAddress: zod_1.z.string().optional(),
  userAgent: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.zAppointment = zod_1.z.object({
  id: zod_1.z.string(),
  buyerId: zod_1.z.string(),
  projectId: zod_1.z.string(),
  type: zod_1.z.enum(['fitting', 'visit', 'consultation', 'payment', 'delivery']),
  title: zod_1.z.string(),
  description: zod_1.z.string(),
  location: zod_1.z.object({
    type: zod_1.z.enum(['physical', 'virtual', 'hybrid']),
    address: zod_1.z.string().optional(),
    coordinates: zod_1.z
      .object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
      })
      .optional(),
    virtualUrl: zod_1.z.string().optional(),
    instructions: zod_1.z.string().optional(),
  }),
  startTime: zod_1.z.date(),
  endTime: zod_1.z.date(),
  timezone: zod_1.z.string(),
  status: zod_1.z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  participants: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string(),
      name: zod_1.z.string(),
      email: zod_1.z.string().optional(),
      phone: zod_1.z.string().optional(),
      role: zod_1.z.string(),
      confirmed: zod_1.z.boolean().default(false),
    })
  ),
  reminders: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string(),
      type: zod_1.z.enum(['whatsapp', 'email', 'sms']),
      template: zod_1.z.string(),
      scheduledAt: zod_1.z.date(),
      sentAt: zod_1.z.date().optional(),
      status: zod_1.z.enum(['scheduled', 'sent', 'failed', 'confirmed']),
      recipient: zod_1.z.string(),
      message: zod_1.z.string().optional(),
      confirmationReceived: zod_1.z.boolean().optional(),
    })
  ),
  notes: zod_1.z.string().optional(),
  attachments: zod_1.z
    .array(
      zod_1.z.object({
        id: zod_1.z.string(),
        filename: zod_1.z.string(),
        url: zod_1.z.string(),
        type: zod_1.z.string(),
      })
    )
    .optional(),
  icsFile: zod_1.z
    .object({
      id: zod_1.z.string(),
      filename: zod_1.z.string(),
      content: zod_1.z.string(),
      generatedAt: zod_1.z.date(),
    })
    .optional(),
  googleEventId: zod_1.z.string().optional(),
  createdAt: zod_1.z.date(),
  updatedAt: zod_1.z.date(),
});
exports.zAppointmentLocation = zod_1.z.object({
  type: zod_1.z.enum(['physical', 'virtual', 'hybrid']),
  address: zod_1.z.string().optional(),
  coordinates: zod_1.z
    .object({
      lat: zod_1.z.number(),
      lng: zod_1.z.number(),
    })
    .optional(),
  virtualUrl: zod_1.z.string().optional(),
  instructions: zod_1.z.string().optional(),
});
exports.zAppointmentParticipant = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  email: zod_1.z.string().optional(),
  phone: zod_1.z.string().optional(),
  role: zod_1.z.string(),
  confirmed: zod_1.z.boolean(),
});
exports.zAppointmentAttachment = zod_1.z.object({
  id: zod_1.z.string(),
  filename: zod_1.z.string(),
  url: zod_1.z.string(),
  type: zod_1.z.string(),
});
exports.zICSFile = zod_1.z.object({
  id: zod_1.z.string(),
  filename: zod_1.z.string(),
  content: zod_1.z.string(),
  events: zod_1.z.array(
    zod_1.z.object({
      uid: zod_1.z.string(),
      summary: zod_1.z.string(),
      description: zod_1.z.string(),
      location: zod_1.z.string(),
      startDate: zod_1.z.date(),
      endDate: zod_1.z.date(),
      timezone: zod_1.z.string(),
      attendees: zod_1.z.array(
        zod_1.z.object({
          name: zod_1.z.string(),
          email: zod_1.z.string(),
          role: zod_1.z.string(),
        })
      ),
      organizer: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string(),
      }),
      attachments: zod_1.z
        .array(
          zod_1.z.object({
            filename: zod_1.z.string(),
            url: zod_1.z.string(),
            mimeType: zod_1.z.string(),
          })
        )
        .optional(),
      recurrence: zod_1.z
        .object({
          freq: zod_1.z.string(),
          interval: zod_1.z.number(),
          until: zod_1.z.date().optional(),
        })
        .optional(),
    })
  ),
  generatedAt: zod_1.z.date(),
  expiresAt: zod_1.z.date().optional(),
});
exports.zICSEvent = zod_1.z.object({
  uid: zod_1.z.string(),
  summary: zod_1.z.string(),
  description: zod_1.z.string(),
  location: zod_1.z.string(),
  startDate: zod_1.z.date(),
  endDate: zod_1.z.date(),
  timezone: zod_1.z.string(),
  attendees: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      email: zod_1.z.string(),
      role: zod_1.z.string(),
    })
  ),
  organizer: zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string(),
  }),
  attachments: zod_1.z
    .array(
      zod_1.z.object({
        filename: zod_1.z.string(),
        url: zod_1.z.string(),
        mimeType: zod_1.z.string(),
      })
    )
    .optional(),
  recurrence: zod_1.z
    .object({
      freq: zod_1.z.string(),
      interval: zod_1.z.number(),
      until: zod_1.z.date().optional(),
    })
    .optional(),
});
exports.zICSAttendee = zod_1.z.object({
  name: zod_1.z.string(),
  email: zod_1.z.string(),
  role: zod_1.z.string(),
});
exports.zICSOrganizer = zod_1.z.object({
  name: zod_1.z.string(),
  email: zod_1.z.string(),
});
exports.zICSAttachment = zod_1.z.object({
  filename: zod_1.z.string(),
  url: zod_1.z.string(),
  mimeType: zod_1.z.string(),
});
exports.zICSRecurrence = zod_1.z.object({
  freq: zod_1.z.string(),
  interval: zod_1.z.number(),
  until: zod_1.z.date().optional(),
});
exports.zAppointmentReminder = zod_1.z.object({
  id: zod_1.z.string(),
  appointmentId: zod_1.z.string(),
  type: zod_1.z.enum(['whatsapp', 'email', 'sms']),
  template: zod_1.z.string(),
  scheduledAt: zod_1.z.date(),
  sentAt: zod_1.z.date().optional(),
  status: zod_1.z.enum(['scheduled', 'sent', 'failed', 'confirmed']),
  recipient: zod_1.z.string(),
  message: zod_1.z.string().optional(),
  confirmationReceived: zod_1.z.boolean().optional(),
});
exports.zReminderTemplate = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  type: zod_1.z.enum(['whatsapp', 'email', 'sms']),
  subject: zod_1.z.string().optional(),
  body: zod_1.z.string(),
  variables: zod_1.z.array(zod_1.z.string()),
  language: zod_1.z.string(),
  isActive: zod_1.z.boolean(),
});
exports.zGoogleCalendarConfig = zod_1.z.object({
  enabled: zod_1.z.boolean(),
  clientId: zod_1.z.string(),
  clientSecret: zod_1.z.string(),
  redirectUri: zod_1.z.string(),
  scopes: zod_1.z.array(zod_1.z.string()),
  syncDirection: zod_1.z.enum(['bidirectional', 'to_google', 'from_google']),
  conflictResolution: zod_1.z.enum(['local_wins', 'remote_wins', 'manual']),
});
exports.zGoogleAuthResult = zod_1.z.object({
  success: zod_1.z.boolean(),
  accessToken: zod_1.z.string().optional(),
  refreshToken: zod_1.z.string().optional(),
  expiresAt: zod_1.z.date().optional(),
  error: zod_1.z.string().optional(),
});
exports.zGoogleEvent = zod_1.z.object({
  id: zod_1.z.string(),
  summary: zod_1.z.string(),
  description: zod_1.z.string(),
  location: zod_1.z.string(),
  startTime: zod_1.z.date(),
  endTime: zod_1.z.date(),
  attendees: zod_1.z.array(
    zod_1.z.object({
      email: zod_1.z.string(),
      displayName: zod_1.z.string(),
      responseStatus: zod_1.z.string(),
    })
  ),
  organizer: zod_1.z.object({
    email: zod_1.z.string(),
    displayName: zod_1.z.string(),
  }),
  htmlLink: zod_1.z.string(),
});
exports.zGoogleAttendee = zod_1.z.object({
  email: zod_1.z.string(),
  displayName: zod_1.z.string(),
  responseStatus: zod_1.z.string(),
});
exports.zGoogleOrganizer = zod_1.z.object({
  email: zod_1.z.string(),
  displayName: zod_1.z.string(),
});
exports.zCollectKYCRequest = zod_1.z.object({
  projectId: zod_1.z.string(),
  buyerId: zod_1.z.string().optional(),
  documentTypes: zod_1.z.array(zod_1.z.string()),
  options: zod_1.z
    .object({
      sendEmail: zod_1.z.boolean().optional(),
      sendWhatsApp: zod_1.z.boolean().optional(),
      retentionDays: zod_1.z.number().optional(),
    })
    .optional(),
});
exports.zCollectKYCResponse = zod_1.z.object({
  success: zod_1.z.boolean(),
  buyerId: zod_1.z.string(),
  uploadLinks: zod_1.z.array(exports.zBuyerJWTLink),
  kycStatus: zod_1.z.string(),
  expiresAt: zod_1.z.date(),
});
exports.zScheduleFittingsRequest = zod_1.z.object({
  buyerId: zod_1.z.string(),
  when: zod_1.z.date(),
  location: exports.zAppointmentLocation,
  type: zod_1.z.enum(['fitting', 'visit', 'consultation']),
  participants: zod_1.z.array(exports.zAppointmentParticipant).optional(),
  reminders: zod_1.z
    .object({
      whatsapp: zod_1.z.boolean().optional(),
      email: zod_1.z.boolean().optional(),
      sms: zod_1.z.boolean().optional(),
    })
    .optional(),
  options: zod_1.z
    .object({
      generateICS: zod_1.z.boolean().optional(),
      syncGoogleCalendar: zod_1.z.boolean().optional(),
      sendConfirmation: zod_1.z.boolean().optional(),
    })
    .optional(),
});
exports.zScheduleFittingsResponse = zod_1.z.object({
  success: zod_1.z.boolean(),
  appointment: exports.zAppointment,
  icsFile: exports.zICSFile.optional(),
  googleEvent: exports.zGoogleEvent.optional(),
  confirmationSent: zod_1.z.boolean(),
});
exports.zRemindPaymentRequest = zod_1.z.object({
  buyerId: zod_1.z.string(),
  milestone: zod_1.z.string(),
  amount: zod_1.z.number(),
  dueDate: zod_1.z.date(),
  options: zod_1.z
    .object({
      sendWhatsApp: zod_1.z.boolean().optional(),
      sendEmail: zod_1.z.boolean().optional(),
      sendSMS: zod_1.z.boolean().optional(),
      requireConfirmation: zod_1.z.boolean().optional(),
    })
    .optional(),
});
exports.zRemindPaymentResponse = zod_1.z.object({
  success: zod_1.z.boolean(),
  reminderId: zod_1.z.string(),
  sentChannels: zod_1.z.array(zod_1.z.string()),
  confirmationRequired: zod_1.z.boolean(),
  confirmationReceived: zod_1.z.boolean(),
});
//# sourceMappingURL=buyer.js.map
