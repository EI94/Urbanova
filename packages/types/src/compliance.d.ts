/**
 * Compliance Types - Urbanova AI
 * Sistema di verifica conformità urbanistica con documenti municipali reali
 */
import { z } from 'zod';
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
  relevance: number;
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
  condition: string;
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
  score: number;
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
  overallScore: number;
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
  municipalityId?: string;
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
  threshold?: number;
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
declare const zMunicipality: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    province: z.ZodString;
    region: z.ZodString;
    cap: z.ZodString;
    coordinates: z.ZodObject<
      {
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        latitude: number;
        longitude: number;
      },
      {
        latitude: number;
        longitude: number;
      }
    >;
    timezone: z.ZodString;
    activeRules: z.ZodArray<z.ZodString, 'many'>;
    lastUpdate: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
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
  },
  {
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
>;
declare const zComplianceDocument: z.ZodObject<
  {
    id: z.ZodString;
    municipalityId: z.ZodString;
    type: z.ZodEnum<
      [
        'REGOLAMENTO_URBANISTICO',
        'PIANO_REGOLATORE',
        'NORME_TECNICHE',
        'VARIANTE',
        'DELIBERA',
        'ALTRO',
      ]
    >;
    title: z.ZodString;
    description: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodNumber;
    mimeType: z.ZodString;
    pageCount: z.ZodOptional<z.ZodNumber>;
    version: z.ZodString;
    effectiveDate: z.ZodDate;
    expiryDate: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<['ACTIVE', 'EXPIRED', 'DRAFT']>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE' | 'EXPIRED';
    type:
      | 'ALTRO'
      | 'REGOLAMENTO_URBANISTICO'
      | 'PIANO_REGOLATORE'
      | 'NORME_TECNICHE'
      | 'VARIANTE'
      | 'DELIBERA';
    metadata: Record<string, any>;
    title: string;
    createdAt: Date;
    municipalityId: string;
    fileSize: number;
    mimeType: string;
    version: string;
    effectiveDate: Date;
    updatedAt: Date;
    url?: string | undefined;
    filePath?: string | undefined;
    pageCount?: number | undefined;
    expiryDate?: Date | undefined;
  },
  {
    id: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE' | 'EXPIRED';
    type:
      | 'ALTRO'
      | 'REGOLAMENTO_URBANISTICO'
      | 'PIANO_REGOLATORE'
      | 'NORME_TECNICHE'
      | 'VARIANTE'
      | 'DELIBERA';
    metadata: Record<string, any>;
    title: string;
    createdAt: Date;
    municipalityId: string;
    fileSize: number;
    mimeType: string;
    version: string;
    effectiveDate: Date;
    updatedAt: Date;
    url?: string | undefined;
    filePath?: string | undefined;
    pageCount?: number | undefined;
    expiryDate?: Date | undefined;
  }
>;
declare const zDocumentSection: z.ZodObject<
  {
    id: z.ZodString;
    documentId: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    sectionNumber: z.ZodOptional<z.ZodString>;
    subsection: z.ZodOptional<z.ZodString>;
    vectorEmbedding: z.ZodArray<z.ZodNumber, 'many'>;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    metadata: Record<string, any>;
    title: string;
    documentId: string;
    content: string;
    vectorEmbedding: number[];
    pageNumber?: number | undefined;
    sectionNumber?: string | undefined;
    subsection?: string | undefined;
  },
  {
    id: string;
    metadata: Record<string, any>;
    title: string;
    documentId: string;
    content: string;
    vectorEmbedding: number[];
    pageNumber?: number | undefined;
    sectionNumber?: string | undefined;
    subsection?: string | undefined;
  }
>;
declare const zCitation: z.ZodObject<
  {
    id: z.ZodString;
    documentId: z.ZodString;
    documentTitle: z.ZodString;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    sectionNumber: z.ZodOptional<z.ZodString>;
    subsection: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodString;
    relevance: z.ZodNumber;
    timestamp: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    documentId: string;
    documentTitle: string;
    excerpt: string;
    relevance: number;
    timestamp: Date;
    url?: string | undefined;
    pageNumber?: number | undefined;
    sectionNumber?: string | undefined;
    subsection?: string | undefined;
  },
  {
    id: string;
    documentId: string;
    documentTitle: string;
    excerpt: string;
    relevance: number;
    timestamp: Date;
    url?: string | undefined;
    pageNumber?: number | undefined;
    sectionNumber?: string | undefined;
    subsection?: string | undefined;
  }
>;
declare const zRuleParameter: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<['NUMBER', 'STRING', 'BOOLEAN', 'ENUM', 'RANGE']>;
    value: z.ZodAny;
    unit: z.ZodOptional<z.ZodString>;
    minValue: z.ZodOptional<z.ZodNumber>;
    maxValue: z.ZodOptional<z.ZodNumber>;
    enumValues: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    required: z.ZodBoolean;
    defaultValue: z.ZodOptional<z.ZodAny>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
    name: string;
    required: boolean;
    unit?: string | undefined;
    value?: any;
    minValue?: number | undefined;
    maxValue?: number | undefined;
    enumValues?: string[] | undefined;
    defaultValue?: any;
  },
  {
    id: string;
    description: string;
    type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
    name: string;
    required: boolean;
    unit?: string | undefined;
    value?: any;
    minValue?: number | undefined;
    maxValue?: number | undefined;
    enumValues?: string[] | undefined;
    defaultValue?: any;
  }
>;
declare const zRuleValidation: z.ZodObject<
  {
    id: z.ZodString;
    ruleId: z.ZodString;
    condition: z.ZodString;
    errorMessage: z.ZodString;
    severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
    autoFix: z.ZodOptional<z.ZodBoolean>;
    requiresManualReview: z.ZodBoolean;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    ruleId: string;
    condition: string;
    errorMessage: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresManualReview: boolean;
    autoFix?: boolean | undefined;
  },
  {
    id: string;
    ruleId: string;
    condition: string;
    errorMessage: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresManualReview: boolean;
    autoFix?: boolean | undefined;
  }
>;
declare const zPatternRule: z.ZodObject<
  {
    id: z.ZodString;
    municipalityId: z.ZodString;
    category: z.ZodEnum<
      [
        'DISTACCHI',
        'ALTEZZE',
        'PARCHEGGI',
        'SUPERFICI',
        'VOLUMI',
        'ACCESSIBILITA',
        'AMBIENTALE',
        'STORICO',
        'ALTRO',
      ]
    >;
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          description: z.ZodString;
          type: z.ZodEnum<['NUMBER', 'STRING', 'BOOLEAN', 'ENUM', 'RANGE']>;
          value: z.ZodAny;
          unit: z.ZodOptional<z.ZodString>;
          minValue: z.ZodOptional<z.ZodNumber>;
          maxValue: z.ZodOptional<z.ZodNumber>;
          enumValues: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          required: z.ZodBoolean;
          defaultValue: z.ZodOptional<z.ZodAny>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
          name: string;
          required: boolean;
          unit?: string | undefined;
          value?: any;
          minValue?: number | undefined;
          maxValue?: number | undefined;
          enumValues?: string[] | undefined;
          defaultValue?: any;
        },
        {
          id: string;
          description: string;
          type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
          name: string;
          required: boolean;
          unit?: string | undefined;
          value?: any;
          minValue?: number | undefined;
          maxValue?: number | undefined;
          enumValues?: string[] | undefined;
          defaultValue?: any;
        }
      >,
      'many'
    >;
    validation: z.ZodObject<
      {
        id: z.ZodString;
        ruleId: z.ZodString;
        condition: z.ZodString;
        errorMessage: z.ZodString;
        severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
        autoFix: z.ZodOptional<z.ZodBoolean>;
        requiresManualReview: z.ZodBoolean;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        ruleId: string;
        condition: string;
        errorMessage: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        requiresManualReview: boolean;
        autoFix?: boolean | undefined;
      },
      {
        id: string;
        ruleId: string;
        condition: string;
        errorMessage: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        requiresManualReview: boolean;
        autoFix?: boolean | undefined;
      }
    >;
    version: z.ZodString;
    effectiveDate: z.ZodDate;
    expiryDate: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<['ACTIVE', 'INACTIVE', 'DRAFT']>;
    priority: z.ZodNumber;
    tags: z.ZodArray<z.ZodString, 'many'>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    category:
      | 'DISTACCHI'
      | 'ALTEZZE'
      | 'PARCHEGGI'
      | 'SUPERFICI'
      | 'VOLUMI'
      | 'ACCESSIBILITA'
      | 'AMBIENTALE'
      | 'STORICO'
      | 'ALTRO';
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
    validation: {
      id: string;
      ruleId: string;
      condition: string;
      errorMessage: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      autoFix?: boolean | undefined;
    };
    createdAt: Date;
    tags: string[];
    name: string;
    municipalityId: string;
    version: string;
    effectiveDate: Date;
    updatedAt: Date;
    parameters: {
      id: string;
      description: string;
      type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
      name: string;
      required: boolean;
      unit?: string | undefined;
      value?: any;
      minValue?: number | undefined;
      maxValue?: number | undefined;
      enumValues?: string[] | undefined;
      defaultValue?: any;
    }[];
    priority: number;
    expiryDate?: Date | undefined;
  },
  {
    id: string;
    description: string;
    category:
      | 'DISTACCHI'
      | 'ALTEZZE'
      | 'PARCHEGGI'
      | 'SUPERFICI'
      | 'VOLUMI'
      | 'ACCESSIBILITA'
      | 'AMBIENTALE'
      | 'STORICO'
      | 'ALTRO';
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
    validation: {
      id: string;
      ruleId: string;
      condition: string;
      errorMessage: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      autoFix?: boolean | undefined;
    };
    createdAt: Date;
    tags: string[];
    name: string;
    municipalityId: string;
    version: string;
    effectiveDate: Date;
    updatedAt: Date;
    parameters: {
      id: string;
      description: string;
      type: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM' | 'RANGE';
      name: string;
      required: boolean;
      unit?: string | undefined;
      value?: any;
      minValue?: number | undefined;
      maxValue?: number | undefined;
      enumValues?: string[] | undefined;
      defaultValue?: any;
    }[];
    priority: number;
    expiryDate?: Date | undefined;
  }
>;
declare const zComplianceViolation: z.ZodObject<
  {
    id: z.ZodString;
    checkId: z.ZodString;
    ruleId: z.ZodString;
    type: z.ZodEnum<['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']>;
    severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
    description: z.ZodString;
    actualValue: z.ZodAny;
    expectedValue: z.ZodAny;
    deviation: z.ZodNumber;
    citations: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          documentId: z.ZodString;
          documentTitle: z.ZodString;
          pageNumber: z.ZodOptional<z.ZodNumber>;
          sectionNumber: z.ZodOptional<z.ZodString>;
          subsection: z.ZodOptional<z.ZodString>;
          url: z.ZodOptional<z.ZodString>;
          excerpt: z.ZodString;
          relevance: z.ZodNumber;
          timestamp: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        },
        {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        }
      >,
      'many'
    >;
    autoFixable: z.ZodBoolean;
    suggestedFix: z.ZodOptional<z.ZodAny>;
    requiresManualReview: z.ZodBoolean;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
    ruleId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresManualReview: boolean;
    checkId: string;
    deviation: number;
    citations: {
      id: string;
      documentId: string;
      documentTitle: string;
      excerpt: string;
      relevance: number;
      timestamp: Date;
      url?: string | undefined;
      pageNumber?: number | undefined;
      sectionNumber?: string | undefined;
      subsection?: string | undefined;
    }[];
    autoFixable: boolean;
    actualValue?: any;
    expectedValue?: any;
    suggestedFix?: any;
  },
  {
    id: string;
    description: string;
    type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
    ruleId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresManualReview: boolean;
    checkId: string;
    deviation: number;
    citations: {
      id: string;
      documentId: string;
      documentTitle: string;
      excerpt: string;
      relevance: number;
      timestamp: Date;
      url?: string | undefined;
      pageNumber?: number | undefined;
      sectionNumber?: string | undefined;
      subsection?: string | undefined;
    }[];
    autoFixable: boolean;
    actualValue?: any;
    expectedValue?: any;
    suggestedFix?: any;
  }
>;
declare const zComplianceCheck: z.ZodObject<
  {
    id: z.ZodString;
    projectId: z.ZodString;
    municipalityId: z.ZodString;
    ruleId: z.ZodString;
    status: z.ZodEnum<
      ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'REQUIRES_REVIEW', 'NOT_APPLICABLE']
    >;
    actualValue: z.ZodAny;
    expectedValue: z.ZodAny;
    deviation: z.ZodNumber;
    citations: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          documentId: z.ZodString;
          documentTitle: z.ZodString;
          pageNumber: z.ZodOptional<z.ZodNumber>;
          sectionNumber: z.ZodOptional<z.ZodString>;
          subsection: z.ZodOptional<z.ZodString>;
          url: z.ZodOptional<z.ZodString>;
          excerpt: z.ZodString;
          relevance: z.ZodNumber;
          timestamp: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        },
        {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        }
      >,
      'many'
    >;
    violations: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          checkId: z.ZodString;
          ruleId: z.ZodString;
          type: z.ZodEnum<['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']>;
          severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
          description: z.ZodString;
          actualValue: z.ZodAny;
          expectedValue: z.ZodAny;
          deviation: z.ZodNumber;
          citations: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                documentId: z.ZodString;
                documentTitle: z.ZodString;
                pageNumber: z.ZodOptional<z.ZodNumber>;
                sectionNumber: z.ZodOptional<z.ZodString>;
                subsection: z.ZodOptional<z.ZodString>;
                url: z.ZodOptional<z.ZodString>;
                excerpt: z.ZodString;
                relevance: z.ZodNumber;
                timestamp: z.ZodDate;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              },
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              }
            >,
            'many'
          >;
          autoFixable: z.ZodBoolean;
          suggestedFix: z.ZodOptional<z.ZodAny>;
          requiresManualReview: z.ZodBoolean;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
          ruleId: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          requiresManualReview: boolean;
          checkId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          autoFixable: boolean;
          actualValue?: any;
          expectedValue?: any;
          suggestedFix?: any;
        },
        {
          id: string;
          description: string;
          type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
          ruleId: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          requiresManualReview: boolean;
          checkId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          autoFixable: boolean;
          actualValue?: any;
          expectedValue?: any;
          suggestedFix?: any;
        }
      >,
      'many'
    >;
    recommendations: z.ZodArray<z.ZodString, 'many'>;
    score: z.ZodNumber;
    checkedAt: z.ZodDate;
    checkedBy: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status:
      | 'COMPLIANT'
      | 'NON_COMPLIANT'
      | 'PARTIALLY_COMPLIANT'
      | 'REQUIRES_REVIEW'
      | 'NOT_APPLICABLE';
    projectId: string;
    municipalityId: string;
    ruleId: string;
    deviation: number;
    citations: {
      id: string;
      documentId: string;
      documentTitle: string;
      excerpt: string;
      relevance: number;
      timestamp: Date;
      url?: string | undefined;
      pageNumber?: number | undefined;
      sectionNumber?: string | undefined;
      subsection?: string | undefined;
    }[];
    violations: {
      id: string;
      description: string;
      type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
      ruleId: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      checkId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      autoFixable: boolean;
      actualValue?: any;
      expectedValue?: any;
      suggestedFix?: any;
    }[];
    recommendations: string[];
    score: number;
    checkedAt: Date;
    checkedBy: string;
    actualValue?: any;
    expectedValue?: any;
    notes?: string | undefined;
  },
  {
    id: string;
    status:
      | 'COMPLIANT'
      | 'NON_COMPLIANT'
      | 'PARTIALLY_COMPLIANT'
      | 'REQUIRES_REVIEW'
      | 'NOT_APPLICABLE';
    projectId: string;
    municipalityId: string;
    ruleId: string;
    deviation: number;
    citations: {
      id: string;
      documentId: string;
      documentTitle: string;
      excerpt: string;
      relevance: number;
      timestamp: Date;
      url?: string | undefined;
      pageNumber?: number | undefined;
      sectionNumber?: string | undefined;
      subsection?: string | undefined;
    }[];
    violations: {
      id: string;
      description: string;
      type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
      ruleId: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      checkId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      autoFixable: boolean;
      actualValue?: any;
      expectedValue?: any;
      suggestedFix?: any;
    }[];
    recommendations: string[];
    score: number;
    checkedAt: Date;
    checkedBy: string;
    actualValue?: any;
    expectedValue?: any;
    notes?: string | undefined;
  }
>;
declare const zComplianceReport: z.ZodObject<
  {
    id: z.ZodString;
    projectId: z.ZodString;
    municipalityId: z.ZodString;
    overallStatus: z.ZodEnum<
      ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'REQUIRES_REVIEW', 'NOT_APPLICABLE']
    >;
    overallScore: z.ZodNumber;
    checks: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          projectId: z.ZodString;
          municipalityId: z.ZodString;
          ruleId: z.ZodString;
          status: z.ZodEnum<
            [
              'COMPLIANT',
              'NON_COMPLIANT',
              'PARTIALLY_COMPLIANT',
              'REQUIRES_REVIEW',
              'NOT_APPLICABLE',
            ]
          >;
          actualValue: z.ZodAny;
          expectedValue: z.ZodAny;
          deviation: z.ZodNumber;
          citations: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                documentId: z.ZodString;
                documentTitle: z.ZodString;
                pageNumber: z.ZodOptional<z.ZodNumber>;
                sectionNumber: z.ZodOptional<z.ZodString>;
                subsection: z.ZodOptional<z.ZodString>;
                url: z.ZodOptional<z.ZodString>;
                excerpt: z.ZodString;
                relevance: z.ZodNumber;
                timestamp: z.ZodDate;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              },
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              }
            >,
            'many'
          >;
          violations: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                checkId: z.ZodString;
                ruleId: z.ZodString;
                type: z.ZodEnum<['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']>;
                severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
                description: z.ZodString;
                actualValue: z.ZodAny;
                expectedValue: z.ZodAny;
                deviation: z.ZodNumber;
                citations: z.ZodArray<
                  z.ZodObject<
                    {
                      id: z.ZodString;
                      documentId: z.ZodString;
                      documentTitle: z.ZodString;
                      pageNumber: z.ZodOptional<z.ZodNumber>;
                      sectionNumber: z.ZodOptional<z.ZodString>;
                      subsection: z.ZodOptional<z.ZodString>;
                      url: z.ZodOptional<z.ZodString>;
                      excerpt: z.ZodString;
                      relevance: z.ZodNumber;
                      timestamp: z.ZodDate;
                    },
                    'strip',
                    z.ZodTypeAny,
                    {
                      id: string;
                      documentId: string;
                      documentTitle: string;
                      excerpt: string;
                      relevance: number;
                      timestamp: Date;
                      url?: string | undefined;
                      pageNumber?: number | undefined;
                      sectionNumber?: string | undefined;
                      subsection?: string | undefined;
                    },
                    {
                      id: string;
                      documentId: string;
                      documentTitle: string;
                      excerpt: string;
                      relevance: number;
                      timestamp: Date;
                      url?: string | undefined;
                      pageNumber?: number | undefined;
                      sectionNumber?: string | undefined;
                      subsection?: string | undefined;
                    }
                  >,
                  'many'
                >;
                autoFixable: z.ZodBoolean;
                suggestedFix: z.ZodOptional<z.ZodAny>;
                requiresManualReview: z.ZodBoolean;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                description: string;
                type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
                ruleId: string;
                severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
                requiresManualReview: boolean;
                checkId: string;
                deviation: number;
                citations: {
                  id: string;
                  documentId: string;
                  documentTitle: string;
                  excerpt: string;
                  relevance: number;
                  timestamp: Date;
                  url?: string | undefined;
                  pageNumber?: number | undefined;
                  sectionNumber?: string | undefined;
                  subsection?: string | undefined;
                }[];
                autoFixable: boolean;
                actualValue?: any;
                expectedValue?: any;
                suggestedFix?: any;
              },
              {
                id: string;
                description: string;
                type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
                ruleId: string;
                severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
                requiresManualReview: boolean;
                checkId: string;
                deviation: number;
                citations: {
                  id: string;
                  documentId: string;
                  documentTitle: string;
                  excerpt: string;
                  relevance: number;
                  timestamp: Date;
                  url?: string | undefined;
                  pageNumber?: number | undefined;
                  sectionNumber?: string | undefined;
                  subsection?: string | undefined;
                }[];
                autoFixable: boolean;
                actualValue?: any;
                expectedValue?: any;
                suggestedFix?: any;
              }
            >,
            'many'
          >;
          recommendations: z.ZodArray<z.ZodString, 'many'>;
          score: z.ZodNumber;
          checkedAt: z.ZodDate;
          checkedBy: z.ZodString;
          notes: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          status:
            | 'COMPLIANT'
            | 'NON_COMPLIANT'
            | 'PARTIALLY_COMPLIANT'
            | 'REQUIRES_REVIEW'
            | 'NOT_APPLICABLE';
          projectId: string;
          municipalityId: string;
          ruleId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          violations: {
            id: string;
            description: string;
            type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
            ruleId: string;
            severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            requiresManualReview: boolean;
            checkId: string;
            deviation: number;
            citations: {
              id: string;
              documentId: string;
              documentTitle: string;
              excerpt: string;
              relevance: number;
              timestamp: Date;
              url?: string | undefined;
              pageNumber?: number | undefined;
              sectionNumber?: string | undefined;
              subsection?: string | undefined;
            }[];
            autoFixable: boolean;
            actualValue?: any;
            expectedValue?: any;
            suggestedFix?: any;
          }[];
          recommendations: string[];
          score: number;
          checkedAt: Date;
          checkedBy: string;
          actualValue?: any;
          expectedValue?: any;
          notes?: string | undefined;
        },
        {
          id: string;
          status:
            | 'COMPLIANT'
            | 'NON_COMPLIANT'
            | 'PARTIALLY_COMPLIANT'
            | 'REQUIRES_REVIEW'
            | 'NOT_APPLICABLE';
          projectId: string;
          municipalityId: string;
          ruleId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          violations: {
            id: string;
            description: string;
            type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
            ruleId: string;
            severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            requiresManualReview: boolean;
            checkId: string;
            deviation: number;
            citations: {
              id: string;
              documentId: string;
              documentTitle: string;
              excerpt: string;
              relevance: number;
              timestamp: Date;
              url?: string | undefined;
              pageNumber?: number | undefined;
              sectionNumber?: string | undefined;
              subsection?: string | undefined;
            }[];
            autoFixable: boolean;
            actualValue?: any;
            expectedValue?: any;
            suggestedFix?: any;
          }[];
          recommendations: string[];
          score: number;
          checkedAt: Date;
          checkedBy: string;
          actualValue?: any;
          expectedValue?: any;
          notes?: string | undefined;
        }
      >,
      'many'
    >;
    violations: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          checkId: z.ZodString;
          ruleId: z.ZodString;
          type: z.ZodEnum<['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']>;
          severity: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']>;
          description: z.ZodString;
          actualValue: z.ZodAny;
          expectedValue: z.ZodAny;
          deviation: z.ZodNumber;
          citations: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                documentId: z.ZodString;
                documentTitle: z.ZodString;
                pageNumber: z.ZodOptional<z.ZodNumber>;
                sectionNumber: z.ZodOptional<z.ZodString>;
                subsection: z.ZodOptional<z.ZodString>;
                url: z.ZodOptional<z.ZodString>;
                excerpt: z.ZodString;
                relevance: z.ZodNumber;
                timestamp: z.ZodDate;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              },
              {
                id: string;
                documentId: string;
                documentTitle: string;
                excerpt: string;
                relevance: number;
                timestamp: Date;
                url?: string | undefined;
                pageNumber?: number | undefined;
                sectionNumber?: string | undefined;
                subsection?: string | undefined;
              }
            >,
            'many'
          >;
          autoFixable: z.ZodBoolean;
          suggestedFix: z.ZodOptional<z.ZodAny>;
          requiresManualReview: z.ZodBoolean;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
          ruleId: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          requiresManualReview: boolean;
          checkId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          autoFixable: boolean;
          actualValue?: any;
          expectedValue?: any;
          suggestedFix?: any;
        },
        {
          id: string;
          description: string;
          type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
          ruleId: string;
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          requiresManualReview: boolean;
          checkId: string;
          deviation: number;
          citations: {
            id: string;
            documentId: string;
            documentTitle: string;
            excerpt: string;
            relevance: number;
            timestamp: Date;
            url?: string | undefined;
            pageNumber?: number | undefined;
            sectionNumber?: string | undefined;
            subsection?: string | undefined;
          }[];
          autoFixable: boolean;
          actualValue?: any;
          expectedValue?: any;
          suggestedFix?: any;
        }
      >,
      'many'
    >;
    summary: z.ZodObject<
      {
        totalChecks: z.ZodNumber;
        compliantChecks: z.ZodNumber;
        nonCompliantChecks: z.ZodNumber;
        criticalViolations: z.ZodNumber;
        highViolations: z.ZodNumber;
        mediumViolations: z.ZodNumber;
        lowViolations: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        totalChecks: number;
        compliantChecks: number;
        nonCompliantChecks: number;
        criticalViolations: number;
        highViolations: number;
        mediumViolations: number;
        lowViolations: number;
      },
      {
        totalChecks: number;
        compliantChecks: number;
        nonCompliantChecks: number;
        criticalViolations: number;
        highViolations: number;
        mediumViolations: number;
        lowViolations: number;
      }
    >;
    recommendations: z.ZodArray<z.ZodString, 'many'>;
    generatedAt: z.ZodDate;
    generatedBy: z.ZodString;
    expiresAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    projectId: string;
    municipalityId: string;
    violations: {
      id: string;
      description: string;
      type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
      ruleId: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      checkId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      autoFixable: boolean;
      actualValue?: any;
      expectedValue?: any;
      suggestedFix?: any;
    }[];
    recommendations: string[];
    overallStatus:
      | 'COMPLIANT'
      | 'NON_COMPLIANT'
      | 'PARTIALLY_COMPLIANT'
      | 'REQUIRES_REVIEW'
      | 'NOT_APPLICABLE';
    overallScore: number;
    checks: {
      id: string;
      status:
        | 'COMPLIANT'
        | 'NON_COMPLIANT'
        | 'PARTIALLY_COMPLIANT'
        | 'REQUIRES_REVIEW'
        | 'NOT_APPLICABLE';
      projectId: string;
      municipalityId: string;
      ruleId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      violations: {
        id: string;
        description: string;
        type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
        ruleId: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        requiresManualReview: boolean;
        checkId: string;
        deviation: number;
        citations: {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        }[];
        autoFixable: boolean;
        actualValue?: any;
        expectedValue?: any;
        suggestedFix?: any;
      }[];
      recommendations: string[];
      score: number;
      checkedAt: Date;
      checkedBy: string;
      actualValue?: any;
      expectedValue?: any;
      notes?: string | undefined;
    }[];
    summary: {
      totalChecks: number;
      compliantChecks: number;
      nonCompliantChecks: number;
      criticalViolations: number;
      highViolations: number;
      mediumViolations: number;
      lowViolations: number;
    };
    generatedAt: Date;
    generatedBy: string;
    expiresAt: Date;
  },
  {
    id: string;
    projectId: string;
    municipalityId: string;
    violations: {
      id: string;
      description: string;
      type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
      ruleId: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresManualReview: boolean;
      checkId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      autoFixable: boolean;
      actualValue?: any;
      expectedValue?: any;
      suggestedFix?: any;
    }[];
    recommendations: string[];
    overallStatus:
      | 'COMPLIANT'
      | 'NON_COMPLIANT'
      | 'PARTIALLY_COMPLIANT'
      | 'REQUIRES_REVIEW'
      | 'NOT_APPLICABLE';
    overallScore: number;
    checks: {
      id: string;
      status:
        | 'COMPLIANT'
        | 'NON_COMPLIANT'
        | 'PARTIALLY_COMPLIANT'
        | 'REQUIRES_REVIEW'
        | 'NOT_APPLICABLE';
      projectId: string;
      municipalityId: string;
      ruleId: string;
      deviation: number;
      citations: {
        id: string;
        documentId: string;
        documentTitle: string;
        excerpt: string;
        relevance: number;
        timestamp: Date;
        url?: string | undefined;
        pageNumber?: number | undefined;
        sectionNumber?: string | undefined;
        subsection?: string | undefined;
      }[];
      violations: {
        id: string;
        description: string;
        type: 'DISTANCE' | 'HEIGHT' | 'AREA' | 'VOLUME' | 'PARKING' | 'OTHER';
        ruleId: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        requiresManualReview: boolean;
        checkId: string;
        deviation: number;
        citations: {
          id: string;
          documentId: string;
          documentTitle: string;
          excerpt: string;
          relevance: number;
          timestamp: Date;
          url?: string | undefined;
          pageNumber?: number | undefined;
          sectionNumber?: string | undefined;
          subsection?: string | undefined;
        }[];
        autoFixable: boolean;
        actualValue?: any;
        expectedValue?: any;
        suggestedFix?: any;
      }[];
      recommendations: string[];
      score: number;
      checkedAt: Date;
      checkedBy: string;
      actualValue?: any;
      expectedValue?: any;
      notes?: string | undefined;
    }[];
    summary: {
      totalChecks: number;
      compliantChecks: number;
      nonCompliantChecks: number;
      criticalViolations: number;
      highViolations: number;
      mediumViolations: number;
      lowViolations: number;
    };
    generatedAt: Date;
    generatedBy: string;
    expiresAt: Date;
  }
>;
declare const zComplianceIngestRequest: z.ZodObject<
  {
    municipalityId: z.ZodString;
    documents: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodEnum<
            [
              'REGOLAMENTO_URBANISTICO',
              'PIANO_REGOLATORE',
              'NORME_TECNICHE',
              'VARIANTE',
              'DELIBERA',
              'ALTRO',
            ]
          >;
          title: z.ZodString;
          description: z.ZodOptional<z.ZodString>;
          url: z.ZodOptional<z.ZodString>;
          file: z.ZodOptional<z.ZodAny>;
          version: z.ZodOptional<z.ZodString>;
          effectiveDate: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
          metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          type:
            | 'ALTRO'
            | 'REGOLAMENTO_URBANISTICO'
            | 'PIANO_REGOLATORE'
            | 'NORME_TECNICHE'
            | 'VARIANTE'
            | 'DELIBERA';
          title: string;
          description?: string | undefined;
          metadata?: Record<string, any> | undefined;
          url?: string | undefined;
          version?: string | undefined;
          effectiveDate?: string | Date | undefined;
          file?: any;
        },
        {
          type:
            | 'ALTRO'
            | 'REGOLAMENTO_URBANISTICO'
            | 'PIANO_REGOLATORE'
            | 'NORME_TECNICHE'
            | 'VARIANTE'
            | 'DELIBERA';
          title: string;
          description?: string | undefined;
          metadata?: Record<string, any> | undefined;
          url?: string | undefined;
          version?: string | undefined;
          effectiveDate?: string | Date | undefined;
          file?: any;
        }
      >,
      'many'
    >;
    forceUpdate: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    municipalityId: string;
    documents: {
      type:
        | 'ALTRO'
        | 'REGOLAMENTO_URBANISTICO'
        | 'PIANO_REGOLATORE'
        | 'NORME_TECNICHE'
        | 'VARIANTE'
        | 'DELIBERA';
      title: string;
      description?: string | undefined;
      metadata?: Record<string, any> | undefined;
      url?: string | undefined;
      version?: string | undefined;
      effectiveDate?: string | Date | undefined;
      file?: any;
    }[];
    forceUpdate?: boolean | undefined;
  },
  {
    municipalityId: string;
    documents: {
      type:
        | 'ALTRO'
        | 'REGOLAMENTO_URBANISTICO'
        | 'PIANO_REGOLATORE'
        | 'NORME_TECNICHE'
        | 'VARIANTE'
        | 'DELIBERA';
      title: string;
      description?: string | undefined;
      metadata?: Record<string, any> | undefined;
      url?: string | undefined;
      version?: string | undefined;
      effectiveDate?: string | Date | undefined;
      file?: any;
    }[];
    forceUpdate?: boolean | undefined;
  }
>;
declare const zComplianceCheckRequest: z.ZodObject<
  {
    projectId: z.ZodString;
    municipalityId: z.ZodOptional<z.ZodString>;
    ruleCategories: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<
          [
            'DISTACCHI',
            'ALTEZZE',
            'PARCHEGGI',
            'SUPERFICI',
            'VOLUMI',
            'ACCESSIBILITA',
            'AMBIENTALE',
            'STORICO',
            'ALTRO',
          ]
        >,
        'many'
      >
    >;
    includeCitations: z.ZodOptional<z.ZodBoolean>;
    includeRecommendations: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    municipalityId?: string | undefined;
    ruleCategories?:
      | (
          | 'DISTACCHI'
          | 'ALTEZZE'
          | 'PARCHEGGI'
          | 'SUPERFICI'
          | 'VOLUMI'
          | 'ACCESSIBILITA'
          | 'AMBIENTALE'
          | 'STORICO'
          | 'ALTRO'
        )[]
      | undefined;
    includeCitations?: boolean | undefined;
    includeRecommendations?: boolean | undefined;
  },
  {
    projectId: string;
    municipalityId?: string | undefined;
    ruleCategories?:
      | (
          | 'DISTACCHI'
          | 'ALTEZZE'
          | 'PARCHEGGI'
          | 'SUPERFICI'
          | 'VOLUMI'
          | 'ACCESSIBILITA'
          | 'AMBIENTALE'
          | 'STORICO'
          | 'ALTRO'
        )[]
      | undefined;
    includeCitations?: boolean | undefined;
    includeRecommendations?: boolean | undefined;
  }
>;
declare const zComplianceSearchRequest: z.ZodObject<
  {
    municipalityId: z.ZodString;
    query: z.ZodString;
    categories: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<
          [
            'DISTACCHI',
            'ALTEZZE',
            'PARCHEGGI',
            'SUPERFICI',
            'VOLUMI',
            'ACCESSIBILITA',
            'AMBIENTALE',
            'STORICO',
            'ALTRO',
          ]
        >,
        'many'
      >
    >;
    documentTypes: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<
          [
            'REGOLAMENTO_URBANISTICO',
            'PIANO_REGOLATORE',
            'NORME_TECNICHE',
            'VARIANTE',
            'DELIBERA',
            'ALTRO',
          ]
        >,
        'many'
      >
    >;
    limit: z.ZodOptional<z.ZodNumber>;
    threshold: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    municipalityId: string;
    query: string;
    categories?:
      | (
          | 'DISTACCHI'
          | 'ALTEZZE'
          | 'PARCHEGGI'
          | 'SUPERFICI'
          | 'VOLUMI'
          | 'ACCESSIBILITA'
          | 'AMBIENTALE'
          | 'STORICO'
          | 'ALTRO'
        )[]
      | undefined;
    documentTypes?:
      | (
          | 'ALTRO'
          | 'REGOLAMENTO_URBANISTICO'
          | 'PIANO_REGOLATORE'
          | 'NORME_TECNICHE'
          | 'VARIANTE'
          | 'DELIBERA'
        )[]
      | undefined;
    limit?: number | undefined;
    threshold?: number | undefined;
  },
  {
    municipalityId: string;
    query: string;
    categories?:
      | (
          | 'DISTACCHI'
          | 'ALTEZZE'
          | 'PARCHEGGI'
          | 'SUPERFICI'
          | 'VOLUMI'
          | 'ACCESSIBILITA'
          | 'AMBIENTALE'
          | 'STORICO'
          | 'ALTRO'
        )[]
      | undefined;
    documentTypes?:
      | (
          | 'ALTRO'
          | 'REGOLAMENTO_URBANISTICO'
          | 'PIANO_REGOLATORE'
          | 'NORME_TECNICHE'
          | 'VARIANTE'
          | 'DELIBERA'
        )[]
      | undefined;
    limit?: number | undefined;
    threshold?: number | undefined;
  }
>;
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
//# sourceMappingURL=compliance.d.ts.map
