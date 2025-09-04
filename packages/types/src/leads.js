"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyResponseSchema = exports.LeadCreationResponseSchema = exports.EmailReplyRequestSchema = exports.WhatsAppReplyRequestSchema = exports.SendGridInboundRequestSchema = exports.AuditLogSchema = exports.AuditEventTypeSchema = exports.AssignmentRuleSchema = exports.SLATrackerSchema = exports.SLAConfigSchema = exports.TemplateSchema = exports.TemplateCategorySchema = exports.MessageSchema = exports.MessageSenderSchema = exports.MessageAttachmentSchema = exports.MessageStatusSchema = exports.MessageDirectionSchema = exports.ConversationSchema = exports.ConversationStatusSchema = exports.ConversationChannelSchema = exports.LeadSchema = exports.LeadStatusSchema = exports.LeadSourceSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// LEAD TYPES
// ============================================================================
/**
 * Lead Source Enum
 */
exports.LeadSourceSchema = zod_1.z.enum([
    'immobiliare',
    'idealista',
    'casa',
    'email',
    'whatsapp',
    'portal',
    'unknown',
]);
/**
 * Lead Status Enum
 */
exports.LeadStatusSchema = zod_1.z.enum([
    'new',
    'contacted',
    'qualified',
    'lost',
    'won',
    'archived',
]);
/**
 * Lead Entity
 */
exports.LeadSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string().optional(),
    source: exports.LeadSourceSchema,
    listingId: zod_1.z.string().optional(),
    portalLeadId: zod_1.z.string().optional(), // For deduplication
    subject: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    rawData: zod_1.z.record(zod_1.z.unknown()).optional(), // Original portal data
    metadata: zod_1.z
        .object({
        ipAddress: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional(),
        referrer: zod_1.z.string().optional(),
        utmSource: zod_1.z.string().optional(),
        utmMedium: zod_1.z.string().optional(),
        utmCampaign: zod_1.z.string().optional(),
        portalUrl: zod_1.z.string().optional(),
        listingUrl: zod_1.z.string().optional(),
        extractedData: zod_1.z.record(zod_1.z.unknown()).optional(),
    })
        .optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    status: exports.LeadStatusSchema,
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assignedUserId: zod_1.z.string().optional(),
    slaStatus: zod_1.z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
    firstResponseAt: zod_1.z.date().optional(),
    lastContactAt: zod_1.z.date().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    notes: zod_1.z.string().optional(),
});
// ============================================================================
// CONVERSATION TYPES
// ============================================================================
/**
 * Conversation Channel Enum
 */
exports.ConversationChannelSchema = zod_1.z.enum([
    'email',
    'whatsapp',
    'portal:immobiliare',
    'portal:idealista',
    'portal:casa',
    'portal:generic',
]);
/**
 * Conversation Status Enum
 */
exports.ConversationStatusSchema = zod_1.z.enum(['active', 'closed', 'archived', 'spam']);
/**
 * Conversation Entity
 */
exports.ConversationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    leadId: zod_1.z.string(),
    projectId: zod_1.z.string().optional(),
    channel: exports.ConversationChannelSchema,
    assigneeUserId: zod_1.z.string().optional(),
    lastMsgAt: zod_1.z.date(),
    unreadCount: zod_1.z.number().default(0),
    status: exports.ConversationStatusSchema.default('active'),
    slaStatus: zod_1.z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
    slaDeadline: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    metadata: zod_1.z
        .object({
        firstMessageId: zod_1.z.string().optional(),
        lastMessageId: zod_1.z.string().optional(),
        messageCount: zod_1.z.number().default(0),
        responseTime: zod_1.z.number().optional(), // in minutes
        customerSatisfaction: zod_1.z.number().optional(), // 1-5 scale
        tags: zod_1.z.array(zod_1.z.string()).default([]),
    })
        .optional(),
});
// ============================================================================
// MESSAGE TYPES
// ============================================================================
/**
 * Message Direction Enum
 */
exports.MessageDirectionSchema = zod_1.z.enum(['inbound', 'outbound']);
/**
 * Message Status Enum
 */
exports.MessageStatusSchema = zod_1.z.enum(['sent', 'delivered', 'failed', 'pending']);
/**
 * Message Attachment
 */
exports.MessageAttachmentSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    filename: zod_1.z.string(),
    contentType: zod_1.z.string(),
    size: zod_1.z.number().optional(),
    gcsPath: zod_1.z.string().optional(),
    signedUrl: zod_1.z.string().optional(),
    expiresAt: zod_1.z.date().optional(),
});
/**
 * Message Sender
 */
exports.MessageSenderSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
});
/**
 * Message Entity
 */
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    convId: zod_1.z.string(),
    direction: exports.MessageDirectionSchema,
    channel: exports.ConversationChannelSchema,
    text: zod_1.z.string(),
    html: zod_1.z.string().optional(),
    attachments: zod_1.z.array(exports.MessageAttachmentSchema).default([]),
    meta: zod_1.z.record(zod_1.z.unknown()).optional(),
    createdAt: zod_1.z.date(),
    sender: exports.MessageSenderSchema.optional(),
    status: exports.MessageStatusSchema.default('sent'),
    externalId: zod_1.z.string().optional(), // External message ID (Twilio, SendGrid, etc.)
    replyToMessageId: zod_1.z.string().optional(),
    templateId: zod_1.z.string().optional(),
    slaImpact: zod_1.z.boolean().default(false), // Whether this message affects SLA
    auditLog: zod_1.z
        .object({
        processedAt: zod_1.z.date(),
        processedBy: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional(),
    })
        .optional(),
});
// ============================================================================
// TEMPLATE TYPES
// ============================================================================
/**
 * Template Category Enum
 */
exports.TemplateCategorySchema = zod_1.z.enum([
    'first_response',
    'follow_up',
    'documents_request',
    'appointment_confirmation',
    'pricing_info',
    'general',
]);
/**
 * Template Entity
 */
exports.TemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    category: exports.TemplateCategorySchema,
    subject: zod_1.z.string().optional(),
    bodyText: zod_1.z.string(),
    bodyHtml: zod_1.z.string().optional(),
    variables: zod_1.z.array(zod_1.z.string()).default([]), // Template variables like {{name}}, {{project}}
    isActive: zod_1.z.boolean().default(true),
    projectId: zod_1.z.string().optional(), // Project-specific template
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    usageCount: zod_1.z.number().default(0),
    lastUsedAt: zod_1.z.date().optional(),
    metadata: zod_1.z
        .object({
        language: zod_1.z.string().default('it'),
        channel: exports.ConversationChannelSchema.optional(),
        slaTarget: zod_1.z.number().optional(), // Target response time in minutes
        tags: zod_1.z.array(zod_1.z.string()).default([]),
    })
        .optional(),
});
// ============================================================================
// SLA TYPES
// ============================================================================
/**
 * SLA Configuration
 */
exports.SLAConfigSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    firstResponseMinutes: zod_1.z.number().default(15),
    businessHours: zod_1.z.object({
        start: zod_1.z.string(), // "09:00"
        end: zod_1.z.string(), // "18:00"
        timezone: zod_1.z.string().default('Europe/Rome'),
        daysOfWeek: zod_1.z.array(zod_1.z.number()).default([1, 2, 3, 4, 5]), // Mon-Fri
    }),
    escalationLevels: zod_1.z.object({
        level1Minutes: zod_1.z.number().default(10),
        level2Minutes: zod_1.z.number().default(20),
        level3Minutes: zod_1.z.number().default(30),
        level4Minutes: zod_1.z.number().default(60),
    }),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
/**
 * SLA Tracker
 */
exports.SLATrackerSchema = zod_1.z.object({
    leadId: zod_1.z.string(),
    conversationId: zod_1.z.string(),
    assignedUserId: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    firstResponseDeadline: zod_1.z.date(),
    firstResponseAt: zod_1.z.date().optional(),
    slaStatus: zod_1.z.enum(['on_track', 'at_risk', 'breached']).default('on_track'),
    escalationLevel: zod_1.z.number().default(0),
    escalationHistory: zod_1.z
        .array(zod_1.z.object({
        level: zod_1.z.number(),
        timestamp: zod_1.z.date(),
        userId: zod_1.z.string(),
        action: zod_1.z.string(),
        message: zod_1.z.string().optional(),
    }))
        .default([]),
    businessHoursOnly: zod_1.z.boolean().default(true),
    lastEscalationAt: zod_1.z.date().optional(),
});
// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================
/**
 * Assignment Rule
 */
exports.AssignmentRuleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    priority: zod_1.z.number().default(1),
    conditions: zod_1.z.object({
        leadSource: zod_1.z.array(exports.LeadSourceSchema).optional(),
        leadType: zod_1.z.array(zod_1.z.string()).optional(),
        projectPhase: zod_1.z.array(zod_1.z.string()).optional(),
        teamMemberSkills: zod_1.z.array(zod_1.z.string()).optional(),
        leadPriority: zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
    }),
    assignment: zod_1.z.object({
        type: zod_1.z.enum(['auto', 'manual', 'round_robin', 'least_busy']),
        userIds: zod_1.z.array(zod_1.z.string()).optional(),
        fallbackUserId: zod_1.z.string().optional(),
    }),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// ============================================================================
// AUDIT TYPES
// ============================================================================
/**
 * Audit Event Type
 */
exports.AuditEventTypeSchema = zod_1.z.enum([
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
/**
 * Audit Log Entry
 */
exports.AuditLogSchema = zod_1.z.object({
    id: zod_1.z.string(),
    eventType: exports.AuditEventTypeSchema,
    entityType: zod_1.z.enum(['lead', 'conversation', 'message', 'template', 'sla']),
    entityId: zod_1.z.string(),
    userId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
    timestamp: zod_1.z.date(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
});
// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================
/**
 * SendGrid Inbound Parse Request
 */
exports.SendGridInboundRequestSchema = zod_1.z.object({
    to: zod_1.z.string().email(),
    from: zod_1.z.string().email(),
    subject: zod_1.z.string().optional(),
    text: zod_1.z.string().optional(),
    html: zod_1.z.string().optional(),
    attachments: zod_1.z.number().default(0),
    attachmentInfo: zod_1.z.string().optional(),
    attachment1: zod_1.z.string().optional(),
    attachment2: zod_1.z.string().optional(),
    attachment3: zod_1.z.string().optional(),
    attachment4: zod_1.z.string().optional(),
    attachment5: zod_1.z.string().optional(),
    attachment1Info: zod_1.z.string().optional(),
    attachment2Info: zod_1.z.string().optional(),
    attachment3Info: zod_1.z.string().optional(),
    attachment4Info: zod_1.z.string().optional(),
    attachment5Info: zod_1.z.string().optional(),
    headers: zod_1.z.string().optional(),
    dkim: zod_1.z.string().optional(),
    contentIds: zod_1.z.string().optional(),
    envelope: zod_1.z.string().optional(),
    spamScore: zod_1.z.string().optional(),
    spamReport: zod_1.z.string().optional(),
    xSgEid: zod_1.z.string().optional(),
    xSgMsgId: zod_1.z.string().optional(),
});
/**
 * WhatsApp Reply Request
 */
exports.WhatsAppReplyRequestSchema = zod_1.z.object({
    convId: zod_1.z.string(),
    text: zod_1.z.string(),
    templateId: zod_1.z.string().optional(),
    variables: zod_1.z.record(zod_1.z.string()).optional(),
});
/**
 * Email Reply Request
 */
exports.EmailReplyRequestSchema = zod_1.z.object({
    convId: zod_1.z.string(),
    templateId: zod_1.z.string().optional(),
    text: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    variables: zod_1.z.record(zod_1.z.string()).optional(),
});
/**
 * Lead Creation Response
 */
exports.LeadCreationResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    leadId: zod_1.z.string().optional(),
    conversationId: zod_1.z.string().optional(),
    messageId: zod_1.z.string().optional(),
    slaDeadline: zod_1.z.date().optional(),
    assignedUserId: zod_1.z.string().optional(),
    error: zod_1.z.string().optional(),
});
/**
 * Reply Response
 */
exports.ReplyResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    messageId: zod_1.z.string().optional(),
    externalId: zod_1.z.string().optional(),
    slaImpact: zod_1.z.boolean().default(false),
    error: zod_1.z.string().optional(),
});
//# sourceMappingURL=leads.js.map