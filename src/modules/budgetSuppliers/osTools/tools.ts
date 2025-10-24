/**
 * 🛠️ BUDGET SUPPLIERS OS TOOLS
 * 
 * Definizione tools OS per controllo modulo Budget & Suppliers da chat
 */

import { z } from 'zod';

// Schema per tipologia
export const TypologySchema = z.object({
  name: z.string().describe('Nome della tipologia (es. Bilocale, Trilocale)'),
  unitsCount: z.number().int().positive().describe('Numero di unità per questa tipologia'),
  areaMq: z.number().positive().describe('Superficie media in metri quadri'),
  finishLevel: z.enum(['economico', 'standard', 'premium']).describe('Livello di finitura')
});

// Schema per milestone contratto
export const MilestoneSchema = z.object({
  name: z.string().describe('Nome della milestone (es. Anticipo, Sal)'),
  percentage: z.number().min(0).max(100).describe('Percentuale di pagamento'),
  description: z.string().describe('Descrizione della milestone')
});

// Schema per aggiudicazione
export const AwardSchema = z.object({
  itemId: z.string().describe('ID dell\'item aggiudicato'),
  vendorId: z.string().describe('ID del fornitore vincitore')
});

// Schema per regole RFP
export const RfpRulesSchema = z.object({
  hideBudget: z.boolean().default(true).describe('Nascondere budget ai fornitori'),
  allowPartialOffers: z.boolean().default(false).describe('Permettere offerte parziali'),
  requireAttachments: z.boolean().default(true).describe('Richiedere allegati'),
  maxVariations: z.number().int().min(0).default(0).describe('Numero massimo di varianti consentite')
});

// Tool 1: Genera BoQ
export const generateBoQTool = {
  name: 'generateBoQ',
  description: 'Genera computo metrico (BoQ) per progetto basato su tipologie e livello di dettaglio',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto'),
    typologies: z.array(TypologySchema).min(1).describe('Lista delle tipologie da includere nel computo'),
    level: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed').describe('Livello di dettaglio del computo')
  }),
  returns: z.object({
    success: z.boolean(),
    boqId: z.string().optional(),
    itemsCount: z.number().optional(),
    totalBudget: z.number().optional(),
    categories: z.array(z.string()).optional(),
    error: z.string().optional()
  })
};

// Tool 2: Lancia RFP
export const launchRFPTool = {
  name: 'launchRFP',
  description: 'Lancia Request for Proposal (RFP) per items specifici a fornitori selezionati',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto'),
    itemIds: z.array(z.string()).min(1).describe('Lista degli ID degli items da includere nell\'RFP'),
    vendorIds: z.array(z.string()).min(1).describe('Lista degli ID dei fornitori da invitare'),
    dueAt: z.string().describe('Data di scadenza RFP (ISO string)'),
    rules: RfpRulesSchema.optional().describe('Regole specifiche per l\'RFP')
  }),
  returns: z.object({
    success: z.boolean(),
    rfpId: z.string().optional(),
    invitationsSent: z.number().optional(),
    itemsCount: z.number().optional(),
    vendorsCount: z.number().optional(),
    error: z.string().optional()
  })
};

// Tool 3: Importa Offerta
export const ingestOfferTool = {
  name: 'ingestOffer',
  description: 'Importa e normalizza offerta da fornitore (file o dati manuali)',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto'),
    rfpId: z.string().describe('ID dell\'RFP'),
    vendorId: z.string().describe('ID del fornitore'),
    fileUrl: z.string().url().optional().describe('URL del file offerta (PDF/Excel)'),
    lines: z.array(z.object({
      itemId: z.string().describe('ID dell\'item'),
      unitPrice: z.number().positive().describe('Prezzo unitario'),
      notes: z.string().optional().describe('Note aggiuntive'),
      exclusions: z.string().optional().describe('Esclusioni specifiche')
    })).optional().describe('Dati offerta manuali (se non file)')
  }),
  returns: z.object({
    success: z.boolean(),
    offerId: z.string().optional(),
    itemsProcessed: z.number().optional(),
    totalValue: z.number().optional(),
    parsingErrors: z.array(z.string()).optional(),
    error: z.string().optional()
  })
};

// Tool 4: Confronta Offerte
export const compareOffersTool = {
  name: 'compareOffers',
  description: 'Confronta tutte le offerte ricevute per un RFP e identifica la migliore',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto'),
    rfpId: z.string().describe('ID dell\'RFP da confrontare')
  }),
  returns: z.object({
    success: z.boolean(),
    comparisonId: z.string().optional(),
    totalOffers: z.number().optional(),
    bestOffer: z.object({
      vendorId: z.string(),
      vendorName: z.string(),
      totalValue: z.number(),
      score: z.number()
    }).optional(),
    savings: z.number().optional(),
    recommendations: z.array(z.string()).optional(),
    error: z.string().optional()
  })
};

// Tool 5: Crea Contratto Bundle
export const createBundleContractTool = {
  name: 'createBundleContract',
  description: 'Crea contratto bundle basato su aggiudicazioni specifiche',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto'),
    rfpId: z.string().describe('ID dell\'RFP'),
    awards: z.array(AwardSchema).min(1).describe('Lista delle aggiudicazioni per item'),
    milestones: z.array(MilestoneSchema).min(1).describe('Milestone di pagamento per il contratto')
  }),
  returns: z.object({
    success: z.boolean(),
    contractId: z.string().optional(),
    bundleId: z.string().optional(),
    totalValue: z.number().optional(),
    vendorsCount: z.number().optional(),
    itemsCount: z.number().optional(),
    error: z.string().optional()
  })
};

// Tool 6: Sincronizza Business Plan
export const syncBusinessPlanTool = {
  name: 'syncBusinessPlan',
  description: 'Sincronizza Business Plan con costi contrattualizzati aggiornati',
  parameters: z.object({
    projectId: z.string().describe('ID del progetto')
  }),
  returns: z.object({
    success: z.boolean(),
    businessPlanId: z.string().optional(),
    costUpdates: z.number().optional(),
    marginChange: z.number().optional(),
    npvChange: z.number().optional(),
    irrChange: z.number().optional(),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    recommendations: z.array(z.string()).optional(),
    error: z.string().optional()
  })
};

// Lista completa dei tools
export const budgetSuppliersTools = [
  generateBoQTool,
  launchRFPTool,
  ingestOfferTool,
  compareOffersTool,
  createBundleContractTool,
  syncBusinessPlanTool
];

// Eventi per status tracking
export const BudgetSuppliersEvents = {
  // Eventi generazione BoQ
  BOQ_START: 'budget_suppliers.boq.start',
  BOQ_TYPOLOGIES_PROCESSING: 'budget_suppliers.boq.typologies_processing',
  BOQ_ITEMS_GENERATION: 'budget_suppliers.boq.items_generation',
  BOQ_CATEGORIES_CREATION: 'budget_suppliers.boq.categories_creation',
  BOQ_COMPLETE: 'budget_suppliers.boq.complete',
  
  // Eventi RFP
  RFP_START: 'budget_suppliers.rfp.start',
  RFP_ITEMS_FILTERING: 'budget_suppliers.rfp.items_filtering',
  RFP_VENDORS_SELECTION: 'budget_suppliers.rfp.vendors_selection',
  RFP_INVITATIONS_SENDING: 'budget_suppliers.rfp.invitations_sending',
  RFP_COMPLETE: 'budget_suppliers.rfp.complete',
  
  // Eventi offerte
  OFFER_START: 'budget_suppliers.offer.start',
  OFFER_FILE_PARSING: 'budget_suppliers.offer.file_parsing',
  OFFER_NORMALIZATION: 'budget_suppliers.offer.normalization',
  OFFER_VALIDATION: 'budget_suppliers.offer.validation',
  OFFER_COMPLETE: 'budget_suppliers.offer.complete',
  
  // Eventi confronto
  COMPARISON_START: 'budget_suppliers.comparison.start',
  COMPARISON_ANALYSIS: 'budget_suppliers.comparison.analysis',
  COMPARISON_SCORING: 'budget_suppliers.comparison.scoring',
  COMPARISON_RANKING: 'budget_suppliers.comparison.ranking',
  COMPARISON_COMPLETE: 'budget_suppliers.comparison.complete',
  
  // Eventi contratto
  CONTRACT_START: 'budget_suppliers.contract.start',
  CONTRACT_BUNDLE_CREATION: 'budget_suppliers.contract.bundle_creation',
  CONTRACT_MILESTONES_SETUP: 'budget_suppliers.contract.milestones_setup',
  CONTRACT_VALIDATION: 'budget_suppliers.contract.validation',
  CONTRACT_COMPLETE: 'budget_suppliers.contract.complete',
  
  // Eventi sincronizzazione BP
  SYNC_START: 'budget_suppliers.sync.start',
  SYNC_COSTS_RETRIEVAL: 'budget_suppliers.sync.costs_retrieval',
  SYNC_MAPPING: 'budget_suppliers.sync.mapping',
  SYNC_METRICS_CALCULATION: 'budget_suppliers.sync.metrics_calculation',
  SYNC_IMPACT_ANALYSIS: 'budget_suppliers.sync.impact_analysis',
  SYNC_COMPLETE: 'budget_suppliers.sync.complete'
} as const;

// Status messages per i18n
export const BudgetSuppliersStatusMessages = {
  // Generazione BoQ
  'budget_suppliers.boq.start': 'Generare computo…',
  'budget_suppliers.boq.typologies_processing': 'Elaborare tipologie…',
  'budget_suppliers.boq.items_generation': 'Generare items computo…',
  'budget_suppliers.boq.categories_creation': 'Creare categorie…',
  'budget_suppliers.boq.complete': 'Computo generato',
  
  // RFP
  'budget_suppliers.rfp.start': 'Preparare RFP…',
  'budget_suppliers.rfp.items_filtering': 'Filtrare items…',
  'budget_suppliers.rfp.vendors_selection': 'Selezionare fornitori…',
  'budget_suppliers.rfp.invitations_sending': 'Inviare inviti ai fornitori…',
  'budget_suppliers.rfp.complete': 'RFP lanciato',
  
  // Offerte
  'budget_suppliers.offer.start': 'Importare offerta…',
  'budget_suppliers.offer.file_parsing': 'Analizzare file…',
  'budget_suppliers.offer.normalization': 'Normalizzare dati…',
  'budget_suppliers.offer.validation': 'Validare offerta…',
  'budget_suppliers.offer.complete': 'Offerta importata',
  
  // Confronto
  'budget_suppliers.comparison.start': 'Confrontare offerte…',
  'budget_suppliers.comparison.analysis': 'Analizzare offerte…',
  'budget_suppliers.comparison.scoring': 'Calcolare punteggi…',
  'budget_suppliers.comparison.ranking': 'Classificare risultati…',
  'budget_suppliers.comparison.complete': 'Confronto completato',
  
  // Contratto
  'budget_suppliers.contract.start': 'Creare contratto…',
  'budget_suppliers.contract.bundle_creation': 'Creare bundle…',
  'budget_suppliers.contract.milestones_setup': 'Configurare milestone…',
  'budget_suppliers.contract.validation': 'Validare contratto…',
  'budget_suppliers.contract.complete': 'Contratto creato',
  
  // Sincronizzazione
  'budget_suppliers.sync.start': 'Sincronizzare Business Plan…',
  'budget_suppliers.sync.costs_retrieval': 'Recuperare costi…',
  'budget_suppliers.sync.mapping': 'Mappare categorie…',
  'budget_suppliers.sync.metrics_calculation': 'Calcolare metriche…',
  'budget_suppliers.sync.impact_analysis': 'Analizzare impatto…',
  'budget_suppliers.sync.complete': 'Sincronizzazione completata'
} as const;
