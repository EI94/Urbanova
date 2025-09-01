import { z } from 'zod';

// ============================================================================
// VENDOR QUESTIONNAIRE TYPES
// ============================================================================

export interface VendorContact {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}

export interface VendorQuestionnaire {
  id: string;
  projectId: string;
  vendorContact: VendorContact;
  token: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  answers?: VendorAnswers;
  metadata: {
    sentBy: string;
    sentAt: Date;
    reminderCount: number;
    lastReminderAt?: Date;
  };
}

export interface VendorAnswers {
  // CDU Section
  cdu: {
    hasCDU: boolean;
    cduDate?: string;
    cduValidity?: string;
    cduNotes?: string;
  };

  // Project Section
  project: {
    hasSubmittedProject: boolean;
    projectSubmissionDate?: string;
    projectApprovalStatus?: 'pending' | 'approved' | 'rejected';
    projectNotes?: string;
  };

  // Sale Section
  sale: {
    saleType: 'asset' | 'spa';
    saleMotivation?: string;
    saleUrgency: 'low' | 'medium' | 'high';
  };

  // Constraints Section
  constraints: {
    urbanConstraints: string[];
    easements: string[];
    accessLimitations: string[];
    constraintNotes?: string;
  };

  // Documents Section
  documents: {
    availableDocuments: string[];
    documentNotes?: string;
  };

  // Additional Info
  additional: {
    notes?: string;
    contactPreference?: 'email' | 'phone' | 'meeting';
    bestTimeToContact?: string;
  };
}

export interface ProjectFactsUpdate {
  projectId: string;
  source: 'vendor_questionnaire';
  timestamp: Date;
  updatedBy: string;
  changes: {
    field: string;
    oldValue?: any;
    newValue: any;
    confidence: number; // 0-1
  }[];
  metadata: {
    questionnaireId: string;
    vendorContact: VendorContact;
  };
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const zVendorContact = z.object({
  name: z.string().min(1, 'Nome richiesto'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export const zVendorAnswers = z.object({
  cdu: z.object({
    hasCDU: z.boolean(),
    cduDate: z.string().optional(),
    cduValidity: z.string().optional(),
    cduNotes: z.string().optional(),
  }),

  project: z.object({
    hasSubmittedProject: z.boolean(),
    projectSubmissionDate: z.string().optional(),
    projectApprovalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
    projectNotes: z.string().optional(),
  }),

  sale: z.object({
    saleType: z.enum(['asset', 'spa']),
    saleMotivation: z.string().optional(),
    saleUrgency: z.enum(['low', 'medium', 'high']),
  }),

  constraints: z.object({
    urbanConstraints: z.array(z.string()),
    easements: z.array(z.string()),
    accessLimitations: z.array(z.string()),
    constraintNotes: z.string().optional(),
  }),

  documents: z.object({
    availableDocuments: z.array(z.string()),
    documentNotes: z.string().optional(),
  }),

  additional: z.object({
    notes: z.string().optional(),
    contactPreference: z.enum(['email', 'phone', 'meeting']).optional(),
    bestTimeToContact: z.string().optional(),
  }),
});

export const zVendorQuestionnaire = z.object({
  id: z.string(),
  projectId: z.string(),
  vendorContact: zVendorContact,
  token: z.string(),
  status: z.enum(['pending', 'completed', 'expired']),
  createdAt: z.date(),
  expiresAt: z.date(),
  completedAt: z.date().optional(),
  answers: zVendorAnswers.optional(),
  metadata: z.object({
    sentBy: z.string(),
    sentAt: z.date(),
    reminderCount: z.number().min(0),
    lastReminderAt: z.date().optional(),
  }),
});

export const zProjectFactsUpdate = z.object({
  projectId: z.string(),
  source: z.literal('vendor_questionnaire'),
  timestamp: z.date(),
  updatedBy: z.string(),
  changes: z.array(
    z.object({
      field: z.string(),
      oldValue: z.any().optional(),
      newValue: z.any(),
      confidence: z.number().min(0).max(1),
    })
  ),
  metadata: z.object({
    questionnaireId: z.string(),
    vendorContact: zVendorContact,
  }),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type VendorQuestionnaireStatus = 'pending' | 'completed' | 'expired';
export type SaleType = 'asset' | 'spa';
export type SaleUrgency = 'low' | 'medium' | 'high';
export type ProjectApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ContactPreference = 'email' | 'phone' | 'meeting';

// ============================================================================
// CONSTANTS
// ============================================================================

export const VENDOR_QUESTIONNAIRE_EXPIRY_DAYS = 7;
export const VENDOR_QUESTIONNAIRE_REMINDER_DAYS = [3, 5]; // giorni prima della scadenza

export const AVAILABLE_DOCUMENTS_OPTIONS = [
  'planimetrie',
  'relazioni_tecniche',
  'certificazioni_energetiche',
  'perizie_tecniche',
  'visure_catastali',
  'certificati_agibilita',
  'documenti_urbanistici',
  'contratti_locazione',
  'altri_documenti',
] as const;

export const URBAN_CONSTRAINTS_OPTIONS = [
  'vincoli_paesaggistici',
  'vincoli_archeologici',
  'vincoli_idrogeologici',
  'vincoli_acustici',
  'vincoli_ambientali',
  'vincoli_viabilita',
  'nessun_vincolo',
] as const;

export const EASEMENTS_OPTIONS = [
  'passaggio_servitu',
  'elettrodotto',
  'gasdotto',
  'acquedotto',
  'fognatura',
  'telecomunicazioni',
  'nessuna_servitu',
] as const;

export const ACCESS_LIMITATIONS_OPTIONS = [
  'strada_privata',
  'accesso_limitato',
  'orari_accesso',
  'restrizioni_veicolari',
  'nessuna_limitazione',
] as const;
