"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_LIMITATIONS_OPTIONS = exports.EASEMENTS_OPTIONS = exports.URBAN_CONSTRAINTS_OPTIONS = exports.AVAILABLE_DOCUMENTS_OPTIONS = exports.VENDOR_QUESTIONNAIRE_REMINDER_DAYS = exports.VENDOR_QUESTIONNAIRE_EXPIRY_DAYS = exports.zProjectFactsUpdate = exports.zVendorQuestionnaire = exports.zVendorAnswers = exports.zVendorContact = void 0;
const zod_1 = require("zod");
// ============================================================================
// ZOD SCHEMAS
// ============================================================================
exports.zVendorContact = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome richiesto'),
    email: zod_1.z.string().email('Email non valida'),
    phone: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
});
exports.zVendorAnswers = zod_1.z.object({
    cdu: zod_1.z.object({
        hasCDU: zod_1.z.boolean(),
        cduDate: zod_1.z.string().optional(),
        cduValidity: zod_1.z.string().optional(),
        cduNotes: zod_1.z.string().optional(),
    }),
    project: zod_1.z.object({
        hasSubmittedProject: zod_1.z.boolean(),
        projectSubmissionDate: zod_1.z.string().optional(),
        projectApprovalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
        projectNotes: zod_1.z.string().optional(),
    }),
    sale: zod_1.z.object({
        saleType: zod_1.z.enum(['asset', 'spa']),
        saleMotivation: zod_1.z.string().optional(),
        saleUrgency: zod_1.z.enum(['low', 'medium', 'high']),
    }),
    constraints: zod_1.z.object({
        urbanConstraints: zod_1.z.array(zod_1.z.string()),
        easements: zod_1.z.array(zod_1.z.string()),
        accessLimitations: zod_1.z.array(zod_1.z.string()),
        constraintNotes: zod_1.z.string().optional(),
    }),
    documents: zod_1.z.object({
        availableDocuments: zod_1.z.array(zod_1.z.string()),
        documentNotes: zod_1.z.string().optional(),
    }),
    additional: zod_1.z.object({
        notes: zod_1.z.string().optional(),
        contactPreference: zod_1.z.enum(['email', 'phone', 'meeting']).optional(),
        bestTimeToContact: zod_1.z.string().optional(),
    }),
});
exports.zVendorQuestionnaire = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    vendorContact: exports.zVendorContact,
    token: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'completed', 'expired']),
    createdAt: zod_1.z.date(),
    expiresAt: zod_1.z.date(),
    completedAt: zod_1.z.date().optional(),
    answers: exports.zVendorAnswers.optional(),
    metadata: zod_1.z.object({
        sentBy: zod_1.z.string(),
        sentAt: zod_1.z.date(),
        reminderCount: zod_1.z.number().min(0),
        lastReminderAt: zod_1.z.date().optional(),
    }),
});
exports.zProjectFactsUpdate = zod_1.z.object({
    projectId: zod_1.z.string(),
    source: zod_1.z.literal('vendor_questionnaire'),
    timestamp: zod_1.z.date(),
    updatedBy: zod_1.z.string(),
    changes: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        oldValue: zod_1.z.any().optional(),
        newValue: zod_1.z.any(),
        confidence: zod_1.z.number().min(0).max(1),
    })),
    metadata: zod_1.z.object({
        questionnaireId: zod_1.z.string(),
        vendorContact: exports.zVendorContact,
    }),
});
// ============================================================================
// CONSTANTS
// ============================================================================
exports.VENDOR_QUESTIONNAIRE_EXPIRY_DAYS = 7;
exports.VENDOR_QUESTIONNAIRE_REMINDER_DAYS = [3, 5]; // giorni prima della scadenza
exports.AVAILABLE_DOCUMENTS_OPTIONS = [
    'planimetrie',
    'relazioni_tecniche',
    'certificazioni_energetiche',
    'perizie_tecniche',
    'visure_catastali',
    'certificati_agibilita',
    'documenti_urbanistici',
    'contratti_locazione',
    'altri_documenti',
];
exports.URBAN_CONSTRAINTS_OPTIONS = [
    'vincoli_paesaggistici',
    'vincoli_archeologici',
    'vincoli_idrogeologici',
    'vincoli_acustici',
    'vincoli_ambientali',
    'vincoli_viabilita',
    'nessun_vincolo',
];
exports.EASEMENTS_OPTIONS = [
    'passaggio_servitu',
    'elettrodotto',
    'gasdotto',
    'acquedotto',
    'fognatura',
    'telecomunicazioni',
    'nessuna_servitu',
];
exports.ACCESS_LIMITATIONS_OPTIONS = [
    'strada_privata',
    'accesso_limitato',
    'orari_accesso',
    'restrizioni_veicolari',
    'nessuna_limitazione',
];
//# sourceMappingURL=vendor.js.map