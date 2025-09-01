// Document Types for Doc Hunter v1

import { z } from 'zod';

// Document Kinds
export type DocKind = 'CDU' | 'VISURA' | 'DURC' | 'PLANIMETRIA' | 'PROGETTO';

// Document Status Lifecycle
export type DocumentStatus = 'REQUESTED' | 'UPLOADED' | 'EXTRACTED' | 'VALIDATED' | 'EXPIRED';

// Document Metadata
export interface DocumentMeta {
  kind: DocKind;
  projectId: string;
  vendorId?: string;
  required: boolean;
  expiresAt?: Date;
  requestedAt: Date;
  requestedBy: string;
}

// Extracted Fields per Document Type
export interface CDUExtractedFields {
  particella: string;
  destinazioneUso: string;
  vincoli: string[];
  superficie: number;
  indiceUrbanistico: number;
  altezzaMax: number;
  destinazioneSpecifica?: string;
}

export interface VisuraExtractedFields {
  cciaa: string;
  oggettoSociale: string;
  sedeLegale: string;
  partitaIva: string;
  codiceFiscale: string;
  dataIscrizione: Date;
  stato: 'ATTIVA' | 'SOSPESA' | 'CANCELLATA';
}

export interface DURCExtractedFields {
  ditta: string;
  validita: Date;
  numero: string;
  rilasciatoDa: string;
  dataRilascio: Date;
  categoria: string;
  classe: string;
}

export interface PlanimetriaExtractedFields {
  scala: string;
  data: Date;
  tecnico: string;
  superficie: number;
  destinazione: string;
  livelli: number;
  vani: number;
}

export interface ProgettoExtractedFields {
  titolo: string;
  architetto: string;
  data: Date;
  versione: string;
  approvato: boolean;
  note?: string;
}

// Union type for all extracted fields
export type ExtractedFields =
  | CDUExtractedFields
  | VisuraExtractedFields
  | DURCExtractedFields
  | PlanimetriaExtractedFields
  | ProgettoExtractedFields;

// Document Entity
export interface DocumentEntity {
  id: string;
  meta: DocumentMeta;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
  extracted?: ExtractedFields;
  issues?: string[];
  validatedAt?: Date;
  validatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document Request
export interface DocRequest {
  projectId: string;
  kind: DocKind;
  to: 'vendor' | 'internal';
  messageTemplateId: string;
  uploadUrl: string;
  expiresAt: Date;
  requestedBy: string;
}

// Checklist Item
export interface ChecklistItem {
  kind: DocKind;
  status: DocumentStatus;
  documentId?: string;
  missingFields?: string[];
  issues?: string[];
  lastUpdate: Date;
}

// Project Checklist
export interface Checklist {
  projectId: string;
  items: ChecklistItem[];
  overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
  completionPercentage: number;
  lastUpdated: Date;
  updatedBy: string;
}

// Zod Schemas
export const zDocKind = z.enum(['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO']);
export const zDocumentStatus = z.enum([
  'REQUESTED',
  'UPLOADED',
  'EXTRACTED',
  'VALIDATED',
  'EXPIRED',
]);

export const zCDUExtractedFields = z.object({
  particella: z.string(),
  destinazioneUso: z.string(),
  vincoli: z.array(z.string()),
  superficie: z.number(),
  indiceUrbanistico: z.number(),
  altezzaMax: z.number(),
  destinazioneSpecifica: z.string().optional(),
});

export const zVisuraExtractedFields = z.object({
  cciaa: z.string(),
  oggettoSociale: z.string(),
  sedeLegale: z.string(),
  partitaIva: z.string(),
  codiceFiscale: z.string(),
  dataIscrizione: z.date(),
  stato: z.enum(['ATTIVA', 'SOSPESA', 'CANCELLATA']),
});

export const zDURCExtractedFields = z.object({
  ditta: z.string(),
  validita: z.date(),
  numero: z.string(),
  rilasciatoDa: z.string(),
  dataRilascio: z.date(),
  categoria: z.string(),
  classe: z.string(),
});

export const zPlanimetriaExtractedFields = z.object({
  scala: z.string(),
  data: z.date(),
  tecnico: z.string(),
  superficie: z.number(),
  destinazione: z.string(),
  livelli: z.number(),
  vani: z.number(),
});

export const zProgettoExtractedFields = z.object({
  titolo: z.string(),
  architetto: z.string(),
  data: z.date(),
  versione: z.string(),
  approvato: z.boolean(),
  note: z.string().optional(),
});

export const zExtractedFields = z.union([
  zCDUExtractedFields,
  zVisuraExtractedFields,
  zDURCExtractedFields,
  zPlanimetriaExtractedFields,
  zProgettoExtractedFields,
]);

export const zDocumentMeta = z.object({
  kind: zDocKind,
  projectId: z.string(),
  vendorId: z.string().optional(),
  required: z.boolean(),
  expiresAt: z.date().optional(),
  requestedAt: z.date(),
  requestedBy: z.string(),
});

export const zDocumentEntity = z.object({
  id: z.string(),
  meta: zDocumentMeta,
  status: zDocumentStatus,
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  uploadedAt: z.date().optional(),
  uploadedBy: z.string().optional(),
  extracted: zExtractedFields.optional(),
  issues: z.array(z.string()).optional(),
  validatedAt: z.date().optional(),
  validatedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const zDocRequest = z.object({
  projectId: z.string(),
  kind: zDocKind,
  to: z.enum(['vendor', 'internal']),
  messageTemplateId: z.string(),
  uploadUrl: z.string(),
  expiresAt: z.date(),
  requestedBy: z.string(),
});

export const zChecklistItem = z.object({
  kind: zDocKind,
  status: zDocumentStatus,
  documentId: z.string().optional(),
  missingFields: z.array(z.string()).optional(),
  issues: z.array(z.string()).optional(),
  lastUpdate: z.date(),
});

export const zChecklist = z.object({
  projectId: z.string(),
  items: z.array(zChecklistItem),
  overallStatus: z.enum(['INCOMPLETE', 'COMPLETE', 'VALIDATION_REQUIRED']),
  completionPercentage: z.number(),
  lastUpdated: z.date(),
  updatedBy: z.string(),
});
