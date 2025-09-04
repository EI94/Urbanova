import { feasibilityTool } from '../feasibility';

describe('FeasibilityTool', () => {
  describe('run', () => {
    it('should run feasibility analysis for project', async () => {
      const result = await (feasibilityTool as any).run(
        { userId: 'test-user' },
        { projectId: 'test-project-123' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.summary).toContain('Feasibility analysis completed');
    });
  });

  describe('run_sensitivity', () => {
    it('should run sensitivity analysis with deltas', async () => {
      const result = await (feasibilityTool as any).run_sensitivity(
        { userId: 'test-user' },
        { projectId: 'test-project-123', deltas: [-0.05, 0, 0.05] }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.pdfUrl).toBeDefined();
      expect(result.data.summary).toContain('3 scenarios');
    });

    it('should handle different delta arrays', async () => {
      const result = await (feasibilityTool as any).run_sensitivity(
        { userId: 'test-user' },
        { projectId: 'test-project-456', deltas: [-0.1, -0.05, 0, 0.05, 0.1] }
      );

      expect(result.success).toBe(true);
      expect(result.data.summary).toContain('5 scenarios');
    });
  });
});
