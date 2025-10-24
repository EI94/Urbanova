/**
 * 📊 PROGRESS API
 * 
 * API per gestione SAL, varianti e dashboard scostamenti
 */

import { BudgetSuppliersRepository } from './repo';
import { Sal, Contract, BoqItem, Variation, ProgressSnapshot } from '../lib/types';

export interface SalEntry {
  id: string;
  contractId: string;
  itemId: string;
  amount: number;
  percentage: number; // Percentuale completamento item
  description: string;
  date: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
  attachments?: string[];
  notes?: string;
}

export interface VariationEntry {
  id: string;
  contractId: string;
  itemId?: string; // Se null, variazione su contratto intero
  type: 'addition' | 'reduction' | 'modification';
  amount: number; // Delta positivo/negativo
  description: string;
  reason: string;
  justification: string;
  date: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
  version: number;
  previousVersion?: string;
}

export interface DriftMetrics {
  category: string;
  budget: number;
  bestOffer: number;
  contract: number;
  consuntivo: number;
  variations: number;
  driftPercentage: number;
  driftAmount: number;
  status: 'green' | 'yellow' | 'red';
  trend: 'up' | 'down' | 'stable';
}

export interface ProgressSummary {
  totalBudget: number;
  totalContract: number;
  totalConsuntivo: number;
  totalVariations: number;
  completionPercentage: number;
  driftPercentage: number;
  categories: DriftMetrics[];
  alerts: ProgressAlert[];
}

export interface ProgressAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: string;
  message: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export class ProgressService {
  
  // Registra SAL per contratto/item
  static async recordSal(
    contractId: string,
    itemId: string,
    amount: number,
    percentage: number,
    description: string,
    notes?: string,
    attachments?: string[]
  ): Promise<SalEntry> {
    try {
      console.log('📊 [PROGRESS] Registrazione SAL:', { contractId, itemId, amount });
      
      const salEntry: SalEntry = {
        id: `sal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contractId,
        itemId,
        amount,
        percentage,
        description,
        date: Date.now(),
        status: 'pending',
        notes,
        attachments
      };
      
      // Salva SAL nel repository
      await BudgetSuppliersRepository.sals.create({
        contractId,
        itemId,
        amount,
        percentage,
        description,
        date: salEntry.date,
        status: 'pending',
        notes,
        attachments
      });
      
      // Aggiorna stato item se completato
      if (percentage >= 100) {
        await this.updateItemStatus(itemId, 'done');
      } else if (percentage > 0) {
        await this.updateItemStatus(itemId, 'in_progress');
      }
      
      console.log('✅ [PROGRESS] SAL registrato:', salEntry.id);
      return salEntry;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore registrazione SAL:', error);
      throw new Error(`Errore registrazione SAL: ${error.message}`);
    }
  }

  // Approva SAL
  static async approveSal(salId: string, approvedBy: string): Promise<SalEntry> {
    try {
      console.log('📊 [PROGRESS] Approvazione SAL:', salId);
      
      const sal = await BudgetSuppliersRepository.sals.getById(salId);
      if (!sal) {
        throw new Error('SAL non trovato');
      }
      
      const updatedSal = await BudgetSuppliersRepository.sals.update(salId, {
        status: 'approved',
        approvedBy,
        approvedAt: Date.now()
      });
      
      console.log('✅ [PROGRESS] SAL approvato:', salId);
      return updatedSal;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore approvazione SAL:', error);
      throw new Error(`Errore approvazione SAL: ${error.message}`);
    }
  }

  // Registra variante
  static async recordVariation(
    contractId: string,
    itemId: string | null,
    type: 'addition' | 'reduction' | 'modification',
    amount: number,
    description: string,
    reason: string,
    justification: string
  ): Promise<VariationEntry> {
    try {
      console.log('📊 [PROGRESS] Registrazione variante:', { contractId, itemId, amount });
      
      // Ottieni versione corrente
      const existingVariations = await this.getContractVariations(contractId);
      const version = existingVariations.length + 1;
      
      const variationEntry: VariationEntry = {
        id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contractId,
        itemId,
        type,
        amount,
        description,
        reason,
        justification,
        date: Date.now(),
        status: 'pending',
        version,
        previousVersion: existingVariations.length > 0 ? existingVariations[existingVariations.length - 1].id : undefined
      };
      
      // Salva variante nel repository
      await BudgetSuppliersRepository.variations.create({
        contractId,
        itemId,
        type,
        amount,
        description,
        reason,
        justification,
        date: variationEntry.date,
        status: 'pending',
        version
      });
      
      console.log('✅ [PROGRESS] Variante registrata:', variationEntry.id);
      return variationEntry;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore registrazione variante:', error);
      throw new Error(`Errore registrazione variante: ${error.message}`);
    }
  }

  // Approva variante
  static async approveVariation(variationId: string, approvedBy: string): Promise<VariationEntry> {
    try {
      console.log('📊 [PROGRESS] Approvazione variante:', variationId);
      
      const variation = await BudgetSuppliersRepository.variations.getById(variationId);
      if (!variation) {
        throw new Error('Variante non trovata');
      }
      
      const updatedVariation = await BudgetSuppliersRepository.variations.update(variationId, {
        status: 'approved',
        approvedBy,
        approvedAt: Date.now()
      });
      
      console.log('✅ [PROGRESS] Variante approvata:', variationId);
      return updatedVariation;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore approvazione variante:', error);
      throw new Error(`Errore approvazione variante: ${error.message}`);
    }
  }

  // Ottieni SAL per contratto
  static async getContractSals(contractId: string): Promise<SalEntry[]> {
    try {
      console.log('📊 [PROGRESS] Get SAL per contratto:', contractId);
      
      const sals = await BudgetSuppliersRepository.sals.listByContract({ contractId });
      
      return sals.map(sal => ({
        id: sal.id,
        contractId: sal.contractId,
        itemId: sal.itemId,
        amount: sal.amount,
        percentage: sal.percentage,
        description: sal.description,
        date: sal.date,
        status: sal.status as 'pending' | 'approved' | 'rejected',
        approvedBy: sal.approvedBy,
        approvedAt: sal.approvedAt,
        attachments: sal.attachments,
        notes: sal.notes
      }));
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore get SAL:', error);
      throw new Error(`Errore get SAL: ${error.message}`);
    }
  }

  // Ottieni varianti per contratto
  static async getContractVariations(contractId: string): Promise<VariationEntry[]> {
    try {
      console.log('📊 [PROGRESS] Get varianti per contratto:', contractId);
      
      const variations = await BudgetSuppliersRepository.variations.listByContract({ contractId });
      
      return variations.map(variation => ({
        id: variation.id,
        contractId: variation.contractId,
        itemId: variation.itemId,
        type: variation.type as 'addition' | 'reduction' | 'modification',
        amount: variation.amount,
        description: variation.description,
        reason: variation.reason,
        justification: variation.justification,
        date: variation.date,
        status: variation.status as 'pending' | 'approved' | 'rejected',
        approvedBy: variation.approvedBy,
        approvedAt: variation.approvedAt,
        version: variation.version,
        previousVersion: variation.previousVersion
      }));
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore get varianti:', error);
      throw new Error(`Errore get varianti: ${error.message}`);
    }
  }

  // Calcola consuntivo per item
  static async getItemConsuntivo(itemId: string): Promise<number> {
    try {
      const sals = await BudgetSuppliersRepository.sals.listByItem({ itemId });
      const approvedSals = sals.filter(sal => sal.status === 'approved');
      
      return approvedSals.reduce((sum, sal) => sum + sal.amount, 0);
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore calcolo consuntivo:', error);
      return 0;
    }
  }

  // Calcola varianti per item
  static async getItemVariations(itemId: string): Promise<number> {
    try {
      const variations = await BudgetSuppliersRepository.variations.listByItem({ itemId });
      const approvedVariations = variations.filter(v => v.status === 'approved');
      
      return approvedVariations.reduce((sum, v) => sum + v.amount, 0);
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore calcolo varianti:', error);
      return 0;
    }
  }

  // Genera dashboard scostamenti
  static async generateDriftDashboard(projectId: string): Promise<ProgressSummary> {
    try {
      console.log('📊 [PROGRESS] Generazione dashboard scostamenti:', projectId);
      
      // Ottieni tutti gli items del progetto
      const items = await BudgetSuppliersRepository.items.listByProject({ projectId });
      
      // Ottieni contratti del progetto
      const contracts = await BudgetSuppliersRepository.contracts.listByProject({ projectId });
      
      // Raggruppa per categoria
      const categories = [...new Set(items.map(item => item.category))];
      
      const categoryMetrics: DriftMetrics[] = [];
      let totalBudget = 0;
      let totalContract = 0;
      let totalConsuntivo = 0;
      let totalVariations = 0;
      
      for (const category of categories) {
        const categoryItems = items.filter(item => item.category === category);
        
        let categoryBudget = 0;
        let categoryBestOffer = 0;
        let categoryContract = 0;
        let categoryConsuntivo = 0;
        let categoryVariations = 0;
        
        for (const item of categoryItems) {
          categoryBudget += item.budgetPrice || 0;
          categoryBestOffer += item.bestOfferPrice || 0;
          
          // Trova contratto per questo item
          const itemContract = contracts.find(c => 
            c.items.some(ci => ci.itemId === item.id)
          );
          
          if (itemContract) {
            const contractItem = itemContract.items.find(ci => ci.itemId === item.id);
            if (contractItem) {
              categoryContract += contractItem.totalPrice;
            }
          }
          
          // Calcola consuntivo e varianti
          const consuntivo = await this.getItemConsuntivo(item.id);
          const variations = await this.getItemVariations(item.id);
          
          categoryConsuntivo += consuntivo;
          categoryVariations += variations;
        }
        
        const driftAmount = categoryConsuntivo - categoryContract;
        const driftPercentage = categoryContract > 0 ? (driftAmount / categoryContract) * 100 : 0;
        
        // Determina status semaforo
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (Math.abs(driftPercentage) > 10) status = 'red';
        else if (Math.abs(driftPercentage) > 5) status = 'yellow';
        
        // Determina trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (driftAmount > 0) trend = 'up';
        else if (driftAmount < 0) trend = 'down';
        
        categoryMetrics.push({
          category,
          budget: categoryBudget,
          bestOffer: categoryBestOffer,
          contract: categoryContract,
          consuntivo: categoryConsuntivo,
          variations: categoryVariations,
          driftPercentage,
          driftAmount,
          status,
          trend
        });
        
        totalBudget += categoryBudget;
        totalContract += categoryContract;
        totalConsuntivo += categoryConsuntivo;
        totalVariations += categoryVariations;
      }
      
      // Calcola metriche totali
      const completionPercentage = totalContract > 0 ? (totalConsuntivo / totalContract) * 100 : 0;
      const driftPercentage = totalContract > 0 ? ((totalConsuntivo - totalContract) / totalContract) * 100 : 0;
      
      // Genera alert
      const alerts = this.generateProgressAlerts(categoryMetrics);
      
      const summary: ProgressSummary = {
        totalBudget,
        totalContract,
        totalConsuntivo,
        totalVariations,
        completionPercentage,
        driftPercentage,
        categories: categoryMetrics,
        alerts
      };
      
      console.log('✅ [PROGRESS] Dashboard generata:', summary);
      return summary;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore generazione dashboard:', error);
      throw new Error(`Errore generazione dashboard: ${error.message}`);
    }
  }

  // Genera alert per scostamenti
  static generateProgressAlerts(metrics: DriftMetrics[]): ProgressAlert[] {
    const alerts: ProgressAlert[] = [];
    
    for (const metric of metrics) {
      if (metric.status === 'red') {
        alerts.push({
          id: `alert_${metric.category}_${Date.now()}`,
          type: 'error',
          category: metric.category,
          message: `Scostamento critico: ${metric.driftPercentage.toFixed(1)}% (€${metric.driftAmount.toLocaleString()})`,
          suggestion: `Rivedere costi per ${metric.category} e considerare negoziazione con fornitore`,
          priority: 'high'
        });
      } else if (metric.status === 'yellow') {
        alerts.push({
          id: `alert_${metric.category}_${Date.now()}`,
          type: 'warning',
          category: metric.category,
          message: `Scostamento significativo: ${metric.driftPercentage.toFixed(1)}% (€${metric.driftAmount.toLocaleString()})`,
          suggestion: `Monitorare attentamente ${metric.category} per evitare ulteriori scostamenti`,
          priority: 'medium'
        });
      }
    }
    
    return alerts;
  }

  // Aggiorna stato item
  static async updateItemStatus(itemId: string, status: 'pending' | 'in_progress' | 'done'): Promise<void> {
    try {
      await BudgetSuppliersRepository.items.update(itemId, { status });
      console.log('✅ [PROGRESS] Stato item aggiornato:', itemId, status);
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore aggiornamento stato item:', error);
    }
  }

  // Ottieni snapshot progresso
  static async getProgressSnapshot(projectId: string): Promise<ProgressSnapshot> {
    try {
      const summary = await this.generateDriftDashboard(projectId);
      
      return {
        projectId,
        timestamp: Date.now(),
        summary,
        items: await BudgetSuppliersRepository.items.listByProject({ projectId }),
        contracts: await BudgetSuppliersRepository.contracts.listByProject({ projectId })
      };
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore snapshot progresso:', error);
      throw new Error(`Errore snapshot progresso: ${error.message}`);
    }
  }

  // Esporta report progresso
  static async exportProgressReport(projectId: string): Promise<Blob> {
    try {
      const snapshot = await this.getProgressSnapshot(projectId);
      
      const reportData = {
        projectId,
        generatedAt: new Date().toISOString(),
        summary: snapshot.summary,
        categories: snapshot.summary.categories,
        alerts: snapshot.summary.alerts
      };
      
      const data = JSON.stringify(reportData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      console.log('✅ [PROGRESS] Report esportato');
      return blob;
      
    } catch (error: any) {
      console.error('❌ [PROGRESS] Errore esportazione report:', error);
      throw new Error(`Errore esportazione report: ${error.message}`);
    }
  }
}
