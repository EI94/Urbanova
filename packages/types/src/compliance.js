'use strict';
/**
 * Compliance Types - Urbanova AI
 * Sistema di verifica conformità urbanistica con documenti municipali reali
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.zComplianceSearchRequest =
  exports.zComplianceCheckRequest =
  exports.zComplianceIngestRequest =
  exports.zComplianceReport =
  exports.zComplianceCheck =
  exports.zComplianceViolation =
  exports.zRuleValidation =
  exports.zRuleParameter =
  exports.zPatternRule =
  exports.zCitation =
  exports.zDocumentSection =
  exports.zComplianceDocument =
  exports.zMunicipality =
    void 0;
const zod_1 = require('zod');
// ============================================================================
// SCHEMI ZOD
// ============================================================================
const zMunicipality = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string().min(1),
  province: zod_1.z.string().min(1),
  region: zod_1.z.string().min(1),
  cap: zod_1.z.string().length(5),
  coordinates: zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
  }),
  timezone: zod_1.z.string(),
  activeRules: zod_1.z.array(zod_1.z.string()),
  lastUpdate: zod_1.z.date(),
});
exports.zMunicipality = zMunicipality;
const zComplianceDocument = zod_1.z.object({
  id: zod_1.z.string(),
  municipalityId: zod_1.z.string(),
  type: zod_1.z.enum([
    'REGOLAMENTO_URBANISTICO',
    'PIANO_REGOLATORE',
    'NORME_TECNICHE',
    'VARIANTE',
    'DELIBERA',
    'ALTRO',
  ]),
  title: zod_1.z.string().min(1),
  description: zod_1.z.string(),
  url: zod_1.z.string().url().optional(),
  filePath: zod_1.z.string().optional(),
  fileSize: zod_1.z.number().positive(),
  mimeType: zod_1.z.string(),
  pageCount: zod_1.z.number().positive().optional(),
  version: zod_1.z.string(),
  effectiveDate: zod_1.z.date(),
  expiryDate: zod_1.z.date().optional(),
  status: zod_1.z.enum(['ACTIVE', 'EXPIRED', 'DRAFT']),
  metadata: zod_1.z.record(zod_1.z.any()),
  createdAt: zod_1.z.date(),
  updatedAt: zod_1.z.date(),
});
exports.zComplianceDocument = zComplianceDocument;
const zDocumentSection = zod_1.z.object({
  id: zod_1.z.string(),
  documentId: zod_1.z.string(),
  title: zod_1.z.string(),
  content: zod_1.z.string().min(1),
  pageNumber: zod_1.z.number().positive().optional(),
  sectionNumber: zod_1.z.string().optional(),
  subsection: zod_1.z.string().optional(),
  vectorEmbedding: zod_1.z.array(zod_1.z.number()),
  metadata: zod_1.z.record(zod_1.z.any()),
});
exports.zDocumentSection = zDocumentSection;
const zCitation = zod_1.z.object({
  id: zod_1.z.string(),
  documentId: zod_1.z.string(),
  documentTitle: zod_1.z.string(),
  pageNumber: zod_1.z.number().positive().optional(),
  sectionNumber: zod_1.z.string().optional(),
  subsection: zod_1.z.string().optional(),
  url: zod_1.z.string().url().optional(),
  excerpt: zod_1.z.string(),
  relevance: zod_1.z.number().min(0).max(1),
  timestamp: zod_1.z.date(),
});
exports.zCitation = zCitation;
const zRuleParameter = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  description: zod_1.z.string(),
  type: zod_1.z.enum(['NUMBER', 'STRING', 'BOOLEAN', 'ENUM', 'RANGE']),
  value: zod_1.z.any(),
  unit: zod_1.z.string().optional(),
  minValue: zod_1.z.number().optional(),
  maxValue: zod_1.z.number().optional(),
  enumValues: zod_1.z.array(zod_1.z.string()).optional(),
  required: zod_1.z.boolean(),
  defaultValue: zod_1.z.any().optional(),
});
exports.zRuleParameter = zRuleParameter;
const zRuleValidation = zod_1.z.object({
  id: zod_1.z.string(),
  ruleId: zod_1.z.string(),
  condition: zod_1.z.string(),
  errorMessage: zod_1.z.string(),
  severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  autoFix: zod_1.z.boolean().optional(),
  requiresManualReview: zod_1.z.boolean(),
});
exports.zRuleValidation = zRuleValidation;
const zPatternRule = zod_1.z.object({
  id: zod_1.z.string(),
  municipalityId: zod_1.z.string(),
  category: zod_1.z.enum([
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
  name: zod_1.z.string(),
  description: zod_1.z.string(),
  parameters: zod_1.z.array(zRuleParameter),
  validation: zRuleValidation,
  version: zod_1.z.string(),
  effectiveDate: zod_1.z.date(),
  expiryDate: zod_1.z.date().optional(),
  status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  priority: zod_1.z.number().min(1).max(10),
  tags: zod_1.z.array(zod_1.z.string()),
  createdAt: zod_1.z.date(),
  updatedAt: zod_1.z.date(),
});
exports.zPatternRule = zPatternRule;
const zComplianceViolation = zod_1.z.object({
  id: zod_1.z.string(),
  checkId: zod_1.z.string(),
  ruleId: zod_1.z.string(),
  type: zod_1.z.enum(['DISTANCE', 'HEIGHT', 'AREA', 'VOLUME', 'PARKING', 'OTHER']),
  severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: zod_1.z.string(),
  actualValue: zod_1.z.any(),
  expectedValue: zod_1.z.any(),
  deviation: zod_1.z.number(),
  citations: zod_1.z.array(zCitation),
  autoFixable: zod_1.z.boolean(),
  suggestedFix: zod_1.z.any().optional(),
  requiresManualReview: zod_1.z.boolean(),
});
exports.zComplianceViolation = zComplianceViolation;
const zComplianceCheck = zod_1.z.object({
  id: zod_1.z.string(),
  projectId: zod_1.z.string(),
  municipalityId: zod_1.z.string(),
  ruleId: zod_1.z.string(),
  status: zod_1.z.enum([
    'COMPLIANT',
    'NON_COMPLIANT',
    'PARTIALLY_COMPLIANT',
    'REQUIRES_REVIEW',
    'NOT_APPLICABLE',
  ]),
  actualValue: zod_1.z.any(),
  expectedValue: zod_1.z.any(),
  deviation: zod_1.z.number(),
  citations: zod_1.z.array(zCitation),
  violations: zod_1.z.array(zComplianceViolation),
  recommendations: zod_1.z.array(zod_1.z.string()),
  score: zod_1.z.number().min(0).max(100),
  checkedAt: zod_1.z.date(),
  checkedBy: zod_1.z.string(),
  notes: zod_1.z.string().optional(),
});
exports.zComplianceCheck = zComplianceCheck;
const zComplianceReport = zod_1.z.object({
  id: zod_1.z.string(),
  projectId: zod_1.z.string(),
  municipalityId: zod_1.z.string(),
  overallStatus: zod_1.z.enum([
    'COMPLIANT',
    'NON_COMPLIANT',
    'PARTIALLY_COMPLIANT',
    'REQUIRES_REVIEW',
    'NOT_APPLICABLE',
  ]),
  overallScore: zod_1.z.number().min(0).max(100),
  checks: zod_1.z.array(zComplianceCheck),
  violations: zod_1.z.array(zComplianceViolation),
  summary: zod_1.z.object({
    totalChecks: zod_1.z.number(),
    compliantChecks: zod_1.z.number(),
    nonCompliantChecks: zod_1.z.number(),
    criticalViolations: zod_1.z.number(),
    highViolations: zod_1.z.number(),
    mediumViolations: zod_1.z.number(),
    lowViolations: zod_1.z.number(),
  }),
  recommendations: zod_1.z.array(zod_1.z.string()),
  generatedAt: zod_1.z.date(),
  generatedBy: zod_1.z.string(),
  expiresAt: zod_1.z.date(),
});
exports.zComplianceReport = zComplianceReport;
const zComplianceIngestRequest = zod_1.z.object({
  municipalityId: zod_1.z.string(),
  documents: zod_1.z.array(
    zod_1.z.object({
      type: zod_1.z.enum([
        'REGOLAMENTO_URBANISTICO',
        'PIANO_REGOLATORE',
        'NORME_TECNICHE',
        'VARIANTE',
        'DELIBERA',
        'ALTRO',
      ]),
      title: zod_1.z.string().min(1),
      description: zod_1.z.string().optional(),
      url: zod_1.z.string().url().optional(),
      file: zod_1.z.any().optional(), // File object
      version: zod_1.z.string().optional(),
      effectiveDate: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]).optional(),
      metadata: zod_1.z.record(zod_1.z.any()).optional(),
    })
  ),
  forceUpdate: zod_1.z.boolean().optional(),
});
exports.zComplianceIngestRequest = zComplianceIngestRequest;
const zComplianceCheckRequest = zod_1.z.object({
  projectId: zod_1.z.string(),
  municipalityId: zod_1.z.string().optional(),
  ruleCategories: zod_1.z
    .array(
      zod_1.z.enum([
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
  includeCitations: zod_1.z.boolean().optional(),
  includeRecommendations: zod_1.z.boolean().optional(),
});
exports.zComplianceCheckRequest = zComplianceCheckRequest;
const zComplianceSearchRequest = zod_1.z.object({
  municipalityId: zod_1.z.string(),
  query: zod_1.z.string().min(1),
  categories: zod_1.z
    .array(
      zod_1.z.enum([
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
  documentTypes: zod_1.z
    .array(
      zod_1.z.enum([
        'REGOLAMENTO_URBANISTICO',
        'PIANO_REGOLATORE',
        'NORME_TECNICHE',
        'VARIANTE',
        'DELIBERA',
        'ALTRO',
      ])
    )
    .optional(),
  limit: zod_1.z.number().positive().optional(),
  threshold: zod_1.z.number().min(0).max(1).optional(),
});
exports.zComplianceSearchRequest = zComplianceSearchRequest;
//# sourceMappingURL=compliance.js.map
