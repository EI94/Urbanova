"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zSALPayRequest = exports.zSALSignRequest = exports.zSALSendRequest = exports.zSALCreateRequest = exports.zSALPayment = exports.zSALSignature = exports.zSALLine = exports.zSAL = void 0;
// SAL (Subcontractor Agreement Letter) Types - Urbanova AI
const zod_1 = require("zod");
// ============================================================================
// ZOD SCHEMAS
// ============================================================================
/**
 * Schema Zod per SALLine
 */
const zSALLine = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unit: zod_1.z.string().min(1),
    unitPrice: zod_1.z.number().positive(),
    totalPrice: zod_1.z.number().positive(),
    category: zod_1.z.enum(['MATERIALS', 'LABOR', 'EQUIPMENT', 'SERVICES']),
    specifications: zod_1.z.string().optional(),
    deliveryDate: zod_1.z.date().optional(),
});
exports.zSALLine = zSALLine;
/**
 * Schema Zod per SALSignature
 */
const zSALSignature = zod_1.z.object({
    id: zod_1.z.string(),
    signerId: zod_1.z.string(),
    signerName: zod_1.z.string().min(1),
    signerRole: zod_1.z.enum(['PM', 'VENDOR']),
    signedAt: zod_1.z.date(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    signatureHash: zod_1.z.string().min(1),
});
exports.zSALSignature = zSALSignature;
/**
 * Schema Zod per SALPayment
 */
const zSALPayment = zod_1.z.object({
    id: zod_1.z.string(),
    stripePaymentIntentId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    status: zod_1.z.enum(['pending', 'succeeded', 'failed', 'canceled']),
    receiptUrl: zod_1.z.string().url().optional(),
    paidAt: zod_1.z.date().optional(),
    failureReason: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string()),
});
exports.zSALPayment = zSALPayment;
/**
 * Schema Zod per SAL
 */
const zSAL = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    vendorId: zod_1.z.string(),
    vendorName: zod_1.z.string().min(1),
    vendorEmail: zod_1.z.string().email(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    totalAmount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    status: zod_1.z.enum(['DRAFT', 'SENT', 'SIGNED_VENDOR', 'SIGNED_PM', 'READY_TO_PAY', 'PAID']),
    currentStep: zod_1.z.number().min(1),
    totalSteps: zod_1.z.number().min(1),
    createdAt: zod_1.z.date(),
    sentAt: zod_1.z.date().optional(),
    vendorSignedAt: zod_1.z.date().optional(),
    pmSignedAt: zod_1.z.date().optional(),
    readyToPayAt: zod_1.z.date().optional(),
    paidAt: zod_1.z.date().optional(),
    lines: zod_1.z.array(zSALLine),
    terms: zod_1.z.string(),
    conditions: zod_1.z.array(zod_1.z.string()),
    signatures: zod_1.z.array(zSALSignature),
    payment: zSALPayment.optional(),
    metadata: zod_1.z.record(zod_1.z.any()),
    tags: zod_1.z.array(zod_1.z.string()),
});
exports.zSAL = zSAL;
/**
 * Schema Zod per SALCreateRequest
 */
const zSALCreateRequest = zod_1.z.object({
    projectId: zod_1.z.string(),
    vendorId: zod_1.z.string(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    lines: zod_1.z.array(zSALLine.omit({ id: true })),
    terms: zod_1.z.string(),
    conditions: zod_1.z.array(zod_1.z.string()),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.zSALCreateRequest = zSALCreateRequest;
/**
 * Schema Zod per SALSendRequest
 */
const zSALSendRequest = zod_1.z.object({
    salId: zod_1.z.string(),
    vendorEmail: zod_1.z.string().email(),
    message: zod_1.z.string().optional(),
});
exports.zSALSendRequest = zSALSendRequest;
/**
 * Schema Zod per SALSignRequest
 */
const zSALSignRequest = zod_1.z.object({
    salId: zod_1.z.string(),
    signerId: zod_1.z.string(),
    signerName: zod_1.z.string().min(1),
    signerRole: zod_1.z.enum(['PM', 'VENDOR']),
    signatureHash: zod_1.z.string().min(1),
});
exports.zSALSignRequest = zSALSignRequest;
/**
 * Schema Zod per SALPayRequest
 */
const zSALPayRequest = zod_1.z.object({
    salId: zod_1.z.string(),
    paymentMethodId: zod_1.z.string().optional(),
});
exports.zSALPayRequest = zSALPayRequest;
//# sourceMappingURL=sal.js.map