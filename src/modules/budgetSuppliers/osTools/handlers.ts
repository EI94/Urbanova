/**
 * 🛠️ BUDGET SUPPLIERS OS HANDLERS
 * 
 * Handlers per esecuzione tools OS Budget & Suppliers
 */

import { z } from 'zod';
import { BudgetSuppliersRepository } from '../api/repo';
import { BusinessPlanSyncService } from '../api/syncBusinessPlan';
import { RfpService } from '../api/rfp';
import { OfferService } from '../api/offer';
import { CompareService } from '../api/compare';
import { ContractService } from '../api/contract';
import { BudgetSuppliersEvents } from './tools';
import { BudgetSuppliersRBAC, BudgetSuppliersRole, BudgetSuppliersPermission } from '../lib/permissions';
import { BudgetSuppliersAudit, BudgetSuppliersAuditAction } from '../lib/audit';

// Event emitter per status tracking
interface EventEmitter {
  emit(event: string, data?: any): void;
}

let eventEmitter: EventEmitter | null = null;

export function setEventEmitter(emitter: EventEmitter) {
  eventEmitter = emitter;
}

function emitEvent(event: string, data?: any) {
  if (eventEmitter) {
    eventEmitter.emit(event, data);
  }
}

// Helper per controllo RBAC e audit
async function checkPermissionAndAudit(
  userId: string,
  userRole: BudgetSuppliersRole,
  projectId: string,
  permission: BudgetSuppliersPermission,
  action: BudgetSuppliersAuditAction,
  entityType: 'boq' | 'item' | 'rfp' | 'offer' | 'contract' | 'sal' | 'variation' | 'business_plan' | 'system',
  entityId: string,
  entityName: string,
  options?: {
    vendorScope?: any;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    errorMessage?: string;
  }
): Promise<{ allowed: boolean; reason?: string }> {
  
  // Controllo RBAC
  const rbacCheck = await BudgetSuppliersRBAC.checkPermission(
    {
      userId,
      userRole,
      projectId,
      vendorScope: options?.vendorScope,
      entityId,
      entityType
    },
    permission
  );
  
  if (!rbacCheck.allowed) {
    // Log tentativo di accesso negato
    await BudgetSuppliersAudit.logSimple(
      userId,
      userRole,
      action,
      entityType,
      entityId,
      projectId,
      permission,
      false,
      `Accesso negato: ${rbacCheck.reason}`
    );
    
    return rbacCheck;
  }
  
  // Log operazione autorizzata
  await BudgetSuppliersAudit.logCritical(
    userId,
    `user${userId}@example.com`, // Simula email
    userRole,
    action,
    entityType,
    entityId,
    entityName,
    projectId,
    permission,
    options?.oldValues,
    options?.newValues,
    {
      vendorScope: options?.vendorScope,
      errorMessage: options?.errorMessage
    }
  );
  
  return { allowed: true };
}

// Handler per generazione BoQ
export async function handleGenerateBoQ(params: {
  projectId: string;
  typologies: Array<{
    name: string;
    unitsCount: number;
    areaMq: number;
    finishLevel: 'economico' | 'standard' | 'premium';
  }>;
  level: 'summary' | 'detailed' | 'comprehensive';
  userId?: string;
  userRole?: BudgetSuppliersRole;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.BOQ_START, { projectId: params.projectId });
    
    console.log('🛠️ [OS] Generazione BoQ:', params);
    
    // Controllo RBAC e audit
    const userId = params.userId || 'system';
    const userRole = params.userRole || BudgetSuppliersRole.PROJECT_MANAGER;
    const boqId = `boq_${params.projectId}_${Date.now()}`;
    
    const permissionCheck = await checkPermissionAndAudit(
      userId,
      userRole,
      params.projectId,
      BudgetSuppliersPermission.CREATE_BOQ,
      BudgetSuppliersAuditAction.CREATE_BOQ,
      'boq',
      boqId,
      `BoQ ${params.projectId}`,
      {
        newValues: {
          typologies: params.typologies,
          level: params.level,
          itemsCount: 0,
          totalBudget: 0
        }
      }
    );
    
    if (!permissionCheck.allowed) {
      return {
        success: false,
        error: `Accesso negato: ${permissionCheck.reason}`
      };
    }
    
    // Elabora tipologie
    emitEvent(BudgetSuppliersEvents.BOQ_TYPOLOGIES_PROCESSING, { 
      typologiesCount: params.typologies.length 
    });
    
    const items: any[] = [];
    let totalBudget = 0;
    const categories = new Set<string>();
    
    // Genera items per ogni tipologia
    emitEvent(BudgetSuppliersEvents.BOQ_ITEMS_GENERATION, { 
      typologies: params.typologies.map(t => t.name) 
    });
    
    for (const typology of params.typologies) {
      // Genera items basati su tipologia e livello di finitura
      const typologyItems = generateTypologyItems(typology, params.level);
      items.push(...typologyItems);
      
      // Calcola budget totale
      totalBudget += typologyItems.reduce((sum, item) => sum + (item.budgetPrice || 0), 0);
      
      // Raccoglie categorie
      typologyItems.forEach(item => categories.add(item.category));
    }
    
    // Crea categorie
    emitEvent(BudgetSuppliersEvents.BOQ_CATEGORIES_CREATION, { 
      categories: Array.from(categories) 
    });
    
    // Salva items nel repository
    const savedItems = [];
    for (const item of items) {
      const savedItem = await BudgetSuppliersRepository.items.create({
        projectId: params.projectId,
        description: item.description,
        category: item.category,
        uom: item.uom,
        qty: item.qty,
        budgetPrice: item.budgetPrice,
        status: 'pending'
      });
      savedItems.push(savedItem);
    }
    
    emitEvent(BudgetSuppliersEvents.BOQ_COMPLETE, { 
      itemsCount: savedItems.length,
      totalBudget,
      categories: Array.from(categories)
    });
    
    // Log completamento operazione
    await BudgetSuppliersAudit.logCritical(
      userId,
      `user${userId}@example.com`,
      userRole,
      BudgetSuppliersAuditAction.CREATE_BOQ,
      'boq',
      boqId,
      `BoQ ${params.projectId}`,
      params.projectId,
      BudgetSuppliersPermission.CREATE_BOQ,
      undefined,
      {
        itemsCount: savedItems.length,
        totalBudget,
        categories: Array.from(categories),
        typologies: params.typologies,
        level: params.level
      }
    );
    
    return {
      success: true,
      boqId: boqId,
      itemsCount: savedItems.length,
      totalBudget,
      categories: Array.from(categories)
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore generazione BoQ:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler per lancio RFP
export async function handleLaunchRFP(params: {
  projectId: string;
  itemIds: string[];
  vendorIds: string[];
  dueAt: string;
  rules?: {
    hideBudget?: boolean;
    allowPartialOffers?: boolean;
    requireAttachments?: boolean;
    maxVariations?: number;
  };
  userId?: string;
  userRole?: BudgetSuppliersRole;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.RFP_START, { 
      projectId: params.projectId,
      itemsCount: params.itemIds.length,
      vendorsCount: params.vendorIds.length
    });
    
    console.log('🛠️ [OS] Lancio RFP:', params);
    
    // Controllo RBAC e audit
    const userId = params.userId || 'system';
    const userRole = params.userRole || BudgetSuppliersRole.PROJECT_MANAGER;
    const rfpId = `rfp_${params.projectId}_${Date.now()}`;
    
    const permissionCheck = await checkPermissionAndAudit(
      userId,
      userRole,
      params.projectId,
      BudgetSuppliersPermission.CREATE_RFP,
      BudgetSuppliersAuditAction.CREATE_RFP,
      'rfp',
      rfpId,
      `RFP ${params.projectId}`,
      {
        newValues: {
          itemIds: params.itemIds,
          vendorIds: params.vendorIds,
          dueAt: params.dueAt,
          rules: params.rules
        }
      }
    );
    
    if (!permissionCheck.allowed) {
      return {
        success: false,
        error: `Accesso negato: ${permissionCheck.reason}`
      };
    }
    
    // Filtra items
    emitEvent(BudgetSuppliersEvents.RFP_ITEMS_FILTERING, { 
      itemIds: params.itemIds 
    });
    
    const items = [];
    for (const itemId of params.itemIds) {
      const item = await BudgetSuppliersRepository.items.getById(itemId);
      if (item) {
        items.push(item);
      }
    }
    
    // Seleziona fornitori
    emitEvent(BudgetSuppliersEvents.RFP_VENDORS_SELECTION, { 
      vendorIds: params.vendorIds 
    });
    
    const vendors = [];
    for (const vendorId of params.vendorIds) {
      // Simula recupero fornitore (in produzione useresti repository fornitori)
      vendors.push({
        id: vendorId,
        name: `Fornitore ${vendorId}`,
        email: `vendor${vendorId}@example.com`
      });
    }
    
    // Crea RFP
    const rfpData = {
      projectId: params.projectId,
      name: `RFP ${new Date().toLocaleDateString('it-IT')}`,
      description: `RFP per ${items.length} items`,
      items: items.map(item => ({
        itemId: item.id,
        description: item.description,
        category: item.category,
        uom: item.uom,
        qty: item.qty,
        budgetPrice: item.budgetPrice
      })),
      vendors: vendors.map(vendor => ({
        vendorId: vendor.id,
        vendorName: vendor.name,
        email: vendor.email
      })),
      dueAt: new Date(params.dueAt).getTime(),
      rules: {
        hideBudget: params.rules?.hideBudget ?? true,
        allowPartialOffers: params.rules?.allowPartialOffers ?? false,
        requireAttachments: params.rules?.requireAttachments ?? true,
        maxVariations: params.rules?.maxVariations ?? 0
      },
      status: 'active'
    };
    
    const rfp = await RfpService.createRFP(rfpData);
    
    // Invia inviti
    emitEvent(BudgetSuppliersEvents.RFP_INVITATIONS_SENDING, { 
      vendorsCount: vendors.length 
    });
    
    let invitationsSent = 0;
    for (const vendor of vendors) {
      try {
        await RfpService.sendRfpInvitation(rfp.id, vendor.id, vendor.email);
        invitationsSent++;
      } catch (error) {
        console.error('❌ [OS] Errore invio invito:', error);
      }
    }
    
    emitEvent(BudgetSuppliersEvents.RFP_COMPLETE, { 
      rfpId: rfp.id,
      invitationsSent
    });
    
    return {
      success: true,
      rfpId: rfp.id,
      invitationsSent,
      itemsCount: items.length,
      vendorsCount: vendors.length
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore lancio RFP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler per importazione offerta
export async function handleIngestOffer(params: {
  projectId: string;
  rfpId: string;
  vendorId: string;
  fileUrl?: string;
  lines?: Array<{
    itemId: string;
    unitPrice: number;
    notes?: string;
    exclusions?: string;
  }>;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.OFFER_START, { 
      projectId: params.projectId,
      rfpId: params.rfpId,
      vendorId: params.vendorId
    });
    
    console.log('🛠️ [OS] Importazione offerta:', params);
    
    let itemsProcessed = 0;
    let totalValue = 0;
    const parsingErrors: string[] = [];
    
    if (params.fileUrl) {
      // Parsing file
      emitEvent(BudgetSuppliersEvents.OFFER_FILE_PARSING, { 
        fileUrl: params.fileUrl 
      });
      
      // Simula parsing file (in produzione useresti OfferParser)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simula dati estratti
      const extractedLines = [
        { itemId: 'item1', unitPrice: 150, notes: 'Prezzo competitivo' },
        { itemId: 'item2', unitPrice: 200, notes: 'Include trasporto' }
      ];
      
      // Normalizzazione
      emitEvent(BudgetSuppliersEvents.OFFER_NORMALIZATION, { 
        linesCount: extractedLines.length 
      });
      
      for (const line of extractedLines) {
        try {
          const offerData = {
            rfpId: params.rfpId,
            vendorId: params.vendorId,
            itemId: line.itemId,
            unitPrice: line.unitPrice,
            notes: line.notes,
            status: 'received'
          };
          
          await OfferService.submitOffer(offerData);
          itemsProcessed++;
          totalValue += line.unitPrice;
          
        } catch (error: any) {
          parsingErrors.push(`Errore item ${line.itemId}: ${error.message}`);
        }
      }
      
    } else if (params.lines) {
      // Dati manuali
      emitEvent(BudgetSuppliersEvents.OFFER_NORMALIZATION, { 
        linesCount: params.lines.length 
      });
      
      for (const line of params.lines) {
        try {
          const offerData = {
            rfpId: params.rfpId,
            vendorId: params.vendorId,
            itemId: line.itemId,
            unitPrice: line.unitPrice,
            notes: line.notes,
            exclusions: line.exclusions,
            status: 'received'
          };
          
          await OfferService.submitOffer(offerData);
          itemsProcessed++;
          totalValue += line.unitPrice;
          
        } catch (error: any) {
          parsingErrors.push(`Errore item ${line.itemId}: ${error.message}`);
        }
      }
    }
    
    // Validazione
    emitEvent(BudgetSuppliersEvents.OFFER_VALIDATION, { 
      itemsProcessed,
      totalValue
    });
    
    emitEvent(BudgetSuppliersEvents.OFFER_COMPLETE, { 
      itemsProcessed,
      totalValue,
      errorsCount: parsingErrors.length
    });
    
    return {
      success: true,
      offerId: `offer_${params.rfpId}_${params.vendorId}_${Date.now()}`,
      itemsProcessed,
      totalValue,
      parsingErrors
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore importazione offerta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler per confronto offerte
export async function handleCompareOffers(params: {
  projectId: string;
  rfpId: string;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.COMPARISON_START, { 
      projectId: params.projectId,
      rfpId: params.rfpId
    });
    
    console.log('🛠️ [OS] Confronto offerte:', params);
    
    // Recupera offerte
    const offers = await OfferService.getOffersByRfp(params.rfpId);
    
    // Analisi offerte
    emitEvent(BudgetSuppliersEvents.COMPARISON_ANALYSIS, { 
      offersCount: offers.length 
    });
    
    // Calcolo punteggi
    emitEvent(BudgetSuppliersEvents.COMPARISON_SCORING, { 
      offersCount: offers.length 
    });
    
    const comparison = await CompareService.compareOffers(offers);
    
    // Classificazione risultati
    emitEvent(BudgetSuppliersEvents.COMPARISON_RANKING, { 
      vendorsCount: comparison.vendorScores.length 
    });
    
    const bestOffer = comparison.vendorScores[0];
    const savings = comparison.totalSavings || 0;
    
    const recommendations = [];
    if (savings > 0) {
      recommendations.push(`Risparmio potenziale: €${savings.toLocaleString()}`);
    }
    if (comparison.vendorScores.length > 1) {
      recommendations.push(`Confrontare con ${comparison.vendorScores.length - 1} altri fornitori`);
    }
    
    emitEvent(BudgetSuppliersEvents.COMPARISON_COMPLETE, { 
      bestVendor: bestOffer?.vendorName,
      savings
    });
    
    return {
      success: true,
      comparisonId: `comparison_${params.rfpId}_${Date.now()}`,
      totalOffers: offers.length,
      bestOffer: bestOffer ? {
        vendorId: bestOffer.vendorName,
        vendorName: bestOffer.vendorName,
        totalValue: bestOffer.totalScore,
        score: bestOffer.score
      } : undefined,
      savings,
      recommendations
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore confronto offerte:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler per creazione contratto bundle
export async function handleCreateBundleContract(params: {
  projectId: string;
  rfpId: string;
  awards: Array<{
    itemId: string;
    vendorId: string;
  }>;
  milestones: Array<{
    name: string;
    percentage: number;
    description: string;
  }>;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.CONTRACT_START, { 
      projectId: params.projectId,
      rfpId: params.rfpId,
      awardsCount: params.awards.length
    });
    
    console.log('🛠️ [OS] Creazione contratto bundle:', params);
    
    // Crea bundle
    emitEvent(BudgetSuppliersEvents.CONTRACT_BUNDLE_CREATION, { 
      awardsCount: params.awards.length 
    });
    
    const bundleItems = [];
    let totalValue = 0;
    const vendors = new Set<string>();
    
    for (const award of params.awards) {
      // Recupera item e calcola valore
      const item = await BudgetSuppliersRepository.items.getById(award.itemId);
      if (item) {
        bundleItems.push({
          itemId: award.itemId,
          vendorName: award.vendorId,
          unitPrice: item.budgetPrice || 0,
          totalPrice: (item.budgetPrice || 0) * (item.qty || 1),
          qty: item.qty || 1,
          uom: item.uom || 'pz',
          description: item.description || '',
          category: item.category || 'Generale'
        });
        
        totalValue += (item.budgetPrice || 0) * (item.qty || 1);
        vendors.add(award.vendorId);
      }
    }
    
    // Configurazione milestone
    emitEvent(BudgetSuppliersEvents.CONTRACT_MILESTONES_SETUP, { 
      milestonesCount: params.milestones.length 
    });
    
    const bundle: any = {
      id: `bundle_${params.rfpId}_${Date.now()}`,
      name: `Bundle ${params.rfpId}`,
      vendorName: Array.from(vendors).join(', '),
      items: bundleItems,
      totalValue,
      milestones: params.milestones.map(milestone => ({
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: milestone.name,
        percentage: milestone.percentage,
        amount: (totalValue * milestone.percentage) / 100,
        description: milestone.description,
        conditions: []
      })),
      retention: 5,
      penalties: [],
      bonuses: []
    };
    
    // Validazione contratto
    emitEvent(BudgetSuppliersEvents.CONTRACT_VALIDATION, { 
      totalValue,
      vendorsCount: vendors.size
    });
    
    const contract = await ContractService.createContractFromBundle(bundle);
    
    emitEvent(BudgetSuppliersEvents.CONTRACT_COMPLETE, { 
      contractId: contract.id,
      totalValue
    });
    
    return {
      success: true,
      contractId: contract.id,
      bundleId: bundle.id,
      totalValue,
      vendorsCount: vendors.size,
      itemsCount: bundleItems.length
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore creazione contratto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handler per sincronizzazione Business Plan
export async function handleSyncBusinessPlan(params: {
  projectId: string;
}) {
  try {
    emitEvent(BudgetSuppliersEvents.SYNC_START, { 
      projectId: params.projectId
    });
    
    console.log('🛠️ [OS] Sincronizzazione Business Plan:', params);
    
    // Recupera costi contrattualizzati
    emitEvent(BudgetSuppliersEvents.SYNC_COSTS_RETRIEVAL, { 
      projectId: params.projectId
    });
    
    const contractCosts = await BusinessPlanSyncService.getContractCosts(params.projectId);
    
    // Mappatura categorie
    emitEvent(BudgetSuppliersEvents.SYNC_MAPPING, { 
      categoriesCount: contractCosts.length
    });
    
    // Simula Business Plan ID (in produzione useresti il servizio esistente)
    const businessPlanId = `bp_${params.projectId}`;
    
    // Calcolo metriche
    emitEvent(BudgetSuppliersEvents.SYNC_METRICS_CALCULATION, { 
      costUpdatesCount: contractCosts.length
    });
    
    const syncResult = await BusinessPlanSyncService.syncBusinessPlan(
      params.projectId,
      businessPlanId
    );
    
    // Analisi impatto
    emitEvent(BudgetSuppliersEvents.SYNC_IMPACT_ANALYSIS, { 
      impactLevel: syncResult.impactAnalysis.impactLevel
    });
    
    emitEvent(BudgetSuppliersEvents.SYNC_COMPLETE, { 
      marginChange: syncResult.impactAnalysis.marginPercentageChange,
      npvChange: syncResult.impactAnalysis.npvChange
    });
    
    return {
      success: true,
      businessPlanId: syncResult.businessPlanId,
      costUpdates: contractCosts.length,
      marginChange: syncResult.impactAnalysis.marginPercentageChange,
      npvChange: syncResult.impactAnalysis.npvChange,
      irrChange: syncResult.impactAnalysis.irrChange,
      impactLevel: syncResult.impactAnalysis.impactLevel,
      recommendations: syncResult.impactAnalysis.recommendations
    };
    
  } catch (error: any) {
    console.error('❌ [OS] Errore sincronizzazione Business Plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Funzione helper per generare items da tipologia
function generateTypologyItems(typology: {
  name: string;
  unitsCount: number;
  areaMq: number;
  finishLevel: 'economico' | 'standard' | 'premium';
}, level: 'summary' | 'detailed' | 'comprehensive') {
  const items = [];
  
  // Items base per ogni tipologia
  const baseItems = [
    { category: 'Strutture', description: 'Struttura portante', uom: 'mq', basePrice: 300 },
    { category: 'Impianti', description: 'Impianto elettrico', uom: 'mq', basePrice: 80 },
    { category: 'Impianti', description: 'Impianto idraulico', uom: 'mq', basePrice: 60 },
    { category: 'Finiture', description: 'Pavimenti', uom: 'mq', basePrice: 50 },
    { category: 'Finiture', description: 'Rivestimenti', uom: 'mq', basePrice: 40 }
  ];
  
  // Moltiplicatori per livello di finitura
  const finishMultipliers = {
    economico: 0.8,
    standard: 1.0,
    premium: 1.3
  };
  
  const multiplier = finishMultipliers[typology.finishLevel];
  
  for (const baseItem of baseItems) {
    const price = baseItem.basePrice * multiplier;
    const qty = typology.areaMq * typology.unitsCount;
    
    items.push({
      description: `${baseItem.description} - ${typology.name}`,
      category: baseItem.category,
      uom: baseItem.uom,
      qty: qty,
      budgetPrice: price
    });
  }
  
  return items;
}
