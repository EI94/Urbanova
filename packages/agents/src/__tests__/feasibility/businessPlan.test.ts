// Business Plan Engine Tests - Urbanova AI

import { BusinessPlanEngine } from '../../feasibility/businessPlan';

describe('BusinessPlanEngine', () => {
  let engine: BusinessPlanEngine;

  beforeEach(() => {
    engine = new BusinessPlanEngine();
  });

  describe('runBusinessPlan', () => {
    it('should calculate basic business plan metrics', async () => {
      const input = {
        projectId: 'test-project',
        land: { priceAsk: 100000, taxes: 5000, surface: 500 },
        costs: { hard: 300000, soft: 75000, fees: 40000, contingency: 60000 },
        prices: { psqmBase: 3500, byTypology: {} },
        timing: { monthsDev: 18, monthsSales: 12 },
        sensitivity: { costDeltas: [-10, 0, 10], priceDeltas: [-10, 0, 10] },
        config: {
          includeComps: true,
          includeOMI: true,
          outlierFiltering: true,
          confidenceThreshold: 0.7,
        },
      };

      const result = await engine.runBusinessPlan(input);

      expect(result).toBeDefined();
      expect(result.roi).toBe(0.25);
      expect(result.marginPct).toBe(0.15);
      expect(result.paybackYears).toBe(5);
    });

    it('should handle projectId-only input', async () => {
      const input = { projectId: 'test-project' };

      const result = await engine.runBusinessPlan(input);

      expect(result).toBeDefined();
      expect(result.roi).toBe(0.25);
      expect(result.marginPct).toBe(0.15);
      expect(result.paybackYears).toBe(5);
    });
  });

  describe('runSensitivity', () => {
    it('should calculate sensitivity scenarios', async () => {
      const result = await engine.runSensitivity('test-project');

      expect(result).toBeDefined();
      expect(result.roi).toBe(0.25);
      expect(result.marginPct).toBe(0.15);
      expect(result.paybackYears).toBe(5);
    });
  });
});
