"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zVendor = exports.zVendorDocument = exports.zPreCheckResult = exports.zPreCheckItem = exports.zOffer = exports.zOfferScoring = exports.zOfferAttachment = exports.zOfferLine = exports.zRDO = exports.zInvitedVendor = exports.zRDOLine = exports.zScoringWeights = void 0;
// Urbanova Procurement System Types
const zod_1 = require("zod");
// ===========================================
// ZOD SCHEMAS
// ===========================================
exports.zScoringWeights = zod_1.z
    .object({
    price: zod_1.z.number().min(0).max(1),
    time: zod_1.z.number().min(0).max(1),
    quality: zod_1.z.number().min(0).max(1),
    custom: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
})
    .refine(data => Math.abs(data.price + data.time + data.quality - 1) < 0.01, {
    message: 'I pesi devono sommare a 1.0',
});
exports.zRDOLine = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string().min(10),
    quantity: zod_1.z.number().positive(),
    unit: zod_1.z.string(),
    unitPrice: zod_1.z.number().positive().optional(),
    totalPrice: zod_1.z.number().positive().optional(),
    specifications: zod_1.z.string(),
    requirements: zod_1.z.array(zod_1.z.string()),
});
exports.zInvitedVendor = zod_1.z.object({
    vendorId: zod_1.z.string(),
    vendorName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    invitedAt: zod_1.z.date(),
    respondedAt: zod_1.z.date().optional(),
    status: zod_1.z.enum(['invited', 'responded', 'declined', 'expired']),
    token: zod_1.z.string(),
    expiresAt: zod_1.z.date(),
});
exports.zRDO = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    title: zod_1.z.string().min(10),
    description: zod_1.z.string().min(50),
    deadline: zod_1.z.date(),
    status: zod_1.z.enum(['draft', 'open', 'evaluating', 'awarded', 'cancelled']),
    lines: zod_1.z.array(exports.zRDOLine).min(1),
    invitedVendors: zod_1.z.array(exports.zInvitedVendor),
    scoringWeights: exports.zScoringWeights,
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    createdBy: zod_1.z.string(),
    awardedTo: zod_1.z.string().optional(),
    awardedAt: zod_1.z.date().optional(),
    metadata: zod_1.z.object({
        category: zod_1.z.string(),
        estimatedValue: zod_1.z.number().positive(),
        currency: zod_1.z.string().length(3),
        location: zod_1.z.string(),
        requirements: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.zOfferLine = zod_1.z.object({
    lineId: zod_1.z.string(),
    description: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    unit: zod_1.z.string(),
    unitPrice: zod_1.z.number().positive(),
    totalPrice: zod_1.z.number().positive(),
    deliveryTime: zod_1.z.number().positive(),
    notes: zod_1.z.string().optional(),
});
exports.zOfferAttachment = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    type: zod_1.z.enum(['technical', 'financial', 'certification', 'other']),
    size: zod_1.z.number().positive(),
    mimeType: zod_1.z.string(),
    uploadedAt: zod_1.z.date(),
});
exports.zOfferScoring = zod_1.z.object({
    priceScore: zod_1.z.number().min(0).max(100),
    timeScore: zod_1.z.number().min(0).max(100),
    qualityScore: zod_1.z.number().min(0).max(100),
    totalScore: zod_1.z.number().min(0).max(100),
    weightedScore: zod_1.z.number().min(0).max(100),
    outlier: zod_1.z.boolean(),
    outlierReason: zod_1.z.string().optional(),
});
exports.zOffer = zod_1.z.object({
    id: zod_1.z.string(),
    rdoId: zod_1.z.string(),
    vendorId: zod_1.z.string(),
    vendorName: zod_1.z.string(),
    submittedAt: zod_1.z.date(),
    status: zod_1.z.enum(['draft', 'submitted', 'evaluated', 'awarded', 'rejected']),
    lines: zod_1.z.array(exports.zOfferLine),
    totalPrice: zod_1.z.number().positive(),
    totalTime: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    qualityScore: zod_1.z.number().min(1).max(10),
    qualityNotes: zod_1.z.string(),
    technicalNotes: zod_1.z.string(),
    additionalInfo: zod_1.z.record(zod_1.z.unknown()),
    attachments: zod_1.z.array(exports.zOfferAttachment),
    scoring: exports.zOfferScoring.optional(),
    ranking: zod_1.z.number().int().positive().optional(),
    preCheckStatus: zod_1.z.enum(['pending', 'passed', 'failed', 'warning']),
    preCheckDetails: zod_1.z
        .object({
        status: zod_1.z.enum(['pending', 'passed', 'failed', 'warning']),
        checks: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
            status: zod_1.z.enum(['valid', 'expired', 'missing', 'invalid']),
            documentUrl: zod_1.z.string().url().optional(),
            expiryDate: zod_1.z.date().optional(),
            score: zod_1.z.number().min(0).max(100),
            notes: zod_1.z.string(),
            required: zod_1.z.boolean(),
        })),
        overallScore: zod_1.z.number().min(0).max(100),
        passed: zod_1.z.boolean(),
        warnings: zod_1.z.array(zod_1.z.string()),
        errors: zod_1.z.array(zod_1.z.string()),
        lastChecked: zod_1.z.date(),
        nextCheckDue: zod_1.z.date(),
    })
        .optional(),
});
exports.zPreCheckItem = zod_1.z.object({
    type: zod_1.z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
    status: zod_1.z.enum(['valid', 'expired', 'missing', 'invalid']),
    documentUrl: zod_1.z.string().url().optional(),
    expiryDate: zod_1.z.date().optional(),
    score: zod_1.z.number().min(0).max(100),
    notes: zod_1.z.string(),
    required: zod_1.z.boolean(),
});
exports.zPreCheckResult = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'passed', 'failed', 'warning']),
    checks: zod_1.z.array(exports.zPreCheckItem),
    overallScore: zod_1.z.number().min(0).max(100),
    passed: zod_1.z.boolean(),
    warnings: zod_1.z.array(zod_1.z.string()),
    errors: zod_1.z.array(zod_1.z.string()),
    lastChecked: zod_1.z.date(),
    nextCheckDue: zod_1.z.date(),
});
exports.zVendorDocument = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
    url: zod_1.z.string().url(),
    filename: zod_1.z.string(),
    uploadedAt: zod_1.z.date(),
    expiresAt: zod_1.z.date().optional(),
    status: zod_1.z.enum(['valid', 'expired', 'pending_verification']),
    verifiedAt: zod_1.z.date().optional(),
    verifiedBy: zod_1.z.string().optional(),
});
exports.zVendor = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.object({
        street: zod_1.z.string(),
        city: zod_1.z.string(),
        province: zod_1.z.string().length(2),
        postalCode: zod_1.z.string(),
        country: zod_1.z.string(),
    }),
    vatNumber: zod_1.z.string(),
    fiscalCode: zod_1.z.string(),
    category: zod_1.z.array(zod_1.z.string()),
    rating: zod_1.z.number().min(1).max(5),
    activeRDOs: zod_1.z.number().int().min(0),
    completedProjects: zod_1.z.number().int().min(0),
    totalValue: zod_1.z.number().positive(),
    documents: zod_1.z.array(exports.zVendorDocument),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
//# sourceMappingURL=procurement.js.map