/**
 * 🔍 BUDGET SUPPLIERS SCHEMAS
 * 
 * Validazioni Zod per il data model Budget & Fornitori
 */

import { z } from 'zod';
import {
  UnitOfMeasure,
  ItemCategory,
  PriceProfile,
  ProjectRef,
  Typology,
  BoqItem,
  Rfp,
  OfferLine,
  Offer,
  ContractBundle,
  Sal,
  CreateTypologyInput,
  UpdateTypologyInput,
  CreateBoqItemInput,
  UpdateBoqItemInput,
  CreateRfpInput,
  UpdateRfpInput,
  CreateOfferInput,
  UpdateOfferInput,
  CreateContractInput,
  UpdateContractInput,
  CreateSalInput,
  UpdateSalInput,
  TypologyFilters,
  BoqItemFilters,
  RfpFilters,
  OfferFilters,
  ContractFilters,
  SalFilters,
} from './types';

// Enum schemas
export const UnitOfMeasureSchema = z.enum(['mq', 'mc', 'kg', 'pz', 'h', 'ml', 'q.le', 'altra']);

export const ItemCategorySchema = z.enum(['OPERE', 'FORNITURE', 'SICUREZZA', 'CANTIERIZZAZIONE', 'ESTERNE_ALTRO']);

export const PriceProfileSchema = z.enum(['BUDGET', 'BEST_OFFER', 'CONTRACT', 'ACTUAL']);

// Base schemas
export const ProjectRefSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Project name is required'),
  currency: z.enum(['EUR', 'USD']),
  vatDefaultPct: z.number().min(0).max(100, 'VAT percentage must be between 0 and 100'),
});

export const TypologySchema = z.object({
  id: z.string().min(1, 'Typology ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Typology name is required'),
  description: z.string().optional(),
  grossAreaMq: z.number().positive('Gross area must be positive'),
  unitsCount: z.number().int().positive('Units count must be a positive integer'),
  finishLevel: z.enum(['basic', 'standard', 'premium']).optional(),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

export const BoqItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  typologyId: z.string().optional(),
  code: z.string().optional(),
  category: ItemCategorySchema,
  description: z.string().min(1, 'Description is required'),
  uom: UnitOfMeasureSchema,
  qty: z.number().positive('Quantity must be positive'),
  notes: z.string().optional(),
  level: z.enum(['rough', 'definitive', 'executive']),
  budget: z.number().min(0).optional(),
  bestOffer: z.number().min(0).optional(),
  contract: z.number().min(0).optional(),
  actual: z.number().min(0).optional(),
  vendorIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'rfp', 'awarded', 'contracted', 'in_progress', 'done']),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

export const OfferLineSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  uom: UnitOfMeasureSchema,
  qty: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  exclusions: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const RfpSchema = z.object({
  id: z.string().min(1, 'RFP ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'RFP name is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item is required'),
  inviteVendorIds: z.array(z.string()).min(1, 'At least one vendor must be invited'),
  dueAt: z.number().int().positive('Due date must be a positive timestamp'),
  hideBudget: z.boolean(),
  attachments: z.array(z.string()).optional(),
  rules: z.object({
    requireUnitPrices: z.boolean(),
    requireLeadTime: z.boolean(),
    paymentTerms: z.string().optional(),
  }).optional(),
  status: z.enum(['draft', 'sent', 'collecting', 'closed']),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

export const OfferSchema = z.object({
  id: z.string().min(1, 'Offer ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  rfpId: z.string().min(1, 'RFP ID is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  lines: z.array(OfferLineSchema).min(1, 'At least one offer line is required'),
  leadTimeDays: z.number().int().positive('Lead time must be a positive integer').optional(),
  paymentTerms: z.string().optional(),
  validityDays: z.number().int().positive('Validity days must be a positive integer').optional(),
  files: z.array(z.string()).optional(),
  status: z.enum(['received', 'normalized', 'evaluated']),
  score: z.object({
    price: z.number().min(0).max(10, 'Price score must be between 0 and 10'),
    quality: z.number().min(0).max(10, 'Quality score must be between 0 and 10'),
    leadTime: z.number().min(0).max(10, 'Lead time score must be between 0 and 10'),
    compliance: z.number().min(0).max(10, 'Compliance score must be between 0 and 10'),
    risk: z.number().min(0).max(10, 'Risk score must be between 0 and 10'),
    total: z.number().min(0).max(10, 'Total score must be between 0 and 10'),
  }).optional(),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

export const ContractBundleSchema = z.object({
  id: z.string().min(1, 'Contract ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  rfpId: z.string().optional(),
  name: z.string().min(1, 'Contract name is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['EUR', 'USD']),
  terms: z.object({
    milestones: z.array(z.object({
      label: z.string().min(1, 'Milestone label is required'),
      amount: z.number().min(0, 'Milestone amount must be non-negative'),
      dueAt: z.number().int().positive('Milestone due date must be a positive timestamp'),
    })).optional(),
    penalties: z.string().optional(),
    bonuses: z.string().optional(),
    retentionPct: z.number().min(0).max(100, 'Retention percentage must be between 0 and 100').optional(),
  }),
  status: z.enum(['draft', 'signed', 'active', 'completed', 'cancelled']),
  files: z.array(z.string()).optional(),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

export const SalSchema = z.object({
  id: z.string().min(1, 'SAL ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  contractId: z.string().min(1, 'Contract ID is required'),
  number: z.number().int().positive('SAL number must be a positive integer'),
  date: z.number().int().positive('SAL date must be a positive timestamp'),
  amount: z.number().min(0, 'SAL amount must be non-negative'),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.number().int().positive('Created at must be a positive timestamp'),
  updatedAt: z.number().int().positive('Updated at must be a positive timestamp'),
});

// Input schemas for CRUD operations
export const CreateTypologyInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Typology name is required'),
  description: z.string().optional(),
  grossAreaMq: z.number().positive('Gross area must be positive'),
  unitsCount: z.number().int().positive('Units count must be a positive integer'),
  finishLevel: z.enum(['basic', 'standard', 'premium']).optional(),
});

export const UpdateTypologyInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  grossAreaMq: z.number().positive().optional(),
  unitsCount: z.number().int().positive().optional(),
  finishLevel: z.enum(['basic', 'standard', 'premium']).optional(),
});

export const CreateBoqItemInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  typologyId: z.string().optional(),
  code: z.string().optional(),
  category: ItemCategorySchema,
  description: z.string().min(1, 'Description is required'),
  uom: UnitOfMeasureSchema,
  qty: z.number().positive('Quantity must be positive'),
  notes: z.string().optional(),
  level: z.enum(['rough', 'definitive', 'executive']),
  vendorIds: z.array(z.string()).optional(),
});

export const UpdateBoqItemInputSchema = z.object({
  code: z.string().optional(),
  category: ItemCategorySchema.optional(),
  description: z.string().min(1).optional(),
  uom: UnitOfMeasureSchema.optional(),
  qty: z.number().positive().optional(),
  notes: z.string().optional(),
  level: z.enum(['rough', 'definitive', 'executive']).optional(),
  budget: z.number().min(0).optional(),
  bestOffer: z.number().min(0).optional(),
  contract: z.number().min(0).optional(),
  actual: z.number().min(0).optional(),
  vendorIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'rfp', 'awarded', 'contracted', 'in_progress', 'done']).optional(),
});

export const CreateRfpInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'RFP name is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item is required'),
  inviteVendorIds: z.array(z.string()).min(1, 'At least one vendor must be invited'),
  dueAt: z.number().int().positive('Due date must be a positive timestamp'),
  hideBudget: z.boolean(),
  attachments: z.array(z.string()).optional(),
  rules: z.object({
    requireUnitPrices: z.boolean(),
    requireLeadTime: z.boolean(),
    paymentTerms: z.string().optional(),
  }).optional(),
});

export const UpdateRfpInputSchema = z.object({
  name: z.string().min(1).optional(),
  itemIds: z.array(z.string()).min(1).optional(),
  inviteVendorIds: z.array(z.string()).min(1).optional(),
  dueAt: z.number().int().positive().optional(),
  hideBudget: z.boolean().optional(),
  attachments: z.array(z.string()).optional(),
  rules: z.object({
    requireUnitPrices: z.boolean(),
    requireLeadTime: z.boolean(),
    paymentTerms: z.string().optional(),
  }).optional(),
  status: z.enum(['draft', 'sent', 'collecting', 'closed']).optional(),
});

export const CreateOfferInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  rfpId: z.string().min(1, 'RFP ID is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  lines: z.array(OfferLineSchema).min(1, 'At least one offer line is required'),
  leadTimeDays: z.number().int().positive().optional(),
  paymentTerms: z.string().optional(),
  validityDays: z.number().int().positive().optional(),
  files: z.array(z.string()).optional(),
});

export const UpdateOfferInputSchema = z.object({
  lines: z.array(OfferLineSchema).min(1).optional(),
  leadTimeDays: z.number().int().positive().optional(),
  paymentTerms: z.string().optional(),
  validityDays: z.number().int().positive().optional(),
  files: z.array(z.string()).optional(),
  status: z.enum(['received', 'normalized', 'evaluated']).optional(),
  score: z.object({
    price: z.number().min(0).max(10),
    quality: z.number().min(0).max(10),
    leadTime: z.number().min(0).max(10),
    compliance: z.number().min(0).max(10),
    risk: z.number().min(0).max(10),
    total: z.number().min(0).max(10),
  }).optional(),
});

export const CreateContractInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  rfpId: z.string().optional(),
  name: z.string().min(1, 'Contract name is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['EUR', 'USD']),
  terms: z.object({
    milestones: z.array(z.object({
      label: z.string().min(1),
      amount: z.number().min(0),
      dueAt: z.number().int().positive(),
    })).optional(),
    penalties: z.string().optional(),
    bonuses: z.string().optional(),
    retentionPct: z.number().min(0).max(100).optional(),
  }),
  files: z.array(z.string()).optional(),
});

export const UpdateContractInputSchema = z.object({
  name: z.string().min(1).optional(),
  itemIds: z.array(z.string()).min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.enum(['EUR', 'USD']).optional(),
  terms: z.object({
    milestones: z.array(z.object({
      label: z.string().min(1),
      amount: z.number().min(0),
      dueAt: z.number().int().positive(),
    })).optional(),
    penalties: z.string().optional(),
    bonuses: z.string().optional(),
    retentionPct: z.number().min(0).max(100).optional(),
  }).optional(),
  status: z.enum(['draft', 'signed', 'active', 'completed', 'cancelled']).optional(),
  files: z.array(z.string()).optional(),
});

export const CreateSalInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  contractId: z.string().min(1, 'Contract ID is required'),
  number: z.number().int().positive('SAL number must be a positive integer'),
  date: z.number().int().positive('SAL date must be a positive timestamp'),
  amount: z.number().min(0, 'SAL amount must be non-negative'),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const UpdateSalInputSchema = z.object({
  number: z.number().int().positive().optional(),
  date: z.number().int().positive().optional(),
  amount: z.number().min(0).optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Filter schemas
export const TypologyFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  finishLevel: z.enum(['basic', 'standard', 'premium']).optional(),
});

export const BoqItemFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  typologyId: z.string().optional(),
  category: ItemCategorySchema.optional(),
  status: z.enum(['draft', 'rfp', 'awarded', 'contracted', 'in_progress', 'done']).optional(),
  level: z.enum(['rough', 'definitive', 'executive']).optional(),
});

export const RfpFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.enum(['draft', 'sent', 'collecting', 'closed']).optional(),
});

export const OfferFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  rfpId: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.enum(['received', 'normalized', 'evaluated']).optional(),
});

export const ContractFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  vendorId: z.string().optional(),
  status: z.enum(['draft', 'signed', 'active', 'completed', 'cancelled']).optional(),
});

export const SalFiltersSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  contractId: z.string().optional(),
});

// Generic validation function
export function ensureValid<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

// Type-safe validation functions
export const validateProjectRef = (data: unknown): ProjectRef => ensureValid(ProjectRefSchema, data);
export const validateTypology = (data: unknown): Typology => ensureValid(TypologySchema, data);
export const validateBoqItem = (data: unknown): BoqItem => ensureValid(BoqItemSchema, data);
export const validateRfp = (data: unknown): Rfp => ensureValid(RfpSchema, data);
export const validateOffer = (data: unknown): Offer => ensureValid(OfferSchema, data);
export const validateContractBundle = (data: unknown): ContractBundle => ensureValid(ContractBundleSchema, data);
export const validateSal = (data: unknown): Sal => ensureValid(SalSchema, data);

export const validateCreateTypologyInput = (data: unknown): CreateTypologyInput => ensureValid(CreateTypologyInputSchema, data);
export const validateUpdateTypologyInput = (data: unknown): UpdateTypologyInput => ensureValid(UpdateTypologyInputSchema, data);
export const validateCreateBoqItemInput = (data: unknown): CreateBoqItemInput => ensureValid(CreateBoqItemInputSchema, data);
export const validateUpdateBoqItemInput = (data: unknown): UpdateBoqItemInput => ensureValid(UpdateBoqItemInputSchema, data);
export const validateCreateRfpInput = (data: unknown): CreateRfpInput => ensureValid(CreateRfpInputSchema, data);
export const validateUpdateRfpInput = (data: unknown): UpdateRfpInput => ensureValid(UpdateRfpInputSchema, data);
export const validateCreateOfferInput = (data: unknown): CreateOfferInput => ensureValid(CreateOfferInputSchema, data);
export const validateUpdateOfferInput = (data: unknown): UpdateOfferInput => ensureValid(UpdateOfferInputSchema, data);
export const validateCreateContractInput = (data: unknown): CreateContractInput => ensureValid(CreateContractInputSchema, data);
export const validateUpdateContractInput = (data: unknown): UpdateContractInput => ensureValid(UpdateContractInputSchema, data);
export const validateCreateSalInput = (data: unknown): CreateSalInput => ensureValid(CreateSalInputSchema, data);
export const validateUpdateSalInput = (data: unknown): UpdateSalInput => ensureValid(UpdateSalInputSchema, data);

export const validateTypologyFilters = (data: unknown): TypologyFilters => ensureValid(TypologyFiltersSchema, data);
export const validateBoqItemFilters = (data: unknown): BoqItemFilters => ensureValid(BoqItemFiltersSchema, data);
export const validateRfpFilters = (data: unknown): RfpFilters => ensureValid(RfpFiltersSchema, data);
export const validateOfferFilters = (data: unknown): OfferFilters => ensureValid(OfferFiltersSchema, data);
export const validateContractFilters = (data: unknown): ContractFilters => ensureValid(ContractFiltersSchema, data);
export const validateSalFilters = (data: unknown): SalFilters => ensureValid(SalFiltersSchema, data);
