/**
 * 🔄 SYNC BUSINESS PLAN API
 * 
 * API per sincronizzazione costi contrattualizzati con Business Plan
 */

import { BudgetSuppliersRepository } from './repo';
import { BusinessPlanInput, BusinessPlanOutput } from '../../businessPlan/lib/types';

export interface CategoryMapping {
  budgetSupplierCategory: string;
  businessPlanCategory: string;
  businessPlanField: string;
  description: string;
}

export interface ContractCosts {
  category: string;
  budgetAmount: number;
  contractAmount: number;
  consuntivoAmount: number;
  variationsAmount: number;
  finalAmount: number;
  driftPercentage: number;
}

export interface BusinessPlanSyncResult {
  projectId: string;
  businessPlanId: string;
  beforeMetrics: BusinessPlanMetrics;
  afterMetrics: BusinessPlanMetrics;
  costUpdates: ContractCosts[];
  impactAnalysis: ImpactAnalysis;
  syncTimestamp: number;
}

export interface BusinessPlanMetrics {
  totalRevenue: number;
  totalCosts: number;
  margin: number;
  marginPercentage: number;
  npv: number;
  irr: number;
  dscr: number;
  paybackPeriod: number;
}

export interface ImpactAnalysis {
  costChange: number;
  marginChange: number;
  marginPercentageChange: number;
  npvChange: number;
  irrChange: number;
  dscrChange: number;
  paybackPeriodChange: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// Mappatura categorie Budget Suppliers → Business Plan
const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    budgetSupplierCategory: 'Strutture',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'constructionBreakdown.structure',
    description: 'Costi strutturali'
  },
  {
    budgetSupplierCategory: 'Impianti',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'constructionBreakdown.systems',
    description: 'Costi impianti'
  },
  {
    budgetSupplierCategory: 'Finiture',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'constructionBreakdown.finishes',
    description: 'Costi finiture'
  },
  {
    budgetSupplierCategory: 'Scavi e Fondazioni',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'constructionBreakdown.excavation',
    description: 'Costi scavi e fondazioni'
  },
  {
    budgetSupplierCategory: 'Opere Esterne',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'constructionBreakdown.external',
    description: 'Costi opere esterne'
  },
  {
    budgetSupplierCategory: 'Progettazione',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'softCosts.breakdown.design',
    description: 'Costi progettazione'
  },
  {
    budgetSupplierCategory: 'Permessi',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'softCosts.breakdown.permits',
    description: 'Costi permessi'
  },
  {
    budgetSupplierCategory: 'Marketing',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'softCosts.breakdown.marketing',
    description: 'Costi marketing'
  },
  {
    budgetSupplierCategory: 'Legali',
    businessPlanCategory: 'costConfig',
    businessPlanField: 'softCosts.breakdown.legal',
    description: 'Costi legali'
  }
];

export class BusinessPlanSyncService {
  
  // Ottieni costi contrattualizzati per progetto
  static async getContractCosts(projectId: string): Promise<ContractCosts[]> {
    try {
      console.log('🔄 [SYNC] Recupero costi contrattualizzati:', projectId);
      
      // Ottieni items del progetto
      const items = await BudgetSuppliersRepository.items.listByProject({ projectId });
      
      // Ottieni contratti del progetto
      const contracts = await BudgetSuppliersRepository.contracts.listByProject({ projectId });
      
      // Ottieni SAL per calcolare consuntivo
      const sals = await BudgetSuppliersRepository.sals.listByProject({ projectId });
      
      // Ottieni varianti per calcolare variazioni
      const variations = await BudgetSuppliersRepository.variations.listByProject({ projectId });
      
      // Raggruppa per categoria
      const categories = [...new Set(items.map(item => item.category))];
      
      const contractCosts: ContractCosts[] = [];
      
      for (const category of categories) {
        const categoryItems = items.filter(item => item.category === category);
        
        let budgetAmount = 0;
        let contractAmount = 0;
        let consuntivoAmount = 0;
        let variationsAmount = 0;
        
        for (const item of categoryItems) {
          // Budget originale
          budgetAmount += item.budgetPrice || 0;
          
          // Contratto
          const itemContract = contracts.find(c => 
            c.items.some(ci => ci.itemId === item.id)
          );
          
          if (itemContract) {
            const contractItem = itemContract.items.find(ci => ci.itemId === item.id);
            if (contractItem) {
              contractAmount += contractItem.totalPrice;
            }
          }
          
          // Consuntivo (SAL approvati)
          const itemSals = sals.filter(sal => 
            sal.itemId === item.id && sal.status === 'approved'
          );
          consuntivoAmount += itemSals.reduce((sum, sal) => sum + sal.amount, 0);
          
          // Varianti (approvate)
          const itemVariations = variations.filter(v => 
            v.itemId === item.id && v.status === 'approved'
          );
          variationsAmount += itemVariations.reduce((sum, v) => sum + v.amount, 0);
        }
        
        const finalAmount = contractAmount + variationsAmount;
        const driftPercentage = contractAmount > 0 ? 
          ((finalAmount - contractAmount) / contractAmount) * 100 : 0;
        
        contractCosts.push({
          category,
          budgetAmount,
          contractAmount,
          consuntivoAmount,
          variationsAmount,
          finalAmount,
          driftPercentage
        });
      }
      
      console.log('✅ [SYNC] Costi contrattualizzati recuperati:', contractCosts.length);
      return contractCosts;
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore recupero costi:', error);
      throw new Error(`Errore recupero costi contrattualizzati: ${error.message}`);
    }
  }

  // Sincronizza Business Plan con costi contrattualizzati
  static async syncBusinessPlan(
    projectId: string,
    businessPlanId: string
  ): Promise<BusinessPlanSyncResult> {
    try {
      console.log('🔄 [SYNC] Sincronizzazione Business Plan:', { projectId, businessPlanId });
      
      // Ottieni Business Plan corrente
      const businessPlan = await this.getBusinessPlan(businessPlanId);
      if (!businessPlan) {
        throw new Error('Business Plan non trovato');
      }
      
      // Calcola metriche prima della sincronizzazione
      const beforeMetrics = this.calculateBusinessPlanMetrics(businessPlan);
      
      // Ottieni costi contrattualizzati
      const contractCosts = await this.getContractCosts(projectId);
      
      // Aggiorna Business Plan con costi contrattualizzati
      const updatedBusinessPlan = await this.updateBusinessPlanWithContractCosts(
        businessPlan,
        contractCosts
      );
      
      // Calcola metriche dopo la sincronizzazione
      const afterMetrics = this.calculateBusinessPlanMetrics(updatedBusinessPlan);
      
      // Analizza impatto
      const impactAnalysis = this.analyzeImpact(beforeMetrics, afterMetrics);
      
      // Salva Business Plan aggiornato
      await this.saveUpdatedBusinessPlan(businessPlanId, updatedBusinessPlan);
      
      const result: BusinessPlanSyncResult = {
        projectId,
        businessPlanId,
        beforeMetrics,
        afterMetrics,
        costUpdates: contractCosts,
        impactAnalysis,
        syncTimestamp: Date.now()
      };
      
      console.log('✅ [SYNC] Business Plan sincronizzato:', result);
      return result;
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore sincronizzazione:', error);
      throw new Error(`Errore sincronizzazione Business Plan: ${error.message}`);
    }
  }

  // Ottieni Business Plan per ID
  static async getBusinessPlan(businessPlanId: string): Promise<BusinessPlanInput | null> {
    try {
      // Simula recupero Business Plan (in produzione useresti il servizio esistente)
      const mockBusinessPlan: BusinessPlanInput = {
        projectName: 'Progetto Test',
        location: 'Roma',
        type: 'RESIDENTIAL',
        totalUnits: 10,
        revenueConfig: {
          method: 'PER_UNIT',
          averagePrice: 300000,
          salesCommission: 3,
          discounts: 0,
          salesCalendar: [
            { period: 't1', units: 5 },
            { period: 't2', units: 5 }
          ]
        },
        costConfig: {
          constructionMethod: 'DETAILED',
          constructionBreakdown: {
            excavation: 100000,
            structure: 400000,
            systems: 200000,
            finishes: 300000,
            external: 50000
          },
          contingency: 5,
          softCosts: {
            percentage: 8,
            breakdown: {
              permits: 2,
              design: 3,
              legal: 1,
              marketing: 2
            }
          }
        },
        financeConfig: {
          discountRate: 12,
          debt: {
            enabled: false,
            amount: 0,
            interestRate: 4.5,
            term: 20,
            ltv: 0,
            dscr: 1.2,
            fees: 0,
            amortizationType: 'FRENCH'
          }
        },
        timingConfig: {
          constructionTimeline: [
            { phase: 'Fondazioni', period: 't0' },
            { phase: 'Struttura', period: 't1' },
            { phase: 'Finiture', period: 't2' }
          ],
          permitDelay: 6
        },
        targets: {
          margin: 15,
          minimumDSCR: 1.2
        },
        landScenarios: [{
          id: 'default-scenario',
          name: 'Scenario Base',
          type: 'CASH',
          upfrontPayment: 200000,
          description: 'Scenario Base'
        }]
      };
      
      return mockBusinessPlan;
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore recupero Business Plan:', error);
      return null;
    }
  }

  // Aggiorna Business Plan con costi contrattualizzati
  static async updateBusinessPlanWithContractCosts(
    businessPlan: BusinessPlanInput,
    contractCosts: ContractCosts[]
  ): Promise<BusinessPlanInput> {
    try {
      console.log('🔄 [SYNC] Aggiornamento Business Plan con costi contrattualizzati');
      
      const updatedBusinessPlan = { ...businessPlan };
      
      // Applica mappature categoria per categoria
      for (const contractCost of contractCosts) {
        const mapping = CATEGORY_MAPPINGS.find(m => 
          m.budgetSupplierCategory === contractCost.category
        );
        
        if (mapping) {
          // Aggiorna il campo specifico nel Business Plan
          this.updateBusinessPlanField(
            updatedBusinessPlan,
            mapping.businessPlanField,
            contractCost.finalAmount
          );
        }
      }
      
      // Ricalcola costi totali
      this.recalculateTotalCosts(updatedBusinessPlan);
      
      console.log('✅ [SYNC] Business Plan aggiornato con costi contrattualizzati');
      return updatedBusinessPlan;
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore aggiornamento Business Plan:', error);
      throw error;
    }
  }

  // Aggiorna campo specifico nel Business Plan
  static updateBusinessPlanField(
    businessPlan: BusinessPlanInput,
    fieldPath: string,
    value: number
  ): void {
    const pathParts = fieldPath.split('.');
    let current: any = businessPlan;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
  }

  // Ricalcola costi totali
  static recalculateTotalCosts(businessPlan: BusinessPlanInput): void {
    const costConfig = businessPlan.costConfig;
    
    if (costConfig?.constructionBreakdown) {
      const breakdown = costConfig.constructionBreakdown;
      const totalConstruction = 
        (breakdown.excavation || 0) +
        (breakdown.structure || 0) +
        (breakdown.systems || 0) +
        (breakdown.finishes || 0) +
        (breakdown.external || 0);
      
      costConfig.totalConstructionCost = totalConstruction;
    }
    
    if (costConfig?.softCosts) {
      const softCosts = costConfig.softCosts;
      const totalSoftCosts = Object.values(softCosts.breakdown || {}).reduce(
        (sum, value) => sum + (typeof value === 'number' ? value : 0), 0
      );
      
      softCosts.total = totalSoftCosts;
    }
  }

  // Calcola metriche Business Plan
  static calculateBusinessPlanMetrics(businessPlan: BusinessPlanInput): BusinessPlanMetrics {
    // Calcola ricavi totali
    let totalRevenue = 0;
    if (businessPlan.revenueConfig?.method === 'PER_UNIT' && businessPlan.revenueConfig?.averagePrice) {
      totalRevenue = (businessPlan.totalUnits || 0) * businessPlan.revenueConfig.averagePrice;
    }
    
    // Calcola costi totali
    let totalCosts = 0;
    
    // Costi terreno
    if (businessPlan.landScenarios && businessPlan.landScenarios.length > 0) {
      totalCosts += businessPlan.landScenarios.reduce((sum, scenario) => {
        if (scenario.type === 'CASH') {
          return sum + (scenario.upfrontPayment || 0);
        }
        return sum;
      }, 0);
    }
    
    // Costi costruzione
    if (businessPlan.costConfig?.totalConstructionCost) {
      totalCosts += businessPlan.costConfig.totalConstructionCost;
    }
    
    // Soft costs
    if (businessPlan.costConfig?.softCosts?.total) {
      totalCosts += businessPlan.costConfig.softCosts.total;
    }
    
    // Contingency
    if (businessPlan.costConfig?.contingency && businessPlan.costConfig?.totalConstructionCost) {
      totalCosts += (businessPlan.costConfig.totalConstructionCost * businessPlan.costConfig.contingency) / 100;
    }
    
    // Calcola margine
    const margin = totalRevenue - totalCosts;
    const marginPercentage = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
    
    // Calcola NPV, IRR, DSCR (simplified)
    const discountRate = businessPlan.financeConfig?.discountRate || 12;
    const npv = this.calculateNPV(totalRevenue, totalCosts, discountRate);
    const irr = this.calculateIRR(totalRevenue, totalCosts);
    const dscr = this.calculateDSCR(totalRevenue, totalCosts, businessPlan.financeConfig?.debt);
    const paybackPeriod = this.calculatePaybackPeriod(totalRevenue, totalCosts);
    
    return {
      totalRevenue,
      totalCosts,
      margin,
      marginPercentage,
      npv,
      irr,
      dscr,
      paybackPeriod
    };
  }

  // Calcola NPV (simplified)
  static calculateNPV(revenue: number, costs: number, discountRate: number): number {
    const netCashFlow = revenue - costs;
    return netCashFlow / Math.pow(1 + discountRate / 100, 1);
  }

  // Calcola IRR (simplified)
  static calculateIRR(revenue: number, costs: number): number {
    const netCashFlow = revenue - costs;
    return netCashFlow > 0 ? 15 : 5; // Simplified calculation
  }

  // Calcola DSCR (simplified)
  static calculateDSCR(revenue: number, costs: number, debt?: any): number {
    if (!debt?.enabled) return 0;
    
    const netOperatingIncome = revenue - costs;
    const debtService = debt.amount * (debt.interestRate / 100);
    
    return debtService > 0 ? netOperatingIncome / debtService : 0;
  }

  // Calcola Payback Period (simplified)
  static calculatePaybackPeriod(revenue: number, costs: number): number {
    const netCashFlow = revenue - costs;
    return netCashFlow > 0 ? costs / netCashFlow : 0;
  }

  // Analizza impatto della sincronizzazione
  static analyzeImpact(
    beforeMetrics: BusinessPlanMetrics,
    afterMetrics: BusinessPlanMetrics
  ): ImpactAnalysis {
    const costChange = afterMetrics.totalCosts - beforeMetrics.totalCosts;
    const marginChange = afterMetrics.margin - beforeMetrics.margin;
    const marginPercentageChange = afterMetrics.marginPercentage - beforeMetrics.marginPercentage;
    const npvChange = afterMetrics.npv - beforeMetrics.npv;
    const irrChange = afterMetrics.irr - beforeMetrics.irr;
    const dscrChange = afterMetrics.dscr - beforeMetrics.dscr;
    const paybackPeriodChange = afterMetrics.paybackPeriod - beforeMetrics.paybackPeriod;
    
    // Determina livello di impatto
    let impactLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (Math.abs(marginPercentageChange) > 20) {
      impactLevel = 'critical';
    } else if (Math.abs(marginPercentageChange) > 10) {
      impactLevel = 'high';
    } else if (Math.abs(marginPercentageChange) > 5) {
      impactLevel = 'medium';
    }
    
    // Genera raccomandazioni
    const recommendations: string[] = [];
    
    if (marginPercentageChange < -5) {
      recommendations.push('Considerare negoziazione con fornitori per ridurre costi');
      recommendations.push('Valutare alternative progettuali per ottimizzare budget');
    }
    
    if (npvChange < 0) {
      recommendations.push('Rivedere strategia finanziaria per migliorare NPV');
    }
    
    if (dscrChange < 0 && afterMetrics.dscr < 1.2) {
      recommendations.push('Attenzione: DSCR sotto soglia minima, rivedere struttura debito');
    }
    
    return {
      costChange,
      marginChange,
      marginPercentageChange,
      npvChange,
      irrChange,
      dscrChange,
      paybackPeriodChange,
      impactLevel,
      recommendations
    };
  }

  // Salva Business Plan aggiornato
  static async saveUpdatedBusinessPlan(
    businessPlanId: string,
    updatedBusinessPlan: BusinessPlanInput
  ): Promise<void> {
    try {
      console.log('💾 [SYNC] Salvataggio Business Plan aggiornato:', businessPlanId);
      
      // Simula salvataggio (in produzione useresti il servizio esistente)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [SYNC] Business Plan salvato');
      
    } catch (error: any) {
      console.error('❌ [SYNC] Errore salvataggio Business Plan:', error);
      throw error;
    }
  }

  // Ottieni mappature categorie
  static getCategoryMappings(): CategoryMapping[] {
    return CATEGORY_MAPPINGS;
  }

  // Valida sincronizzazione
  static validateSync(projectId: string, businessPlanId: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!projectId) {
      errors.push('Project ID mancante');
    }
    
    if (!businessPlanId) {
      errors.push('Business Plan ID mancante');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
