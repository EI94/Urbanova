/**
 * 🔄 REFRESH FROM SUPPLIERS API
 * 
 * API per aggiornamento Business Plan dai dati fornitori
 */

import { BusinessPlanSyncService, ContractCosts, BusinessPlanSyncResult } from '../budgetSuppliers/api/syncBusinessPlan';
import { BusinessPlanInput, BusinessPlanOutput } from '../businessPlan/lib/types';

export interface RefreshRequest {
  projectId: string;
  businessPlanId: string;
  forceRefresh?: boolean;
}

export interface RefreshResult {
  success: boolean;
  result?: BusinessPlanSyncResult;
  error?: string;
  timestamp: number;
}

export interface BusinessPlanUpdate {
  businessPlanId: string;
  updatedFields: Record<string, any>;
  costUpdates: ContractCosts[];
  metricsChange: {
    before: any;
    after: any;
  };
}

export class BusinessPlanRefreshService {
  
  // Aggiorna Business Plan dai dati fornitori
  static async refreshBusinessPlanFromSuppliers(
    projectId: string,
    businessPlanId: string,
    forceRefresh: boolean = false
  ): Promise<RefreshResult> {
    try {
      console.log('🔄 [REFRESH] Aggiornamento Business Plan dai fornitori:', { projectId, businessPlanId });
      
      // Valida input
      const validation = BusinessPlanSyncService.validateSync(projectId, businessPlanId);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          timestamp: Date.now()
        };
      }
      
      // Verifica se è necessario aggiornamento
      if (!forceRefresh) {
        const needsUpdate = await this.checkIfUpdateNeeded(projectId, businessPlanId);
        if (!needsUpdate) {
          return {
            success: true,
            result: undefined,
            timestamp: Date.now()
          };
        }
      }
      
      // Esegui sincronizzazione
      const syncResult = await BusinessPlanSyncService.syncBusinessPlan(projectId, businessPlanId);
      
      // Salva log aggiornamento
      await this.logBusinessPlanUpdate(syncResult);
      
      console.log('✅ [REFRESH] Business Plan aggiornato con successo');
      
      return {
        success: true,
        result: syncResult,
        timestamp: Date.now()
      };
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore aggiornamento Business Plan:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Verifica se è necessario aggiornamento
  static async checkIfUpdateNeeded(projectId: string, businessPlanId: string): Promise<boolean> {
    try {
      console.log('🔍 [REFRESH] Verifica necessità aggiornamento:', { projectId, businessPlanId });
      
      // Ottieni ultimo aggiornamento Business Plan
      const lastBusinessPlanUpdate = await this.getLastBusinessPlanUpdate(businessPlanId);
      
      // Ottieni ultimo aggiornamento contratti
      const lastContractUpdate = await this.getLastContractUpdate(projectId);
      
      // Se non ci sono aggiornamenti contratti dopo l'ultimo aggiornamento BP, non serve refresh
      if (lastBusinessPlanUpdate && lastContractUpdate) {
        return lastContractUpdate > lastBusinessPlanUpdate;
      }
      
      // Se non ci sono dati precedenti, sempre aggiorna
      return true;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore verifica aggiornamento:', error);
      return true; // In caso di errore, procedi con l'aggiornamento
    }
  }

  // Ottieni ultimo aggiornamento Business Plan
  static async getLastBusinessPlanUpdate(businessPlanId: string): Promise<number | null> {
    try {
      // Simula recupero ultimo aggiornamento (in produzione useresti database)
      const mockLastUpdate = Date.now() - (24 * 60 * 60 * 1000); // 24 ore fa
      return mockLastUpdate;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore recupero ultimo aggiornamento BP:', error);
      return null;
    }
  }

  // Ottieni ultimo aggiornamento contratti
  static async getLastContractUpdate(projectId: string): Promise<number | null> {
    try {
      // Simula recupero ultimo aggiornamento contratti (in produzione useresti database)
      const mockLastUpdate = Date.now() - (2 * 60 * 60 * 1000); // 2 ore fa
      return mockLastUpdate;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore recupero ultimo aggiornamento contratti:', error);
      return null;
    }
  }

  // Log aggiornamento Business Plan
  static async logBusinessPlanUpdate(syncResult: BusinessPlanSyncResult): Promise<void> {
    try {
      console.log('📝 [REFRESH] Log aggiornamento Business Plan:', syncResult.businessPlanId);
      
      const logEntry = {
        businessPlanId: syncResult.businessPlanId,
        projectId: syncResult.projectId,
        syncTimestamp: syncResult.syncTimestamp,
        impactLevel: syncResult.impactAnalysis.impactLevel,
        marginChange: syncResult.impactAnalysis.marginPercentageChange,
        costUpdates: syncResult.costUpdates.length,
        beforeMetrics: syncResult.beforeMetrics,
        afterMetrics: syncResult.afterMetrics
      };
      
      // Simula salvataggio log (in produzione useresti database)
      console.log('📊 [REFRESH] Log entry:', logEntry);
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore log aggiornamento:', error);
    }
  }

  // Ottieni storico aggiornamenti Business Plan
  static async getBusinessPlanUpdateHistory(businessPlanId: string): Promise<BusinessPlanUpdate[]> {
    try {
      console.log('📚 [REFRESH] Recupero storico aggiornamenti:', businessPlanId);
      
      // Simula recupero storico (in produzione useresti database)
      const mockHistory: BusinessPlanUpdate[] = [
        {
          businessPlanId,
          updatedFields: {
            'costConfig.constructionBreakdown.structure': 450000,
            'costConfig.constructionBreakdown.systems': 220000
          },
          costUpdates: [
            {
              category: 'Strutture',
              budgetAmount: 400000,
              contractAmount: 450000,
              consuntivoAmount: 0,
              variationsAmount: 0,
              finalAmount: 450000,
              driftPercentage: 12.5
            }
          ],
          metricsChange: {
            before: {
              margin: 15.2,
              npv: 1200000,
              irr: 18.5
            },
            after: {
              margin: 13.8,
              npv: 1100000,
              irr: 17.2
            }
          }
        }
      ];
      
      return mockHistory;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore recupero storico:', error);
      return [];
    }
  }

  // Calcola impatto potenziale senza applicare modifiche
  static async calculatePotentialImpact(
    projectId: string,
    businessPlanId: string
  ): Promise<{
    costChange: number;
    marginImpact: number;
    recommendations: string[];
  }> {
    try {
      console.log('🔮 [REFRESH] Calcolo impatto potenziale:', { projectId, businessPlanId });
      
      // Ottieni costi contrattualizzati
      const contractCosts = await BusinessPlanSyncService.getContractCosts(projectId);
      
      // Ottieni Business Plan corrente
      const businessPlan = await BusinessPlanSyncService.getBusinessPlan(businessPlanId);
      if (!businessPlan) {
        throw new Error('Business Plan non trovato');
      }
      
      // Calcola metriche correnti
      const currentMetrics = BusinessPlanSyncService.calculateBusinessPlanMetrics(businessPlan);
      
      // Simula aggiornamento
      const updatedBusinessPlan = await BusinessPlanSyncService.updateBusinessPlanWithContractCosts(
        businessPlan,
        contractCosts
      );
      
      // Calcola metriche aggiornate
      const updatedMetrics = BusinessPlanSyncService.calculateBusinessPlanMetrics(updatedBusinessPlan);
      
      // Calcola impatto
      const costChange = updatedMetrics.totalCosts - currentMetrics.totalCosts;
      const marginImpact = updatedMetrics.marginPercentage - currentMetrics.marginPercentage;
      
      // Genera raccomandazioni
      const recommendations: string[] = [];
      
      if (marginImpact < -5) {
        recommendations.push('⚠️ Impatto significativo sul margine: considerare negoziazione fornitori');
      }
      
      if (costChange > 100000) {
        recommendations.push('💰 Incremento costi elevato: valutare alternative progettuali');
      }
      
      if (updatedMetrics.marginPercentage < 10) {
        recommendations.push('🚨 Margine sotto soglia critica: rivedere strategia commerciale');
      }
      
      return {
        costChange,
        marginImpact,
        recommendations
      };
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore calcolo impatto potenziale:', error);
      throw error;
    }
  }

  // Ottieni statistiche aggiornamenti
  static async getUpdateStatistics(projectId: string): Promise<{
    totalUpdates: number;
    averageMarginImpact: number;
    mostImpactedCategories: string[];
    lastUpdate: number;
  }> {
    try {
      console.log('📊 [REFRESH] Recupero statistiche aggiornamenti:', projectId);
      
      // Simula statistiche (in produzione useresti database)
      const mockStats = {
        totalUpdates: 12,
        averageMarginImpact: -2.3,
        mostImpactedCategories: ['Strutture', 'Impianti', 'Finiture'],
        lastUpdate: Date.now() - (3 * 60 * 60 * 1000) // 3 ore fa
      };
      
      return mockStats;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore recupero statistiche:', error);
      return {
        totalUpdates: 0,
        averageMarginImpact: 0,
        mostImpactedCategories: [],
        lastUpdate: 0
      };
    }
  }

  // Valida Business Plan dopo aggiornamento
  static validateBusinessPlanAfterUpdate(businessPlan: BusinessPlanInput): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Verifica margine minimo
    const metrics = BusinessPlanSyncService.calculateBusinessPlanMetrics(businessPlan);
    if (metrics.marginPercentage < 5) {
      errors.push('Margine sotto soglia critica (5%)');
    } else if (metrics.marginPercentage < 10) {
      warnings.push('Margine sotto soglia raccomandata (10%)');
    }
    
    // Verifica DSCR
    if (businessPlan.financeConfig?.debt?.enabled && metrics.dscr < 1.2) {
      errors.push('DSCR sotto soglia minima (1.2)');
    }
    
    // Verifica NPV positivo
    if (metrics.npv < 0) {
      warnings.push('NPV negativo: progetto non redditizio');
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  // Rollback aggiornamento Business Plan
  static async rollbackBusinessPlanUpdate(
    businessPlanId: string,
    updateTimestamp: number
  ): Promise<boolean> {
    try {
      console.log('↩️ [REFRESH] Rollback aggiornamento Business Plan:', { businessPlanId, updateTimestamp });
      
      // Simula rollback (in produzione useresti database con versioning)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [REFRESH] Rollback completato');
      return true;
      
    } catch (error: any) {
      console.error('❌ [REFRESH] Errore rollback:', error);
      return false;
    }
  }
}
