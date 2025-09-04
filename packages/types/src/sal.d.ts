import { z } from 'zod';
/**
 * Stati del SAL (Finite State Machine)
 */
export type SALStatus = 'DRAFT' | 'SENT' | 'SIGNED_VENDOR' | 'SIGNED_PM' | 'READY_TO_PAY' | 'PAID';
/**
 * Linea del SAL - Specifica tecnica e costi
 */
interface SALLine {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category: 'MATERIALS' | 'LABOR' | 'EQUIPMENT' | 'SERVICES';
    specifications?: string;
    deliveryDate?: Date;
}
/**
 * Firma digitale (pseudo-firma)
 */
interface SALSignature {
    id: string;
    signerId: string;
    signerName: string;
    signerRole: 'PM' | 'VENDOR';
    signedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    signatureHash: string;
}
/**
 * Dettagli del pagamento
 */
interface SALPayment {
    id: string;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    receiptUrl?: string;
    paidAt?: Date;
    failureReason?: string;
    metadata: Record<string, string>;
}
/**
 * SAL principale
 */
interface SAL {
    id: string;
    projectId: string;
    vendorId: string;
    vendorName: string;
    vendorEmail: string;
    title: string;
    description: string;
    totalAmount: number;
    currency: string;
    status: SALStatus;
    currentStep: number;
    totalSteps: number;
    createdAt: Date;
    sentAt?: Date;
    vendorSignedAt?: Date;
    pmSignedAt?: Date;
    readyToPayAt?: Date;
    paidAt?: Date;
    lines: SALLine[];
    terms: string;
    conditions: string[];
    signatures: SALSignature[];
    payment?: SALPayment;
    metadata: Record<string, any>;
    tags: string[];
}
/**
 * Creazione di un nuovo SAL
 */
interface SALCreateRequest {
    projectId: string;
    vendorId: string;
    title: string;
    description: string;
    lines: Omit<SALLine, 'id'>[];
    terms: string;
    conditions: string[];
    metadata?: Record<string, any>;
}
/**
 * Invio del SAL al vendor
 */
interface SALSendRequest {
    salId: string;
    vendorEmail: string;
    message?: string;
}
/**
 * Firma del SAL
 */
interface SALSignRequest {
    salId: string;
    signerId: string;
    signerName: string;
    signerRole: 'PM' | 'VENDOR';
    signatureHash: string;
}
/**
 * Pagamento del SAL
 */
interface SALPayRequest {
    salId: string;
    paymentMethodId?: string;
}
/**
 * Risultato delle operazioni SAL
 */
interface SALResult {
    success: boolean;
    sal?: SAL;
    message: string;
    errors?: string[];
    nextAction?: string;
}
/**
 * Schema Zod per SALLine
 */
declare const zSALLine: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    unitPrice: z.ZodNumber;
    totalPrice: z.ZodNumber;
    category: z.ZodEnum<["MATERIALS", "LABOR", "EQUIPMENT", "SERVICES"]>;
    specifications: z.ZodOptional<z.ZodString>;
    deliveryDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
    specifications?: string | undefined;
    deliveryDate?: Date | undefined;
}, {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
    specifications?: string | undefined;
    deliveryDate?: Date | undefined;
}>;
/**
 * Schema Zod per SALSignature
 */
declare const zSALSignature: z.ZodObject<{
    id: z.ZodString;
    signerId: z.ZodString;
    signerName: z.ZodString;
    signerRole: z.ZodEnum<["PM", "VENDOR"]>;
    signedAt: z.ZodDate;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    signatureHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    signerId: string;
    signerName: string;
    signerRole: "PM" | "VENDOR";
    signedAt: Date;
    signatureHash: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    id: string;
    signerId: string;
    signerName: string;
    signerRole: "PM" | "VENDOR";
    signedAt: Date;
    signatureHash: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
/**
 * Schema Zod per SALPayment
 */
declare const zSALPayment: z.ZodObject<{
    id: z.ZodString;
    stripePaymentIntentId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["pending", "succeeded", "failed", "canceled"]>;
    receiptUrl: z.ZodOptional<z.ZodString>;
    paidAt: z.ZodOptional<z.ZodDate>;
    failureReason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "succeeded" | "failed" | "canceled";
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
    receiptUrl?: string | undefined;
    paidAt?: Date | undefined;
    failureReason?: string | undefined;
}, {
    id: string;
    status: "pending" | "succeeded" | "failed" | "canceled";
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
    receiptUrl?: string | undefined;
    paidAt?: Date | undefined;
    failureReason?: string | undefined;
}>;
/**
 * Schema Zod per SAL
 */
declare const zSAL: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    vendorId: z.ZodString;
    vendorName: z.ZodString;
    vendorEmail: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
    status: z.ZodEnum<["DRAFT", "SENT", "SIGNED_VENDOR", "SIGNED_PM", "READY_TO_PAY", "PAID"]>;
    currentStep: z.ZodNumber;
    totalSteps: z.ZodNumber;
    createdAt: z.ZodDate;
    sentAt: z.ZodOptional<z.ZodDate>;
    vendorSignedAt: z.ZodOptional<z.ZodDate>;
    pmSignedAt: z.ZodOptional<z.ZodDate>;
    readyToPayAt: z.ZodOptional<z.ZodDate>;
    paidAt: z.ZodOptional<z.ZodDate>;
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
        category: z.ZodEnum<["MATERIALS", "LABOR", "EQUIPMENT", "SERVICES"]>;
        specifications: z.ZodOptional<z.ZodString>;
        deliveryDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }, {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }>, "many">;
    terms: z.ZodString;
    conditions: z.ZodArray<z.ZodString, "many">;
    signatures: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        signerId: z.ZodString;
        signerName: z.ZodString;
        signerRole: z.ZodEnum<["PM", "VENDOR"]>;
        signedAt: z.ZodDate;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signatureHash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        signerId: string;
        signerName: string;
        signerRole: "PM" | "VENDOR";
        signedAt: Date;
        signatureHash: string;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }, {
        id: string;
        signerId: string;
        signerName: string;
        signerRole: "PM" | "VENDOR";
        signedAt: Date;
        signatureHash: string;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }>, "many">;
    payment: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        stripePaymentIntentId: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodString;
        status: z.ZodEnum<["pending", "succeeded", "failed", "canceled"]>;
        receiptUrl: z.ZodOptional<z.ZodString>;
        paidAt: z.ZodOptional<z.ZodDate>;
        failureReason: z.ZodOptional<z.ZodString>;
        metadata: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "pending" | "succeeded" | "failed" | "canceled";
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        metadata: Record<string, string>;
        receiptUrl?: string | undefined;
        paidAt?: Date | undefined;
        failureReason?: string | undefined;
    }, {
        id: string;
        status: "pending" | "succeeded" | "failed" | "canceled";
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        metadata: Record<string, string>;
        receiptUrl?: string | undefined;
        paidAt?: Date | undefined;
        failureReason?: string | undefined;
    }>>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    status: "DRAFT" | "SENT" | "SIGNED_VENDOR" | "SIGNED_PM" | "READY_TO_PAY" | "PAID";
    currency: string;
    metadata: Record<string, any>;
    projectId: string;
    vendorId: string;
    vendorName: string;
    vendorEmail: string;
    title: string;
    totalAmount: number;
    currentStep: number;
    totalSteps: number;
    createdAt: Date;
    lines: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }[];
    terms: string;
    conditions: string[];
    signatures: {
        id: string;
        signerId: string;
        signerName: string;
        signerRole: "PM" | "VENDOR";
        signedAt: Date;
        signatureHash: string;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }[];
    tags: string[];
    paidAt?: Date | undefined;
    sentAt?: Date | undefined;
    vendorSignedAt?: Date | undefined;
    pmSignedAt?: Date | undefined;
    readyToPayAt?: Date | undefined;
    payment?: {
        id: string;
        status: "pending" | "succeeded" | "failed" | "canceled";
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        metadata: Record<string, string>;
        receiptUrl?: string | undefined;
        paidAt?: Date | undefined;
        failureReason?: string | undefined;
    } | undefined;
}, {
    id: string;
    description: string;
    status: "DRAFT" | "SENT" | "SIGNED_VENDOR" | "SIGNED_PM" | "READY_TO_PAY" | "PAID";
    currency: string;
    metadata: Record<string, any>;
    projectId: string;
    vendorId: string;
    vendorName: string;
    vendorEmail: string;
    title: string;
    totalAmount: number;
    currentStep: number;
    totalSteps: number;
    createdAt: Date;
    lines: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }[];
    terms: string;
    conditions: string[];
    signatures: {
        id: string;
        signerId: string;
        signerName: string;
        signerRole: "PM" | "VENDOR";
        signedAt: Date;
        signatureHash: string;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }[];
    tags: string[];
    paidAt?: Date | undefined;
    sentAt?: Date | undefined;
    vendorSignedAt?: Date | undefined;
    pmSignedAt?: Date | undefined;
    readyToPayAt?: Date | undefined;
    payment?: {
        id: string;
        status: "pending" | "succeeded" | "failed" | "canceled";
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        metadata: Record<string, string>;
        receiptUrl?: string | undefined;
        paidAt?: Date | undefined;
        failureReason?: string | undefined;
    } | undefined;
}>;
/**
 * Schema Zod per SALCreateRequest
 */
declare const zSALCreateRequest: z.ZodObject<{
    projectId: z.ZodString;
    vendorId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    lines: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
        category: z.ZodEnum<["MATERIALS", "LABOR", "EQUIPMENT", "SERVICES"]>;
        specifications: z.ZodOptional<z.ZodString>;
        deliveryDate: z.ZodOptional<z.ZodDate>;
    }, "id">, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }, {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }>, "many">;
    terms: z.ZodString;
    conditions: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    projectId: string;
    vendorId: string;
    title: string;
    lines: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }[];
    terms: string;
    conditions: string[];
    metadata?: Record<string, any> | undefined;
}, {
    description: string;
    projectId: string;
    vendorId: string;
    title: string;
    lines: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        category: "MATERIALS" | "LABOR" | "EQUIPMENT" | "SERVICES";
        specifications?: string | undefined;
        deliveryDate?: Date | undefined;
    }[];
    terms: string;
    conditions: string[];
    metadata?: Record<string, any> | undefined;
}>;
/**
 * Schema Zod per SALSendRequest
 */
declare const zSALSendRequest: z.ZodObject<{
    salId: z.ZodString;
    vendorEmail: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vendorEmail: string;
    salId: string;
    message?: string | undefined;
}, {
    vendorEmail: string;
    salId: string;
    message?: string | undefined;
}>;
/**
 * Schema Zod per SALSignRequest
 */
declare const zSALSignRequest: z.ZodObject<{
    salId: z.ZodString;
    signerId: z.ZodString;
    signerName: z.ZodString;
    signerRole: z.ZodEnum<["PM", "VENDOR"]>;
    signatureHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    signerId: string;
    signerName: string;
    signerRole: "PM" | "VENDOR";
    signatureHash: string;
    salId: string;
}, {
    signerId: string;
    signerName: string;
    signerRole: "PM" | "VENDOR";
    signatureHash: string;
    salId: string;
}>;
/**
 * Schema Zod per SALPayRequest
 */
declare const zSALPayRequest: z.ZodObject<{
    salId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    salId: string;
    paymentMethodId?: string | undefined;
}, {
    salId: string;
    paymentMethodId?: string | undefined;
}>;
export type { SAL, SALLine, SALSignature, SALPayment, SALCreateRequest, SALSendRequest, SALSignRequest, SALPayRequest, SALResult, };
export { zSAL, zSALLine, zSALSignature, zSALPayment, zSALCreateRequest, zSALSendRequest, zSALSignRequest, zSALPayRequest, };
//# sourceMappingURL=sal.d.ts.map