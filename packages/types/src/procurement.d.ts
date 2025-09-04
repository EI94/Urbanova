import { z } from 'zod';
export interface RDO {
    id: string;
    projectId: string;
    title: string;
    description: string;
    deadline: Date;
    status: 'draft' | 'open' | 'evaluating' | 'awarded' | 'cancelled';
    lines: RDOLine[];
    invitedVendors: InvitedVendor[];
    scoringWeights: ScoringWeights;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    awardedTo?: string;
    awardedAt?: Date;
    metadata: {
        category: string;
        estimatedValue: number;
        currency: string;
        location: string;
        requirements: string[];
    };
}
export interface RDOLine {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    totalPrice?: number;
    specifications: string;
    requirements: string[];
}
export interface InvitedVendor {
    vendorId: string;
    vendorName: string;
    email: string;
    phone?: string;
    invitedAt: Date;
    respondedAt?: Date;
    status: 'invited' | 'responded' | 'declined' | 'expired';
    token: string;
    expiresAt: Date;
}
export interface ScoringWeights {
    price: number;
    time: number;
    quality: number;
    custom?: Record<string, number>;
}
export interface Offer {
    id: string;
    rdoId: string;
    vendorId: string;
    vendorName: string;
    submittedAt: Date;
    status: 'draft' | 'submitted' | 'evaluated' | 'awarded' | 'rejected';
    lines: OfferLine[];
    totalPrice: number;
    totalTime: number;
    currency: string;
    qualityScore: number;
    qualityNotes: string;
    technicalNotes: string;
    additionalInfo: Record<string, unknown>;
    attachments: OfferAttachment[];
    scoring?: OfferScoring;
    ranking?: number;
    preCheckStatus: 'pending' | 'passed' | 'failed' | 'warning';
    preCheckDetails?: PreCheckResult;
}
export interface OfferLine {
    lineId: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    deliveryTime: number;
    notes?: string;
}
export interface OfferAttachment {
    id: string;
    name: string;
    url: string;
    type: 'technical' | 'financial' | 'certification' | 'other';
    size: number;
    mimeType: string;
    uploadedAt: Date;
}
export interface OfferScoring {
    priceScore: number;
    timeScore: number;
    qualityScore: number;
    totalScore: number;
    weightedScore: number;
    outlier: boolean;
    outlierReason?: string;
}
export interface Comparison {
    id: string;
    rdoId: string;
    generatedAt: Date;
    generatedBy: string;
    offers: RankedOffer[];
    statistics: ComparisonStatistics;
    outliers: OutlierAnalysis[];
    pdfUrl: string;
    excelUrl?: string;
    scoringWeights: ScoringWeights;
    notes: string;
}
export interface RankedOffer {
    rank: number;
    offer: Offer;
    score: number;
    priceRank: number;
    timeRank: number;
    qualityRank: number;
    recommendation: 'strong' | 'good' | 'acceptable' | 'weak';
}
export interface ComparisonStatistics {
    totalOffers: number;
    validOffers: number;
    averagePrice: number;
    averageTime: number;
    averageQuality: number;
    priceRange: {
        min: number;
        max: number;
    };
    timeRange: {
        min: number;
        max: number;
    };
    qualityRange: {
        min: number;
        max: number;
    };
}
export interface OutlierAnalysis {
    offerId: string;
    vendorName: string;
    type: 'price' | 'time' | 'quality' | 'combined';
    severity: 'low' | 'medium' | 'high';
    description: string;
    deviation: number;
    recommendation: string;
}
export interface PreCheckResult {
    status: 'pending' | 'passed' | 'failed' | 'warning';
    checks: PreCheckItem[];
    overallScore: number;
    passed: boolean;
    warnings: string[];
    errors: string[];
    lastChecked: Date;
    nextCheckDue: Date;
}
export interface PreCheckItem {
    type: 'DURC' | 'visura' | 'certification' | 'insurance' | 'financial';
    status: 'valid' | 'expired' | 'missing' | 'invalid';
    documentUrl?: string;
    expiryDate?: Date;
    score: number;
    notes: string;
    required: boolean;
}
export interface Vendor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    vatNumber: string;
    fiscalCode: string;
    category: string[];
    rating: number;
    activeRDOs: number;
    completedProjects: number;
    totalValue: number;
    documents: VendorDocument[];
    createdAt: Date;
    updatedAt: Date;
}
export interface VendorDocument {
    id: string;
    type: 'DURC' | 'visura' | 'certification' | 'insurance' | 'financial';
    url: string;
    filename: string;
    uploadedAt: Date;
    expiresAt?: Date;
    status: 'valid' | 'expired' | 'pending_verification';
    verifiedAt?: Date;
    verifiedBy?: string;
}
export declare const zScoringWeights: z.ZodEffects<z.ZodObject<{
    price: z.ZodNumber;
    time: z.ZodNumber;
    quality: z.ZodNumber;
    custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    price: number;
    time: number;
    quality: number;
    custom?: Record<string, number> | undefined;
}, {
    price: number;
    time: number;
    quality: number;
    custom?: Record<string, number> | undefined;
}>, {
    price: number;
    time: number;
    quality: number;
    custom?: Record<string, number> | undefined;
}, {
    price: number;
    time: number;
    quality: number;
    custom?: Record<string, number> | undefined;
}>;
export declare const zRDOLine: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    unitPrice: z.ZodOptional<z.ZodNumber>;
    totalPrice: z.ZodOptional<z.ZodNumber>;
    specifications: z.ZodString;
    requirements: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    specifications: string;
    requirements: string[];
    unitPrice?: number | undefined;
    totalPrice?: number | undefined;
}, {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    specifications: string;
    requirements: string[];
    unitPrice?: number | undefined;
    totalPrice?: number | undefined;
}>;
export declare const zInvitedVendor: z.ZodObject<{
    vendorId: z.ZodString;
    vendorName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    invitedAt: z.ZodDate;
    respondedAt: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<["invited", "responded", "declined", "expired"]>;
    token: z.ZodString;
    expiresAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "expired" | "invited" | "responded" | "declined";
    vendorId: string;
    vendorName: string;
    expiresAt: Date;
    email: string;
    token: string;
    invitedAt: Date;
    phone?: string | undefined;
    respondedAt?: Date | undefined;
}, {
    status: "expired" | "invited" | "responded" | "declined";
    vendorId: string;
    vendorName: string;
    expiresAt: Date;
    email: string;
    token: string;
    invitedAt: Date;
    phone?: string | undefined;
    respondedAt?: Date | undefined;
}>;
export declare const zRDO: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    deadline: z.ZodDate;
    status: z.ZodEnum<["draft", "open", "evaluating", "awarded", "cancelled"]>;
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        unitPrice: z.ZodOptional<z.ZodNumber>;
        totalPrice: z.ZodOptional<z.ZodNumber>;
        specifications: z.ZodString;
        requirements: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        specifications: string;
        requirements: string[];
        unitPrice?: number | undefined;
        totalPrice?: number | undefined;
    }, {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        specifications: string;
        requirements: string[];
        unitPrice?: number | undefined;
        totalPrice?: number | undefined;
    }>, "many">;
    invitedVendors: z.ZodArray<z.ZodObject<{
        vendorId: z.ZodString;
        vendorName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        invitedAt: z.ZodDate;
        respondedAt: z.ZodOptional<z.ZodDate>;
        status: z.ZodEnum<["invited", "responded", "declined", "expired"]>;
        token: z.ZodString;
        expiresAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        status: "expired" | "invited" | "responded" | "declined";
        vendorId: string;
        vendorName: string;
        expiresAt: Date;
        email: string;
        token: string;
        invitedAt: Date;
        phone?: string | undefined;
        respondedAt?: Date | undefined;
    }, {
        status: "expired" | "invited" | "responded" | "declined";
        vendorId: string;
        vendorName: string;
        expiresAt: Date;
        email: string;
        token: string;
        invitedAt: Date;
        phone?: string | undefined;
        respondedAt?: Date | undefined;
    }>, "many">;
    scoringWeights: z.ZodEffects<z.ZodObject<{
        price: z.ZodNumber;
        time: z.ZodNumber;
        quality: z.ZodNumber;
        custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    }, {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    }>, {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    }, {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    awardedTo: z.ZodOptional<z.ZodString>;
    awardedAt: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodObject<{
        category: z.ZodString;
        estimatedValue: z.ZodNumber;
        currency: z.ZodString;
        location: z.ZodString;
        requirements: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        category: string;
        currency: string;
        location: string;
        estimatedValue: number;
        requirements: string[];
    }, {
        category: string;
        currency: string;
        location: string;
        estimatedValue: number;
        requirements: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    status: "draft" | "open" | "cancelled" | "awarded" | "evaluating";
    metadata: {
        category: string;
        currency: string;
        location: string;
        estimatedValue: number;
        requirements: string[];
    };
    projectId: string;
    title: string;
    createdAt: Date;
    lines: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        specifications: string;
        requirements: string[];
        unitPrice?: number | undefined;
        totalPrice?: number | undefined;
    }[];
    updatedAt: Date;
    deadline: Date;
    createdBy: string;
    invitedVendors: {
        status: "expired" | "invited" | "responded" | "declined";
        vendorId: string;
        vendorName: string;
        expiresAt: Date;
        email: string;
        token: string;
        invitedAt: Date;
        phone?: string | undefined;
        respondedAt?: Date | undefined;
    }[];
    scoringWeights: {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    };
    awardedTo?: string | undefined;
    awardedAt?: Date | undefined;
}, {
    id: string;
    description: string;
    status: "draft" | "open" | "cancelled" | "awarded" | "evaluating";
    metadata: {
        category: string;
        currency: string;
        location: string;
        estimatedValue: number;
        requirements: string[];
    };
    projectId: string;
    title: string;
    createdAt: Date;
    lines: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        specifications: string;
        requirements: string[];
        unitPrice?: number | undefined;
        totalPrice?: number | undefined;
    }[];
    updatedAt: Date;
    deadline: Date;
    createdBy: string;
    invitedVendors: {
        status: "expired" | "invited" | "responded" | "declined";
        vendorId: string;
        vendorName: string;
        expiresAt: Date;
        email: string;
        token: string;
        invitedAt: Date;
        phone?: string | undefined;
        respondedAt?: Date | undefined;
    }[];
    scoringWeights: {
        price: number;
        time: number;
        quality: number;
        custom?: Record<string, number> | undefined;
    };
    awardedTo?: string | undefined;
    awardedAt?: Date | undefined;
}>;
export declare const zOfferLine: z.ZodObject<{
    lineId: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    unitPrice: z.ZodNumber;
    totalPrice: z.ZodNumber;
    deliveryTime: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    lineId: string;
    deliveryTime: number;
    notes?: string | undefined;
}, {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    lineId: string;
    deliveryTime: number;
    notes?: string | undefined;
}>;
export declare const zOfferAttachment: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    type: z.ZodEnum<["technical", "financial", "certification", "other"]>;
    size: z.ZodNumber;
    mimeType: z.ZodString;
    uploadedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "other" | "certification" | "technical" | "financial";
    name: string;
    url: string;
    mimeType: string;
    uploadedAt: Date;
    size: number;
}, {
    id: string;
    type: "other" | "certification" | "technical" | "financial";
    name: string;
    url: string;
    mimeType: string;
    uploadedAt: Date;
    size: number;
}>;
export declare const zOfferScoring: z.ZodObject<{
    priceScore: z.ZodNumber;
    timeScore: z.ZodNumber;
    qualityScore: z.ZodNumber;
    totalScore: z.ZodNumber;
    weightedScore: z.ZodNumber;
    outlier: z.ZodBoolean;
    outlierReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    priceScore: number;
    timeScore: number;
    qualityScore: number;
    totalScore: number;
    weightedScore: number;
    outlier: boolean;
    outlierReason?: string | undefined;
}, {
    priceScore: number;
    timeScore: number;
    qualityScore: number;
    totalScore: number;
    weightedScore: number;
    outlier: boolean;
    outlierReason?: string | undefined;
}>;
export declare const zOffer: z.ZodObject<{
    id: z.ZodString;
    rdoId: z.ZodString;
    vendorId: z.ZodString;
    vendorName: z.ZodString;
    submittedAt: z.ZodDate;
    status: z.ZodEnum<["draft", "submitted", "evaluated", "awarded", "rejected"]>;
    lines: z.ZodArray<z.ZodObject<{
        lineId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
        deliveryTime: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        lineId: string;
        deliveryTime: number;
        notes?: string | undefined;
    }, {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        lineId: string;
        deliveryTime: number;
        notes?: string | undefined;
    }>, "many">;
    totalPrice: z.ZodNumber;
    totalTime: z.ZodNumber;
    currency: z.ZodString;
    qualityScore: z.ZodNumber;
    qualityNotes: z.ZodString;
    technicalNotes: z.ZodString;
    additionalInfo: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    attachments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodEnum<["technical", "financial", "certification", "other"]>;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        uploadedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "other" | "certification" | "technical" | "financial";
        name: string;
        url: string;
        mimeType: string;
        uploadedAt: Date;
        size: number;
    }, {
        id: string;
        type: "other" | "certification" | "technical" | "financial";
        name: string;
        url: string;
        mimeType: string;
        uploadedAt: Date;
        size: number;
    }>, "many">;
    scoring: z.ZodOptional<z.ZodObject<{
        priceScore: z.ZodNumber;
        timeScore: z.ZodNumber;
        qualityScore: z.ZodNumber;
        totalScore: z.ZodNumber;
        weightedScore: z.ZodNumber;
        outlier: z.ZodBoolean;
        outlierReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        priceScore: number;
        timeScore: number;
        qualityScore: number;
        totalScore: number;
        weightedScore: number;
        outlier: boolean;
        outlierReason?: string | undefined;
    }, {
        priceScore: number;
        timeScore: number;
        qualityScore: number;
        totalScore: number;
        weightedScore: number;
        outlier: boolean;
        outlierReason?: string | undefined;
    }>>;
    ranking: z.ZodOptional<z.ZodNumber>;
    preCheckStatus: z.ZodEnum<["pending", "passed", "failed", "warning"]>;
    preCheckDetails: z.ZodOptional<z.ZodObject<{
        status: z.ZodEnum<["pending", "passed", "failed", "warning"]>;
        checks: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["DURC", "visura", "certification", "insurance", "financial"]>;
            status: z.ZodEnum<["valid", "expired", "missing", "invalid"]>;
            documentUrl: z.ZodOptional<z.ZodString>;
            expiryDate: z.ZodOptional<z.ZodDate>;
            score: z.ZodNumber;
            notes: z.ZodString;
            required: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }, {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }>, "many">;
        overallScore: z.ZodNumber;
        passed: z.ZodBoolean;
        warnings: z.ZodArray<z.ZodString, "many">;
        errors: z.ZodArray<z.ZodString, "many">;
        lastChecked: z.ZodDate;
        nextCheckDue: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "failed" | "warning" | "passed";
        overallScore: number;
        checks: {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }[];
        lastChecked: Date;
        passed: boolean;
        warnings: string[];
        errors: string[];
        nextCheckDue: Date;
    }, {
        status: "pending" | "failed" | "warning" | "passed";
        overallScore: number;
        checks: {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }[];
        lastChecked: Date;
        passed: boolean;
        warnings: string[];
        errors: string[];
        nextCheckDue: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    totalPrice: number;
    status: "rejected" | "draft" | "awarded" | "submitted" | "evaluated";
    currency: string;
    vendorId: string;
    vendorName: string;
    lines: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        lineId: string;
        deliveryTime: number;
        notes?: string | undefined;
    }[];
    rdoId: string;
    attachments: {
        id: string;
        type: "other" | "certification" | "technical" | "financial";
        name: string;
        url: string;
        mimeType: string;
        uploadedAt: Date;
        size: number;
    }[];
    qualityScore: number;
    submittedAt: Date;
    totalTime: number;
    qualityNotes: string;
    technicalNotes: string;
    additionalInfo: Record<string, unknown>;
    preCheckStatus: "pending" | "failed" | "warning" | "passed";
    scoring?: {
        priceScore: number;
        timeScore: number;
        qualityScore: number;
        totalScore: number;
        weightedScore: number;
        outlier: boolean;
        outlierReason?: string | undefined;
    } | undefined;
    ranking?: number | undefined;
    preCheckDetails?: {
        status: "pending" | "failed" | "warning" | "passed";
        overallScore: number;
        checks: {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }[];
        lastChecked: Date;
        passed: boolean;
        warnings: string[];
        errors: string[];
        nextCheckDue: Date;
    } | undefined;
}, {
    id: string;
    totalPrice: number;
    status: "rejected" | "draft" | "awarded" | "submitted" | "evaluated";
    currency: string;
    vendorId: string;
    vendorName: string;
    lines: {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        lineId: string;
        deliveryTime: number;
        notes?: string | undefined;
    }[];
    rdoId: string;
    attachments: {
        id: string;
        type: "other" | "certification" | "technical" | "financial";
        name: string;
        url: string;
        mimeType: string;
        uploadedAt: Date;
        size: number;
    }[];
    qualityScore: number;
    submittedAt: Date;
    totalTime: number;
    qualityNotes: string;
    technicalNotes: string;
    additionalInfo: Record<string, unknown>;
    preCheckStatus: "pending" | "failed" | "warning" | "passed";
    scoring?: {
        priceScore: number;
        timeScore: number;
        qualityScore: number;
        totalScore: number;
        weightedScore: number;
        outlier: boolean;
        outlierReason?: string | undefined;
    } | undefined;
    ranking?: number | undefined;
    preCheckDetails?: {
        status: "pending" | "failed" | "warning" | "passed";
        overallScore: number;
        checks: {
            status: "valid" | "expired" | "invalid" | "missing";
            type: "DURC" | "visura" | "certification" | "financial" | "insurance";
            required: boolean;
            score: number;
            notes: string;
            expiryDate?: Date | undefined;
            documentUrl?: string | undefined;
        }[];
        lastChecked: Date;
        passed: boolean;
        warnings: string[];
        errors: string[];
        nextCheckDue: Date;
    } | undefined;
}>;
export declare const zPreCheckItem: z.ZodObject<{
    type: z.ZodEnum<["DURC", "visura", "certification", "insurance", "financial"]>;
    status: z.ZodEnum<["valid", "expired", "missing", "invalid"]>;
    documentUrl: z.ZodOptional<z.ZodString>;
    expiryDate: z.ZodOptional<z.ZodDate>;
    score: z.ZodNumber;
    notes: z.ZodString;
    required: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "valid" | "expired" | "invalid" | "missing";
    type: "DURC" | "visura" | "certification" | "financial" | "insurance";
    required: boolean;
    score: number;
    notes: string;
    expiryDate?: Date | undefined;
    documentUrl?: string | undefined;
}, {
    status: "valid" | "expired" | "invalid" | "missing";
    type: "DURC" | "visura" | "certification" | "financial" | "insurance";
    required: boolean;
    score: number;
    notes: string;
    expiryDate?: Date | undefined;
    documentUrl?: string | undefined;
}>;
export declare const zPreCheckResult: z.ZodObject<{
    status: z.ZodEnum<["pending", "passed", "failed", "warning"]>;
    checks: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["DURC", "visura", "certification", "insurance", "financial"]>;
        status: z.ZodEnum<["valid", "expired", "missing", "invalid"]>;
        documentUrl: z.ZodOptional<z.ZodString>;
        expiryDate: z.ZodOptional<z.ZodDate>;
        score: z.ZodNumber;
        notes: z.ZodString;
        required: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        status: "valid" | "expired" | "invalid" | "missing";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        required: boolean;
        score: number;
        notes: string;
        expiryDate?: Date | undefined;
        documentUrl?: string | undefined;
    }, {
        status: "valid" | "expired" | "invalid" | "missing";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        required: boolean;
        score: number;
        notes: string;
        expiryDate?: Date | undefined;
        documentUrl?: string | undefined;
    }>, "many">;
    overallScore: z.ZodNumber;
    passed: z.ZodBoolean;
    warnings: z.ZodArray<z.ZodString, "many">;
    errors: z.ZodArray<z.ZodString, "many">;
    lastChecked: z.ZodDate;
    nextCheckDue: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "failed" | "warning" | "passed";
    overallScore: number;
    checks: {
        status: "valid" | "expired" | "invalid" | "missing";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        required: boolean;
        score: number;
        notes: string;
        expiryDate?: Date | undefined;
        documentUrl?: string | undefined;
    }[];
    lastChecked: Date;
    passed: boolean;
    warnings: string[];
    errors: string[];
    nextCheckDue: Date;
}, {
    status: "pending" | "failed" | "warning" | "passed";
    overallScore: number;
    checks: {
        status: "valid" | "expired" | "invalid" | "missing";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        required: boolean;
        score: number;
        notes: string;
        expiryDate?: Date | undefined;
        documentUrl?: string | undefined;
    }[];
    lastChecked: Date;
    passed: boolean;
    warnings: string[];
    errors: string[];
    nextCheckDue: Date;
}>;
export declare const zVendorDocument: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["DURC", "visura", "certification", "insurance", "financial"]>;
    url: z.ZodString;
    filename: z.ZodString;
    uploadedAt: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<["valid", "expired", "pending_verification"]>;
    verifiedAt: z.ZodOptional<z.ZodDate>;
    verifiedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "valid" | "expired" | "pending_verification";
    type: "DURC" | "visura" | "certification" | "financial" | "insurance";
    url: string;
    filename: string;
    uploadedAt: Date;
    expiresAt?: Date | undefined;
    verifiedAt?: Date | undefined;
    verifiedBy?: string | undefined;
}, {
    id: string;
    status: "valid" | "expired" | "pending_verification";
    type: "DURC" | "visura" | "certification" | "financial" | "insurance";
    url: string;
    filename: string;
    uploadedAt: Date;
    expiresAt?: Date | undefined;
    verifiedAt?: Date | undefined;
    verifiedBy?: string | undefined;
}>;
export declare const zVendor: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        province: string;
        city: string;
        street: string;
        postalCode: string;
        country: string;
    }, {
        province: string;
        city: string;
        street: string;
        postalCode: string;
        country: string;
    }>;
    vatNumber: z.ZodString;
    fiscalCode: z.ZodString;
    category: z.ZodArray<z.ZodString, "many">;
    rating: z.ZodNumber;
    activeRDOs: z.ZodNumber;
    completedProjects: z.ZodNumber;
    totalValue: z.ZodNumber;
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["DURC", "visura", "certification", "insurance", "financial"]>;
        url: z.ZodString;
        filename: z.ZodString;
        uploadedAt: z.ZodDate;
        expiresAt: z.ZodOptional<z.ZodDate>;
        status: z.ZodEnum<["valid", "expired", "pending_verification"]>;
        verifiedAt: z.ZodOptional<z.ZodDate>;
        verifiedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "valid" | "expired" | "pending_verification";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        url: string;
        filename: string;
        uploadedAt: Date;
        expiresAt?: Date | undefined;
        verifiedAt?: Date | undefined;
        verifiedBy?: string | undefined;
    }, {
        id: string;
        status: "valid" | "expired" | "pending_verification";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        url: string;
        filename: string;
        uploadedAt: Date;
        expiresAt?: Date | undefined;
        verifiedAt?: Date | undefined;
        verifiedBy?: string | undefined;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: string[];
    createdAt: Date;
    name: string;
    updatedAt: Date;
    documents: {
        id: string;
        status: "valid" | "expired" | "pending_verification";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        url: string;
        filename: string;
        uploadedAt: Date;
        expiresAt?: Date | undefined;
        verifiedAt?: Date | undefined;
        verifiedBy?: string | undefined;
    }[];
    address: {
        province: string;
        city: string;
        street: string;
        postalCode: string;
        country: string;
    };
    email: string;
    vatNumber: string;
    fiscalCode: string;
    rating: number;
    activeRDOs: number;
    completedProjects: number;
    totalValue: number;
    phone?: string | undefined;
}, {
    id: string;
    category: string[];
    createdAt: Date;
    name: string;
    updatedAt: Date;
    documents: {
        id: string;
        status: "valid" | "expired" | "pending_verification";
        type: "DURC" | "visura" | "certification" | "financial" | "insurance";
        url: string;
        filename: string;
        uploadedAt: Date;
        expiresAt?: Date | undefined;
        verifiedAt?: Date | undefined;
        verifiedBy?: string | undefined;
    }[];
    address: {
        province: string;
        city: string;
        street: string;
        postalCode: string;
        country: string;
    };
    email: string;
    vatNumber: string;
    fiscalCode: string;
    rating: number;
    activeRDOs: number;
    completedProjects: number;
    totalValue: number;
    phone?: string | undefined;
}>;
//# sourceMappingURL=procurement.d.ts.map