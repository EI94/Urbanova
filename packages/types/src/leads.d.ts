import { z } from 'zod';
/**
 * Lead Source Enum
 */
export declare const LeadSourceSchema: z.ZodEnum<["immobiliare", "idealista", "casa", "email", "whatsapp", "portal", "unknown"]>;
export type LeadSource = z.infer<typeof LeadSourceSchema>;
/**
 * Lead Status Enum
 */
export declare const LeadStatusSchema: z.ZodEnum<["new", "contacted", "qualified", "lost", "won", "archived"]>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
/**
 * Lead Entity
 */
export declare const LeadSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["immobiliare", "idealista", "casa", "email", "whatsapp", "portal", "unknown"]>;
    listingId: z.ZodOptional<z.ZodString>;
    portalLeadId: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    rawData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodObject<{
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
        utmSource: z.ZodOptional<z.ZodString>;
        utmMedium: z.ZodOptional<z.ZodString>;
        utmCampaign: z.ZodOptional<z.ZodString>;
        portalUrl: z.ZodOptional<z.ZodString>;
        listingUrl: z.ZodOptional<z.ZodString>;
        extractedData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        utmSource?: string | undefined;
        utmMedium?: string | undefined;
        utmCampaign?: string | undefined;
        portalUrl?: string | undefined;
        listingUrl?: string | undefined;
        extractedData?: Record<string, unknown> | undefined;
    }, {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        utmSource?: string | undefined;
        utmMedium?: string | undefined;
        utmCampaign?: string | undefined;
        portalUrl?: string | undefined;
        listingUrl?: string | undefined;
        extractedData?: Record<string, unknown> | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    status: z.ZodEnum<["new", "contacted", "qualified", "lost", "won", "archived"]>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    assignedUserId: z.ZodOptional<z.ZodString>;
    slaStatus: z.ZodDefault<z.ZodEnum<["on_track", "at_risk", "breached"]>>;
    firstResponseAt: z.ZodOptional<z.ZodDate>;
    lastContactAt: z.ZodOptional<z.ZodDate>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "archived" | "new" | "contacted" | "qualified" | "lost" | "won";
    createdAt: Date;
    tags: string[];
    updatedAt: Date;
    priority: "low" | "medium" | "high" | "urgent";
    source: "unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal";
    slaStatus: "on_track" | "at_risk" | "breached";
    message?: string | undefined;
    metadata?: {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        utmSource?: string | undefined;
        utmMedium?: string | undefined;
        utmCampaign?: string | undefined;
        portalUrl?: string | undefined;
        listingUrl?: string | undefined;
        extractedData?: Record<string, unknown> | undefined;
    } | undefined;
    projectId?: string | undefined;
    name?: string | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    subject?: string | undefined;
    listingId?: string | undefined;
    portalLeadId?: string | undefined;
    rawData?: Record<string, unknown> | undefined;
    assignedUserId?: string | undefined;
    firstResponseAt?: Date | undefined;
    lastContactAt?: Date | undefined;
}, {
    id: string;
    status: "archived" | "new" | "contacted" | "qualified" | "lost" | "won";
    createdAt: Date;
    updatedAt: Date;
    source: "unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal";
    message?: string | undefined;
    metadata?: {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        utmSource?: string | undefined;
        utmMedium?: string | undefined;
        utmCampaign?: string | undefined;
        portalUrl?: string | undefined;
        listingUrl?: string | undefined;
        extractedData?: Record<string, unknown> | undefined;
    } | undefined;
    projectId?: string | undefined;
    tags?: string[] | undefined;
    name?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    subject?: string | undefined;
    listingId?: string | undefined;
    portalLeadId?: string | undefined;
    rawData?: Record<string, unknown> | undefined;
    assignedUserId?: string | undefined;
    slaStatus?: "on_track" | "at_risk" | "breached" | undefined;
    firstResponseAt?: Date | undefined;
    lastContactAt?: Date | undefined;
}>;
export type Lead = z.infer<typeof LeadSchema>;
/**
 * Conversation Channel Enum
 */
export declare const ConversationChannelSchema: z.ZodEnum<["email", "whatsapp", "portal:immobiliare", "portal:idealista", "portal:casa", "portal:generic"]>;
export type ConversationChannel = z.infer<typeof ConversationChannelSchema>;
/**
 * Conversation Status Enum
 */
export declare const ConversationStatusSchema: z.ZodEnum<["active", "closed", "archived", "spam"]>;
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
/**
 * Conversation Entity
 */
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    leadId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    channel: z.ZodEnum<["email", "whatsapp", "portal:immobiliare", "portal:idealista", "portal:casa", "portal:generic"]>;
    assigneeUserId: z.ZodOptional<z.ZodString>;
    lastMsgAt: z.ZodDate;
    unreadCount: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "closed", "archived", "spam"]>>;
    slaStatus: z.ZodDefault<z.ZodEnum<["on_track", "at_risk", "breached"]>>;
    slaDeadline: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    metadata: z.ZodOptional<z.ZodObject<{
        firstMessageId: z.ZodOptional<z.ZodString>;
        lastMessageId: z.ZodOptional<z.ZodString>;
        messageCount: z.ZodDefault<z.ZodNumber>;
        responseTime: z.ZodOptional<z.ZodNumber>;
        customerSatisfaction: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        messageCount: number;
        firstMessageId?: string | undefined;
        lastMessageId?: string | undefined;
        responseTime?: number | undefined;
        customerSatisfaction?: number | undefined;
    }, {
        tags?: string[] | undefined;
        firstMessageId?: string | undefined;
        lastMessageId?: string | undefined;
        messageCount?: number | undefined;
        responseTime?: number | undefined;
        customerSatisfaction?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "active" | "archived" | "closed" | "spam";
    createdAt: Date;
    updatedAt: Date;
    channel: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic";
    slaStatus: "on_track" | "at_risk" | "breached";
    leadId: string;
    lastMsgAt: Date;
    unreadCount: number;
    metadata?: {
        tags: string[];
        messageCount: number;
        firstMessageId?: string | undefined;
        lastMessageId?: string | undefined;
        responseTime?: number | undefined;
        customerSatisfaction?: number | undefined;
    } | undefined;
    projectId?: string | undefined;
    assigneeUserId?: string | undefined;
    slaDeadline?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    channel: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic";
    leadId: string;
    lastMsgAt: Date;
    status?: "active" | "archived" | "closed" | "spam" | undefined;
    metadata?: {
        tags?: string[] | undefined;
        firstMessageId?: string | undefined;
        lastMessageId?: string | undefined;
        messageCount?: number | undefined;
        responseTime?: number | undefined;
        customerSatisfaction?: number | undefined;
    } | undefined;
    projectId?: string | undefined;
    slaStatus?: "on_track" | "at_risk" | "breached" | undefined;
    assigneeUserId?: string | undefined;
    unreadCount?: number | undefined;
    slaDeadline?: Date | undefined;
}>;
export type Conversation = z.infer<typeof ConversationSchema>;
/**
 * Message Direction Enum
 */
export declare const MessageDirectionSchema: z.ZodEnum<["inbound", "outbound"]>;
export type MessageDirection = z.infer<typeof MessageDirectionSchema>;
/**
 * Message Status Enum
 */
export declare const MessageStatusSchema: z.ZodEnum<["sent", "delivered", "failed", "pending"]>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
/**
 * Message Attachment
 */
export declare const MessageAttachmentSchema: z.ZodObject<{
    url: z.ZodString;
    filename: z.ZodString;
    contentType: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    gcsPath: z.ZodOptional<z.ZodString>;
    signedUrl: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    url: string;
    filename: string;
    contentType: string;
    expiresAt?: Date | undefined;
    size?: number | undefined;
    gcsPath?: string | undefined;
    signedUrl?: string | undefined;
}, {
    url: string;
    filename: string;
    contentType: string;
    expiresAt?: Date | undefined;
    size?: number | undefined;
    gcsPath?: string | undefined;
    signedUrl?: string | undefined;
}>;
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
/**
 * Message Sender
 */
export declare const MessageSenderSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    userId?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name?: string | undefined;
    userId?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export type MessageSender = z.infer<typeof MessageSenderSchema>;
/**
 * Message Entity
 */
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    convId: z.ZodString;
    direction: z.ZodEnum<["inbound", "outbound"]>;
    channel: z.ZodEnum<["email", "whatsapp", "portal:immobiliare", "portal:idealista", "portal:casa", "portal:generic"]>;
    text: z.ZodString;
    html: z.ZodOptional<z.ZodString>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        filename: z.ZodString;
        contentType: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        gcsPath: z.ZodOptional<z.ZodString>;
        signedUrl: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        filename: string;
        contentType: string;
        expiresAt?: Date | undefined;
        size?: number | undefined;
        gcsPath?: string | undefined;
        signedUrl?: string | undefined;
    }, {
        url: string;
        filename: string;
        contentType: string;
        expiresAt?: Date | undefined;
        size?: number | undefined;
        gcsPath?: string | undefined;
        signedUrl?: string | undefined;
    }>, "many">>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    sender: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        userId?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name?: string | undefined;
        userId?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["sent", "delivered", "failed", "pending"]>>;
    externalId: z.ZodOptional<z.ZodString>;
    replyToMessageId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    slaImpact: z.ZodDefault<z.ZodBoolean>;
    auditLog: z.ZodOptional<z.ZodObject<{
        processedAt: z.ZodDate;
        processedBy: z.ZodOptional<z.ZodString>;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        processedAt: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        processedBy?: string | undefined;
    }, {
        processedAt: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        processedBy?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "failed" | "sent" | "delivered";
    createdAt: Date;
    attachments: {
        url: string;
        filename: string;
        contentType: string;
        expiresAt?: Date | undefined;
        size?: number | undefined;
        gcsPath?: string | undefined;
        signedUrl?: string | undefined;
    }[];
    channel: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic";
    convId: string;
    direction: "inbound" | "outbound";
    text: string;
    slaImpact: boolean;
    html?: string | undefined;
    meta?: Record<string, unknown> | undefined;
    sender?: {
        name?: string | undefined;
        userId?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    externalId?: string | undefined;
    replyToMessageId?: string | undefined;
    templateId?: string | undefined;
    auditLog?: {
        processedAt: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        processedBy?: string | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: Date;
    channel: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic";
    convId: string;
    direction: "inbound" | "outbound";
    text: string;
    status?: "pending" | "failed" | "sent" | "delivered" | undefined;
    attachments?: {
        url: string;
        filename: string;
        contentType: string;
        expiresAt?: Date | undefined;
        size?: number | undefined;
        gcsPath?: string | undefined;
        signedUrl?: string | undefined;
    }[] | undefined;
    html?: string | undefined;
    meta?: Record<string, unknown> | undefined;
    sender?: {
        name?: string | undefined;
        userId?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    externalId?: string | undefined;
    replyToMessageId?: string | undefined;
    templateId?: string | undefined;
    slaImpact?: boolean | undefined;
    auditLog?: {
        processedAt: Date;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        processedBy?: string | undefined;
    } | undefined;
}>;
export type Message = z.infer<typeof MessageSchema>;
/**
 * Template Category Enum
 */
export declare const TemplateCategorySchema: z.ZodEnum<["first_response", "follow_up", "documents_request", "appointment_confirmation", "pricing_info", "general"]>;
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;
/**
 * Template Entity
 */
export declare const TemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<["first_response", "follow_up", "documents_request", "appointment_confirmation", "pricing_info", "general"]>;
    subject: z.ZodOptional<z.ZodString>;
    bodyText: z.ZodString;
    bodyHtml: z.ZodOptional<z.ZodString>;
    variables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    projectId: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    usageCount: z.ZodDefault<z.ZodNumber>;
    lastUsedAt: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodOptional<z.ZodObject<{
        language: z.ZodDefault<z.ZodString>;
        channel: z.ZodOptional<z.ZodEnum<["email", "whatsapp", "portal:immobiliare", "portal:idealista", "portal:casa", "portal:generic"]>>;
        slaTarget: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        language: string;
        channel?: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic" | undefined;
        slaTarget?: number | undefined;
    }, {
        tags?: string[] | undefined;
        language?: string | undefined;
        channel?: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic" | undefined;
        slaTarget?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: "first_response" | "follow_up" | "documents_request" | "appointment_confirmation" | "pricing_info" | "general";
    createdAt: Date;
    name: string;
    updatedAt: Date;
    isActive: boolean;
    createdBy: string;
    variables: string[];
    bodyText: string;
    usageCount: number;
    metadata?: {
        tags: string[];
        language: string;
        channel?: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic" | undefined;
        slaTarget?: number | undefined;
    } | undefined;
    projectId?: string | undefined;
    subject?: string | undefined;
    bodyHtml?: string | undefined;
    lastUsedAt?: Date | undefined;
}, {
    id: string;
    category: "first_response" | "follow_up" | "documents_request" | "appointment_confirmation" | "pricing_info" | "general";
    createdAt: Date;
    name: string;
    updatedAt: Date;
    createdBy: string;
    bodyText: string;
    metadata?: {
        tags?: string[] | undefined;
        language?: string | undefined;
        channel?: "email" | "whatsapp" | "portal:immobiliare" | "portal:idealista" | "portal:casa" | "portal:generic" | undefined;
        slaTarget?: number | undefined;
    } | undefined;
    projectId?: string | undefined;
    isActive?: boolean | undefined;
    subject?: string | undefined;
    variables?: string[] | undefined;
    bodyHtml?: string | undefined;
    usageCount?: number | undefined;
    lastUsedAt?: Date | undefined;
}>;
export type Template = z.infer<typeof TemplateSchema>;
/**
 * SLA Configuration
 */
export declare const SLAConfigSchema: z.ZodObject<{
    projectId: z.ZodString;
    firstResponseMinutes: z.ZodDefault<z.ZodNumber>;
    businessHours: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
        timezone: z.ZodDefault<z.ZodString>;
        daysOfWeek: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        start: string;
        end: string;
        daysOfWeek: number[];
    }, {
        start: string;
        end: string;
        timezone?: string | undefined;
        daysOfWeek?: number[] | undefined;
    }>;
    escalationLevels: z.ZodObject<{
        level1Minutes: z.ZodDefault<z.ZodNumber>;
        level2Minutes: z.ZodDefault<z.ZodNumber>;
        level3Minutes: z.ZodDefault<z.ZodNumber>;
        level4Minutes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        level1Minutes: number;
        level2Minutes: number;
        level3Minutes: number;
        level4Minutes: number;
    }, {
        level1Minutes?: number | undefined;
        level2Minutes?: number | undefined;
        level3Minutes?: number | undefined;
        level4Minutes?: number | undefined;
    }>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    firstResponseMinutes: number;
    businessHours: {
        timezone: string;
        start: string;
        end: string;
        daysOfWeek: number[];
    };
    escalationLevels: {
        level1Minutes: number;
        level2Minutes: number;
        level3Minutes: number;
        level4Minutes: number;
    };
}, {
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    businessHours: {
        start: string;
        end: string;
        timezone?: string | undefined;
        daysOfWeek?: number[] | undefined;
    };
    escalationLevels: {
        level1Minutes?: number | undefined;
        level2Minutes?: number | undefined;
        level3Minutes?: number | undefined;
        level4Minutes?: number | undefined;
    };
    isActive?: boolean | undefined;
    firstResponseMinutes?: number | undefined;
}>;
export type SLAConfig = z.infer<typeof SLAConfigSchema>;
/**
 * SLA Tracker
 */
export declare const SLATrackerSchema: z.ZodObject<{
    leadId: z.ZodString;
    conversationId: z.ZodString;
    assignedUserId: z.ZodString;
    createdAt: z.ZodDate;
    firstResponseDeadline: z.ZodDate;
    firstResponseAt: z.ZodOptional<z.ZodDate>;
    slaStatus: z.ZodDefault<z.ZodEnum<["on_track", "at_risk", "breached"]>>;
    escalationLevel: z.ZodDefault<z.ZodNumber>;
    escalationHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        level: z.ZodNumber;
        timestamp: z.ZodDate;
        userId: z.ZodString;
        action: z.ZodString;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: Date;
        userId: string;
        action: string;
        level: number;
        message?: string | undefined;
    }, {
        timestamp: Date;
        userId: string;
        action: string;
        level: number;
        message?: string | undefined;
    }>, "many">>;
    businessHoursOnly: z.ZodDefault<z.ZodBoolean>;
    lastEscalationAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    assignedUserId: string;
    slaStatus: "on_track" | "at_risk" | "breached";
    leadId: string;
    conversationId: string;
    firstResponseDeadline: Date;
    escalationLevel: number;
    escalationHistory: {
        timestamp: Date;
        userId: string;
        action: string;
        level: number;
        message?: string | undefined;
    }[];
    businessHoursOnly: boolean;
    firstResponseAt?: Date | undefined;
    lastEscalationAt?: Date | undefined;
}, {
    createdAt: Date;
    assignedUserId: string;
    leadId: string;
    conversationId: string;
    firstResponseDeadline: Date;
    slaStatus?: "on_track" | "at_risk" | "breached" | undefined;
    firstResponseAt?: Date | undefined;
    escalationLevel?: number | undefined;
    escalationHistory?: {
        timestamp: Date;
        userId: string;
        action: string;
        level: number;
        message?: string | undefined;
    }[] | undefined;
    businessHoursOnly?: boolean | undefined;
    lastEscalationAt?: Date | undefined;
}>;
export type SLATracker = z.infer<typeof SLATrackerSchema>;
/**
 * Assignment Rule
 */
export declare const AssignmentRuleSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    priority: z.ZodDefault<z.ZodNumber>;
    conditions: z.ZodObject<{
        leadSource: z.ZodOptional<z.ZodArray<z.ZodEnum<["immobiliare", "idealista", "casa", "email", "whatsapp", "portal", "unknown"]>, "many">>;
        leadType: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        projectPhase: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        teamMemberSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        leadPriority: z.ZodOptional<z.ZodArray<z.ZodEnum<["low", "medium", "high", "urgent"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        leadSource?: ("unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal")[] | undefined;
        leadType?: string[] | undefined;
        projectPhase?: string[] | undefined;
        teamMemberSkills?: string[] | undefined;
        leadPriority?: ("low" | "medium" | "high" | "urgent")[] | undefined;
    }, {
        leadSource?: ("unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal")[] | undefined;
        leadType?: string[] | undefined;
        projectPhase?: string[] | undefined;
        teamMemberSkills?: string[] | undefined;
        leadPriority?: ("low" | "medium" | "high" | "urgent")[] | undefined;
    }>;
    assignment: z.ZodObject<{
        type: z.ZodEnum<["auto", "manual", "round_robin", "least_busy"]>;
        userIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        fallbackUserId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "manual" | "auto" | "round_robin" | "least_busy";
        userIds?: string[] | undefined;
        fallbackUserId?: string | undefined;
    }, {
        type: "manual" | "auto" | "round_robin" | "least_busy";
        userIds?: string[] | undefined;
        fallbackUserId?: string | undefined;
    }>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    projectId: string;
    createdAt: Date;
    conditions: {
        leadSource?: ("unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal")[] | undefined;
        leadType?: string[] | undefined;
        projectPhase?: string[] | undefined;
        teamMemberSkills?: string[] | undefined;
        leadPriority?: ("low" | "medium" | "high" | "urgent")[] | undefined;
    };
    updatedAt: Date;
    priority: number;
    isActive: boolean;
    assignment: {
        type: "manual" | "auto" | "round_robin" | "least_busy";
        userIds?: string[] | undefined;
        fallbackUserId?: string | undefined;
    };
}, {
    id: string;
    projectId: string;
    createdAt: Date;
    conditions: {
        leadSource?: ("unknown" | "email" | "whatsapp" | "immobiliare" | "idealista" | "casa" | "portal")[] | undefined;
        leadType?: string[] | undefined;
        projectPhase?: string[] | undefined;
        teamMemberSkills?: string[] | undefined;
        leadPriority?: ("low" | "medium" | "high" | "urgent")[] | undefined;
    };
    updatedAt: Date;
    assignment: {
        type: "manual" | "auto" | "round_robin" | "least_busy";
        userIds?: string[] | undefined;
        fallbackUserId?: string | undefined;
    };
    priority?: number | undefined;
    isActive?: boolean | undefined;
}>;
export type AssignmentRule = z.infer<typeof AssignmentRuleSchema>;
/**
 * Audit Event Type
 */
export declare const AuditEventTypeSchema: z.ZodEnum<["lead_created", "lead_updated", "lead_assigned", "message_sent", "message_received", "sla_breached", "escalation_triggered", "template_used", "conversation_closed", "data_exported", "data_deleted"]>;
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;
/**
 * Audit Log Entry
 */
export declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodString;
    eventType: z.ZodEnum<["lead_created", "lead_updated", "lead_assigned", "message_sent", "message_received", "sla_breached", "escalation_triggered", "template_used", "conversation_closed", "data_exported", "data_deleted"]>;
    entityType: z.ZodEnum<["lead", "conversation", "message", "template", "sla"]>;
    entityId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: Date;
    eventType: "lead_created" | "lead_updated" | "lead_assigned" | "message_sent" | "message_received" | "sla_breached" | "escalation_triggered" | "template_used" | "conversation_closed" | "data_exported" | "data_deleted";
    entityType: "message" | "template" | "lead" | "conversation" | "sla";
    entityId: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
}, {
    id: string;
    timestamp: Date;
    eventType: "lead_created" | "lead_updated" | "lead_assigned" | "message_sent" | "message_received" | "sla_breached" | "escalation_triggered" | "template_used" | "conversation_closed" | "data_exported" | "data_deleted";
    entityType: "message" | "template" | "lead" | "conversation" | "sla";
    entityId: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
}>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
/**
 * SendGrid Inbound Parse Request
 */
export declare const SendGridInboundRequestSchema: z.ZodObject<{
    to: z.ZodString;
    from: z.ZodString;
    subject: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    html: z.ZodOptional<z.ZodString>;
    attachments: z.ZodDefault<z.ZodNumber>;
    attachmentInfo: z.ZodOptional<z.ZodString>;
    attachment1: z.ZodOptional<z.ZodString>;
    attachment2: z.ZodOptional<z.ZodString>;
    attachment3: z.ZodOptional<z.ZodString>;
    attachment4: z.ZodOptional<z.ZodString>;
    attachment5: z.ZodOptional<z.ZodString>;
    attachment1Info: z.ZodOptional<z.ZodString>;
    attachment2Info: z.ZodOptional<z.ZodString>;
    attachment3Info: z.ZodOptional<z.ZodString>;
    attachment4Info: z.ZodOptional<z.ZodString>;
    attachment5Info: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodString>;
    dkim: z.ZodOptional<z.ZodString>;
    contentIds: z.ZodOptional<z.ZodString>;
    envelope: z.ZodOptional<z.ZodString>;
    spamScore: z.ZodOptional<z.ZodString>;
    spamReport: z.ZodOptional<z.ZodString>;
    xSgEid: z.ZodOptional<z.ZodString>;
    xSgMsgId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    attachments: number;
    to: string;
    from: string;
    subject?: string | undefined;
    text?: string | undefined;
    html?: string | undefined;
    attachmentInfo?: string | undefined;
    attachment1?: string | undefined;
    attachment2?: string | undefined;
    attachment3?: string | undefined;
    attachment4?: string | undefined;
    attachment5?: string | undefined;
    attachment1Info?: string | undefined;
    attachment2Info?: string | undefined;
    attachment3Info?: string | undefined;
    attachment4Info?: string | undefined;
    attachment5Info?: string | undefined;
    headers?: string | undefined;
    dkim?: string | undefined;
    contentIds?: string | undefined;
    envelope?: string | undefined;
    spamScore?: string | undefined;
    spamReport?: string | undefined;
    xSgEid?: string | undefined;
    xSgMsgId?: string | undefined;
}, {
    to: string;
    from: string;
    attachments?: number | undefined;
    subject?: string | undefined;
    text?: string | undefined;
    html?: string | undefined;
    attachmentInfo?: string | undefined;
    attachment1?: string | undefined;
    attachment2?: string | undefined;
    attachment3?: string | undefined;
    attachment4?: string | undefined;
    attachment5?: string | undefined;
    attachment1Info?: string | undefined;
    attachment2Info?: string | undefined;
    attachment3Info?: string | undefined;
    attachment4Info?: string | undefined;
    attachment5Info?: string | undefined;
    headers?: string | undefined;
    dkim?: string | undefined;
    contentIds?: string | undefined;
    envelope?: string | undefined;
    spamScore?: string | undefined;
    spamReport?: string | undefined;
    xSgEid?: string | undefined;
    xSgMsgId?: string | undefined;
}>;
export type SendGridInboundRequest = z.infer<typeof SendGridInboundRequestSchema>;
/**
 * WhatsApp Reply Request
 */
export declare const WhatsAppReplyRequestSchema: z.ZodObject<{
    convId: z.ZodString;
    text: z.ZodString;
    templateId: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    convId: string;
    text: string;
    variables?: Record<string, string> | undefined;
    templateId?: string | undefined;
}, {
    convId: string;
    text: string;
    variables?: Record<string, string> | undefined;
    templateId?: string | undefined;
}>;
export type WhatsAppReplyRequest = z.infer<typeof WhatsAppReplyRequestSchema>;
/**
 * Email Reply Request
 */
export declare const EmailReplyRequestSchema: z.ZodObject<{
    convId: z.ZodString;
    templateId: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    convId: string;
    subject?: string | undefined;
    variables?: Record<string, string> | undefined;
    text?: string | undefined;
    templateId?: string | undefined;
}, {
    convId: string;
    subject?: string | undefined;
    variables?: Record<string, string> | undefined;
    text?: string | undefined;
    templateId?: string | undefined;
}>;
export type EmailReplyRequest = z.infer<typeof EmailReplyRequestSchema>;
/**
 * Lead Creation Response
 */
export declare const LeadCreationResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    leadId: z.ZodOptional<z.ZodString>;
    conversationId: z.ZodOptional<z.ZodString>;
    messageId: z.ZodOptional<z.ZodString>;
    slaDeadline: z.ZodOptional<z.ZodDate>;
    assignedUserId: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    assignedUserId?: string | undefined;
    leadId?: string | undefined;
    slaDeadline?: Date | undefined;
    conversationId?: string | undefined;
    messageId?: string | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    assignedUserId?: string | undefined;
    leadId?: string | undefined;
    slaDeadline?: Date | undefined;
    conversationId?: string | undefined;
    messageId?: string | undefined;
}>;
export type LeadCreationResponse = z.infer<typeof LeadCreationResponseSchema>;
/**
 * Reply Response
 */
export declare const ReplyResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    messageId: z.ZodOptional<z.ZodString>;
    externalId: z.ZodOptional<z.ZodString>;
    slaImpact: z.ZodDefault<z.ZodBoolean>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    slaImpact: boolean;
    error?: string | undefined;
    externalId?: string | undefined;
    messageId?: string | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    externalId?: string | undefined;
    slaImpact?: boolean | undefined;
    messageId?: string | undefined;
}>;
export type ReplyResponse = z.infer<typeof ReplyResponseSchema>;
//# sourceMappingURL=leads.d.ts.map