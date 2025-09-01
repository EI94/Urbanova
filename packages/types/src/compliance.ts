/**
 * Compliance Types - Urbanova AI
 * Sistema di verifica conformità urbanistica con documenti municipali reali
 */

import { z } from 'zod';

// ============================================================================
// ENUMS E CONSTANTS
// ============================================================================

export type RuleCategory =
  | 'DISTACCHI'
  | 'ALTEZZE'
  | 'PARCHEGGI'
  | 'SUPERFICI'
  | 'VOLUMI'
  | 'ACCESSIBILITA'
  | 'AMBIENTALE'
  | 'STORICO'
  | 'ALTRO';

export type ComplianceStatusType =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'REQUIRES_REVIEW'
  | 'NOT_APPLICABLE';

export type ComplianceDocumentType =
  | 'REGOLAMENTO_URBANISTICO'
  | 'PIANO_REGOLATORE'
  | 'NORME_TECNICHE'
  | 'VARIANTE'
  | 'DELIBERA'
  | 'ALTRO';

export type VectorStoreType = 'WEAVIATE' | 'PINECONE' | 'LOCAL_FALLBACK';

// ============================================================================
// INTERFACCE BASE
// ============================================================================

export interface Municipality {
  id: string;
  name: string;
  province: string;
  region: string;
  cap: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  activeRules: string[];
  lastUpdate: Date;
}

export interface ComplianceDocument {
  id: string;
  municipalityId: string;
  type: ComplianceDocumentType;
  title: string;
  description: string;
  url?: string;
  filePath?: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentSection {
  id: string;
  documentId: string;
  title: string;
  content: string;
  pageNumber?: number;
  sectionNumber?: string;
  subsection?: string;
  vectorEmbedding: number[];
  metadata: Record<string, any>;
}

export interface Citation {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  sectionNumber?: string;
  subsection?: string;
  url?: string;
  excerpt: string;
  relevance: number; // 0-1
  timestamp: Date;
}

export interface PatternRule {
  id: string;
  municipalityId: string;
  category: RuleCategory;
  name: string;
  description: string;
  parameters: RuleParameter[];
  validation: RuleValidation;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleParameter {
  id: string;
  name: string;
  description: string;
  type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
  value: any;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  enumValues?: string[];
  required: boolean;
  defaultValue?: any;
}

export interface RuleValidation {
  id: string;
  ruleId: string;
  condition: string; // Espressione logica
  errorMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoFix?: boolean;
  requiresManualReview: boolean;
}

export interface ComplianceCheck {
  id: string;
  projectId: string;
  municipalityId: string;
  ruleId: string;
  status: ComplianceStatusType;
  actualValue: any;
  expectedValue: any;
  deviation: number;
  citations: Citation[];
  violations: ComplianceViolation[];
  recommendations: string[];
  score: number; // 0-100
  checkedAt: Date;
  checkedBy: string;
  notes?: string;
}

export interface ComplianceViolation {
  id: string;
  checkId: string;
  ruleId: string;
  type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  actualValue: any;
  expectedValue: any;
  deviation: number;
  citations: Citation[];
  autoFixable: boolean;
  suggestedFix?: any;
  requiresManualReview: boolean;
}

export interface ComplianceReport {
  id: string;
  projectId: string;
  municipalityId: string;
  overallStatus: ComplianceStatusType;
  overallScore: number; // 0-100
  checks: ComplianceCheck[];
  violations: ComplianceViolation[];
  summary: {
    totalChecks: number;
    compliantChecks: number;
    nonCompliantChecks: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
  };
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
  expiresAt: Date;
}

// ============================================================================
// REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface ComplianceIngestRequest {
  municipalityId: string;
  documents: Array<{
    type: ComplianceDocumentType;
    title: string;
    description?: string;
    url?: string;
    file?: File;
    version?: string;
    effectiveDate?: Date;
    metadata?: Record<string, any>;
  }>;
  forceUpdate?: boolean;
}

export interface ComplianceIngestResponse {
  success: boolean;
  message: string;
  ingestedDocuments: Array<{
    id: string;
    title: string;
    status: 'SUCCESS' | 'ERROR' | 'SKIPPED';
    error?: string;
    sectionsCount: number;
    vectorized: boolean;
  }>;
  errors?: string[];
}

export interface ComplianceCheckRequest {
  projectId: string;
  municipalityId?: string; // Se non specificato, inferito dall'indirizzo
  ruleCategories?: RuleCategory[];
  includeCitations?: boolean;
  includeRecommendations?: boolean;
}

export interface ComplianceCheckResponse {
  success: boolean;
  message: string;
  report: ComplianceReport;
  processingTime: number;
  vectorStoreUsed: VectorStoreType;
}

export interface ComplianceSearchRequest {
  municipalityId: string;
  query: string;
  categories?: RuleCategory[];
  documentTypes?: ComplianceDocumentType[];
  limit?: number;
  threshold?: number; // Similarity threshold
}

export interface ComplianceSearchResponse {
  success: boolean;
  results: Array<{
    section: DocumentSection;
    relevance: number;
    citations: Citation[];
  }>;
  totalResults: number;
  searchTime: number;
}

// ============================================================================
// SCHEMI ZOD
// ============================================================================

const zMunicipality = z.object({
  id: z.string(),
  name: z.string().min(1),
  province: z.string().min(1),
  region: z.string().min(1),
  cap: z.string().length(5),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  timezone: z.string(),
  activeRules: z.array(z.string()),
  lastUpdate: z.date(),
});

const zComplianceDocument = z.object({
  id: z.string(),
  municipalityId: z.string(),
  type: z.enum([
    'REGOLAMENTO_URBANISTICO',
    'PIANO_REGOLATORE',
    'NORME_TECNICHE',
    'VARIANTE',
    'DELIBERA',
    'ALTRO',
  ]),
  title: z.string().min(1),
  description: z.string(),
  url: z.string().url().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  pageCount: z.number().positive().optional(),
  version: z.string(),
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'DRAFT']),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const zDocumentSection = z.object({
  id: z.string(),
  documentId: z.string(),
  title: z.string(),
  content: z.string().min(1),
  pageNumber: z.number().positive().optional(),
  sectionNumber: z.string().optional(),
  subsection: z.string().optional(),
  vectorEmbedding: z.array(z.number()),
  metadata: z.record(z.any()),
});

const zCitation = z.object({
  id: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  pageNumber: z.number().positive().optional(),
  sectionNumber: z.string().optional(),
  subsection: z.string().optional(),
  url: z.string().url().optional(),
  excerpt: z.string(),
  relevance: z.number().min(0).max(1),
  timestamp: z.date(),
});

const zRuleParameter = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['NUMBER', 'STRING', 'BOOLEAN', 'ENUM', 'RANGE']),
  value: z.any(),
  unit: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  enumValues: z.array(z.string()).optional(),
  required: z.boolean(),
  defaultValue: z.any().optional(),
});

const zRuleValidation = z.object({
  id: z.string(),
  ruleId: z.string(),
  condition: z.string(),
  errorMessage: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  autoFix: z.boolean().optional(),
  requiresManualReview: z.boolean(),
});

const zPatternRule = z.object({
  id: z.string(),
  municipalityId: z.string(),
  category: z.enum([
    'DISTACCHI',
    'ALTEZZE',
    'PARCHEGGI',
    'SUPERFICI',
    'VOLUMI',
    'ACCESSIBILITA',
    'AMBIENTALE',
    'STORICO',
    'ALTRO',
  ]),
  name: z.string(),
  description: z.string(),
  parameters: z.array(zRuleParameter),
  validation: zRuleValidation,
  version: z.string(),
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  priority: z.number().min(1).max(10),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const zComplianceViolation = z.object({
  id: z.string(),
  checkId: z.string(),
  ruleId: z.string(),
  type: z.enum(['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string(),
  actualValue: z.any(),
  expectedValue: z.any(),
  deviation: z.number(),
  citations: z.array(zCitation),
  autoFixable: z.boolean(),
  suggestedFix: z.any().optional(),
  requiresManualReview: z.boolean(),
});

const zComplianceCheck = z.object({
  id: z.string(),
  projectId: z.string(),
  municipalityId: z.string(),
  ruleId: z.string(),
  status: z.enum([
    'COMPLIANT',
    'NON_COMPLIANT',
    'PARTIALLY_COMPLIANT',
    'REQUIRES_REVIEW',
    'NOT_APPLICABLE',
  ]),
  actualValue: z.any(),
  expectedValue: z.any(),
  deviation: z.number(),
  citations: z.array(zCitation),
  violations: z.array(zComplianceViolation),
  recommendations: z.array(z.string()),
  score: z.number().min(0).max(100),
  checkedAt: z.date(),
  checkedBy: z.string(),
  notes: z.string().optional(),
});

const zComplianceReport = z.object({
  id: z.string(),
  projectId: z.string(),
  municipalityId: z.string(),
  overallStatus: z.enum([
    'COMPLIANT',
    'NON_COMPLIANT',
    'PARTIALLY_COMPLIANT',
    'REQUIRES_REVIEW',
    'NOT_APPLICABLE',
  ]),
  overallScore: z.number().min(0).max(100),
  checks: z.array(zComplianceCheck),
  violations: z.array(zComplianceViolation),
  summary: z.object({
    totalChecks: z.number(),
    compliantChecks: z.number(),
    nonCompliantChecks: z.number(),
    criticalViolations: z.number(),
    highViolations: z.number(),
    mediumViolations: z.number(),
    lowViolations: z.number(),
  }),
  recommendations: z.array(z.string()),
  generatedAt: z.date(),
  generatedBy: z.string(),
  expiresAt: z.date(),
});

const zComplianceIngestRequest = z.object({
  municipalityId: z.string(),
  documents: z.array(
    z.object({
      type: z.enum([
        'REGOLAMENTO_URBANISTICO',
        'PIANO_REGOLATORE',
        'NORME_TECNICHE',
        'VARIANTE',
        'DELIBERA',
        'ALTRO',
      ]),
      title: z.string().min(1),
      description: z.string().optional(),
      url: z.string().url().optional(),
      file: z.any().optional(), // File object
      version: z.string().optional(),
      effectiveDate: z.union([z.date(), z.string()]).optional(),
      metadata: z.record(z.any()).optional(),
    })
  ),
  forceUpdate: z.boolean().optional(),
});

const zComplianceCheckRequest = z.object({
  projectId: z.string(),
  municipalityId: z.string().optional(),
  ruleCategories: z
    .array(
      z.enum([
        'DISTACCHI',
        'ALTEZZE',
        'PARCHEGGI',
        'SUPERFICI',
        'VOLUMI',
        'ACCESSIBILITA',
        'AMBIENTALE',
        'STORICO',
        'ALTRO',
      ])
    )
    .optional(),
  includeCitations: z.boolean().optional(),
  includeRecommendations: z.boolean().optional(),
});

const zComplianceSearchRequest = z.object({
  municipalityId: z.string(),
  query: z.string().min(1),
  categories: z
    .array(
      z.enum([
        'DISTACCHI',
        'ALTEZZE',
        'PARCHEGGI',
        'SUPERFICI',
        'VOLUMI',
        'ACCESSIBILITA',
        'AMBIENTALE',
        'STORICO',
        'ALTRO',
      ])
    )
    .optional(),
  documentTypes: z
    .array(
      z.enum([
        'REGOLAMENTO_URBANISTICO',
        'PIANO_REGOLATORE',
        'NORME_TECNICHE',
        'VARIANTE',
        'DELIBERA',
        'ALTRO',
      ])
    )
    .optional(),
  limit: z.number().positive().optional(),
  threshold: z.number().min(0).max(1).optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  zMunicipality,
  zComplianceDocument,
  zDocumentSection,
  zCitation,
  zPatternRule,
  zRuleParameter,
  zRuleValidation,
  zComplianceViolation,
  zComplianceCheck,
  zComplianceReport,
  zComplianceIngestRequest,
  zComplianceCheckRequest,
  zComplianceSearchRequest,
};
