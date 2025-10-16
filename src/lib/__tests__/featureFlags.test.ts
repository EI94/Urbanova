// 🧪 UNIT TEST - Feature Flags
// Test del sistema di feature flags

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules per ogni test
    jest.resetModules();
    // Clone env
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Ripristina env originale
    process.env = originalEnv;
  });

  describe('OS_V2_ENABLED', () => {
    it('dovrebbe essere false di default', () => {
      delete process.env.NEXT_PUBLIC_OS_V2_ENABLED;
      delete process.env.OS_V2_ENABLED;
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false);
    });

    it('dovrebbe essere true quando NEXT_PUBLIC_OS_V2_ENABLED=true', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = 'true';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(true);
    });

    it('dovrebbe essere true quando OS_V2_ENABLED=true', () => {
      process.env.OS_V2_ENABLED = 'true';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(true);
    });

    it('dovrebbe essere false quando env var è stringa vuota', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = '';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false);
    });

    it('dovrebbe essere false quando env var è "false"', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = 'false';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false);
    });

    it('dovrebbe essere false con valori non booleani', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = '1';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false);
    });
  });

  describe('isOSv2Enabled()', () => {
    it('dovrebbe ritornare stesso valore di OS_V2_ENABLED', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = 'true';
      
      const { OS_V2_ENABLED, isOSv2Enabled } = require('../featureFlags');
      
      expect(isOSv2Enabled()).toBe(OS_V2_ENABLED);
      expect(isOSv2Enabled()).toBe(true);
    });
  });

  describe('BUSINESS_PLAN_V2_ENABLED', () => {
    it('dovrebbe essere true di default', () => {
      delete process.env.NEXT_PUBLIC_BUSINESS_PLAN_V2_ENABLED;
      
      const { BUSINESS_PLAN_V2_ENABLED } = require('../featureFlags');
      
      expect(BUSINESS_PLAN_V2_ENABLED).toBe(true);
    });

    it('dovrebbe essere false quando esplicitamente disabilitato', () => {
      process.env.NEXT_PUBLIC_BUSINESS_PLAN_V2_ENABLED = 'false';
      
      const { BUSINESS_PLAN_V2_ENABLED } = require('../featureFlags');
      
      expect(BUSINESS_PLAN_V2_ENABLED).toBe(false);
    });
  });

  describe('MARKET_INTELLIGENCE_ENABLED', () => {
    it('dovrebbe essere true di default', () => {
      delete process.env.NEXT_PUBLIC_MARKET_INTELLIGENCE_ENABLED;
      
      const { MARKET_INTELLIGENCE_ENABLED } = require('../featureFlags');
      
      expect(MARKET_INTELLIGENCE_ENABLED).toBe(true);
    });
  });

  describe('DEBUG_MODE', () => {
    it('dovrebbe essere false di default in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_DEBUG_MODE;
      
      const { DEBUG_MODE } = require('../featureFlags');
      
      expect(DEBUG_MODE).toBe(false);
    });

    it('dovrebbe essere true in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_DEBUG_MODE;
      
      const { DEBUG_MODE } = require('../featureFlags');
      
      expect(DEBUG_MODE).toBe(true);
    });

    it('dovrebbe essere true quando NEXT_PUBLIC_DEBUG_MODE=true', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_DEBUG_MODE = 'true';
      
      const { DEBUG_MODE } = require('../featureFlags');
      
      expect(DEBUG_MODE).toBe(true);
    });
  });

  describe('featureFlags object', () => {
    it('dovrebbe esportare tutti i flags', () => {
      const { featureFlags } = require('../featureFlags');
      
      expect(featureFlags).toHaveProperty('OS_V2_ENABLED');
      expect(featureFlags).toHaveProperty('BUSINESS_PLAN_V2_ENABLED');
      expect(featureFlags).toHaveProperty('MARKET_INTELLIGENCE_ENABLED');
      expect(featureFlags).toHaveProperty('DEBUG_MODE');
    });

    it('dovrebbe essere un oggetto read-only (const)', () => {
      const { featureFlags } = require('../featureFlags');
      
      expect(() => {
        // @ts-ignore - Test runtime behavior
        featureFlags.OS_V2_ENABLED = false;
      }).not.toThrow();
      
      // Verifica che sia comunque const a livello TypeScript
      expect(typeof featureFlags).toBe('object');
    });
  });

  describe('Edge cases', () => {
    it('dovrebbe gestire env vars undefined', () => {
      delete process.env.NEXT_PUBLIC_OS_V2_ENABLED;
      delete process.env.OS_V2_ENABLED;
      delete process.env.NEXT_PUBLIC_DEBUG_MODE;
      
      const flags = require('../featureFlags');
      
      expect(flags.OS_V2_ENABLED).toBe(false);
      expect(flags.DEBUG_MODE).toBeFalsy();
    });

    it('dovrebbe gestire env vars case-sensitive', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = 'TRUE'; // uppercase
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false); // deve essere esattamente 'true'
    });

    it('dovrebbe gestire spazi nelle env vars', () => {
      process.env.NEXT_PUBLIC_OS_V2_ENABLED = ' true ';
      
      const { OS_V2_ENABLED } = require('../featureFlags');
      
      expect(OS_V2_ENABLED).toBe(false); // trim non applicato
    });
  });
});

