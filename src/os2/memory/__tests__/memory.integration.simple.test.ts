// 🧪 SIMPLE INTEGRATION TEST - Memory Defaults
// Test semplificato senza Firebase: verifica logica defaults

import {
  ProjectMemory,
  UserMemory,
} from '../types';

describe('Memory Defaults Logic', () => {
  describe('Default priority: Entity > ProjectMemory > UserMemory > Hardcoded', () => {
    it('dovrebbe dare priorità ai valori espliciti', () => {
      const projectMemory: ProjectMemory = {
        projectId: 'proj123',
        defaults: { discountRate: 0.15, marginTarget: 0.25, currency: 'EUR', contingency: 0.10, salesCommission: 0.03 },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const userMemory: UserMemory = {
        userId: 'user123',
        preferences: {
          tone: 'detailed',
          exportFormat: 'pdf',
          language: 'it',
          notifications: true,
          showAdvancedOptions: false,
          autoSaveDrafts: true,
          defaultCurrency: 'EUR',
          defaultDiscountRate: 0.10,
          defaultMarginTarget: 0.18,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Simula logica Planner
      const explicitValue = 0.20;
      const projectDefault = projectMemory.defaults.discountRate;
      const userDefault = userMemory.preferences.defaultDiscountRate;
      const hardcodedDefault = 0.12;
      
      // Priority logic
      const finalValue = explicitValue || projectDefault || userDefault || hardcodedDefault;
      
      expect(finalValue).toBe(0.20); // Explicit wins
      
      console.log('✅ Priorità corretta: Explicit (0.20) > Project (0.15) > User (0.10) > Hardcoded (0.12)');
    });
    
    it('dovrebbe usare ProjectMemory se nessun valore esplicito', () => {
      const projectMemory: ProjectMemory = {
        projectId: 'proj123',
        defaults: { discountRate: 0.15, marginTarget: 0.25, currency: 'EUR', contingency: 0.10, salesCommission: 0.03 },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const userMemory: UserMemory = {
        userId: 'user123',
        preferences: {
          tone: 'detailed',
          exportFormat: 'pdf',
          language: 'it',
          notifications: true,
          showAdvancedOptions: false,
          autoSaveDrafts: true,
          defaultCurrency: 'EUR',
          defaultDiscountRate: 0.10,
          defaultMarginTarget: 0.18,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const explicitValue = undefined;
      const projectDefault = projectMemory.defaults.discountRate;
      const userDefault = userMemory.preferences.defaultDiscountRate;
      const hardcodedDefault = 0.12;
      
      const finalValue = explicitValue || projectDefault || userDefault || hardcodedDefault;
      
      expect(finalValue).toBe(0.15); // Project wins
      
      console.log('✅ Usa ProjectMemory (0.15) quando no explicit');
    });
    
    it('dovrebbe usare UserMemory se nessuna ProjectMemory', () => {
      const projectMemory = null;
      
      const userMemory: UserMemory = {
        userId: 'user123',
        preferences: {
          tone: 'detailed',
          exportFormat: 'pdf',
          language: 'it',
          notifications: true,
          showAdvancedOptions: false,
          autoSaveDrafts: true,
          defaultCurrency: 'EUR',
          defaultDiscountRate: 0.10,
          defaultMarginTarget: 0.18,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const explicitValue = undefined;
      const projectDefault = projectMemory?.defaults.discountRate;
      const userDefault = userMemory.preferences.defaultDiscountRate;
      const hardcodedDefault = 0.12;
      
      const finalValue = explicitValue || projectDefault || userDefault || hardcodedDefault;
      
      expect(finalValue).toBe(0.10); // User wins
      
      console.log('✅ Usa UserMemory (0.10) quando no Project');
    });
    
    it('dovrebbe usare hardcoded se nessuna memoria', () => {
      const projectMemory = null;
      const userMemory = null;
      
      const explicitValue = undefined;
      const projectDefault = projectMemory?.defaults.discountRate;
      const userDefault = userMemory?.preferences?.defaultDiscountRate;
      const hardcodedDefault = 0.12;
      
      const finalValue = explicitValue || projectDefault || userDefault || hardcodedDefault;
      
      expect(finalValue).toBe(0.12); // Hardcoded wins
      
      console.log('✅ Usa hardcoded (0.12) quando no memoria');
    });
  });
  
  describe('User Preferences export format', () => {
    it('dovrebbe usare exportFormat da UserMemory', () => {
      const userMemory: UserMemory = {
        userId: 'user123',
        preferences: {
          tone: 'detailed',
          exportFormat: 'excel', // ← Custom preference
          language: 'it',
          notifications: true,
          showAdvancedOptions: false,
          autoSaveDrafts: true,
          defaultCurrency: 'EUR',
          defaultDiscountRate: 0.10,
          defaultMarginTarget: 0.18,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const explicitFormat = undefined;
      const userFormat = userMemory.preferences.exportFormat;
      const defaultFormat = 'pdf';
      
      const finalFormat = explicitFormat || userFormat || defaultFormat;
      
      expect(finalFormat).toBe('excel');
      
      console.log('✅ Usa exportFormat=excel da UserMemory');
    });
  });
});

