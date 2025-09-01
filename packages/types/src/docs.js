'use strict';
// Document Types for Doc Hunter v1
Object.defineProperty(exports, '__esModule', { value: true });
exports.zChecklist =
  exports.zChecklistItem =
  exports.zDocRequest =
  exports.zDocumentEntity =
  exports.zDocumentMeta =
  exports.zExtractedFields =
  exports.zProgettoExtractedFields =
  exports.zPlanimetriaExtractedFields =
  exports.zDURCExtractedFields =
  exports.zVisuraExtractedFields =
  exports.zCDUExtractedFields =
  exports.zDocumentStatus =
  exports.zDocKind =
    void 0;
const zod_1 = require('zod');
// Zod Schemas
exports.zDocKind = zod_1.z.enum(['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']);
exports.zDocumentStatus = zod_1.z.enum([
  'REQUESTED',
  'UPLOADED',
  'EXTRACTED',
  'VALIDATED',
  'EXPIRED',
]);
exports.zCDUExtractedFields = zod_1.z.object({
  particella: zod_1.z.string(),
  destinazioneUso: zod_1.z.string(),
  vincoli: zod_1.z.array(zod_1.z.string()),
  superficie: zod_1.z.number(),
  indiceUrbanistico: zod_1.z.number(),
  altezzaMax: zod_1.z.number(),
  destinazioneSpecifica: zod_1.z.string().optional(),
});
exports.zVisuraExtractedFields = zod_1.z.object({
  cciaa: zod_1.z.string(),
  oggettoSociale: zod_1.z.string(),
  sedeLegale: zod_1.z.string(),
  partitaIva: zod_1.z.string(),
  codiceFiscale: zod_1.z.string(),
  dataIscrizione: zod_1.z.date(),
  stato: zod_1.z.enum(['ATTIVA', 'SOSPESA', 'CANCELLATA']),
});
exports.zDURCExtractedFields = zod_1.z.object({
  ditta: zod_1.z.string(),
  validita: zod_1.z.date(),
  numero: zod_1.z.string(),
  rilasciatoDa: zod_1.z.string(),
  dataRilascio: zod_1.z.date(),
  categoria: zod_1.z.string(),
  classe: zod_1.z.string(),
});
exports.zPlanimetriaExtractedFields = zod_1.z.object({
  scala: zod_1.z.string(),
  data: zod_1.z.date(),
  tecnico: zod_1.z.string(),
  superficie: zod_1.z.number(),
  destinazione: zod_1.z.string(),
  livelli: zod_1.z.number(),
  vani: zod_1.z.number(),
});
exports.zProgettoExtractedFields = zod_1.z.object({
  titolo: zod_1.z.string(),
  architetto: zod_1.z.string(),
  data: zod_1.z.date(),
  versione: zod_1.z.string(),
  approvato: zod_1.z.boolean(),
  note: zod_1.z.string().optional(),
});
exports.zExtractedFields = zod_1.z.union([
  exports.zCDUExtractedFields,
  exports.zVisuraExtractedFields,
  exports.zDURCExtractedFields,
  exports.zPlanimetriaExtractedFields,
  exports.zProgettoExtractedFields,
]);
exports.zDocumentMeta = zod_1.z.object({
  kind: exports.zDocKind,
  projectId: zod_1.z.string(),
  vendorId: zod_1.z.string().optional(),
  required: zod_1.z.boolean(),
  expiresAt: zod_1.z.date().optional(),
  requestedAt: zod_1.z.date(),
  requestedBy: zod_1.z.string(),
});
exports.zDocumentEntity = zod_1.z.object({
  id: zod_1.z.string(),
  meta: exports.zDocumentMeta,
  status: exports.zDocumentStatus,
  fileUrl: zod_1.z.string().optional(),
  fileName: zod_1.z.string().optional(),
  fileSize: zod_1.z.number().optional(),
  uploadedAt: zod_1.z.date().optional(),
  uploadedBy: zod_1.z.string().optional(),
  extracted: exports.zExtractedFields.optional(),
  issues: zod_1.z.array(zod_1.z.string()).optional(),
  validatedAt: zod_1.z.date().optional(),
  validatedBy: zod_1.z.string().optional(),
  createdAt: zod_1.z.date(),
  updatedAt: zod_1.z.date(),
});
exports.zDocRequest = zod_1.z.object({
  projectId: zod_1.z.string(),
  kind: exports.zDocKind,
  to: zod_1.z.enum(['vendor', 'internal']),
  messageTemplateId: zod_1.z.string(),
  uploadUrl: zod_1.z.string(),
  expiresAt: zod_1.z.date(),
  requestedBy: zod_1.z.string(),
});
exports.zChecklistItem = zod_1.z.object({
  kind: exports.zDocKind,
  status: exports.zDocumentStatus,
  documentId: zod_1.z.string().optional(),
  missingFields: zod_1.z.array(zod_1.z.string()).optional(),
  issues: zod_1.z.array(zod_1.z.string()).optional(),
  lastUpdate: zod_1.z.date(),
});
exports.zChecklist = zod_1.z.object({
  projectId: zod_1.z.string(),
  items: zod_1.z.array(exports.zChecklistItem),
  overallStatus: zod_1.z.enum(['INCOMPLETE', 'COMPLETE', 'VALIDATION_REQUIRED']),
  completionPercentage: zod_1.z.number(),
  lastUpdated: zod_1.z.date(),
  updatedBy: zod_1.z.string(),
});
//# sourceMappingURL=docs.js.map
