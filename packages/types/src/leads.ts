import { z } from 'zod';

// ============================================================================
// LEAD TYPES
// ============================================================================

/**
 * Lead Source Enum
 */
export const LeadSourceSchema = z.enum([
  'immobiliare',
  'idealista',
  'casa',
  'email',
  'whatsapp',
  'portal',
  'unknown',
]);

export type LeadSource = z.infer<typeof LeadSourceSchema>;

/**
 * Lead Status Enum
 */
export const LeadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'lost',
  'won',
  'archived',
]);

export type LeadStatus = z.infer<typeof LeadStatusSchema>;

/**
 * Lead Entity
 */
export const LeadSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  source: LeadSourceSchema,
  listingId: z.string().optional(),
  portalLeadId: z.string().optional(), // For deduplication
  subject: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  rawData: z.record(z.unknown()).optional(), // Original portal data
  metadata: z
    .object({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      portalUrl: z.string().optional(),
      listingUrl: z.string().optional(),
      extractedData: z.record(z.unknown()).optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: LeadStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedUserId: z.string().optional(),
  slaStatus: z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
  firstResponseAt: z.date().optional(),
  lastContactAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * Conversation Channel Enum
 */
export const ConversationChannelSchema = z.enum([
  'email',
  'whatsapp',
  'portal:immobiliare',
  'portal:idealista',
  'portal:casa',
  'portal:generic',
]);

export type ConversationChannel = z.infer<typeof ConversationChannelSchema>;

/**
 * Conversation Status Enum
 */
export const ConversationStatusSchema = z.enum(['active', 'closed', 'archived', 'spam']);

export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

/**
 * Conversation Entity
 */
export const ConversationSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  projectId: z.string().optional(),
  channel: ConversationChannelSchema,
  assigneeUserId: z.string().optional(),
  lastMsgAt: z.date(),
  unreadCount: z.number().default(0),
  status: ConversationStatusSchema.default('active'),
  slaStatus: z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
  slaDeadline: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z
    .object({
      firstMessageId: z.string().optional(),
      lastMessageId: z.string().optional(),
      messageCount: z.number().default(0),
      responseTime: z.number().optional(), // in minutes
      customerSatisfaction: z.number().optional(), // 1-5 scale
      tags: z.array(z.string()).default([]),
    })
    .optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ============================================================================
// MESSAGE TYPES
// ============================================================================

/**
 * Message Direction Enum
 */
export const MessageDirectionSchema = z.enum(['inbound', 'outbound']);

export type MessageDirection = z.infer<typeof MessageDirectionSchema>;

/**
 * Message Status Enum
 */
export const MessageStatusSchema = z.enum(['sent', 'delivered', 'failed', 'pending']);

export type MessageStatus = z.infer<typeof MessageStatusSchema>;

/**
 * Message Attachment
 */
export const MessageAttachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number().optional(),
  gcsPath: z.string().optional(),
  signedUrl: z.string().optional(),
  expiresAt: z.date().optional(),
});

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

/**
 * Message Sender
 */
export const MessageSenderSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  userId: z.string().optional(),
});

export type MessageSender = z.infer<typeof MessageSenderSchema>;

/**
 * Message Entity
 */
export const MessageSchema = z.object({
  id: z.string(),
  convId: z.string(),
  direction: MessageDirectionSchema,
  channel: ConversationChannelSchema,
  text: z.string(),
  html: z.string().optional(),
  attachments: z.array(MessageAttachmentSchema).default([]),
  meta: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  sender: MessageSenderSchema.optional(),
  status: MessageStatusSchema.default('sent'),
  externalId: z.string().optional(), // External message ID (Twilio, SendGrid, etc.)
  replyToMessageId: z.string().optional(),
  templateId: z.string().optional(),
  slaImpact: z.boolean().default(false), // Whether this message affects SLA
  auditLog: z
    .object({
      processedAt: z.date(),
      processedBy: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Template Category Enum
 */
export const TemplateCategorySchema = z.enum([
  'first_response',
  'follow_up',
  'documents_request',
  'appointment_confirmation',
  'pricing_info',
  'general',
]);

export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;

/**
 * Template Entity
 */
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: TemplateCategorySchema,
  subject: z.string().optional(),
  bodyText: z.string(),
  bodyHtml: z.string().optional(),
  variables: z.array(z.string()).default([]), // Template variables like {{name}}, {{project}}
  isActive: z.boolean().default(true),
  projectId: z.string().optional(), // Project-specific template
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  usageCount: z.number().default(0),
  lastUsedAt: z.date().optional(),
  metadata: z
    .object({
      language: z.string().default('it'),
      channel: ConversationChannelSchema.optional(),
      slaTarget: z.number().optional(), // Target response time in minutes
      tags: z.array(z.string()).default([]),
    })
    .optional(),
});

export type Template = z.infer<typeof TemplateSchema>;

// ============================================================================
// SLA TYPES
// ============================================================================

/**
 * SLA Configuration
 */
export const SLAConfigSchema = z.object({
  projectId: z.string(),
  firstResponseMinutes: z.number().default(15),
  businessHours: z.object({
    start: z.string(), // "09:00"
    end: z.string(), // "18:00"
    timezone: z.string().default('Europe/Rome'),
    daysOfWeek: z.array(z.number()).default([1, 2, 3, 4, 5]), // Mon-Fri
  }),
  escalationLevels: z.object({
    level1Minutes: z.number().default(10),
    level2Minutes: z.number().default(20),
    level3Minutes: z.number().default(30),
    level4Minutes: z.number().default(60),
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SLAConfig = z.infer<typeof SLAConfigSchema>;

/**
 * SLA Tracker
 */
export const SLATrackerSchema = z.object({
  leadId: z.string(),
  conversationId: z.string(),
  assignedUserId: z.string(),
  createdAt: z.date(),
  firstResponseDeadline: z.date(),
  firstResponseAt: z.date().optional(),
  slaStatus: z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
  escalationLevel: z.number().default(0),
  escalationHistory: z
    .array(
      z.object({
        level: z.number(),
        timestamp: z.date(),
        userId: z.string(),
        action: z.string(),
        message: z.string().optional(),
      })
    )
    .default([]),
  businessHoursOnly: z.boolean().default(true),
  lastEscalationAt: z.date().optional(),
});

export type SLATracker = z.infer<typeof SLATrackerSchema>;

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================

/**
 * Assignment Rule
 */
export const AssignmentRuleSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  priority: z.number().default(1),
  conditions: z.object({
    leadSource: z.array(LeadSourceSchema).optional(),
    leadType: z.array(z.string()).optional(),
    projectPhase: z.array(z.string()).optional(),
    teamMemberSkills: z.array(z.string()).optional(),
    leadPriority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  }),
  assignment: z.object({
    type: z.enum(['auto', 'manual', 'round_robin', 'least_busy']),
    userIds: z.array(z.string()).optional(),
    fallbackUserId: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AssignmentRule = z.infer<typeof AssignmentRuleSchema>;

// ============================================================================
// AUDIT TYPES
// ============================================================================

/**
 * Audit Event Type
 */
export const AuditEventTypeSchema = z.enum([
  'lead_created',
  'lead_updated',
  'lead_assigned',
  'message_sent',
  'message_received',
  'sla_breached',
  'escalation_triggered',
  'template_used',
  'conversation_closed',
  'data_exported',
  'data_deleted',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

/**
 * Audit Log Entry
 */
export const AuditLogSchema = z.object({
  id: z.string(),
  eventType: AuditEventTypeSchema,
  entityType: z.enum(['lead', 'conversation', 'message', 'template', 'sla']),
  entityId: z.string(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * SendGrid Inbound Parse Request
 */
export const SendGridInboundRequestSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.number().default(0),
  attachmentInfo: z.string().optional(),
  attachment1: z.string().optional(),
  attachment2: z.string().optional(),
  attachment3: z.string().optional(),
  attachment4: z.string().optional(),
  attachment5: z.string().optional(),
  attachment1Info: z.string().optional(),
  attachment2Info: z.string().optional(),
  attachment3Info: z.string().optional(),
  attachment4Info: z.string().optional(),
  attachment5Info: z.string().optional(),
  headers: z.string().optional(),
  dkim: z.string().optional(),
  contentIds: z.string().optional(),
  envelope: z.string().optional(),
  spamScore: z.string().optional(),
  spamReport: z.string().optional(),
  xSgEid: z.string().optional(),
  xSgMsgId: z.string().optional(),
});

export type SendGridInboundRequest = z.infer<typeof SendGridInboundRequestSchema>;

/**
 * WhatsApp Reply Request
 */
export const WhatsAppReplyRequestSchema = z.object({
  convId: z.string(),
  text: z.string(),
  templateId: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

export type WhatsAppReplyRequest = z.infer<typeof WhatsAppReplyRequestSchema>;

/**
 * Email Reply Request
 */
export const EmailReplyRequestSchema = z.object({
  convId: z.string(),
  templateId: z.string().optional(),
  text: z.string().optional(),
  subject: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

export type EmailReplyRequest = z.infer<typeof EmailReplyRequestSchema>;

/**
 * Lead Creation Response
 */
export const LeadCreationResponseSchema = z.object({
  success: z.boolean(),
  leadId: z.string().optional(),
  conversationId: z.string().optional(),
  messageId: z.string().optional(),
  slaDeadline: z.date().optional(),
  assignedUserId: z.string().optional(),
  error: z.string().optional(),
});

export type LeadCreationResponse = z.infer<typeof LeadCreationResponseSchema>;

/**
 * Reply Response
 */
export const ReplyResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  externalId: z.string().optional(),
  slaImpact: z.boolean().default(false),
  error: z.string().optional(),
});

export type ReplyResponse = z.infer<typeof ReplyResponseSchema>;
