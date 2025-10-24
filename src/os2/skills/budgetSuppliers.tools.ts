/**
 * 🛠️ BUDGET SUPPLIERS OS TOOLS
 * 
 * Tools OS per controllo modulo Budget & Suppliers
 */

import { z } from 'zod';
import { SkillMeta } from '../SkillCatalog';
import { 
  handleGenerateBoQ,
  handleLaunchRFP,
  handleIngestOffer,
  handleCompareOffers,
  handleCreateBundleContract,
  handleSyncBusinessPlan
} from '../../modules/budgetSuppliers/osTools/handlers';

// Tool 1: Genera BoQ
export const generateBoQMeta: SkillMeta = {
  id: 'budget_suppliers.generate_boq',
  name: 'Genera Computo Metrico',
  description: 'Genera computo metrico (BoQ) per progetto basato su tipologie e livello di dettaglio',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
    projectId: z.string().describe('ID del progetto'),
    typologies: z.array(z.object({
      name: z.string().describe('Nome della tipologia (es. Bilocale, Trilocale)'),
      unitsCount: z.number().int().positive().describe('Numero di unità per questa tipologia'),
      areaMq: z.number().positive().describe('Superficie media in metri quadri'),
      finishLevel: z.enum(['economico', 'standard', 'premium']).describe('Livello di finitura')
    })).min(1).describe('Lista delle tipologie da includere nel computo'),
    level: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed').describe('Livello di dettaglio del computo')
  }),
  outputsSchema: z.object({
    success: z.boolean(),
    boqId: z.string().optional(),
    itemsCount: z.number().optional(),
    totalBudget: z.number().optional(),
    categories: z.array(z.string()).optional(),
    error: z.string().optional()
  }),
  latencyBudgetMs: 10000,
  telemetryKey: 'budget_suppliers.generate_boq',
  tags: ['boq', 'computo', 'tipologie', 'budget']
};

export async function generateBoQInvoke(inputs: z.infer<typeof generateBoQMeta.inputsSchema>, ctx: any) {
  return await handleGenerateBoQ(inputs);
}

// Tool 2: Lancia RFP
export const launchRFPMeta: SkillMeta = {
  id: 'budget_suppliers.launch_rfp',
  name: 'Lancia RFP',
  description: 'Lancia Request for Proposal (RFP) per items specifici a fornitori selezionati',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
    projectId: z.string().describe('ID del progetto'),
    itemIds: z.array(z.string()).min(1).describe('Lista degli ID degli items da includere nell\'RFP'),
    vendorIds: z.array(z.string()).min(1).describe('Lista degli ID dei fornitori da invitare'),
    dueAt: z.string().describe('Data di scadenza RFP (ISO string)'),
    rules: z.object({
      hideBudget: z.boolean().default(true).describe('Nascondere budget ai fornitori'),
      allowPartialOffers: z.boolean().default(false).describe('Permettere offerte parziali'),
      requireAttachments: z.boolean().default(true).describe('Richiedere allegati'),
      maxVariations: z.number().int().min(0).default(0).describe('Numero massimo di varianti consentite')
    }).optional().describe('Regole specifiche per l\'RFP')
  }),
  outputsSchema: z.object({
    success: z.boolean(),
    rfpId: z.string().optional(),
    invitationsSent: z.number().optional(),
    itemsCount: z.number().optional(),
    vendorsCount: z.number().optional(),
    error: z.string().optional()
  }),
  latencyBudgetMs: 15000,
  telemetryKey: 'budget_suppliers.launch_rfp',
  tags: ['rfp', 'fornitori', 'inviti', 'procurement']
};

export async function launchRFPInvoke(inputs: z.infer<typeof launchRFPMeta.inputsSchema>, ctx: any) {
  return await handleLaunchRFP(inputs);
}

// Tool 3: Importa Offerta
export const ingestOfferMeta: SkillMeta = {
  id: 'budget_suppliers.ingest_offer',
  name: 'Importa Offerta',
  description: 'Importa e normalizza offerta da fornitore (file o dati manuali)',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
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
  outputsSchema: z.object({
    success: z.boolean(),
    offerId: z.string().optional(),
    itemsProcessed: z.number().optional(),
    totalValue: z.number().optional(),
    parsingErrors: z.array(z.string()).optional(),
    error: z.string().optional()
  }),
  latencyBudgetMs: 20000,
  telemetryKey: 'budget_suppliers.ingest_offer',
  tags: ['offerta', 'import', 'parsing', 'normalizzazione']
};

export async function ingestOfferInvoke(inputs: z.infer<typeof ingestOfferMeta.inputsSchema>, ctx: any) {
  return await handleIngestOffer(inputs);
}

// Tool 4: Confronta Offerte
export const compareOffersMeta: SkillMeta = {
  id: 'budget_suppliers.compare_offers',
  name: 'Confronta Offerte',
  description: 'Confronta tutte le offerte ricevute per un RFP e identifica la migliore',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
    projectId: z.string().describe('ID del progetto'),
    rfpId: z.string().describe('ID dell\'RFP da confrontare')
  }),
  outputsSchema: z.object({
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
  }),
  latencyBudgetMs: 12000,
  telemetryKey: 'budget_suppliers.compare_offers',
  tags: ['confronto', 'offerte', 'analisi', 'migliore']
};

export async function compareOffersInvoke(inputs: z.infer<typeof compareOffersMeta.inputsSchema>, ctx: any) {
  return await handleCompareOffers(inputs);
}

// Tool 5: Crea Contratto Bundle
export const createBundleContractMeta: SkillMeta = {
  id: 'budget_suppliers.create_bundle_contract',
  name: 'Crea Contratto Bundle',
  description: 'Crea contratto bundle basato su aggiudicazioni specifiche',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
    projectId: z.string().describe('ID del progetto'),
    rfpId: z.string().describe('ID dell\'RFP'),
    awards: z.array(z.object({
      itemId: z.string().describe('ID dell\'item aggiudicato'),
      vendorId: z.string().describe('ID del fornitore vincitore')
    })).min(1).describe('Lista delle aggiudicazioni per item'),
    milestones: z.array(z.object({
      name: z.string().describe('Nome della milestone (es. Anticipo, Sal)'),
      percentage: z.number().min(0).max(100).describe('Percentuale di pagamento'),
      description: z.string().describe('Descrizione della milestone')
    })).min(1).describe('Milestone di pagamento per il contratto')
  }),
  outputsSchema: z.object({
    success: z.boolean(),
    contractId: z.string().optional(),
    bundleId: z.string().optional(),
    totalValue: z.number().optional(),
    vendorsCount: z.number().optional(),
    itemsCount: z.number().optional(),
    error: z.string().optional()
  }),
  latencyBudgetMs: 15000,
  telemetryKey: 'budget_suppliers.create_bundle_contract',
  tags: ['contratto', 'bundle', 'aggiudicazione', 'milestone']
};

export async function createBundleContractInvoke(inputs: z.infer<typeof createBundleContractMeta.inputsSchema>, ctx: any) {
  return await handleCreateBundleContract(inputs);
}

// Tool 6: Sincronizza Business Plan
export const syncBusinessPlanMeta: SkillMeta = {
  id: 'budget_suppliers.sync_business_plan',
  name: 'Sincronizza Business Plan',
  description: 'Sincronizza Business Plan con costi contrattualizzati aggiornati',
  category: 'budget_suppliers',
  visibility: 'global',
  rbac: ['editor', 'admin'],
  inputsSchema: z.object({
    projectId: z.string().describe('ID del progetto')
  }),
  outputsSchema: z.object({
    success: z.boolean(),
    businessPlanId: z.string().optional(),
    costUpdates: z.number().optional(),
    marginChange: z.number().optional(),
    npvChange: z.number().optional(),
    irrChange: z.number().optional(),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    recommendations: z.array(z.string()).optional(),
    error: z.string().optional()
  }),
  latencyBudgetMs: 18000,
  telemetryKey: 'budget_suppliers.sync_business_plan',
  tags: ['sync', 'business_plan', 'costi', 'metriche']
};

export async function syncBusinessPlanInvoke(inputs: z.infer<typeof syncBusinessPlanMeta.inputsSchema>, ctx: any) {
  return await handleSyncBusinessPlan(inputs);
}
