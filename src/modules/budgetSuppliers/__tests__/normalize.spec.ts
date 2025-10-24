/**
 * 🧪 BUDGET SUPPLIERS NORMALIZE TESTS
 * 
 * Test unitari per conversione UM e normalizzazione prezzi
 */

import { describe, it, expect } from '@jest/globals';
import { 
  normalizeUoM, 
  normalizePrice, 
  normalizeVAT,
  convertUoM,
  UoMConversionMap,
  VATRates
} from '../lib/normalize';

describe('BudgetSuppliers Normalize', () => {
  
  describe('UoM Normalization', () => {
    
    it('should normalize length units correctly', () => {
      expect(normalizeUoM('ml', 'length')).toBe('m');
      expect(normalizeUoM('cm', 'length')).toBe('m');
      expect(normalizeUoM('dm', 'length')).toBe('m');
      expect(normalizeUoM('km', 'length')).toBe('m');
      expect(normalizeUoM('m', 'length')).toBe('m');
    });
    
    it('should normalize area units correctly', () => {
      expect(normalizeUoM('mq', 'area')).toBe('mq');
      expect(normalizeUoM('m²', 'area')).toBe('mq');
      expect(normalizeUoM('m2', 'area')).toBe('mq');
      expect(normalizeUoM('cmq', 'area')).toBe('mq');
      expect(normalizeUoM('ha', 'area')).toBe('mq');
    });
    
    it('should normalize volume units correctly', () => {
      expect(normalizeUoM('mc', 'volume')).toBe('mc');
      expect(normalizeUoM('m³', 'volume')).toBe('mc');
      expect(normalizeUoM('m3', 'volume')).toBe('mc');
      expect(normalizeUoM('l', 'volume')).toBe('mc');
      expect(normalizeUoM('hl', 'volume')).toBe('mc');
    });
    
    it('should normalize weight units correctly', () => {
      expect(normalizeUoM('kg', 'weight')).toBe('kg');
      expect(normalizeUoM('q.le', 'weight')).toBe('kg');
      expect(normalizeUoM('quintale', 'weight')).toBe('kg');
      expect(normalizeUoM('t', 'weight')).toBe('kg');
      expect(normalizeUoM('ton', 'weight')).toBe('kg');
    });
    
    it('should normalize piece units correctly', () => {
      expect(normalizeUoM('pz', 'piece')).toBe('pz');
      expect(normalizeUoM('pezzi', 'piece')).toBe('pz');
      expect(normalizeUoM('n.', 'piece')).toBe('pz');
      expect(normalizeUoM('nr', 'piece')).toBe('pz');
      expect(normalizeUoM('unità', 'piece')).toBe('pz');
    });
    
    it('should handle unknown units gracefully', () => {
      expect(normalizeUoM('unknown', 'length')).toBe('unknown');
      expect(normalizeUoM('xyz', 'area')).toBe('xyz');
    });
    
    it('should handle case insensitive normalization', () => {
      expect(normalizeUoM('ML', 'length')).toBe('m');
      expect(normalizeUoM('Cm', 'length')).toBe('m');
      expect(normalizeUoM('MQ', 'area')).toBe('mq');
      expect(normalizeUoM('Kg', 'weight')).toBe('kg');
    });
  });
  
  describe('UoM Conversion', () => {
    
    it('should convert millimeters to meters', () => {
      const result = convertUoM(1000, 'ml', 'm');
      expect(result).toBe(1);
    });
    
    it('should convert centimeters to meters', () => {
      const result = convertUoM(100, 'cm', 'm');
      expect(result).toBe(1);
    });
    
    it('should convert decimeters to meters', () => {
      const result = convertUoM(10, 'dm', 'm');
      expect(result).toBe(1);
    });
    
    it('should convert kilometers to meters', () => {
      const result = convertUoM(1, 'km', 'm');
      expect(result).toBe(1000);
    });
    
    it('should convert square centimeters to square meters', () => {
      const result = convertUoM(10000, 'cmq', 'mq');
      expect(result).toBe(1);
    });
    
    it('should convert hectares to square meters', () => {
      const result = convertUoM(1, 'ha', 'mq');
      expect(result).toBe(10000);
    });
    
    it('should convert liters to cubic meters', () => {
      const result = convertUoM(1000, 'l', 'mc');
      expect(result).toBe(1);
    });
    
    it('should convert hectoliters to cubic meters', () => {
      const result = convertUoM(10, 'hl', 'mc');
      expect(result).toBe(1);
    });
    
    it('should convert quintals to kilograms', () => {
      const result = convertUoM(1, 'q.le', 'kg');
      expect(result).toBe(100);
    });
    
    it('should convert tons to kilograms', () => {
      const result = convertUoM(1, 't', 'kg');
      expect(result).toBe(1000);
    });
    
    it('should handle same unit conversion', () => {
      const result = convertUoM(100, 'm', 'm');
      expect(result).toBe(100);
    });
    
    it('should handle unknown conversion gracefully', () => {
      const result = convertUoM(100, 'unknown', 'm');
      expect(result).toBe(100); // Return original value
    });
  });
  
  describe('Price Normalization', () => {
    
    it('should normalize price with VAT correctly', () => {
      const result = normalizePrice({
        unitPrice: 100,
        vatRate: 22,
        includeVAT: true
      });
      
      expect(result.unitPriceExVAT).toBe(81.97); // 100 / 1.22
      expect(result.unitPriceIncVAT).toBe(100);
      expect(result.vatAmount).toBe(18.03);
      expect(result.vatRate).toBe(22);
    });
    
    it('should normalize price without VAT correctly', () => {
      const result = normalizePrice({
        unitPrice: 100,
        vatRate: 22,
        includeVAT: false
      });
      
      expect(result.unitPriceExVAT).toBe(100);
      expect(result.unitPriceIncVAT).toBe(122); // 100 * 1.22
      expect(result.vatAmount).toBe(22);
      expect(result.vatRate).toBe(22);
    });
    
    it('should handle zero VAT rate', () => {
      const result = normalizePrice({
        unitPrice: 100,
        vatRate: 0,
        includeVAT: true
      });
      
      expect(result.unitPriceExVAT).toBe(100);
      expect(result.unitPriceIncVAT).toBe(100);
      expect(result.vatAmount).toBe(0);
      expect(result.vatRate).toBe(0);
    });
    
    it('should handle different VAT rates', () => {
      const result10 = normalizePrice({
        unitPrice: 100,
        vatRate: 10,
        includeVAT: true
      });
      
      expect(result10.unitPriceExVAT).toBe(90.91);
      expect(result10.unitPriceIncVAT).toBe(100);
      expect(result10.vatAmount).toBe(9.09);
      
      const result4 = normalizePrice({
        unitPrice: 100,
        vatRate: 4,
        includeVAT: true
      });
      
      expect(result4.unitPriceExVAT).toBe(96.15);
      expect(result4.unitPriceIncVAT).toBe(100);
      expect(result4.vatAmount).toBe(3.85);
    });
    
    it('should handle decimal prices', () => {
      const result = normalizePrice({
        unitPrice: 123.45,
        vatRate: 22,
        includeVAT: true
      });
      
      expect(result.unitPriceExVAT).toBeCloseTo(101.19, 2);
      expect(result.unitPriceIncVAT).toBe(123.45);
      expect(result.vatAmount).toBeCloseTo(22.26, 2);
    });
    
    it('should handle negative prices gracefully', () => {
      const result = normalizePrice({
        unitPrice: -100,
        vatRate: 22,
        includeVAT: true
      });
      
      expect(result.unitPriceExVAT).toBe(-81.97);
      expect(result.unitPriceIncVAT).toBe(-100);
      expect(result.vatAmount).toBe(-18.03);
    });
  });
  
  describe('VAT Normalization', () => {
    
    it('should normalize VAT rates correctly', () => {
      expect(normalizeVAT(22)).toBe(22);
      expect(normalizeVAT(10)).toBe(10);
      expect(normalizeVAT(4)).toBe(4);
      expect(normalizeVAT(0)).toBe(0);
    });
    
    it('should handle string VAT rates', () => {
      expect(normalizeVAT('22%')).toBe(22);
      expect(normalizeVAT('10%')).toBe(10);
      expect(normalizeVAT('4%')).toBe(4);
      expect(normalizeVAT('0%')).toBe(0);
    });
    
    it('should handle decimal VAT rates', () => {
      expect(normalizeVAT(22.5)).toBe(22.5);
      expect(normalizeVAT(10.5)).toBe(10.5);
    });
    
    it('should default to project VAT rate when not specified', () => {
      const projectVAT = 22;
      expect(normalizeVAT(undefined, projectVAT)).toBe(22);
      expect(normalizeVAT(null, projectVAT)).toBe(22);
      expect(normalizeVAT('', projectVAT)).toBe(22);
    });
    
    it('should handle invalid VAT rates gracefully', () => {
      expect(normalizeVAT('invalid')).toBe(22); // Default
      expect(normalizeVAT(-5)).toBe(22); // Default
      expect(normalizeVAT(150)).toBe(22); // Default (too high)
    });
  });
  
  describe('UoM Conversion Map', () => {
    
    it('should have correct length conversions', () => {
      expect(UoMConversionMap.length.ml).toBe(0.001);
      expect(UoMConversionMap.length.cm).toBe(0.01);
      expect(UoMConversionMap.length.dm).toBe(0.1);
      expect(UoMConversionMap.length.m).toBe(1);
      expect(UoMConversionMap.length.km).toBe(1000);
    });
    
    it('should have correct area conversions', () => {
      expect(UoMConversionMap.area.cmq).toBe(0.0001);
      expect(UoMConversionMap.area.mq).toBe(1);
      expect(UoMConversionMap.area.ha).toBe(10000);
    });
    
    it('should have correct volume conversions', () => {
      expect(UoMConversionMap.volume.l).toBe(0.001);
      expect(UoMConversionMap.volume.hl).toBe(0.1);
      expect(UoMConversionMap.volume.mc).toBe(1);
    });
    
    it('should have correct weight conversions', () => {
      expect(UoMConversionMap.weight.g).toBe(0.001);
      expect(UoMConversionMap.weight.kg).toBe(1);
      expect(UoMConversionMap.weight['q.le']).toBe(100);
      expect(UoMConversionMap.weight.t).toBe(1000);
    });
  });
  
  describe('VAT Rates', () => {
    
    it('should have correct standard VAT rate', () => {
      expect(VATRates.STANDARD).toBe(22);
    });
    
    it('should have correct reduced VAT rates', () => {
      expect(VATRates.REDUCED).toBe(10);
      expect(VATRates.SUPER_REDUCED).toBe(4);
    });
    
    it('should have correct zero VAT rate', () => {
      expect(VATRates.ZERO).toBe(0);
    });
  });
  
  describe('Complex Normalization Scenarios', () => {
    
    it('should normalize offer line with mixed units', () => {
      const offerLine = {
        itemId: 'item-1',
        description: 'Struttura portante',
        unitPrice: 150,
        qty: 1000,
        uom: 'ml',
        vatRate: 22,
        includeVAT: true,
        notes: 'Prezzo competitivo'
      };
      
      const normalized = {
        ...offerLine,
        uom: normalizeUoM(offerLine.uom, 'length'),
        qty: convertUoM(offerLine.qty, offerLine.uom, normalizeUoM(offerLine.uom, 'length')),
        price: normalizePrice({
          unitPrice: offerLine.unitPrice,
          vatRate: normalizeVAT(offerLine.vatRate),
          includeVAT: offerLine.includeVAT
        })
      };
      
      expect(normalized.uom).toBe('m');
      expect(normalized.qty).toBe(1);
      expect(normalized.price.unitPriceExVAT).toBeCloseTo(122.95, 2);
      expect(normalized.price.unitPriceIncVAT).toBe(150);
    });
    
    it('should normalize offer line with weight units', () => {
      const offerLine = {
        itemId: 'item-2',
        description: 'Acciaio strutturale',
        unitPrice: 0.8,
        qty: 50,
        uom: 'q.le',
        vatRate: 22,
        includeVAT: false,
        notes: 'Prezzo al quintale'
      };
      
      const normalized = {
        ...offerLine,
        uom: normalizeUoM(offerLine.uom, 'weight'),
        qty: convertUoM(offerLine.qty, offerLine.uom, normalizeUoM(offerLine.uom, 'weight')),
        price: normalizePrice({
          unitPrice: offerLine.unitPrice,
          vatRate: normalizeVAT(offerLine.vatRate),
          includeVAT: offerLine.includeVAT
        })
      };
      
      expect(normalized.uom).toBe('kg');
      expect(normalized.qty).toBe(5000);
      expect(normalized.price.unitPriceExVAT).toBe(0.8);
      expect(normalized.price.unitPriceIncVAT).toBeCloseTo(0.98, 2);
    });
    
    it('should handle missing VAT rate with project default', () => {
      const offerLine = {
        itemId: 'item-3',
        description: 'Fornitura generica',
        unitPrice: 100,
        qty: 10,
        uom: 'pz',
        vatRate: undefined,
        includeVAT: true,
        notes: 'Senza IVA specificata'
      };
      
      const projectVAT = 22;
      const normalized = {
        ...offerLine,
        price: normalizePrice({
          unitPrice: offerLine.unitPrice,
          vatRate: normalizeVAT(offerLine.vatRate, projectVAT),
          includeVAT: offerLine.includeVAT
        })
      };
      
      expect(normalized.price.vatRate).toBe(22);
      expect(normalized.price.unitPriceExVAT).toBeCloseTo(81.97, 2);
      expect(normalized.price.unitPriceIncVAT).toBe(100);
    });
  });
  
  describe('Edge Cases', () => {
    
    it('should handle zero quantities', () => {
      const result = convertUoM(0, 'm', 'cm');
      expect(result).toBe(0);
    });
    
    it('should handle very small quantities', () => {
      const result = convertUoM(0.001, 'm', 'mm');
      expect(result).toBe(1);
    });
    
    it('should handle very large quantities', () => {
      const result = convertUoM(1000000, 'mm', 'km');
      expect(result).toBe(1);
    });
    
    it('should handle precision in conversions', () => {
      const result = convertUoM(1, 'cm', 'mm');
      expect(result).toBe(10);
      
      const result2 = convertUoM(10, 'mm', 'cm');
      expect(result2).toBe(1);
    });
    
    it('should handle case insensitive unit names', () => {
      expect(normalizeUoM('ML', 'length')).toBe('m');
      expect(normalizeUoM('Cm', 'length')).toBe('m');
      expect(normalizeUoM('MQ', 'area')).toBe('mq');
      expect(normalizeUoM('Kg', 'weight')).toBe('kg');
    });
  });
});

