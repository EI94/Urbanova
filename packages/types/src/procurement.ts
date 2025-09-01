// Urbanova Procurement System Types
import { z } from 'zod';

// ===========================================
// RDO (RICHIESTA DI OFFERTA)
// ===========================================

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
  awardedTo?: string; // vendorId
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
  token: string; // JWT per accesso sicuro
  expiresAt: Date;
}

export interface ScoringWeights {
  price: number; // default 0.7
  time: number; // default 0.2
  quality: number; // default 0.1
  custom?: Record<string, number>;
}

// ===========================================
// OFFER (OFFERTA VENDOR)
// ===========================================

export interface Offer {
  id: string;
  rdoId: string;
  vendorId: string;
  vendorName: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'evaluated' | 'awarded' | 'rejected';

  // Prezzi e tempi
  lines: OfferLine[];
  totalPrice: number;
  totalTime: number; // in giorni
  currency: string;

  // Qualità e note
  qualityScore: number; // 1-10
  qualityNotes: string;
  technicalNotes: string;
  additionalInfo: Record<string, unknown>;

  // Documenti
  attachments: OfferAttachment[];

  // Scoring
  scoring?: OfferScoring;
  ranking?: number;

  // Pre-check
  preCheckStatus: 'pending' | 'passed' | 'failed' | 'warning';
  preCheckDetails?: PreCheckResult;
}

export interface OfferLine {
  lineId: string; // riferimento a RDOLine
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  deliveryTime: number; // in giorni
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
  priceScore: number; // 0-100
  timeScore: number; // 0-100
  qualityScore: number; // 0-100
  totalScore: number; // 0-100
  weightedScore: number; // con pesi RDO
  outlier: boolean;
  outlierReason?: string;
}

// ===========================================
// COMPARISON (CONFRONTO OFFERTE)
// ===========================================

export interface Comparison {
  id: string;
  rdoId: string;
  generatedAt: Date;
  generatedBy: string;

  // Ranking
  offers: RankedOffer[];

  // Statistiche
  statistics: ComparisonStatistics;

  // Outliers
  outliers: OutlierAnalysis[];

  // Documenti
  pdfUrl: string;
  excelUrl?: string;

  // Metadata
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
  priceRange: { min: number; max: number };
  timeRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
}

export interface OutlierAnalysis {
  offerId: string;
  vendorName: string;
  type: 'price' | 'time' | 'quality' | 'combined';
  severity: 'low' | 'medium' | 'high';
  description: string;
  deviation: number; // deviazione standard
  recommendation: string;
}

// ===========================================
// PRE-CHECK
// ===========================================

export interface PreCheckResult {
  status: 'pending' | 'passed' | 'failed' | 'warning';
  checks: PreCheckItem[];
  overallScore: number; // 0-100
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
  score: number; // 0-100
  notes: string;
  required: boolean;
}

// ===========================================
// VENDOR
// ===========================================

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
  rating: number; // 1-5
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

// ===========================================
// ZOD SCHEMAS
// ===========================================

export const zScoringWeights = z
  .object({
    price: z.number().min(0).max(1),
    time: z.number().min(0).max(1),
    quality: z.number().min(0).max(1),
    custom: z.record(z.string(), z.number()).optional(),
  })
  .refine(data => Math.abs(data.price + data.time + data.quality - 1) < 0.01, {
    message: 'I pesi devono sommare a 1.0',
  });

export const zRDOLine = z.object({
  id: z.string(),
  description: z.string().min(10),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().positive().optional(),
  totalPrice: z.number().positive().optional(),
  specifications: z.string(),
  requirements: z.array(z.string()),
});

export const zInvitedVendor = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  invitedAt: z.date(),
  respondedAt: z.date().optional(),
  status: z.enum(['invited', 'responded', 'declined', 'expired']),
  token: z.string(),
  expiresAt: z.date(),
});

export const zRDO = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(10),
  description: z.string().min(50),
  deadline: z.date(),
  status: z.enum(['draft', 'open', 'evaluating', 'awarded', 'cancelled']),
  lines: z.array(zRDOLine).min(1),
  invitedVendors: z.array(zInvitedVendor),
  scoringWeights: zScoringWeights,
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  awardedTo: z.string().optional(),
  awardedAt: z.date().optional(),
  metadata: z.object({
    category: z.string(),
    estimatedValue: z.number().positive(),
    currency: z.string().length(3),
    location: z.string(),
    requirements: z.array(z.string()),
  }),
});

export const zOfferLine = z.object({
  lineId: z.string(),
  description: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  deliveryTime: z.number().positive(),
  notes: z.string().optional(),
});

export const zOfferAttachment = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(['technical', 'financial', 'certification', 'other']),
  size: z.number().positive(),
  mimeType: z.string(),
  uploadedAt: z.date(),
});

export const zOfferScoring = z.object({
  priceScore: z.number().min(0).max(100),
  timeScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
  weightedScore: z.number().min(0).max(100),
  outlier: z.boolean(),
  outlierReason: z.string().optional(),
});

export const zOffer = z.object({
  id: z.string(),
  rdoId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  submittedAt: z.date(),
  status: z.enum(['draft', 'submitted', 'evaluated', 'awarded', 'rejected']),
  lines: z.array(zOfferLine),
  totalPrice: z.number().positive(),
  totalTime: z.number().positive(),
  currency: z.string().length(3),
  qualityScore: z.number().min(1).max(10),
  qualityNotes: z.string(),
  technicalNotes: z.string(),
  additionalInfo: z.record(z.unknown()),
  attachments: z.array(zOfferAttachment),
  scoring: zOfferScoring.optional(),
  ranking: z.number().int().positive().optional(),
  preCheckStatus: z.enum(['pending', 'passed', 'failed', 'warning']),
  preCheckDetails: z
    .object({
      status: z.enum(['pending', 'passed', 'failed', 'warning']),
      checks: z.array(
        z.object({
          type: z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
          status: z.enum(['valid', 'expired', 'missing', 'invalid']),
          documentUrl: z.string().url().optional(),
          expiryDate: z.date().optional(),
          score: z.number().min(0).max(100),
          notes: z.string(),
          required: z.boolean(),
        })
      ),
      overallScore: z.number().min(0).max(100),
      passed: z.boolean(),
      warnings: z.array(z.string()),
      errors: z.array(z.string()),
      lastChecked: z.date(),
      nextCheckDue: z.date(),
    })
    .optional(),
});

export const zPreCheckItem = z.object({
  type: z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
  status: z.enum(['valid', 'expired', 'missing', 'invalid']),
  documentUrl: z.string().url().optional(),
  expiryDate: z.date().optional(),
  score: z.number().min(0).max(100),
  notes: z.string(),
  required: z.boolean(),
});

export const zPreCheckResult = z.object({
  status: z.enum(['pending', 'passed', 'failed', 'warning']),
  checks: z.array(zPreCheckItem),
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  lastChecked: z.date(),
  nextCheckDue: z.date(),
});

export const zVendorDocument = z.object({
  id: z.string(),
  type: z.enum(['DURC', 'visura', 'certification', 'insurance', 'financial']),
  url: z.string().url(),
  filename: z.string(),
  uploadedAt: z.date(),
  expiresAt: z.date().optional(),
  status: z.enum(['valid', 'expired', 'pending_verification']),
  verifiedAt: z.date().optional(),
  verifiedBy: z.string().optional(),
});

export const zVendor = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    province: z.string().length(2),
    postalCode: z.string(),
    country: z.string(),
  }),
  vatNumber: z.string(),
  fiscalCode: z.string(),
  category: z.array(z.string()),
  rating: z.number().min(1).max(5),
  activeRDOs: z.number().int().min(0),
  completedProjects: z.number().int().min(0),
  totalValue: z.number().positive(),
  documents: z.array(zVendorDocument),
  createdAt: z.date(),
  updatedAt: z.date(),
});
