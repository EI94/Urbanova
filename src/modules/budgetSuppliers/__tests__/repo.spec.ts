/**
 * 🧪 BUDGET SUPPLIERS REPOSITORY TESTS
 * 
 * Test unitari per CRUD operations Budget & Suppliers
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BudgetSuppliersRepository } from '../api/repo';
import { 
  ItemCategory, 
  BoqItem, 
  Rfp, 
  Offer, 
  ContractBundle,
  Sal,
  Variation
} from '../lib/types';

// Mock data per test
const mockProjectId = 'test-project-123';
const mockUserId = 'test-user-456';

const mockItem: Omit<BoqItem, 'id'> = {
  projectId: mockProjectId,
  description: 'Test Item - Struttura portante',
  category: 'Strutture' as ItemCategory,
  uom: 'mq',
  qty: 100,
  budgetPrice: 300,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockRfp: Omit<Rfp, 'id'> = {
  projectId: mockProjectId,
  name: 'Test RFP - Strutture',
  description: 'RFP per test strutture',
  items: [
    {
      itemId: 'item-1',
      description: 'Struttura portante',
      category: 'Strutture' as ItemCategory,
      uom: 'mq',
      qty: 100,
      budgetPrice: 300
    }
  ],
  vendors: [
    {
      vendorId: 'vendor-1',
      vendorName: 'Test Vendor A',
      email: 'vendorA@test.com'
    }
  ],
  dueAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 giorni
  rules: {
    hideBudget: true,
    allowPartialOffers: false,
    requireAttachments: true,
    maxVariations: 0
  },
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockOffer: Omit<Offer, 'id'> = {
  rfpId: 'rfp-1',
  vendorId: 'vendor-1',
  vendorName: 'Test Vendor A',
  items: [
    {
      itemId: 'item-1',
      unitPrice: 280,
      totalPrice: 28000,
      notes: 'Prezzo competitivo',
      exclusions: undefined
    }
  ],
  attachments: [],
  status: 'received',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockContract: Omit<ContractBundle, 'id'> = {
  projectId: mockProjectId,
  name: 'Test Contract Bundle',
  vendorName: 'Test Vendor A',
  items: [
    {
      itemId: 'item-1',
      vendorName: 'Test Vendor A',
      unitPrice: 280,
      totalPrice: 28000,
      qty: 100,
      uom: 'mq',
      description: 'Struttura portante',
      category: 'Strutture' as ItemCategory
    }
  ],
  totalValue: 28000,
  milestones: [
    {
      id: 'milestone-1',
      name: 'Anticipo',
      percentage: 30,
      amount: 8400,
      description: 'Pagamento anticipato',
      conditions: []
    }
  ],
  retention: 5,
  penalties: [],
  bonuses: [],
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('BudgetSuppliersRepository', () => {
  
  describe('Items CRUD', () => {
    
    it('should create item successfully', async () => {
      const result = await BudgetSuppliersRepository.items.create(mockItem);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(mockProjectId);
      expect(result.description).toBe(mockItem.description);
      expect(result.category).toBe(mockItem.category);
      expect(result.uom).toBe(mockItem.uom);
      expect(result.qty).toBe(mockItem.qty);
      expect(result.budgetPrice).toBe(mockItem.budgetPrice);
      expect(result.status).toBe('pending');
    });
    
    it('should get item by id', async () => {
      const createdItem = await BudgetSuppliersRepository.items.create(mockItem);
      const retrievedItem = await BudgetSuppliersRepository.items.getById(createdItem.id);
      
      expect(retrievedItem).toBeDefined();
      expect(retrievedItem?.id).toBe(createdItem.id);
      expect(retrievedItem?.description).toBe(mockItem.description);
    });
    
    it('should update item successfully', async () => {
      const createdItem = await BudgetSuppliersRepository.items.create(mockItem);
      const updateData = {
        description: 'Updated Test Item',
        budgetPrice: 350,
        status: 'approved' as const
      };
      
      const updatedItem = await BudgetSuppliersRepository.items.update(createdItem.id, updateData);
      
      expect(updatedItem).toBeDefined();
      expect(updatedItem.description).toBe(updateData.description);
      expect(updatedItem.budgetPrice).toBe(updateData.budgetPrice);
      expect(updatedItem.status).toBe(updateData.status);
    });
    
    it('should list items by project', async () => {
      // Crea più items
      await BudgetSuppliersRepository.items.create(mockItem);
      await BudgetSuppliersRepository.items.create({
        ...mockItem,
        description: 'Test Item 2',
        category: 'Impianti' as ItemCategory
      });
      
      const items = await BudgetSuppliersRepository.items.listByProject({ projectId: mockProjectId });
      
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.every(item => item.projectId === mockProjectId)).toBe(true);
    });
    
    it('should delete item successfully', async () => {
      const createdItem = await BudgetSuppliersRepository.items.create(mockItem);
      
      const deleteResult = await BudgetSuppliersRepository.items.delete(createdItem.id);
      expect(deleteResult).toBe(true);
      
      const deletedItem = await BudgetSuppliersRepository.items.getById(createdItem.id);
      expect(deletedItem).toBeNull();
    });
  });
  
  describe('RFP CRUD', () => {
    
    it('should create RFP successfully', async () => {
      const result = await BudgetSuppliersRepository.rfps.create(mockRfp);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(mockProjectId);
      expect(result.name).toBe(mockRfp.name);
      expect(result.items.length).toBe(mockRfp.items.length);
      expect(result.vendors.length).toBe(mockRfp.vendors.length);
      expect(result.status).toBe('active');
    });
    
    it('should get RFP by id', async () => {
      const createdRfp = await BudgetSuppliersRepository.rfps.create(mockRfp);
      const retrievedRfp = await BudgetSuppliersRepository.rfps.getById(createdRfp.id);
      
      expect(retrievedRfp).toBeDefined();
      expect(retrievedRfp?.id).toBe(createdRfp.id);
      expect(retrievedRfp?.name).toBe(mockRfp.name);
    });
    
    it('should update RFP status', async () => {
      const createdRfp = await BudgetSuppliersRepository.rfps.create(mockRfp);
      const updateData = {
        status: 'closed' as const,
        name: 'Updated RFP Name'
      };
      
      const updatedRfp = await BudgetSuppliersRepository.rfps.update(createdRfp.id, updateData);
      
      expect(updatedRfp).toBeDefined();
      expect(updatedRfp.status).toBe('closed');
      expect(updatedRfp.name).toBe(updateData.name);
    });
    
    it('should list RFPs by project', async () => {
      await BudgetSuppliersRepository.rfps.create(mockRfp);
      await BudgetSuppliersRepository.rfps.create({
        ...mockRfp,
        name: 'Test RFP 2'
      });
      
      const rfps = await BudgetSuppliersRepository.rfps.listByProject({ projectId: mockProjectId });
      
      expect(rfps).toBeDefined();
      expect(rfps.length).toBeGreaterThanOrEqual(2);
      expect(rfps.every(rfp => rfp.projectId === mockProjectId)).toBe(true);
    });
  });
  
  describe('Offers CRUD', () => {
    
    it('should create offer successfully', async () => {
      const result = await BudgetSuppliersRepository.offers.create(mockOffer);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.rfpId).toBe(mockOffer.rfpId);
      expect(result.vendorId).toBe(mockOffer.vendorId);
      expect(result.items.length).toBe(mockOffer.items.length);
      expect(result.status).toBe('received');
    });
    
    it('should get offer by id', async () => {
      const createdOffer = await BudgetSuppliersRepository.offers.create(mockOffer);
      const retrievedOffer = await BudgetSuppliersRepository.offers.getById(createdOffer.id);
      
      expect(retrievedOffer).toBeDefined();
      expect(retrievedOffer?.id).toBe(createdOffer.id);
      expect(retrievedOffer?.vendorId).toBe(mockOffer.vendorId);
    });
    
    it('should list offers by RFP', async () => {
      await BudgetSuppliersRepository.offers.create(mockOffer);
      await BudgetSuppliersRepository.offers.create({
        ...mockOffer,
        vendorId: 'vendor-2',
        vendorName: 'Test Vendor B'
      });
      
      const offers = await BudgetSuppliersRepository.offers.listByRfp({ rfpId: mockOffer.rfpId });
      
      expect(offers).toBeDefined();
      expect(offers.length).toBeGreaterThanOrEqual(2);
      expect(offers.every(offer => offer.rfpId === mockOffer.rfpId)).toBe(true);
    });
    
    it('should update offer status', async () => {
      const createdOffer = await BudgetSuppliersRepository.offers.create(mockOffer);
      const updateData = {
        status: 'evaluated' as const
      };
      
      const updatedOffer = await BudgetSuppliersRepository.offers.update(createdOffer.id, updateData);
      
      expect(updatedOffer).toBeDefined();
      expect(updatedOffer.status).toBe('evaluated');
    });
  });
  
  describe('Contracts CRUD', () => {
    
    it('should create contract successfully', async () => {
      const result = await BudgetSuppliersRepository.contracts.create(mockContract);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(mockProjectId);
      expect(result.name).toBe(mockContract.name);
      expect(result.vendorName).toBe(mockContract.vendorName);
      expect(result.totalValue).toBe(mockContract.totalValue);
      expect(result.milestones.length).toBe(mockContract.milestones.length);
      expect(result.status).toBe('draft');
    });
    
    it('should get contract by id', async () => {
      const createdContract = await BudgetSuppliersRepository.contracts.create(mockContract);
      const retrievedContract = await BudgetSuppliersRepository.contracts.getById(createdContract.id);
      
      expect(retrievedContract).toBeDefined();
      expect(retrievedContract?.id).toBe(createdContract.id);
      expect(retrievedContract?.name).toBe(mockContract.name);
    });
    
    it('should update contract status', async () => {
      const createdContract = await BudgetSuppliersRepository.contracts.create(mockContract);
      const updateData = {
        status: 'signed' as const
      };
      
      const updatedContract = await BudgetSuppliersRepository.contracts.update(createdContract.id, updateData);
      
      expect(updatedContract).toBeDefined();
      expect(updatedContract.status).toBe('signed');
    });
    
    it('should list contracts by project', async () => {
      await BudgetSuppliersRepository.contracts.create(mockContract);
      await BudgetSuppliersRepository.contracts.create({
        ...mockContract,
        name: 'Test Contract 2',
        vendorName: 'Test Vendor B'
      });
      
      const contracts = await BudgetSuppliersRepository.contracts.listByProject({ projectId: mockProjectId });
      
      expect(contracts).toBeDefined();
      expect(contracts.length).toBeGreaterThanOrEqual(2);
      expect(contracts.every(contract => contract.projectId === mockProjectId)).toBe(true);
    });
  });
  
  describe('SAL CRUD', () => {
    
    it('should create SAL successfully', async () => {
      const mockSal: Omit<Sal, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-1',
        amount: 5000,
        description: 'Test SAL - Struttura portante',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await BudgetSuppliersRepository.sals.create(mockSal);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(mockProjectId);
      expect(result.contractId).toBe(mockSal.contractId);
      expect(result.itemId).toBe(mockSal.itemId);
      expect(result.amount).toBe(mockSal.amount);
      expect(result.status).toBe('pending');
    });
    
    it('should list SALs by project', async () => {
      const mockSal1: Omit<Sal, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-1',
        amount: 5000,
        description: 'SAL 1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockSal2: Omit<Sal, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-2',
        amount: 3000,
        description: 'SAL 2',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await BudgetSuppliersRepository.sals.create(mockSal1);
      await BudgetSuppliersRepository.sals.create(mockSal2);
      
      const sals = await BudgetSuppliersRepository.sals.listByProject({ projectId: mockProjectId });
      
      expect(sals).toBeDefined();
      expect(sals.length).toBeGreaterThanOrEqual(2);
      expect(sals.every(sal => sal.projectId === mockProjectId)).toBe(true);
    });
  });
  
  describe('Variations CRUD', () => {
    
    it('should create variation successfully', async () => {
      const mockVariation: Omit<Variation, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-1',
        amount: 1000,
        reason: 'Test variation - cambio specifiche',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await BudgetSuppliersRepository.variations.create(mockVariation);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(mockProjectId);
      expect(result.contractId).toBe(mockVariation.contractId);
      expect(result.itemId).toBe(mockVariation.itemId);
      expect(result.amount).toBe(mockVariation.amount);
      expect(result.reason).toBe(mockVariation.reason);
      expect(result.status).toBe('pending');
    });
    
    it('should list variations by project', async () => {
      const mockVariation1: Omit<Variation, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-1',
        amount: 1000,
        reason: 'Variation 1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockVariation2: Omit<Variation, 'id'> = {
        projectId: mockProjectId,
        contractId: 'contract-1',
        itemId: 'item-2',
        amount: -500,
        reason: 'Variation 2 - riduzione',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await BudgetSuppliersRepository.variations.create(mockVariation1);
      await BudgetSuppliersRepository.variations.create(mockVariation2);
      
      const variations = await BudgetSuppliersRepository.variations.listByProject({ projectId: mockProjectId });
      
      expect(variations).toBeDefined();
      expect(variations.length).toBeGreaterThanOrEqual(2);
      expect(variations.every(variation => variation.projectId === mockProjectId)).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    
    it('should handle item not found', async () => {
      const result = await BudgetSuppliersRepository.items.getById('non-existent-id');
      expect(result).toBeNull();
    });
    
    it('should handle RFP not found', async () => {
      const result = await BudgetSuppliersRepository.rfps.getById('non-existent-id');
      expect(result).toBeNull();
    });
    
    it('should handle offer not found', async () => {
      const result = await BudgetSuppliersRepository.offers.getById('non-existent-id');
      expect(result).toBeNull();
    });
    
    it('should handle contract not found', async () => {
      const result = await BudgetSuppliersRepository.contracts.getById('non-existent-id');
      expect(result).toBeNull();
    });
    
    it('should handle invalid update data', async () => {
      const createdItem = await BudgetSuppliersRepository.items.create(mockItem);
      
      try {
        await BudgetSuppliersRepository.items.update(createdItem.id, {
          budgetPrice: -100 // Invalid negative price
        });
        fail('Should have thrown an error for invalid data');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('Data Validation', () => {
    
    it('should validate required fields for item creation', async () => {
      try {
        await BudgetSuppliersRepository.items.create({
          projectId: '', // Invalid empty project ID
          description: 'Test Item',
          category: 'Strutture' as ItemCategory,
          uom: 'mq',
          qty: 100,
          budgetPrice: 300,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        fail('Should have thrown an error for invalid data');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    
    it('should validate numeric fields', async () => {
      try {
        await BudgetSuppliersRepository.items.create({
          ...mockItem,
          qty: -10, // Invalid negative quantity
          budgetPrice: 0 // Invalid zero price
        });
        fail('Should have thrown an error for invalid numeric data');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

