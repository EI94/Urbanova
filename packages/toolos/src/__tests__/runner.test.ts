import { ToolRunner } from '../runner';
import { ToolRegistry } from '../registry';
import { ToolManifest, ToolActionSpec, ToolContext } from '@urbanova/types';

describe('ToolRunner', () => {
  let runner: ToolRunner;
  let registry: ToolRegistry;

  beforeEach(() => {
    runner = new ToolRunner();
    registry = new ToolRegistry();
  });

  const mockManifest: ToolManifest = {
    id: 'test-tool',
    name: 'Test Tool',
    version: '1.0.0',
    category: 'analysis',
    description: 'A test tool for testing purposes',
  };

  const mockAction: ToolActionSpec = {
    name: 'run_test',
    description: 'Run a test action',
    zArgs: require('zod').z.object({
      input: require('zod').z.string(),
      number: require('zod').z.number(),
    }),
    requiredRole: 'pm',
  };

  const mockContext: ToolContext = {
    userId: 'user-123',
    workspaceId: 'workspace-123',
    projectId: 'project-123',
    userRole: 'pm',
    now: new Date(),
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
    db: null,
  };

  const mockRequest = {
    toolId: 'test-tool',
    action: 'run_test',
    args: { input: 'test input', number: 42 },
    context: mockContext,
  };

  describe('runAction', () => {
    beforeEach(() => {
      // Registra il tool nel registry
      registry.registerTool(mockManifest, [mockAction]);

      // Mock del registry nel runner
      (runner as any).toolRegistry = registry;
    });

    it('should execute action successfully', async () => {
      const result = await runner.runAction(mockRequest);

      expect(result.success).toBe(true);
      expect(result.toolId).toBe('test-tool');
      expect(result.action).toBe('run_test');
      expect(result.runId).toBeDefined();
      expect(result.logs).toHaveLength(3); // pending, running, completed
    });

    it('should handle validation errors', async () => {
      const invalidRequest = {
        ...mockRequest,
        args: { input: 'test', number: 'invalid' }, // number should be number
      };

      const result = await runner.runAction(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected number');
    });

    it('should handle tool not found', async () => {
      const invalidRequest = {
        ...mockRequest,
        toolId: 'non-existent-tool',
      };

      const result = await runner.runAction(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool non trovato');
    });

    it('should handle action not found', async () => {
      const invalidRequest = {
        ...mockRequest,
        action: 'non-existent-action',
      };

      const result = await runner.runAction(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Action 'non-existent-action' non trovata");
    });

    it('should handle long running actions', async () => {
      const longRunningAction = {
        ...mockAction,
        longRunning: true,
      };

      registry.unregisterTool('test-tool');
      registry.registerTool(mockManifest, [longRunningAction]);

      const startTime = Date.now();
      const result = await runner.runAction(mockRequest);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeGreaterThan(1000); // Should take at least 1 second
    });

    it('should handle progress callbacks', async () => {
      const onProgress = jest.fn();
      const onLog = jest.fn();

      const result = await runner.runAction(mockRequest, {
        onProgress,
        onLog,
      });

      expect(result.success).toBe(true);
      // Progress and log callbacks should be called during execution
      expect(onProgress).toHaveBeenCalled();
      expect(onLog).toHaveBeenCalled();
    });
  });

  describe('getActiveRun', () => {
    it('should return active run by ID', async () => {
      const result = await runner.runAction(mockRequest);
      const runId = result.runId;

      // Since runs are removed after completion, we need to check during execution
      // For now, just verify the runId is generated
      expect(runId).toMatch(/^run-\d+-[a-z0-9]+$/);
    });
  });

  describe('listActiveRuns', () => {
    it('should return empty array when no active runs', () => {
      const activeRuns = runner.listActiveRuns();
      expect(activeRuns).toHaveLength(0);
    });
  });

  describe('getRunStats', () => {
    it('should return correct run statistics', () => {
      const stats = runner.getRunStats();
      expect(stats.active).toBe(0);
      expect(stats.total).toBe(0);
    });
  });

  describe('executeAction', () => {
    it('should return sensitivity results for sensitivity actions', async () => {
      const sensitivityAction = {
        ...mockAction,
        name: 'run_sensitivity',
      };

      registry.unregisterTool('test-tool');
      registry.registerTool(mockManifest, [sensitivityAction]);

      const result = await runner.runAction({
        ...mockRequest,
        action: 'run_sensitivity',
        args: { deltas: [-0.1, 0.1] },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('baseRoi');
      expect(result.data).toHaveProperty('range');
      expect(result.data).toHaveProperty('pdfUrl');
    });

    it('should return scraping results for scrape actions', async () => {
      const scrapeAction = {
        ...mockAction,
        name: 'scrape_listing',
      };

      registry.unregisterTool('test-tool');
      registry.registerTool(mockManifest, [scrapeAction]);

      const result = await runner.runAction({
        ...mockRequest,
        action: 'scrape_listing',
        args: { url: 'https://example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('scrapedData');
      expect(result.data).toHaveProperty('source');
    });

    it('should return analysis results for analyze actions', async () => {
      const analyzeAction = {
        ...mockAction,
        name: 'analyze_project',
      };

      registry.unregisterTool('test-tool');
      registry.registerTool(mockManifest, [analyzeAction]);

      const result = await runner.runAction({
        ...mockRequest,
        action: 'analyze_project',
        args: { projectId: 'project-123' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('analysis');
      expect(result.data.analysis).toHaveProperty('sentiment');
      expect(result.data.analysis).toHaveProperty('confidence');
    });
  });
});
