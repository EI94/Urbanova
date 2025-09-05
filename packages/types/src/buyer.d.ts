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
/**
 * Dati essenziali acquirente
 */
export interface Buyer {
    id: string;
    projectId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferences?: BuyerPreferences;
    notes?: string;
    kycStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
    documents: BuyerDocument[];
    consentGiven: boolean;
    consentDate: Date;
    retentionPolicy: RetentionPolicy;
    dataSubjectRights: DataSubjectRights;
    createdAt: Date;
    updatedAt: Date;
    lastActivityAt: Date;
}
export declare const zBuyer: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    preferences: z.ZodOptional<z.ZodObject<{
        preferredContact: z.ZodEnum<["email", "phone", "whatsapp"]>;
        language: z.ZodDefault<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        notifications: z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            whatsapp: z.ZodDefault<z.ZodBoolean>;
            sms: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            email: boolean;
            whatsapp: boolean;
            sms: boolean;
        }, {
            email?: boolean | undefined;
            whatsapp?: boolean | undefined;
            sms?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        notifications: {
            email: boolean;
            whatsapp: boolean;
            sms: boolean;
        };
        preferredContact: "email" | "phone" | "whatsapp";
        language: string;
    }, {
        notifications: {
            email?: boolean | undefined;
            whatsapp?: boolean | undefined;
            sms?: boolean | undefined;
        };
        preferredContact: "email" | "phone" | "whatsapp";
        timezone?: string | undefined;
        language?: string | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    kycStatus: z.ZodEnum<["pending", "in_progress", "completed", "rejected"]>;
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        filename: z.ZodString;
        url: z.ZodString;
        uploadedAt: z.ZodDate;
        validatedAt: z.ZodOptional<z.ZodDate>;
        status: z.ZodEnum<["pending", "validated", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
    }, {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
    }>, "many">;
    consentGiven: z.ZodBoolean;
    consentDate: z.ZodDate;
    retentionPolicy: z.ZodObject<{
        retentionPeriod: z.ZodNumber;
        autoDelete: z.ZodBoolean;
        projectBased: z.ZodBoolean;
        consentBased: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        retentionPeriod: number;
        autoDelete: boolean;
        projectBased: boolean;
        consentBased: boolean;
    }, {
        retentionPeriod: number;
        autoDelete: boolean;
        projectBased: boolean;
        consentBased: boolean;
    }>;
    dataSubjectRights: z.ZodObject<{
        rightToAccess: z.ZodBoolean;
        rightToRectification: z.ZodBoolean;
        rightToErasure: z.ZodBoolean;
        rightToPortability: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        rightToAccess: boolean;
        rightToRectification: boolean;
        rightToErasure: boolean;
        rightToPortability: boolean;
    }, {
        rightToAccess: boolean;
        rightToRectification: boolean;
        rightToErasure: boolean;
        rightToPortability: boolean;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastActivityAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    documents: {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
    }[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    kycStatus: "pending" | "completed" | "rejected" | "in_progress";
    consentGiven: boolean;
    consentDate: Date;
    retentionPolicy: {
        retentionPeriod: number;
        autoDelete: boolean;
        projectBased: boolean;
        consentBased: boolean;
    };
    dataSubjectRights: {
        rightToAccess: boolean;
        rightToRectification: boolean;
        rightToErasure: boolean;
        rightToPortability: boolean;
    };
    lastActivityAt: Date;
    notes?: string | undefined;
    preferences?: {
        timezone: string;
        notifications: {
            email: boolean;
            whatsapp: boolean;
            sms: boolean;
        };
        preferredContact: "email" | "phone" | "whatsapp";
        language: string;
    } | undefined;
}, {
    projectId: string;
    documents: {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
    }[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    kycStatus: "pending" | "completed" | "rejected" | "in_progress";
    consentGiven: boolean;
    consentDate: Date;
    retentionPolicy: {
        retentionPeriod: number;
        autoDelete: boolean;
        projectBased: boolean;
        consentBased: boolean;
    };
    dataSubjectRights: {
        rightToAccess: boolean;
        rightToRectification: boolean;
        rightToErasure: boolean;
        rightToPortability: boolean;
    };
    lastActivityAt: Date;
    notes?: string | undefined;
    preferences?: {
        notifications: {
            email?: boolean | undefined;
            whatsapp?: boolean | undefined;
            sms?: boolean | undefined;
        };
        preferredContact: "email" | "phone" | "whatsapp";
        timezone?: string | undefined;
        language?: string | undefined;
    } | undefined;
}>;
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
export declare const zBuyerPreferences: z.ZodObject<{
    preferredContact: z.ZodEnum<["email", "phone", "whatsapp"]>;
    language: z.ZodString;
    timezone: z.ZodString;
    notifications: z.ZodObject<{
        email: z.ZodBoolean;
        whatsapp: z.ZodBoolean;
        sms: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    }, {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    notifications: {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
    preferredContact: "email" | "phone" | "whatsapp";
    language: string;
}, {
    timezone: string;
    notifications: {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
    preferredContact: "email" | "phone" | "whatsapp";
    language: string;
}>;
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
export declare const zBuyerDocument: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    filename: z.ZodString;
    url: z.ZodString;
    uploadedAt: z.ZodDate;
    validatedAt: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<["pending", "validated", "rejected"]>;
    docHunterId: z.ZodOptional<z.ZodString>;
    validationNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "rejected" | "validated";
    type: string;
    url: string;
    filename: string;
    uploadedAt: Date;
    validatedAt?: Date | undefined;
    docHunterId?: string | undefined;
    validationNotes?: string | undefined;
}, {
    id: string;
    status: "pending" | "rejected" | "validated";
    type: string;
    url: string;
    filename: string;
    uploadedAt: Date;
    validatedAt?: Date | undefined;
    docHunterId?: string | undefined;
    validationNotes?: string | undefined;
}>;
/**
 * Policy retention
 */
export interface RetentionPolicy {
    retentionPeriod: number;
    autoDelete: boolean;
    projectBased: boolean;
    consentBased: boolean;
}
export declare const zRetentionPolicy: z.ZodObject<{
    retentionPeriod: z.ZodNumber;
    autoDelete: z.ZodBoolean;
    projectBased: z.ZodBoolean;
    consentBased: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    retentionPeriod: number;
    autoDelete: boolean;
    projectBased: boolean;
    consentBased: boolean;
}, {
    retentionPeriod: number;
    autoDelete: boolean;
    projectBased: boolean;
    consentBased: boolean;
}>;
/**
 * Diritti soggetto dati (GDPR)
 */
export interface DataSubjectRights {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
}
export declare const zDataSubjectRights: z.ZodObject<{
    rightToAccess: z.ZodBoolean;
    rightToRectification: z.ZodBoolean;
    rightToErasure: z.ZodBoolean;
    rightToPortability: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
}, {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
}>;
/**
 * JWT Link per accesso sicuro
 */
export type JWTPermission = 'upload' | 'download' | 'view' | 'edit' | 'delete';
export interface BuyerJWTLink {
    id: string;
    buyerId: string;
    projectId: string;
    purpose: 'upload' | 'appointment' | 'payment' | 'access';
    type?: 'upload' | 'appointment' | 'payment' | 'access';
    token: string;
    url: string;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    usedCount?: number;
    maxUses?: number;
    documentTypes?: string[];
    permissions?: JWTPermission[];
    createdAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}
export declare const zBuyerJWTLink: z.ZodObject<{
    id: z.ZodString;
    buyerId: z.ZodString;
    projectId: z.ZodString;
    purpose: z.ZodEnum<["upload", "appointment", "payment", "access"]>;
    type: z.ZodOptional<z.ZodEnum<["upload", "appointment", "payment", "access"]>>;
    token: z.ZodString;
    url: z.ZodString;
    expiresAt: z.ZodDate;
    used: z.ZodBoolean;
    usedAt: z.ZodOptional<z.ZodDate>;
    usedCount: z.ZodOptional<z.ZodNumber>;
    maxUses: z.ZodOptional<z.ZodNumber>;
    documentTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<["upload", "download", "view", "edit", "delete"]>, "many">>;
    createdAt: z.ZodOptional<z.ZodDate>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    id: string;
    url: string;
    expiresAt: Date;
    token: string;
    used: boolean;
    buyerId: string;
    purpose: "payment" | "upload" | "appointment" | "access";
    type?: "payment" | "upload" | "appointment" | "access" | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
    createdAt?: Date | undefined;
    documentTypes?: string[] | undefined;
    usedAt?: Date | undefined;
    usedCount?: number | undefined;
    maxUses?: number | undefined;
    permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
}, {
    projectId: string;
    id: string;
    url: string;
    expiresAt: Date;
    token: string;
    used: boolean;
    buyerId: string;
    purpose: "payment" | "upload" | "appointment" | "access";
    type?: "payment" | "upload" | "appointment" | "access" | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, any> | undefined;
    createdAt?: Date | undefined;
    documentTypes?: string[] | undefined;
    usedAt?: Date | undefined;
    usedCount?: number | undefined;
    maxUses?: number | undefined;
    permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
}>;
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
export declare const zAppointment: z.ZodObject<{
    id: z.ZodString;
    buyerId: z.ZodString;
    projectId: z.ZodString;
    type: z.ZodEnum<["fitting", "visit", "consultation", "payment", "delivery"]>;
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodObject<{
        type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
        address: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
        virtualUrl: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    }>;
    startTime: z.ZodDate;
    endTime: z.ZodDate;
    timezone: z.ZodString;
    status: z.ZodEnum<["scheduled", "confirmed", "completed", "cancelled"]>;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodString;
        confirmed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        id: string;
        name: string;
        role: string;
        email?: string | undefined;
        phone?: string | undefined;
        confirmed?: boolean | undefined;
    }>, "many">;
    reminders: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["whatsapp", "email", "sms"]>;
        template: z.ZodString;
        scheduledAt: z.ZodDate;
        sentAt: z.ZodOptional<z.ZodDate>;
        status: z.ZodEnum<["pending", "sent", "delivered", "failed", "cancelled"]>;
        recipient: z.ZodString;
        message: z.ZodOptional<z.ZodString>;
        confirmationReceived: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
        type: "email" | "whatsapp" | "sms";
        template: string;
        scheduledAt: Date;
        recipient: string;
        message?: string | undefined;
        sentAt?: Date | undefined;
        confirmationReceived?: boolean | undefined;
    }, {
        id: string;
        status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
        type: "email" | "whatsapp" | "sms";
        template: string;
        scheduledAt: Date;
        recipient: string;
        message?: string | undefined;
        sentAt?: Date | undefined;
        confirmationReceived?: boolean | undefined;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        url: string;
        filename: string;
    }, {
        id: string;
        type: string;
        url: string;
        filename: string;
    }>, "many">>;
    icsFile: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        content: z.ZodString;
        generatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
    }, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
    }>>;
    googleEventId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    id: string;
    description: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed";
    type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
    title: string;
    createdAt: Date;
    timezone: string;
    updatedAt: Date;
    location: {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    };
    buyerId: string;
    startTime: Date;
    endTime: Date;
    participants: {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }[];
    reminders: {
        id: string;
        status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
        type: "email" | "whatsapp" | "sms";
        template: string;
        scheduledAt: Date;
        recipient: string;
        message?: string | undefined;
        sentAt?: Date | undefined;
        confirmationReceived?: boolean | undefined;
    }[];
    notes?: string | undefined;
    attachments?: {
        id: string;
        type: string;
        url: string;
        filename: string;
    }[] | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
    } | undefined;
    googleEventId?: string | undefined;
}, {
    projectId: string;
    id: string;
    description: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed";
    type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
    title: string;
    createdAt: Date;
    timezone: string;
    updatedAt: Date;
    location: {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    };
    buyerId: string;
    startTime: Date;
    endTime: Date;
    participants: {
        id: string;
        name: string;
        role: string;
        email?: string | undefined;
        phone?: string | undefined;
        confirmed?: boolean | undefined;
    }[];
    reminders: {
        id: string;
        status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
        type: "email" | "whatsapp" | "sms";
        template: string;
        scheduledAt: Date;
        recipient: string;
        message?: string | undefined;
        sentAt?: Date | undefined;
        confirmationReceived?: boolean | undefined;
    }[];
    notes?: string | undefined;
    attachments?: {
        id: string;
        type: string;
        url: string;
        filename: string;
    }[] | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
    } | undefined;
    googleEventId?: string | undefined;
}>;
/**
 * Località appuntamento
 */
export interface AppointmentLocation {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    virtualUrl?: string;
    instructions?: string;
}
export declare const zAppointmentLocation: z.ZodObject<{
    type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
    address: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
    virtualUrl: z.ZodOptional<z.ZodString>;
    instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "physical" | "virtual" | "hybrid";
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
    address?: string | undefined;
    virtualUrl?: string | undefined;
    instructions?: string | undefined;
}, {
    type: "physical" | "virtual" | "hybrid";
    coordinates?: {
        lat: number;
        lng: number;
    } | undefined;
    address?: string | undefined;
    virtualUrl?: string | undefined;
    instructions?: string | undefined;
}>;
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
export declare const zAppointmentParticipant: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodString;
    confirmed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    role: string;
    confirmed: boolean;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    id: string;
    name: string;
    role: string;
    confirmed: boolean;
    email?: string | undefined;
    phone?: string | undefined;
}>;
/**
 * Allegato appuntamento
 */
export interface AppointmentAttachment {
    id: string;
    filename: string;
    url: string;
    type: string;
}
export declare const zAppointmentAttachment: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    url: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    url: string;
    filename: string;
}, {
    id: string;
    type: string;
    url: string;
    filename: string;
}>;
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
    downloadUrl?: string;
}
export declare const zICSFile: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    content: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        uid: z.ZodString;
        summary: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        timezone: z.ZodString;
        attendees: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            role: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role: string;
        }, {
            name: string;
            email: string;
            role: string;
        }>, "many">;
        organizer: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
        }, {
            name: string;
            email: string;
        }>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            filename: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            mimeType: string;
            filename: string;
        }, {
            url: string;
            mimeType: string;
            filename: string;
        }>, "many">>;
        recurrence: z.ZodOptional<z.ZodObject<{
            freq: z.ZodString;
            interval: z.ZodNumber;
            until: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            freq: string;
            interval: number;
            until?: Date | undefined;
        }, {
            freq: string;
            interval: number;
            until?: Date | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        timezone: string;
        summary: string;
        location: string;
        startDate: Date;
        endDate: Date;
        uid: string;
        attendees: {
            name: string;
            email: string;
            role: string;
        }[];
        organizer: {
            name: string;
            email: string;
        };
        attachments?: {
            url: string;
            mimeType: string;
            filename: string;
        }[] | undefined;
        recurrence?: {
            freq: string;
            interval: number;
            until?: Date | undefined;
        } | undefined;
    }, {
        description: string;
        timezone: string;
        summary: string;
        location: string;
        startDate: Date;
        endDate: Date;
        uid: string;
        attendees: {
            name: string;
            email: string;
            role: string;
        }[];
        organizer: {
            name: string;
            email: string;
        };
        attachments?: {
            url: string;
            mimeType: string;
            filename: string;
        }[] | undefined;
        recurrence?: {
            freq: string;
            interval: number;
            until?: Date | undefined;
        } | undefined;
    }>, "many">;
    generatedAt: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
    downloadUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    generatedAt: Date;
    filename: string;
    events: {
        description: string;
        timezone: string;
        summary: string;
        location: string;
        startDate: Date;
        endDate: Date;
        uid: string;
        attendees: {
            name: string;
            email: string;
            role: string;
        }[];
        organizer: {
            name: string;
            email: string;
        };
        attachments?: {
            url: string;
            mimeType: string;
            filename: string;
        }[] | undefined;
        recurrence?: {
            freq: string;
            interval: number;
            until?: Date | undefined;
        } | undefined;
    }[];
    expiresAt?: Date | undefined;
    downloadUrl?: string | undefined;
}, {
    id: string;
    content: string;
    generatedAt: Date;
    filename: string;
    events: {
        description: string;
        timezone: string;
        summary: string;
        location: string;
        startDate: Date;
        endDate: Date;
        uid: string;
        attendees: {
            name: string;
            email: string;
            role: string;
        }[];
        organizer: {
            name: string;
            email: string;
        };
        attachments?: {
            url: string;
            mimeType: string;
            filename: string;
        }[] | undefined;
        recurrence?: {
            freq: string;
            interval: number;
            until?: Date | undefined;
        } | undefined;
    }[];
    expiresAt?: Date | undefined;
    downloadUrl?: string | undefined;
}>;
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
export declare const zICSEvent: z.ZodObject<{
    uid: z.ZodString;
    summary: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    timezone: z.ZodString;
    attendees: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role: string;
    }, {
        name: string;
        email: string;
        role: string;
    }>, "many">;
    organizer: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
    }, {
        name: string;
        email: string;
    }>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        url: z.ZodString;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        mimeType: string;
        filename: string;
    }, {
        url: string;
        mimeType: string;
        filename: string;
    }>, "many">>;
    recurrence: z.ZodOptional<z.ZodObject<{
        freq: z.ZodString;
        interval: z.ZodNumber;
        until: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        freq: string;
        interval: number;
        until?: Date | undefined;
    }, {
        freq: string;
        interval: number;
        until?: Date | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    timezone: string;
    summary: string;
    location: string;
    startDate: Date;
    endDate: Date;
    uid: string;
    attendees: {
        name: string;
        email: string;
        role: string;
    }[];
    organizer: {
        name: string;
        email: string;
    };
    attachments?: {
        url: string;
        mimeType: string;
        filename: string;
    }[] | undefined;
    recurrence?: {
        freq: string;
        interval: number;
        until?: Date | undefined;
    } | undefined;
}, {
    description: string;
    timezone: string;
    summary: string;
    location: string;
    startDate: Date;
    endDate: Date;
    uid: string;
    attendees: {
        name: string;
        email: string;
        role: string;
    }[];
    organizer: {
        name: string;
        email: string;
    };
    attachments?: {
        url: string;
        mimeType: string;
        filename: string;
    }[] | undefined;
    recurrence?: {
        freq: string;
        interval: number;
        until?: Date | undefined;
    } | undefined;
}>;
/**
 * Partecipante ICS
 */
export interface ICSAttendee {
    name: string;
    email: string;
    role: string;
}
export declare const zICSAttendee: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: string;
}, {
    name: string;
    email: string;
    role: string;
}>;
/**
 * Organizzatore ICS
 */
export interface ICSOrganizer {
    name: string;
    email: string;
}
export declare const zICSOrganizer: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
}, {
    name: string;
    email: string;
}>;
/**
 * Allegato ICS
 */
export interface ICSAttachment {
    filename: string;
    url: string;
    mimeType: string;
}
export declare const zICSAttachment: z.ZodObject<{
    filename: z.ZodString;
    url: z.ZodString;
    mimeType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    mimeType: string;
    filename: string;
}, {
    url: string;
    mimeType: string;
    filename: string;
}>;
/**
 * Ricorrenza ICS
 */
export interface ICSRecurrence {
    freq: string;
    interval: number;
    until?: Date;
}
export declare const zICSRecurrence: z.ZodObject<{
    freq: z.ZodString;
    interval: z.ZodNumber;
    until: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    freq: string;
    interval: number;
    until?: Date | undefined;
}, {
    freq: string;
    interval: number;
    until?: Date | undefined;
}>;
/**
 * Reminder appuntamento
 */
export interface AppointmentReminder {
    id: string;
    appointmentId: string;
    buyerId?: string;
    type: 'whatsapp' | 'email' | 'sms';
    channel?: string;
    template: string;
    scheduledAt: Date;
    sentAt?: Date;
    status: ReminderStatus;
    recipient: string;
    message?: string;
    confirmationReceived?: boolean;
    data?: Record<string, any>;
    deliveryStatus?: string;
    errorMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const zAppointmentReminder: z.ZodObject<{
    id: z.ZodString;
    appointmentId: z.ZodString;
    buyerId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["whatsapp", "email", "sms"]>;
    channel: z.ZodOptional<z.ZodString>;
    template: z.ZodString;
    scheduledAt: z.ZodDate;
    sentAt: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<["pending", "sent", "delivered", "failed", "cancelled"]>;
    recipient: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    confirmationReceived: z.ZodOptional<z.ZodBoolean>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    deliveryStatus: z.ZodOptional<z.ZodString>;
    errorMessage: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
    type: "email" | "whatsapp" | "sms";
    template: string;
    scheduledAt: Date;
    recipient: string;
    appointmentId: string;
    message?: string | undefined;
    createdAt?: Date | undefined;
    sentAt?: Date | undefined;
    updatedAt?: Date | undefined;
    errorMessage?: string | undefined;
    data?: Record<string, any> | undefined;
    buyerId?: string | undefined;
    confirmationReceived?: boolean | undefined;
    channel?: string | undefined;
    deliveryStatus?: string | undefined;
}, {
    id: string;
    status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
    type: "email" | "whatsapp" | "sms";
    template: string;
    scheduledAt: Date;
    recipient: string;
    appointmentId: string;
    message?: string | undefined;
    createdAt?: Date | undefined;
    sentAt?: Date | undefined;
    updatedAt?: Date | undefined;
    errorMessage?: string | undefined;
    data?: Record<string, any> | undefined;
    buyerId?: string | undefined;
    confirmationReceived?: boolean | undefined;
    channel?: string | undefined;
    deliveryStatus?: string | undefined;
}>;
/**
 * Canali reminder
 */
export type ReminderChannel = 'email' | 'whatsapp' | 'sms';
/**
 * Status reminder
 */
export type ReminderStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
/**
 * Template reminder
 */
export interface ReminderTemplate {
    id: string;
    name: string;
    description?: string;
    type: 'whatsapp' | 'email' | 'sms';
    channels?: ReminderChannel[];
    subject?: string;
    body: string;
    content?: Record<string, any>;
    variables: string[];
    language: string;
    isActive: boolean;
}
export declare const zReminderTemplate: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["whatsapp", "email", "sms"]>;
    channels: z.ZodOptional<z.ZodArray<z.ZodEnum<["email", "whatsapp", "sms"]>, "many">>;
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    variables: z.ZodArray<z.ZodString, "many">;
    language: z.ZodString;
    isActive: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "email" | "whatsapp" | "sms";
    name: string;
    isActive: boolean;
    language: string;
    body: string;
    variables: string[];
    description?: string | undefined;
    content?: Record<string, any> | undefined;
    channels?: ("email" | "whatsapp" | "sms")[] | undefined;
    subject?: string | undefined;
}, {
    id: string;
    type: "email" | "whatsapp" | "sms";
    name: string;
    isActive: boolean;
    language: string;
    body: string;
    variables: string[];
    description?: string | undefined;
    content?: Record<string, any> | undefined;
    channels?: ("email" | "whatsapp" | "sms")[] | undefined;
    subject?: string | undefined;
}>;
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
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    calendarId?: string;
}
export declare const zGoogleCalendarConfig: z.ZodObject<{
    enabled: z.ZodBoolean;
    clientId: z.ZodString;
    clientSecret: z.ZodString;
    redirectUri: z.ZodString;
    scopes: z.ZodArray<z.ZodString, "many">;
    syncDirection: z.ZodEnum<["bidirectional", "to_google", "from_google"]>;
    conflictResolution: z.ZodEnum<["local_wins", "remote_wins", "manual"]>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    calendarId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    syncDirection: "bidirectional" | "to_google" | "from_google";
    conflictResolution: "local_wins" | "remote_wins" | "manual";
    expiresAt?: Date | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    calendarId?: string | undefined;
}, {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    syncDirection: "bidirectional" | "to_google" | "from_google";
    conflictResolution: "local_wins" | "remote_wins" | "manual";
    expiresAt?: Date | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    calendarId?: string | undefined;
}>;
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
export declare const zGoogleAuthResult: z.ZodObject<{
    success: z.ZodBoolean;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    expiresAt?: Date | undefined;
    error?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
}, {
    success: boolean;
    expiresAt?: Date | undefined;
    error?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
}>;
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
    appointmentId?: string;
    created?: Date;
    updated?: Date;
    start?: {
        dateTime: Date;
        timeZone: string;
    };
    end?: {
        dateTime: Date;
        timeZone: string;
    };
    status?: string;
    transparency?: string;
    visibility?: string;
    reminders?: any;
}
export declare const zGoogleEvent: z.ZodObject<{
    id: z.ZodString;
    summary: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    startTime: z.ZodDate;
    endTime: z.ZodDate;
    attendees: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        displayName: z.ZodString;
        responseStatus: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        displayName: string;
        responseStatus: string;
    }, {
        email: string;
        displayName: string;
        responseStatus: string;
    }>, "many">;
    organizer: z.ZodObject<{
        email: z.ZodString;
        displayName: z.ZodString;
        self: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        displayName: string;
        self?: boolean | undefined;
    }, {
        email: string;
        displayName: string;
        self?: boolean | undefined;
    }>;
    htmlLink: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodDate>;
    updated: z.ZodOptional<z.ZodDate>;
    start: z.ZodOptional<z.ZodObject<{
        dateTime: z.ZodDate;
        timeZone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dateTime: Date;
        timeZone: string;
    }, {
        dateTime: Date;
        timeZone: string;
    }>>;
    end: z.ZodOptional<z.ZodObject<{
        dateTime: z.ZodDate;
        timeZone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dateTime: Date;
        timeZone: string;
    }, {
        dateTime: Date;
        timeZone: string;
    }>>;
    status: z.ZodOptional<z.ZodString>;
    transparency: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodString>;
    reminders: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    summary: string;
    location: string;
    startTime: Date;
    endTime: Date;
    attendees: {
        email: string;
        displayName: string;
        responseStatus: string;
    }[];
    organizer: {
        email: string;
        displayName: string;
        self?: boolean | undefined;
    };
    htmlLink: string;
    start?: {
        dateTime: Date;
        timeZone: string;
    } | undefined;
    status?: string | undefined;
    reminders?: any;
    appointmentId?: string | undefined;
    created?: Date | undefined;
    updated?: Date | undefined;
    end?: {
        dateTime: Date;
        timeZone: string;
    } | undefined;
    transparency?: string | undefined;
    visibility?: string | undefined;
}, {
    id: string;
    description: string;
    summary: string;
    location: string;
    startTime: Date;
    endTime: Date;
    attendees: {
        email: string;
        displayName: string;
        responseStatus: string;
    }[];
    organizer: {
        email: string;
        displayName: string;
        self?: boolean | undefined;
    };
    htmlLink: string;
    start?: {
        dateTime: Date;
        timeZone: string;
    } | undefined;
    status?: string | undefined;
    reminders?: any;
    appointmentId?: string | undefined;
    created?: Date | undefined;
    updated?: Date | undefined;
    end?: {
        dateTime: Date;
        timeZone: string;
    } | undefined;
    transparency?: string | undefined;
    visibility?: string | undefined;
}>;
/**
 * Partecipante Google Calendar
 */
export interface GoogleAttendee {
    email: string;
    displayName: string;
    responseStatus: string;
    organizer?: boolean;
}
export declare const zGoogleAttendee: z.ZodObject<{
    email: z.ZodString;
    displayName: z.ZodString;
    responseStatus: z.ZodString;
    organizer: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    displayName: string;
    responseStatus: string;
    organizer?: boolean | undefined;
}, {
    email: string;
    displayName: string;
    responseStatus: string;
    organizer?: boolean | undefined;
}>;
/**
 * Organizzatore Google Calendar
 */
export interface GoogleOrganizer {
    email: string;
    displayName: string;
    self?: boolean;
}
export declare const zGoogleOrganizer: z.ZodObject<{
    email: z.ZodString;
    displayName: z.ZodString;
    self: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    displayName: string;
    self?: boolean | undefined;
}, {
    email: string;
    displayName: string;
    self?: boolean | undefined;
}>;
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
export declare const zCollectKYCRequest: z.ZodObject<{
    projectId: z.ZodString;
    buyerId: z.ZodOptional<z.ZodString>;
    documentTypes: z.ZodArray<z.ZodString, "many">;
    options: z.ZodOptional<z.ZodObject<{
        sendEmail: z.ZodOptional<z.ZodBoolean>;
        sendWhatsApp: z.ZodOptional<z.ZodBoolean>;
        retentionDays: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        retentionDays?: number | undefined;
    }, {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        retentionDays?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    documentTypes: string[];
    options?: {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        retentionDays?: number | undefined;
    } | undefined;
    buyerId?: string | undefined;
}, {
    projectId: string;
    documentTypes: string[];
    options?: {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        retentionDays?: number | undefined;
    } | undefined;
    buyerId?: string | undefined;
}>;
/**
 * Response KYC collection
 */
export interface CollectKYCResponse {
    success: boolean;
    buyerId: string;
    uploadLinks: BuyerJWTLink[];
    kycStatus: string;
    expiresAt: Date;
    kycRequestId?: string;
    uploadLink?: string;
    notifications?: Array<{
        channel: string;
        sent: boolean;
    }>;
    message?: string;
    error?: string;
}
export declare const zCollectKYCResponse: z.ZodObject<{
    success: z.ZodBoolean;
    buyerId: z.ZodString;
    uploadLinks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        buyerId: z.ZodString;
        projectId: z.ZodString;
        purpose: z.ZodEnum<["upload", "appointment", "payment", "access"]>;
        type: z.ZodOptional<z.ZodEnum<["upload", "appointment", "payment", "access"]>>;
        token: z.ZodString;
        url: z.ZodString;
        expiresAt: z.ZodDate;
        used: z.ZodBoolean;
        usedAt: z.ZodOptional<z.ZodDate>;
        usedCount: z.ZodOptional<z.ZodNumber>;
        maxUses: z.ZodOptional<z.ZodNumber>;
        documentTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<["upload", "download", "view", "edit", "delete"]>, "many">>;
        createdAt: z.ZodOptional<z.ZodDate>;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        id: string;
        url: string;
        expiresAt: Date;
        token: string;
        used: boolean;
        buyerId: string;
        purpose: "payment" | "upload" | "appointment" | "access";
        type?: "payment" | "upload" | "appointment" | "access" | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        createdAt?: Date | undefined;
        documentTypes?: string[] | undefined;
        usedAt?: Date | undefined;
        usedCount?: number | undefined;
        maxUses?: number | undefined;
        permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
    }, {
        projectId: string;
        id: string;
        url: string;
        expiresAt: Date;
        token: string;
        used: boolean;
        buyerId: string;
        purpose: "payment" | "upload" | "appointment" | "access";
        type?: "payment" | "upload" | "appointment" | "access" | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        createdAt?: Date | undefined;
        documentTypes?: string[] | undefined;
        usedAt?: Date | undefined;
        usedCount?: number | undefined;
        maxUses?: number | undefined;
        permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
    }>, "many">;
    kycStatus: z.ZodString;
    expiresAt: z.ZodDate;
    kycRequestId: z.ZodOptional<z.ZodString>;
    uploadLink: z.ZodOptional<z.ZodString>;
    notifications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        channel: z.ZodString;
        sent: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        sent: boolean;
        channel: string;
    }, {
        sent: boolean;
        channel: string;
    }>, "many">>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    expiresAt: Date;
    success: boolean;
    kycStatus: string;
    buyerId: string;
    uploadLinks: {
        projectId: string;
        id: string;
        url: string;
        expiresAt: Date;
        token: string;
        used: boolean;
        buyerId: string;
        purpose: "payment" | "upload" | "appointment" | "access";
        type?: "payment" | "upload" | "appointment" | "access" | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        createdAt?: Date | undefined;
        documentTypes?: string[] | undefined;
        usedAt?: Date | undefined;
        usedCount?: number | undefined;
        maxUses?: number | undefined;
        permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
    }[];
    message?: string | undefined;
    notifications?: {
        sent: boolean;
        channel: string;
    }[] | undefined;
    error?: string | undefined;
    kycRequestId?: string | undefined;
    uploadLink?: string | undefined;
}, {
    expiresAt: Date;
    success: boolean;
    kycStatus: string;
    buyerId: string;
    uploadLinks: {
        projectId: string;
        id: string;
        url: string;
        expiresAt: Date;
        token: string;
        used: boolean;
        buyerId: string;
        purpose: "payment" | "upload" | "appointment" | "access";
        type?: "payment" | "upload" | "appointment" | "access" | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        metadata?: Record<string, any> | undefined;
        createdAt?: Date | undefined;
        documentTypes?: string[] | undefined;
        usedAt?: Date | undefined;
        usedCount?: number | undefined;
        maxUses?: number | undefined;
        permissions?: ("delete" | "download" | "upload" | "view" | "edit")[] | undefined;
    }[];
    message?: string | undefined;
    notifications?: {
        sent: boolean;
        channel: string;
    }[] | undefined;
    error?: string | undefined;
    kycRequestId?: string | undefined;
    uploadLink?: string | undefined;
}>;
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
export declare const zScheduleFittingsRequest: z.ZodObject<{
    buyerId: z.ZodString;
    when: z.ZodDate;
    location: z.ZodObject<{
        type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
        address: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
        virtualUrl: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    }, {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    }>;
    type: z.ZodEnum<["fitting", "visit", "consultation"]>;
    participants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodString;
        confirmed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }>, "many">>;
    reminders: z.ZodOptional<z.ZodObject<{
        whatsapp: z.ZodOptional<z.ZodBoolean>;
        email: z.ZodOptional<z.ZodBoolean>;
        sms: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email?: boolean | undefined;
        whatsapp?: boolean | undefined;
        sms?: boolean | undefined;
    }, {
        email?: boolean | undefined;
        whatsapp?: boolean | undefined;
        sms?: boolean | undefined;
    }>>;
    options: z.ZodOptional<z.ZodObject<{
        generateICS: z.ZodOptional<z.ZodBoolean>;
        syncGoogleCalendar: z.ZodOptional<z.ZodBoolean>;
        sendConfirmation: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        generateICS?: boolean | undefined;
        syncGoogleCalendar?: boolean | undefined;
        sendConfirmation?: boolean | undefined;
    }, {
        generateICS?: boolean | undefined;
        syncGoogleCalendar?: boolean | undefined;
        sendConfirmation?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "fitting" | "visit" | "consultation";
    location: {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    };
    buyerId: string;
    when: Date;
    options?: {
        generateICS?: boolean | undefined;
        syncGoogleCalendar?: boolean | undefined;
        sendConfirmation?: boolean | undefined;
    } | undefined;
    participants?: {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }[] | undefined;
    reminders?: {
        email?: boolean | undefined;
        whatsapp?: boolean | undefined;
        sms?: boolean | undefined;
    } | undefined;
}, {
    type: "fitting" | "visit" | "consultation";
    location: {
        type: "physical" | "virtual" | "hybrid";
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
        address?: string | undefined;
        virtualUrl?: string | undefined;
        instructions?: string | undefined;
    };
    buyerId: string;
    when: Date;
    options?: {
        generateICS?: boolean | undefined;
        syncGoogleCalendar?: boolean | undefined;
        sendConfirmation?: boolean | undefined;
    } | undefined;
    participants?: {
        id: string;
        name: string;
        role: string;
        confirmed: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }[] | undefined;
    reminders?: {
        email?: boolean | undefined;
        whatsapp?: boolean | undefined;
        sms?: boolean | undefined;
    } | undefined;
}>;
/**
 * Response scheduling fittings
 */
export interface ScheduleFittingsResponse {
    success: boolean;
    appointment?: Appointment;
    icsFile?: ICSFile;
    googleEvent?: GoogleEvent;
    confirmationSent?: boolean;
    error?: string;
    message?: string;
}
export declare const zScheduleFittingsResponse: z.ZodObject<{
    success: z.ZodBoolean;
    appointment: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        buyerId: z.ZodString;
        projectId: z.ZodString;
        type: z.ZodEnum<["fitting", "visit", "consultation", "payment", "delivery"]>;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodObject<{
            type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
            address: z.ZodOptional<z.ZodString>;
            coordinates: z.ZodOptional<z.ZodObject<{
                lat: z.ZodNumber;
                lng: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                lat: number;
                lng: number;
            }, {
                lat: number;
                lng: number;
            }>>;
            virtualUrl: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }>;
        startTime: z.ZodDate;
        endTime: z.ZodDate;
        timezone: z.ZodString;
        status: z.ZodEnum<["scheduled", "confirmed", "completed", "cancelled"]>;
        participants: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodString;
            confirmed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }, {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }>, "many">;
        reminders: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["whatsapp", "email", "sms"]>;
            template: z.ZodString;
            scheduledAt: z.ZodDate;
            sentAt: z.ZodOptional<z.ZodDate>;
            status: z.ZodEnum<["pending", "sent", "delivered", "failed", "cancelled"]>;
            recipient: z.ZodString;
            message: z.ZodOptional<z.ZodString>;
            confirmationReceived: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }>, "many">;
        notes: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            url: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }>, "many">>;
        icsFile: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            content: z.ZodString;
            generatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }>>;
        googleEventId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }>>;
    icsFile: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        content: z.ZodString;
        events: z.ZodArray<z.ZodObject<{
            uid: z.ZodString;
            summary: z.ZodString;
            description: z.ZodString;
            location: z.ZodString;
            startDate: z.ZodDate;
            endDate: z.ZodDate;
            timezone: z.ZodString;
            attendees: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                email: z.ZodString;
                role: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                email: string;
                role: string;
            }, {
                name: string;
                email: string;
                role: string;
            }>, "many">;
            organizer: z.ZodObject<{
                name: z.ZodString;
                email: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                email: string;
            }, {
                name: string;
                email: string;
            }>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                filename: z.ZodString;
                url: z.ZodString;
                mimeType: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                mimeType: string;
                filename: string;
            }, {
                url: string;
                mimeType: string;
                filename: string;
            }>, "many">>;
            recurrence: z.ZodOptional<z.ZodObject<{
                freq: z.ZodString;
                interval: z.ZodNumber;
                until: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                freq: string;
                interval: number;
                until?: Date | undefined;
            }, {
                freq: string;
                interval: number;
                until?: Date | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }, {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }>, "many">;
        generatedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodDate>;
        downloadUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    }, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    }>>;
    googleEvent: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        summary: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        startTime: z.ZodDate;
        endTime: z.ZodDate;
        attendees: z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            displayName: z.ZodString;
            responseStatus: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            displayName: string;
            responseStatus: string;
        }, {
            email: string;
            displayName: string;
            responseStatus: string;
        }>, "many">;
        organizer: z.ZodObject<{
            email: z.ZodString;
            displayName: z.ZodString;
            self: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        }, {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        }>;
        htmlLink: z.ZodString;
        appointmentId: z.ZodOptional<z.ZodString>;
        created: z.ZodOptional<z.ZodDate>;
        updated: z.ZodOptional<z.ZodDate>;
        start: z.ZodOptional<z.ZodObject<{
            dateTime: z.ZodDate;
            timeZone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dateTime: Date;
            timeZone: string;
        }, {
            dateTime: Date;
            timeZone: string;
        }>>;
        end: z.ZodOptional<z.ZodObject<{
            dateTime: z.ZodDate;
            timeZone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dateTime: Date;
            timeZone: string;
        }, {
            dateTime: Date;
            timeZone: string;
        }>>;
        status: z.ZodOptional<z.ZodString>;
        transparency: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodString>;
        reminders: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        summary: string;
        location: string;
        startTime: Date;
        endTime: Date;
        attendees: {
            email: string;
            displayName: string;
            responseStatus: string;
        }[];
        organizer: {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        };
        htmlLink: string;
        start?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        status?: string | undefined;
        reminders?: any;
        appointmentId?: string | undefined;
        created?: Date | undefined;
        updated?: Date | undefined;
        end?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        transparency?: string | undefined;
        visibility?: string | undefined;
    }, {
        id: string;
        description: string;
        summary: string;
        location: string;
        startTime: Date;
        endTime: Date;
        attendees: {
            email: string;
            displayName: string;
            responseStatus: string;
        }[];
        organizer: {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        };
        htmlLink: string;
        start?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        status?: string | undefined;
        reminders?: any;
        appointmentId?: string | undefined;
        created?: Date | undefined;
        updated?: Date | undefined;
        end?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        transparency?: string | undefined;
        visibility?: string | undefined;
    }>>;
    confirmationSent: z.ZodOptional<z.ZodBoolean>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    error?: string | undefined;
    appointment?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    } | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    } | undefined;
    googleEvent?: {
        id: string;
        description: string;
        summary: string;
        location: string;
        startTime: Date;
        endTime: Date;
        attendees: {
            email: string;
            displayName: string;
            responseStatus: string;
        }[];
        organizer: {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        };
        htmlLink: string;
        start?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        status?: string | undefined;
        reminders?: any;
        appointmentId?: string | undefined;
        created?: Date | undefined;
        updated?: Date | undefined;
        end?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        transparency?: string | undefined;
        visibility?: string | undefined;
    } | undefined;
    confirmationSent?: boolean | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    error?: string | undefined;
    appointment?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    } | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    } | undefined;
    googleEvent?: {
        id: string;
        description: string;
        summary: string;
        location: string;
        startTime: Date;
        endTime: Date;
        attendees: {
            email: string;
            displayName: string;
            responseStatus: string;
        }[];
        organizer: {
            email: string;
            displayName: string;
            self?: boolean | undefined;
        };
        htmlLink: string;
        start?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        status?: string | undefined;
        reminders?: any;
        appointmentId?: string | undefined;
        created?: Date | undefined;
        updated?: Date | undefined;
        end?: {
            dateTime: Date;
            timeZone: string;
        } | undefined;
        transparency?: string | undefined;
        visibility?: string | undefined;
    } | undefined;
    confirmationSent?: boolean | undefined;
}>;
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
export declare const zRemindPaymentRequest: z.ZodObject<{
    buyerId: z.ZodString;
    milestone: z.ZodString;
    amount: z.ZodNumber;
    dueDate: z.ZodDate;
    options: z.ZodOptional<z.ZodObject<{
        sendWhatsApp: z.ZodOptional<z.ZodBoolean>;
        sendEmail: z.ZodOptional<z.ZodBoolean>;
        sendSMS: z.ZodOptional<z.ZodBoolean>;
        requireConfirmation: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        sendSMS?: boolean | undefined;
        requireConfirmation?: boolean | undefined;
    }, {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        sendSMS?: boolean | undefined;
        requireConfirmation?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    milestone: string;
    buyerId: string;
    dueDate: Date;
    options?: {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        sendSMS?: boolean | undefined;
        requireConfirmation?: boolean | undefined;
    } | undefined;
}, {
    amount: number;
    milestone: string;
    buyerId: string;
    dueDate: Date;
    options?: {
        sendEmail?: boolean | undefined;
        sendWhatsApp?: boolean | undefined;
        sendSMS?: boolean | undefined;
        requireConfirmation?: boolean | undefined;
    } | undefined;
}>;
/**
 * Response payment reminder
 */
export interface RemindPaymentResponse {
    success: boolean;
    reminderId?: string;
    sentChannels?: string[];
    confirmationRequired?: boolean;
    confirmationReceived?: boolean;
    notifications?: Array<{
        channel: string;
        sent: boolean;
    }>;
    paymentUrl?: string;
    error?: string;
    message?: string;
}
export declare const zRemindPaymentResponse: z.ZodObject<{
    success: z.ZodBoolean;
    reminderId: z.ZodOptional<z.ZodString>;
    sentChannels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    confirmationRequired: z.ZodOptional<z.ZodBoolean>;
    confirmationReceived: z.ZodOptional<z.ZodBoolean>;
    notifications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        channel: z.ZodString;
        sent: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        sent: boolean;
        channel: string;
    }, {
        sent: boolean;
        channel: string;
    }>, "many">>;
    paymentUrl: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    notifications?: {
        sent: boolean;
        channel: string;
    }[] | undefined;
    error?: string | undefined;
    confirmationReceived?: boolean | undefined;
    reminderId?: string | undefined;
    sentChannels?: string[] | undefined;
    confirmationRequired?: boolean | undefined;
    paymentUrl?: string | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    notifications?: {
        sent: boolean;
        channel: string;
    }[] | undefined;
    error?: string | undefined;
    confirmationReceived?: boolean | undefined;
    reminderId?: string | undefined;
    sentChannels?: string[] | undefined;
    confirmationRequired?: boolean | undefined;
    paymentUrl?: string | undefined;
}>;
/**
 * Response per ottenere informazioni buyer
 */
export interface GetBuyerInfoResponse {
    success: boolean;
    buyer?: Buyer;
    kycStatus?: string;
    documents?: BuyerDocument[];
    appointments?: Appointment[];
    privacySettings?: any;
    error?: string;
    message?: string;
}
export declare const zGetBuyerInfoResponse: z.ZodObject<{
    success: z.ZodBoolean;
    buyer: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        preferences: z.ZodOptional<z.ZodObject<{
            preferredContact: z.ZodEnum<["email", "phone", "whatsapp"]>;
            language: z.ZodDefault<z.ZodString>;
            timezone: z.ZodDefault<z.ZodString>;
            notifications: z.ZodObject<{
                email: z.ZodDefault<z.ZodBoolean>;
                whatsapp: z.ZodDefault<z.ZodBoolean>;
                sms: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                email: boolean;
                whatsapp: boolean;
                sms: boolean;
            }, {
                email?: boolean | undefined;
                whatsapp?: boolean | undefined;
                sms?: boolean | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            timezone: string;
            notifications: {
                email: boolean;
                whatsapp: boolean;
                sms: boolean;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            language: string;
        }, {
            notifications: {
                email?: boolean | undefined;
                whatsapp?: boolean | undefined;
                sms?: boolean | undefined;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            timezone?: string | undefined;
            language?: string | undefined;
        }>>;
        notes: z.ZodOptional<z.ZodString>;
        kycStatus: z.ZodEnum<["pending", "in_progress", "completed", "rejected"]>;
        documents: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            filename: z.ZodString;
            url: z.ZodString;
            uploadedAt: z.ZodDate;
            validatedAt: z.ZodOptional<z.ZodDate>;
            status: z.ZodEnum<["pending", "validated", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }, {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }>, "many">;
        consentGiven: z.ZodBoolean;
        consentDate: z.ZodDate;
        retentionPolicy: z.ZodObject<{
            retentionPeriod: z.ZodNumber;
            autoDelete: z.ZodBoolean;
            projectBased: z.ZodBoolean;
            consentBased: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        }, {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        }>;
        dataSubjectRights: z.ZodObject<{
            rightToAccess: z.ZodBoolean;
            rightToRectification: z.ZodBoolean;
            rightToErasure: z.ZodBoolean;
            rightToPortability: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        }, {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastActivityAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        documents: {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        kycStatus: "pending" | "completed" | "rejected" | "in_progress";
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
        lastActivityAt: Date;
        notes?: string | undefined;
        preferences?: {
            timezone: string;
            notifications: {
                email: boolean;
                whatsapp: boolean;
                sms: boolean;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            language: string;
        } | undefined;
    }, {
        projectId: string;
        documents: {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        kycStatus: "pending" | "completed" | "rejected" | "in_progress";
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
        lastActivityAt: Date;
        notes?: string | undefined;
        preferences?: {
            notifications: {
                email?: boolean | undefined;
                whatsapp?: boolean | undefined;
                sms?: boolean | undefined;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            timezone?: string | undefined;
            language?: string | undefined;
        } | undefined;
    }>>;
    kycStatus: z.ZodOptional<z.ZodString>;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        filename: z.ZodString;
        url: z.ZodString;
        uploadedAt: z.ZodDate;
        validatedAt: z.ZodOptional<z.ZodDate>;
        status: z.ZodEnum<["pending", "validated", "rejected"]>;
        docHunterId: z.ZodOptional<z.ZodString>;
        validationNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
        docHunterId?: string | undefined;
        validationNotes?: string | undefined;
    }, {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
        docHunterId?: string | undefined;
        validationNotes?: string | undefined;
    }>, "many">>;
    appointments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        buyerId: z.ZodString;
        projectId: z.ZodString;
        type: z.ZodEnum<["fitting", "visit", "consultation", "payment", "delivery"]>;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodObject<{
            type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
            address: z.ZodOptional<z.ZodString>;
            coordinates: z.ZodOptional<z.ZodObject<{
                lat: z.ZodNumber;
                lng: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                lat: number;
                lng: number;
            }, {
                lat: number;
                lng: number;
            }>>;
            virtualUrl: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }>;
        startTime: z.ZodDate;
        endTime: z.ZodDate;
        timezone: z.ZodString;
        status: z.ZodEnum<["scheduled", "confirmed", "completed", "cancelled"]>;
        participants: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodString;
            confirmed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }, {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }>, "many">;
        reminders: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["whatsapp", "email", "sms"]>;
            template: z.ZodString;
            scheduledAt: z.ZodDate;
            sentAt: z.ZodOptional<z.ZodDate>;
            status: z.ZodEnum<["pending", "sent", "delivered", "failed", "cancelled"]>;
            recipient: z.ZodString;
            message: z.ZodOptional<z.ZodString>;
            confirmationReceived: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }>, "many">;
        notes: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            url: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }>, "many">>;
        icsFile: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            content: z.ZodString;
            generatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }>>;
        googleEventId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }>, "many">>;
    privacySettings: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    documents?: {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
        docHunterId?: string | undefined;
        validationNotes?: string | undefined;
    }[] | undefined;
    message?: string | undefined;
    error?: string | undefined;
    kycStatus?: string | undefined;
    buyer?: {
        projectId: string;
        documents: {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        kycStatus: "pending" | "completed" | "rejected" | "in_progress";
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
        lastActivityAt: Date;
        notes?: string | undefined;
        preferences?: {
            timezone: string;
            notifications: {
                email: boolean;
                whatsapp: boolean;
                sms: boolean;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            language: string;
        } | undefined;
    } | undefined;
    appointments?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }[] | undefined;
    privacySettings?: any;
}, {
    success: boolean;
    documents?: {
        id: string;
        status: "pending" | "rejected" | "validated";
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
        validatedAt?: Date | undefined;
        docHunterId?: string | undefined;
        validationNotes?: string | undefined;
    }[] | undefined;
    message?: string | undefined;
    error?: string | undefined;
    kycStatus?: string | undefined;
    buyer?: {
        projectId: string;
        documents: {
            id: string;
            status: "pending" | "rejected" | "validated";
            type: string;
            url: string;
            filename: string;
            uploadedAt: Date;
            validatedAt?: Date | undefined;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        kycStatus: "pending" | "completed" | "rejected" | "in_progress";
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
        lastActivityAt: Date;
        notes?: string | undefined;
        preferences?: {
            notifications: {
                email?: boolean | undefined;
                whatsapp?: boolean | undefined;
                sms?: boolean | undefined;
            };
            preferredContact: "email" | "phone" | "whatsapp";
            timezone?: string | undefined;
            language?: string | undefined;
        } | undefined;
    } | undefined;
    appointments?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }[] | undefined;
    privacySettings?: any;
}>;
/**
 * Response per listare appuntamenti
 */
export interface ListAppointmentsResponse {
    success: boolean;
    appointments?: Appointment[];
    total?: number;
    page?: number;
    limit?: number;
    count?: number;
    error?: string;
    message?: string;
}
export declare const zListAppointmentsResponse: z.ZodObject<{
    success: z.ZodBoolean;
    appointments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        buyerId: z.ZodString;
        projectId: z.ZodString;
        type: z.ZodEnum<["fitting", "visit", "consultation", "payment", "delivery"]>;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodObject<{
            type: z.ZodEnum<["physical", "virtual", "hybrid"]>;
            address: z.ZodOptional<z.ZodString>;
            coordinates: z.ZodOptional<z.ZodObject<{
                lat: z.ZodNumber;
                lng: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                lat: number;
                lng: number;
            }, {
                lat: number;
                lng: number;
            }>>;
            virtualUrl: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }, {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        }>;
        startTime: z.ZodDate;
        endTime: z.ZodDate;
        timezone: z.ZodString;
        status: z.ZodEnum<["scheduled", "confirmed", "completed", "cancelled"]>;
        participants: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodString;
            confirmed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }, {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }>, "many">;
        reminders: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["whatsapp", "email", "sms"]>;
            template: z.ZodString;
            scheduledAt: z.ZodDate;
            sentAt: z.ZodOptional<z.ZodDate>;
            status: z.ZodEnum<["pending", "sent", "delivered", "failed", "cancelled"]>;
            recipient: z.ZodString;
            message: z.ZodOptional<z.ZodString>;
            confirmationReceived: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }, {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }>, "many">;
        notes: z.ZodOptional<z.ZodString>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            url: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }, {
            id: string;
            type: string;
            url: string;
            filename: string;
        }>, "many">>;
        icsFile: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            filename: z.ZodString;
            content: z.ZodString;
            generatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }, {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        }>>;
        googleEventId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }, {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }>, "many">>;
    total: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    count: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    limit?: number | undefined;
    total?: number | undefined;
    error?: string | undefined;
    appointments?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            confirmed: boolean;
            email?: string | undefined;
            phone?: string | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }[] | undefined;
    page?: number | undefined;
    count?: number | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    limit?: number | undefined;
    total?: number | undefined;
    error?: string | undefined;
    appointments?: {
        projectId: string;
        id: string;
        description: string;
        status: "completed" | "cancelled" | "scheduled" | "confirmed";
        type: "payment" | "fitting" | "visit" | "consultation" | "delivery";
        title: string;
        createdAt: Date;
        timezone: string;
        updatedAt: Date;
        location: {
            type: "physical" | "virtual" | "hybrid";
            coordinates?: {
                lat: number;
                lng: number;
            } | undefined;
            address?: string | undefined;
            virtualUrl?: string | undefined;
            instructions?: string | undefined;
        };
        buyerId: string;
        startTime: Date;
        endTime: Date;
        participants: {
            id: string;
            name: string;
            role: string;
            email?: string | undefined;
            phone?: string | undefined;
            confirmed?: boolean | undefined;
        }[];
        reminders: {
            id: string;
            status: "pending" | "failed" | "sent" | "cancelled" | "delivered";
            type: "email" | "whatsapp" | "sms";
            template: string;
            scheduledAt: Date;
            recipient: string;
            message?: string | undefined;
            sentAt?: Date | undefined;
            confirmationReceived?: boolean | undefined;
        }[];
        notes?: string | undefined;
        attachments?: {
            id: string;
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        icsFile?: {
            id: string;
            content: string;
            generatedAt: Date;
            filename: string;
        } | undefined;
        googleEventId?: string | undefined;
    }[] | undefined;
    page?: number | undefined;
    count?: number | undefined;
}>;
/**
 * Response per generare file ICS
 */
export interface GenerateICSResponse {
    success: boolean;
    icsFile?: ICSFile;
    downloadUrl?: string;
    expiresAt?: Date;
    message?: string;
    error?: string;
}
export declare const zGenerateICSResponse: z.ZodObject<{
    success: z.ZodBoolean;
    icsFile: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        content: z.ZodString;
        events: z.ZodArray<z.ZodObject<{
            uid: z.ZodString;
            summary: z.ZodString;
            description: z.ZodString;
            location: z.ZodString;
            startDate: z.ZodDate;
            endDate: z.ZodDate;
            timezone: z.ZodString;
            attendees: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                email: z.ZodString;
                role: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                email: string;
                role: string;
            }, {
                name: string;
                email: string;
                role: string;
            }>, "many">;
            organizer: z.ZodObject<{
                name: z.ZodString;
                email: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                email: string;
            }, {
                name: string;
                email: string;
            }>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                filename: z.ZodString;
                url: z.ZodString;
                mimeType: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                mimeType: string;
                filename: string;
            }, {
                url: string;
                mimeType: string;
                filename: string;
            }>, "many">>;
            recurrence: z.ZodOptional<z.ZodObject<{
                freq: z.ZodString;
                interval: z.ZodNumber;
                until: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                freq: string;
                interval: number;
                until?: Date | undefined;
            }, {
                freq: string;
                interval: number;
                until?: Date | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }, {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }>, "many">;
        generatedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodDate>;
        downloadUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    }, {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    }>>;
    downloadUrl: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    expiresAt?: Date | undefined;
    error?: string | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    } | undefined;
    downloadUrl?: string | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    expiresAt?: Date | undefined;
    error?: string | undefined;
    icsFile?: {
        id: string;
        content: string;
        generatedAt: Date;
        filename: string;
        events: {
            description: string;
            timezone: string;
            summary: string;
            location: string;
            startDate: Date;
            endDate: Date;
            uid: string;
            attendees: {
                name: string;
                email: string;
                role: string;
            }[];
            organizer: {
                name: string;
                email: string;
            };
            attachments?: {
                url: string;
                mimeType: string;
                filename: string;
            }[] | undefined;
            recurrence?: {
                freq: string;
                interval: number;
                until?: Date | undefined;
            } | undefined;
        }[];
        expiresAt?: Date | undefined;
        downloadUrl?: string | undefined;
    } | undefined;
    downloadUrl?: string | undefined;
}>;
/**
 * Response per inviare reminder
 */
export interface SendReminderResponse {
    success: boolean;
    reminderId?: string;
    sentChannels?: string[];
    status?: string;
    confirmationRequired?: boolean;
    results?: any;
    error?: string;
    message?: string;
}
export declare const zSendReminderResponse: z.ZodObject<{
    success: z.ZodBoolean;
    reminderId: z.ZodOptional<z.ZodString>;
    sentChannels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodString>;
    confirmationRequired: z.ZodOptional<z.ZodBoolean>;
    results: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    status?: string | undefined;
    message?: string | undefined;
    error?: string | undefined;
    reminderId?: string | undefined;
    sentChannels?: string[] | undefined;
    confirmationRequired?: boolean | undefined;
    results?: any;
}, {
    success: boolean;
    status?: string | undefined;
    message?: string | undefined;
    error?: string | undefined;
    reminderId?: string | undefined;
    sentChannels?: string[] | undefined;
    confirmationRequired?: boolean | undefined;
    results?: any;
}>;
/**
 * Response per aggiornare privacy
 */
export interface UpdatePrivacyResponse {
    success: boolean;
    buyerId?: string;
    privacySettings?: {
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: RetentionPolicy;
        dataSubjectRights: DataSubjectRights;
    };
    message?: string;
    error?: string;
}
export declare const zUpdatePrivacyResponse: z.ZodObject<{
    success: z.ZodBoolean;
    buyerId: z.ZodOptional<z.ZodString>;
    privacySettings: z.ZodOptional<z.ZodObject<{
        consentGiven: z.ZodBoolean;
        consentDate: z.ZodDate;
        retentionPolicy: z.ZodObject<{
            retentionPeriod: z.ZodNumber;
            autoDelete: z.ZodBoolean;
            projectBased: z.ZodBoolean;
            consentBased: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        }, {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        }>;
        dataSubjectRights: z.ZodObject<{
            rightToAccess: z.ZodBoolean;
            rightToRectification: z.ZodBoolean;
            rightToErasure: z.ZodBoolean;
            rightToPortability: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        }, {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
    }, {
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
    }>>;
    message: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    error?: string | undefined;
    buyerId?: string | undefined;
    privacySettings?: {
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
    } | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    error?: string | undefined;
    buyerId?: string | undefined;
    privacySettings?: {
        consentGiven: boolean;
        consentDate: Date;
        retentionPolicy: {
            retentionPeriod: number;
            autoDelete: boolean;
            projectBased: boolean;
            consentBased: boolean;
        };
        dataSubjectRights: {
            rightToAccess: boolean;
            rightToRectification: boolean;
            rightToErasure: boolean;
            rightToPortability: boolean;
        };
    } | undefined;
}>;
//# sourceMappingURL=buyer.d.ts.map