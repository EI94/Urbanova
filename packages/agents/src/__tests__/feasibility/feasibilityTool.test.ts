// FeasibilityTool Tests - Urbanova AI

import { FeasibilityTool } from '../../feasibility/feasibilityTool';

describe('FeasibilityTool', () => {
  let tool: FeasibilityTool;

  beforeEach(() => {
    tool = new FeasibilityTool();
  });

  describe('run_bp', () => {
    it('should execute business plan calculation', async () => {
      const args = { projectId: 'test-project' };
      const result = await tool.run_bp(args);

      expect(result).toBeDefined();
      expect(result.roi).toBe(0.25);
      expect(result.marginPct).toBe(0.15);
      expect(result.paybackYears).toBe(5);
    });
  });

  describe('run_sensitivity', () => {
    it('should execute sensitivity analysis', async () => {
      const args = { projectId: 'test-project' };
      const result = await tool.run_sensitivity(args);

      expect(result).toBeDefined();
      expect(result.scenarios).toBeDefined();
      expect(result.scenarios[0].deltaLabel).toBe('Base');
      expect(result.scenarios[0].roi).toBe(0.25);
    });
  });
});
