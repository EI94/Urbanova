/**
 * 📋 CONTRACT API
 * 
 * API per gestione contratti e aggiudicazioni
 */

import { BudgetSuppliersRepository } from '../api/repo';
import { CreateContractInput, Contract, UpdateContractInput, ContractBundle } from '../lib/types';

export interface AwardItem {
  itemId: string;
  vendorName: string;
  unitPrice: number;
  totalPrice: number;
  qty: number;
  uom: string;
  description: string;
  category: string;
}

export interface AwardBundle {
  id: string;
  name: string;
  vendorName: string;
  items: AwardItem[];
  totalValue: number;
  milestones: ContractMilestone[];
  retention: number;
  penalties: ContractPenalty[];
  bonuses: ContractBonus[];
}

export interface ContractMilestone {
  id: string;
  name: string;
  percentage: number;
  description: string;
  dueDate?: number;
  conditions: string[];
}

export interface ContractPenalty {
  id: string;
  name: string;
  amount: number;
  conditions: string[];
  description: string;
}

export interface ContractBonus {
  id: string;
  name: string;
  amount: number;
  conditions: string[];
  description: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  milestones: ContractMilestone[];
  defaultRetention: number;
  defaultPenalties: ContractPenalty[];
  defaultBonuses: ContractBonus[];
}

// Mock contract templates
const mockTemplates: ContractTemplate[] = [
  {
    id: 'template-1',
    name: 'Contratto Standard Edilizia',
    description: 'Template standard per lavori edilizi',
    milestones: [
      {
        id: 'milestone-1',
        name: 'Anticipo',
        percentage: 30,
        description: 'Pagamento anticipato all\'avvio lavori',
        conditions: ['Firma contratto', 'Presentazione cauzione']
      },
      {
        id: 'milestone-2',
        name: 'Sal',
        percentage: 60,
        description: 'Pagamento al completamento lavori',
        conditions: ['Collaudo positivo', 'Documentazione completa']
      },
      {
        id: 'milestone-3',
        name: 'Retention',
        percentage: 10,
        description: 'Ritenuta di garanzia',
        conditions: ['Garanzia 24 mesi', 'Manutenzione ordinaria']
      }
    ],
    defaultRetention: 5,
    defaultPenalties: [
      {
        id: 'penalty-1',
        name: 'Ritardo consegna',
        amount: 0.5,
        conditions: ['Ritardo > 30 giorni'],
        description: 'Penale giornaliera per ritardo consegna'
      }
    ],
    defaultBonuses: [
      {
        id: 'bonus-1',
        name: 'Consegna anticipata',
        amount: 2,
        conditions: ['Consegna > 15 giorni prima'],
        description: 'Bonus per consegna anticipata'
      }
    ]
  }
];

export class ContractService {
  
  // Crea contratto da bundle aggiudicato
  static async createContractFromBundle(
    bundle: AwardBundle,
    templateId?: string
  ): Promise<Contract> {
    try {
      console.log('📋 [CONTRACT] Creazione contratto da bundle:', bundle.name);
      
      const template = templateId ? 
        mockTemplates.find(t => t.id === templateId) : 
        mockTemplates[0];
      
      if (!template) {
        throw new Error('Template contratto non trovato');
      }
      
      // Calcola milestone amounts
      const milestoneAmounts = bundle.milestones.map(milestone => ({
        ...milestone,
        amount: (bundle.totalValue * milestone.percentage) / 100
      }));
      
      const contractData: CreateContractInput = {
        projectId: 'test-project', // TODO: Passare projectId
        bundleId: bundle.id,
        vendorId: bundle.vendorName,
        vendorName: bundle.vendorName,
        totalValue: bundle.totalValue,
        milestones: milestoneAmounts,
        retention: bundle.retention,
        penalties: bundle.penalties,
        bonuses: bundle.bonuses,
        status: 'draft',
        items: bundle.items.map(item => ({
          itemId: item.itemId,
          description: item.description,
          category: item.category,
          uom: item.uom,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };
      
      const contract = await BudgetSuppliersRepository.contracts.create(contractData);
      
      console.log('✅ [CONTRACT] Contratto creato:', contract.id);
      return contract;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore creazione contratto:', error);
      throw new Error(`Errore creazione contratto: ${error.message}`);
    }
  }

  // Aggiorna contratto
  static async updateContract(id: string, input: UpdateContractInput): Promise<Contract> {
    try {
      console.log('📋 [CONTRACT] Aggiornamento contratto:', id);
      
      const contract = await BudgetSuppliersRepository.contracts.update(id, input);
      
      console.log('✅ [CONTRACT] Contratto aggiornato:', id);
      return contract;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore aggiornamento contratto:', error);
      throw new Error(`Errore aggiornamento contratto: ${error.message}`);
    }
  }

  // Ottieni contratto per ID
  static async getContractById(id: string): Promise<Contract | null> {
    try {
      console.log('📋 [CONTRACT] Get contratto by ID:', id);
      
      const contract = await BudgetSuppliersRepository.contracts.getById(id);
      
      return contract;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore get contratto:', error);
      throw new Error(`Errore get contratto: ${error.message}`);
    }
  }

  // Lista contratti per progetto
  static async listContracts(projectId: string): Promise<Contract[]> {
    try {
      console.log('📋 [CONTRACT] Lista contratti per progetto:', projectId);
      
      const contracts = await BudgetSuppliersRepository.contracts.listByProject({ projectId });
      
      console.log('✅ [CONTRACT] Trovati', contracts.length, 'contratti');
      return contracts;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore lista contratti:', error);
      throw new Error(`Errore lista contratti: ${error.message}`);
    }
  }

  // Elimina contratto
  static async deleteContract(id: string): Promise<void> {
    try {
      console.log('📋 [CONTRACT] Eliminazione contratto:', id);
      
      await BudgetSuppliersRepository.contracts.delete(id);
      
      console.log('✅ [CONTRACT] Contratto eliminato:', id);
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore eliminazione contratto:', error);
      throw new Error(`Errore eliminazione contratto: ${error.message}`);
    }
  }

  // Ottieni template contratti
  static async getContractTemplates(): Promise<ContractTemplate[]> {
    try {
      console.log('📋 [CONTRACT] Lista template contratti');
      
      return mockTemplates;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore template contratti:', error);
      throw new Error(`Errore template contratti: ${error.message}`);
    }
  }

  // Genera PDF contratto
  static async generateContractPDF(contract: Contract): Promise<Blob> {
    try {
      console.log('📄 [CONTRACT] Generazione PDF contratto:', contract.id);
      
      // Simula generazione PDF (in produzione useresti puppeteer o similar)
      const contractData = {
        contractId: contract.id,
        vendorName: contract.vendorName,
        totalValue: contract.totalValue,
        milestones: contract.milestones,
        items: contract.items,
        generatedAt: new Date().toISOString()
      };
      
      const data = JSON.stringify(contractData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      console.log('✅ [CONTRACT] PDF generato');
      return blob;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore generazione PDF:', error);
      throw new Error(`Errore generazione PDF: ${error.message}`);
    }
  }

  // Genera DOCX contratto
  static async generateContractDOCX(contract: Contract): Promise<Blob> {
    try {
      console.log('📄 [CONTRACT] Generazione DOCX contratto:', contract.id);
      
      // Simula generazione DOCX (in produzione useresti docx library)
      const contractData = {
        contractId: contract.id,
        vendorName: contract.vendorName,
        totalValue: contract.totalValue,
        milestones: contract.milestones,
        items: contract.items,
        generatedAt: new Date().toISOString()
      };
      
      const data = JSON.stringify(contractData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      
      console.log('✅ [CONTRACT] DOCX generato');
      return blob;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore generazione DOCX:', error);
      throw new Error(`Errore generazione DOCX: ${error.message}`);
    }
  }

  // Firma contratto (stub per integrazione firma)
  static async signContract(contractId: string, signatureData: any): Promise<Contract> {
    try {
      console.log('✍️ [CONTRACT] Firma contratto:', contractId);
      
      // Simula firma (in produzione integreresti con servizio firma esistente)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const contract = await this.updateContract(contractId, {
        status: 'signed',
        signedAt: Date.now(),
        signatureData: signatureData
      });
      
      console.log('✅ [CONTRACT] Contratto firmato:', contractId);
      return contract;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore firma contratto:', error);
      throw new Error(`Errore firma contratto: ${error.message}`);
    }
  }

  // Attiva contratto
  static async activateContract(contractId: string): Promise<Contract> {
    try {
      console.log('🚀 [CONTRACT] Attivazione contratto:', contractId);
      
      const contract = await this.updateContract(contractId, {
        status: 'active',
        activatedAt: Date.now()
      });
      
      console.log('✅ [CONTRACT] Contratto attivato:', contractId);
      return contract;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore attivazione contratto:', error);
      throw new Error(`Errore attivazione contratto: ${error.message}`);
    }
  }

  // Calcola milestone amounts
  static calculateMilestoneAmounts(
    totalValue: number, 
    milestones: ContractMilestone[]
  ): ContractMilestone[] {
    return milestones.map(milestone => ({
      ...milestone,
      amount: (totalValue * milestone.percentage) / 100
    }));
  }

  // Valida contratto
  static validateContract(contract: Partial<Contract>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!contract.vendorName) {
      errors.push('Nome fornitore mancante');
    }
    
    if (!contract.totalValue || contract.totalValue <= 0) {
      errors.push('Valore totale non valido');
    }
    
    if (!contract.milestones || contract.milestones.length === 0) {
      errors.push('Milestone mancanti');
    }
    
    if (contract.milestones) {
      const totalPercentage = contract.milestones.reduce((sum, m) => sum + m.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push('Percentuali milestone devono sommare 100%');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Ottieni statistiche contratti
  static async getContractStats(projectId: string): Promise<{
    totalContracts: number;
    totalValue: number;
    signedContracts: number;
    activeContracts: number;
    draftContracts: number;
  }> {
    try {
      const contracts = await this.listContracts(projectId);
      
      const stats = {
        totalContracts: contracts.length,
        totalValue: contracts.reduce((sum, c) => sum + c.totalValue, 0),
        signedContracts: contracts.filter(c => c.status === 'signed').length,
        activeContracts: contracts.filter(c => c.status === 'active').length,
        draftContracts: contracts.filter(c => c.status === 'draft').length
      };
      
      return stats;
      
    } catch (error: any) {
      console.error('❌ [CONTRACT] Errore statistiche contratti:', error);
      throw new Error(`Errore statistiche contratti: ${error.message}`);
    }
  }
}
