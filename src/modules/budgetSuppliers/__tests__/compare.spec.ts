/**
 * 🧪 BUDGET SUPPLIERS COMPARE TESTS
 * 
 * Test unitari per ranking e scorecard con esclusioni
 */

import { describe, it, expect } from '@jest/globals';
import { CompareService } from '../api/compare';
import { Offer, OfferLine } from '../lib/types';

// Mock data per test
const mockItems = [
  {
    id: 'item-1',
    description: 'Struttura portante',
    category: 'Strutture',
    uom: 'mq',
    qty: 100,
    budgetPrice: 300
  },
  {
    id: 'item-2',
    description: 'Impianto elettrico',
    category: 'Impianti',
    uom: 'mq',
    qty: 100,
    budgetPrice: 80
  },
  {
    id: 'item-3',
    description: 'Finiture interne',
    category: 'Finiture',
    uom: 'mq',
    qty: 100,
    budgetPrice: 50
  }
];

const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    rfpId: 'rfp-1',
    vendorId: 'vendor-1',
    vendorName: 'Vendor A',
    items: [
      {
        itemId: 'item-1',
        unitPrice: 280,
        totalPrice: 28000,
        notes: 'Prezzo competitivo',
        exclusions: undefined
      },
      {
        itemId: 'item-2',
        unitPrice: 75,
        totalPrice: 7500,
        notes: 'Include trasporto',
        exclusions: undefined
      },
      {
        itemId: 'item-3',
        unitPrice: 45,
        totalPrice: 4500,
        notes: 'Materiale standard',
        exclusions: undefined
      }
    ],
    attachments: [],
    status: 'received',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'offer-2',
    rfpId: 'rfp-1',
    vendorId: 'vendor-2',
    vendorName: 'Vendor B',
    items: [
      {
        itemId: 'item-1',
        unitPrice: 290,
        totalPrice: 29000,
        notes: 'Materiale premium',
        exclusions: undefined
      },
      {
        itemId: 'item-2',
        unitPrice: 85,
        totalPrice: 8500,
        notes: 'Include installazione',
        exclusions: undefined
      },
      {
        itemId: 'item-3',
        unitPrice: 55,
        totalPrice: 5500,
        notes: 'Finiture di lusso',
        exclusions: undefined
      }
    ],
    attachments: [],
    status: 'received',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'offer-3',
    rfpId: 'rfp-1',
    vendorId: 'vendor-3',
    vendorName: 'Vendor C',
    items: [
      {
        itemId: 'item-1',
        unitPrice: 270,
        totalPrice: 27000,
        notes: 'Prezzo molto competitivo',
        exclusions: undefined
      },
      {
        itemId: 'item-2',
        unitPrice: 70,
        totalPrice: 7000,
        notes: 'Senza trasporto',
        exclusions: 'Trasporto non incluso'
      },
      {
        itemId: 'item-3',
        unitPrice: 40,
        totalPrice: 4000,
        notes: 'Materiale economico',
        exclusions: undefined
      }
    ],
    attachments: [],
    status: 'received',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('BudgetSuppliers Compare', () => {
  
  describe('Offer Comparison', () => {
    
    it('should compare offers correctly', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      expect(result).toBeDefined();
      expect(result.vendorScores).toBeDefined();
      expect(result.vendorScores.length).toBe(3);
      expect(result.totalSavings).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
    
    it('should rank vendors by total score', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Vendor C should be ranked first (lowest total price)
      expect(result.vendorScores[0].vendorName).toBe('Vendor C');
      expect(result.vendorScores[0].totalScore).toBe(38000); // 27000 + 7000 + 4000
      
      // Vendor A should be ranked second
      expect(result.vendorScores[1].vendorName).toBe('Vendor A');
      expect(result.vendorScores[1].totalScore).toBe(40000); // 28000 + 7500 + 4500
      
      // Vendor B should be ranked third (highest total price)
      expect(result.vendorScores[2].vendorName).toBe('Vendor B');
      expect(result.vendorScores[2].totalScore).toBe(43000); // 29000 + 8500 + 5500
    });
    
    it('should calculate scores correctly', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Check that scores are calculated properly
      result.vendorScores.forEach(vendor => {
        expect(vendor.score).toBeDefined();
        expect(vendor.score).toBeGreaterThan(0);
        expect(vendor.totalScore).toBeDefined();
        expect(vendor.totalScore).toBeGreaterThan(0);
      });
    });
    
    it('should identify best offer per item', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Item 1: Vendor C has best price (270)
      const item1Best = result.itemAnalysis.find(item => item.itemId === 'item-1');
      expect(item1Best?.bestVendor).toBe('Vendor C');
      expect(item1Best?.bestPrice).toBe(270);
      
      // Item 2: Vendor C has best price (70) but with exclusions
      const item2Best = result.itemAnalysis.find(item => item.itemId === 'item-2');
      expect(item2Best?.bestVendor).toBe('Vendor C');
      expect(item2Best?.bestPrice).toBe(70);
      expect(item2Best?.hasExclusions).toBe(true);
      
      // Item 3: Vendor C has best price (40)
      const item3Best = result.itemAnalysis.find(item => item.itemId === 'item-3');
      expect(item3Best?.bestVendor).toBe('Vendor C');
      expect(item3Best?.bestPrice).toBe(40);
    });
  });
  
  describe('Exclusions Handling', () => {
    
    it('should detect exclusions correctly', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Vendor C has exclusions for item-2
      const vendorC = result.vendorScores.find(v => v.vendorName === 'Vendor C');
      expect(vendorC?.hasExclusions).toBe(true);
      
      // Vendor A and B have no exclusions
      const vendorA = result.vendorScores.find(v => v.vendorName === 'Vendor A');
      const vendorB = result.vendorScores.find(v => v.vendorName === 'Vendor B');
      expect(vendorA?.hasExclusions).toBe(false);
      expect(vendorB?.hasExclusions).toBe(false);
    });
    
    it('should penalize offers with exclusions', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Vendor C should have lower score due to exclusions penalty
      const vendorC = result.vendorScores.find(v => v.vendorName === 'Vendor C');
      expect(vendorC?.exclusionsPenalty).toBeDefined();
      expect(vendorC?.exclusionsPenalty).toBeGreaterThan(0);
    });
    
    it('should include exclusions in recommendations', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      const exclusionsRecommendation = result.recommendations.find(rec => 
        rec.includes('esclusioni') || rec.includes('exclusions')
      );
      expect(exclusionsRecommendation).toBeDefined();
    });
  });
  
  describe('Savings Calculation', () => {
    
    it('should calculate total savings correctly', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Total budget: 300*100 + 80*100 + 50*100 = 43000
      // Best offer total: 270*100 + 70*100 + 40*100 = 38000
      // Savings: 43000 - 38000 = 5000
      expect(result.totalSavings).toBe(5000);
    });
    
    it('should calculate savings percentage correctly', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Savings percentage: 5000 / 43000 * 100 = 11.63%
      expect(result.savingsPercentage).toBeCloseTo(11.63, 1);
    });
    
    it('should identify savings per item', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Item 1 savings: 300 - 270 = 30 per unit
      const item1Savings = result.itemAnalysis.find(item => item.itemId === 'item-1');
      expect(item1Savings?.savingsPerUnit).toBe(30);
      expect(item1Savings?.totalSavings).toBe(3000);
      
      // Item 2 savings: 80 - 70 = 10 per unit
      const item2Savings = result.itemAnalysis.find(item => item.itemId === 'item-2');
      expect(item2Savings?.savingsPerUnit).toBe(10);
      expect(item2Savings?.totalSavings).toBe(1000);
      
      // Item 3 savings: 50 - 40 = 10 per unit
      const item3Savings = result.itemAnalysis.find(item => item.itemId === 'item-3');
      expect(item3Savings?.savingsPerUnit).toBe(10);
      expect(item3Savings?.totalSavings).toBe(1000);
    });
  });
  
  describe('Scorecard Generation', () => {
    
    it('should generate complete scorecard', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      expect(result.scorecard).toBeDefined();
      expect(result.scorecard.vendors).toBeDefined();
      expect(result.scorecard.vendors.length).toBe(3);
      expect(result.scorecard.items).toBeDefined();
      expect(result.scorecard.items.length).toBe(3);
    });
    
    it('should include all vendors in scorecard', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      const vendorNames = result.scorecard.vendors.map(v => v.name);
      expect(vendorNames).toContain('Vendor A');
      expect(vendorNames).toContain('Vendor B');
      expect(vendorNames).toContain('Vendor C');
    });
    
    it('should include all items in scorecard', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      const itemIds = result.scorecard.items.map(i => i.id);
      expect(itemIds).toContain('item-1');
      expect(itemIds).toContain('item-2');
      expect(itemIds).toContain('item-3');
    });
    
    it('should show prices for each vendor-item combination', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      // Check Vendor A prices
      const vendorA = result.scorecard.vendors.find(v => v.name === 'Vendor A');
      expect(vendorA?.itemPrices['item-1']).toBe(280);
      expect(vendorA?.itemPrices['item-2']).toBe(75);
      expect(vendorA?.itemPrices['item-3']).toBe(45);
      
      // Check Vendor B prices
      const vendorB = result.scorecard.vendors.find(v => v.name === 'Vendor B');
      expect(vendorB?.itemPrices['item-1']).toBe(290);
      expect(vendorB?.itemPrices['item-2']).toBe(85);
      expect(vendorB?.itemPrices['item-3']).toBe(55);
      
      // Check Vendor C prices
      const vendorC = result.scorecard.vendors.find(v => v.name === 'Vendor C');
      expect(vendorC?.itemPrices['item-1']).toBe(270);
      expect(vendorC?.itemPrices['item-2']).toBe(70);
      expect(vendorC?.itemPrices['item-3']).toBe(40);
    });
  });
  
  describe('Recommendations', () => {
    
    it('should generate relevant recommendations', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should recommend Vendor C as best overall
      const bestVendorRec = result.recommendations.find(rec => 
        rec.includes('Vendor C') || rec.includes('migliore')
      );
      expect(bestVendorRec).toBeDefined();
      
      // Should mention exclusions
      const exclusionsRec = result.recommendations.find(rec => 
        rec.includes('esclusioni') || rec.includes('exclusions')
      );
      expect(exclusionsRec).toBeDefined();
    });
    
    it('should recommend considering exclusions', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      const exclusionsRec = result.recommendations.find(rec => 
        rec.includes('esclusioni') || rec.includes('exclusions')
      );
      expect(exclusionsRec).toBeDefined();
    });
    
    it('should recommend savings opportunities', async () => {
      const result = await CompareService.compareOffers(mockOffers);
      
      const savingsRec = result.recommendations.find(rec => 
        rec.includes('risparmio') || rec.includes('savings') || rec.includes('5000')
      );
      expect(savingsRec).toBeDefined();
    });
  });
  
  describe('Edge Cases', () => {
    
    it('should handle empty offers array', async () => {
      const result = await CompareService.compareOffers([]);
      
      expect(result.vendorScores).toEqual([]);
      expect(result.totalSavings).toBe(0);
      expect(result.savingsPercentage).toBe(0);
      expect(result.recommendations).toEqual([]);
    });
    
    it('should handle single offer', async () => {
      const singleOffer = [mockOffers[0]];
      const result = await CompareService.compareOffers(singleOffer);
      
      expect(result.vendorScores.length).toBe(1);
      expect(result.vendorScores[0].vendorName).toBe('Vendor A');
      expect(result.totalSavings).toBe(0); // No comparison possible
    });
    
    it('should handle offers with missing items', async () => {
      const incompleteOffer: Offer = {
        ...mockOffers[0],
        items: [mockOffers[0].items[0]] // Only first item
      };
      
      const result = await CompareService.compareOffers([incompleteOffer, mockOffers[1]]);
      
      expect(result.vendorScores).toBeDefined();
      expect(result.vendorScores.length).toBe(2);
      
      // Should handle missing items gracefully
      const vendorA = result.vendorScores.find(v => v.vendorName === 'Vendor A');
      expect(vendorA?.missingItems).toBeDefined();
      expect(vendorA?.missingItems?.length).toBeGreaterThan(0);
    });
    
    it('should handle offers with zero prices', async () => {
      const zeroPriceOffer: Offer = {
        ...mockOffers[0],
        items: mockOffers[0].items.map(item => ({
          ...item,
          unitPrice: 0,
          totalPrice: 0
        }))
      };
      
      const result = await CompareService.compareOffers([zeroPriceOffer, mockOffers[1]]);
      
      expect(result.vendorScores).toBeDefined();
      expect(result.vendorScores.length).toBe(2);
      
      // Vendor with zero prices should be ranked last
      const zeroVendor = result.vendorScores.find(v => v.vendorName === 'Vendor A');
      expect(zeroVendor?.totalScore).toBe(0);
    });
    
    it('should handle offers with negative prices', async () => {
      const negativePriceOffer: Offer = {
        ...mockOffers[0],
        items: mockOffers[0].items.map(item => ({
          ...item,
          unitPrice: -10,
          totalPrice: -1000
        }))
      };
      
      const result = await CompareService.compareOffers([negativePriceOffer, mockOffers[1]]);
      
      expect(result.vendorScores).toBeDefined();
      expect(result.vendorScores.length).toBe(2);
      
      // Should handle negative prices gracefully
      const negativeVendor = result.vendorScores.find(v => v.vendorName === 'Vendor A');
      expect(negativeVendor?.totalScore).toBeLessThan(0);
    });
  });
  
  describe('Performance', () => {
    
    it('should handle large number of offers efficiently', async () => {
      const largeOffers: Offer[] = [];
      
      // Create 100 offers
      for (let i = 0; i < 100; i++) {
        largeOffers.push({
          ...mockOffers[0],
          id: `offer-${i}`,
          vendorId: `vendor-${i}`,
          vendorName: `Vendor ${i}`,
          items: mockOffers[0].items.map(item => ({
            ...item,
            unitPrice: 250 + Math.random() * 100, // Random price between 250-350
            totalPrice: (250 + Math.random() * 100) * item.qty
          }))
        });
      }
      
      const startTime = Date.now();
      const result = await CompareService.compareOffers(largeOffers);
      const endTime = Date.now();
      
      expect(result.vendorScores.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
    
    it('should handle large number of items efficiently', async () => {
      const manyItemsOffer: Offer = {
        ...mockOffers[0],
        items: []
      };
      
      // Create 1000 items
      for (let i = 0; i < 1000; i++) {
        manyItemsOffer.items.push({
          itemId: `item-${i}`,
          unitPrice: 100 + Math.random() * 200,
          totalPrice: (100 + Math.random() * 200) * 10,
          notes: `Item ${i}`,
          exclusions: undefined
        });
      }
      
      const startTime = Date.now();
      const result = await CompareService.compareOffers([manyItemsOffer, mockOffers[1]]);
      const endTime = Date.now();
      
      expect(result.itemAnalysis.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds
    });
  });
});

