/**
 * 💰 BUDGET SUPPLIERS TYPES
 * 
 * Data model completo per Progetto→Tipologie→Items→RFP→Offerte→Contratti→SAL
 */

export type UnitOfMeasure = 'mq' | 'mc' | 'kg' | 'pz' | 'h' | 'ml' | 'q.le' | 'altra';

export type ItemCategory = 'OPERE' | 'FORNITURE' | 'SICUREZZA' | 'CANTIERIZZAZIONE' | 'ESTERNE_ALTRO';

export type PriceProfile = 'BUDGET' | 'BEST_OFFER' | 'CONTRACT' | 'ACTUAL';

export interface ProjectRef {
  id: string;
  name: string;
  currency: 'EUR' | 'USD';
  vatDefaultPct: number;
}

export interface Typology {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  grossAreaMq: number;
  unitsCount: number;
  finishLevel?: 'basic' | 'standard' | 'premium';
  createdAt: number;
  updatedAt: number;
}

export interface BoqItem {
  id: string;
  projectId: string;
  typologyId?: string; // se null = comune
  code?: string; // tariffa / riferimento
  category: ItemCategory;
  description: string;
  uom: UnitOfMeasure;
  qty: number;
  notes?: string;
  level: 'rough' | 'definitive' | 'executive';
  // prezzi calcolati (snapshot)
  budget?: number;
  bestOffer?: number;
  contract?: number;
  actual?: number;
  vendorIds?: string[]; // vendor rilevanti
  status: 'draft' | 'rfp' | 'awarded' | 'contracted' | 'in_progress' | 'done';
  createdAt: number;
  updatedAt: number;
}

export interface Rfp {
  id: string;
  projectId: string;
  name: string;
  itemIds: string[];
  inviteVendorIds: string[];
  dueAt: number;
  hideBudget: boolean;
  attachments?: string[];
  rules?: {
    requireUnitPrices: boolean;
    requireLeadTime: boolean;
    paymentTerms?: string;
  };
  status: 'draft' | 'sent' | 'collecting' | 'closed';
  createdAt: number;
  updatedAt: number;
}

export interface OfferLine {
  itemId: string;
  uom: UnitOfMeasure;
  qty: number;
  unitPrice: number;
  exclusions?: string[];
  notes?: string;
}

export interface Offer {
  id: string;
  projectId: string;
  rfpId: string;
  vendorId: string;
  lines: OfferLine[];
  leadTimeDays?: number;
  paymentTerms?: string;
  validityDays?: number;
  files?: string[];
  status: 'received' | 'normalized' | 'evaluated';
  score?: {
    price: number;
    quality: number;
    leadTime: number;
    compliance: number;
    risk: number;
    total: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface ContractBundle {
  id: string;
  projectId: string;
  vendorId: string;
  rfpId?: string;
  name: string;
  itemIds: string[];
  amount: number;
  currency: 'EUR' | 'USD';
  terms: {
    milestones?: {
      label: string;
      amount: number;
      dueAt: number;
    }[];
    penalties?: string;
    bonuses?: string;
    retentionPct?: number;
  };
  status: 'draft' | 'signed' | 'active' | 'completed' | 'cancelled';
  files?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Sal {
  id: string;
  projectId: string;
  contractId: string;
  number: number;
  date: number;
  amount: number;
  attachments?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Utility types per le operazioni CRUD
export interface CreateTypologyInput {
  projectId: string;
  name: string;
  description?: string;
  grossAreaMq: number;
  unitsCount: number;
  finishLevel?: 'basic' | 'standard' | 'premium';
}

export interface UpdateTypologyInput {
  name?: string;
  description?: string;
  grossAreaMq?: number;
  unitsCount?: number;
  finishLevel?: 'basic' | 'standard' | 'premium';
}

export interface CreateBoqItemInput {
  projectId: string;
  typologyId?: string;
  code?: string;
  category: ItemCategory;
  description: string;
  uom: UnitOfMeasure;
  qty: number;
  notes?: string;
  level: 'rough' | 'definitive' | 'executive';
  vendorIds?: string[];
}

export interface UpdateBoqItemInput {
  code?: string;
  category?: ItemCategory;
  description?: string;
  uom?: UnitOfMeasure;
  qty?: number;
  notes?: string;
  level?: 'rough' | 'definitive' | 'executive';
  budget?: number;
  bestOffer?: number;
  contract?: number;
  actual?: number;
  vendorIds?: string[];
  status?: 'draft' | 'rfp' | 'awarded' | 'contracted' | 'in_progress' | 'done';
}

export interface CreateRfpInput {
  projectId: string;
  name: string;
  itemIds: string[];
  inviteVendorIds: string[];
  dueAt: number;
  hideBudget: boolean;
  attachments?: string[];
  rules?: {
    requireUnitPrices: boolean;
    requireLeadTime: boolean;
    paymentTerms?: string;
  };
}

export interface UpdateRfpInput {
  name?: string;
  itemIds?: string[];
  inviteVendorIds?: string[];
  dueAt?: number;
  hideBudget?: boolean;
  attachments?: string[];
  rules?: {
    requireUnitPrices: boolean;
    requireLeadTime: boolean;
    paymentTerms?: string;
  };
  status?: 'draft' | 'sent' | 'collecting' | 'closed';
}

export interface CreateOfferInput {
  projectId: string;
  rfpId: string;
  vendorId: string;
  lines: OfferLine[];
  leadTimeDays?: number;
  paymentTerms?: string;
  validityDays?: number;
  files?: string[];
}

export interface UpdateOfferInput {
  lines?: OfferLine[];
  leadTimeDays?: number;
  paymentTerms?: string;
  validityDays?: number;
  files?: string[];
  status?: 'received' | 'normalized' | 'evaluated';
  score?: {
    price: number;
    quality: number;
    leadTime: number;
    compliance: number;
    risk: number;
    total: number;
  };
}

export interface CreateContractInput {
  projectId: string;
  vendorId: string;
  rfpId?: string;
  name: string;
  itemIds: string[];
  amount: number;
  currency: 'EUR' | 'USD';
  terms: {
    milestones?: {
      label: string;
      amount: number;
      dueAt: number;
    }[];
    penalties?: string;
    bonuses?: string;
    retentionPct?: number;
  };
  files?: string[];
}

export interface UpdateContractInput {
  name?: string;
  itemIds?: string[];
  amount?: number;
  currency?: 'EUR' | 'USD';
  terms?: {
    milestones?: {
      label: string;
      amount: number;
      dueAt: number;
    }[];
    penalties?: string;
    bonuses?: string;
    retentionPct?: number;
  };
  status?: 'draft' | 'signed' | 'active' | 'completed' | 'cancelled';
  files?: string[];
}

export interface CreateSalInput {
  projectId: string;
  contractId: string;
  number: number;
  date: number;
  amount: number;
  attachments?: string[];
  notes?: string;
}

export interface UpdateSalInput {
  number?: number;
  date?: number;
  amount?: number;
  attachments?: string[];
  notes?: string;
}

// Query filters
export interface TypologyFilters {
  projectId: string;
  finishLevel?: 'basic' | 'standard' | 'premium';
}

export interface BoqItemFilters {
  projectId: string;
  typologyId?: string;
  category?: ItemCategory;
  status?: 'draft' | 'rfp' | 'awarded' | 'contracted' | 'in_progress' | 'done';
  level?: 'rough' | 'definitive' | 'executive';
}

export interface RfpFilters {
  projectId: string;
  status?: 'draft' | 'sent' | 'collecting' | 'closed';
}

export interface OfferFilters {
  projectId: string;
  rfpId?: string;
  vendorId?: string;
  status?: 'received' | 'normalized' | 'evaluated';
}

export interface ContractFilters {
  projectId: string;
  vendorId?: string;
  status?: 'draft' | 'signed' | 'active' | 'completed' | 'cancelled';
}

export interface SalFilters {
  projectId: string;
  contractId?: string;
}
