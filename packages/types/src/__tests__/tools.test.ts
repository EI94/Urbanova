import {
  zToolManifest,
  zToolActionSpec,
  zToolInstall,
  zToolRun,
  zTool,
  zToolExecutionResult,
  ToolManifest,
  ToolActionSpec,
  ToolInstall,
  ToolRun,
  Tool,
  ToolExecutionResult,
} from '../tools';

describe('Tools Types - Zod Schemas', () => {
  describe('zToolManifest', () => {
    const validManifest: ToolManifest = {
      id: 'feasibility-tool',
      name: 'Feasibility Analysis Tool',
      version: '1.0.0',
      category: 'feasibility',
      description: 'Tool for analyzing project feasibility and ROI calculations',
      author: 'Urbanova Team',
      website: 'https://urbanova.com',
      intents: ['feasibility', 'roi', 'analysis'],
      tags: ['financial', 'analysis'],
      dependencies: ['feasibility-service'],
    };

    it('should validate a valid tool manifest', () => {
      const result = zToolManifest.safeParse(validManifest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const invalidManifest = { ...validManifest, version: 'invalid' };
      const result = zToolManifest.safeParse(invalidManifest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['version']);
      }
    });

    it('should reject invalid category', () => {
      const invalidManifest = { ...validManifest, category: 'invalid' as any };
      const result = zToolManifest.safeParse(invalidManifest);
      expect(result.success).toBe(false);
    });

    it('should reject empty description', () => {
      const invalidManifest = { ...validManifest, description: 'short' };
      const result = zToolManifest.safeParse(invalidManifest);
      expect(result.success).toBe(false);
    });
  });

  describe('zToolActionSpec', () => {
    const validAction: ToolActionSpec = {
      name: 'run_sensitivity',
      description: 'Run sensitivity analysis with specified deltas',
      zArgs: require('zod').z.object({
        projectId: require('zod').z.string(),
        deltas: require('zod').z.array(require('zod').z.number()),
      }),
      requiredRole: 'pm',
      confirm: true,
      longRunning: false,
      timeout: 300,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000,
        maxBackoffMs: 10000,
      },
    };

    it('should validate a valid tool action spec', () => {
      const result = zToolActionSpec.safeParse(validAction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidAction = { ...validAction, requiredRole: 'invalid' as any };
      const result = zToolActionSpec.safeParse(invalidAction);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidAction = { ...validAction, name: '' };
      const result = zToolActionSpec.safeParse(invalidAction);
      expect(result.success).toBe(false);
    });
  });

  describe('zToolInstall', () => {
    const validInstall: ToolInstall = {
      workspaceId: 'workspace-123',
      toolId: 'feasibility-tool',
      enabled: true,
      config: { apiKey: 'test-key' },
      secrets: { secretKey: 'secret-value' },
      installedAt: new Date(),
      updatedAt: new Date(),
      installedBy: 'user-123',
      version: '1.0.0',
    };

    it('should validate a valid tool install', () => {
      const result = zToolInstall.safeParse(validInstall);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidInstall = { ...validInstall };
      delete (invalidInstall as any).workspaceId;
      const result = zToolInstall.safeParse(invalidInstall);
      expect(result.success).toBe(false);
    });
  });

  describe('zToolRun', () => {
    const validRun: ToolRun = {
      id: 'run-123',
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      projectId: 'project-123',
      workspaceId: 'workspace-123',
      userId: 'user-123',
      status: 'completed',
      startedAt: new Date(),
      finishedAt: new Date(),
      args: { projectId: 'project-123', deltas: [-0.1, 0.1] },
      output: { roi: 15.5, range: { min: 12, max: 18 } },
      logs: ['Starting analysis...', 'Analysis completed'],
      progress: 100,
      metadata: { executionTime: 5000 },
    };

    it('should validate a valid tool run', () => {
      const result = zToolRun.safeParse(validRun);
      expect(result.success).toBe(true);
    });

    it('should validate pending status without finishedAt', () => {
      const pendingRun = { ...validRun, status: 'pending' as const, finishedAt: undefined };
      const result = zToolRun.safeParse(pendingRun);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidRun = { ...validRun, status: 'invalid' as any };
      const result = zToolRun.safeParse(invalidRun);
      expect(result.success).toBe(false);
    });
  });

  describe('zTool', () => {
    const validTool: Tool = {
      manifest: {
        id: 'feasibility-tool',
        name: 'Feasibility Analysis Tool',
        version: '1.0.0',
        category: 'feasibility',
        description: 'Tool for analyzing project feasibility',
      },
      actions: [
        {
          name: 'run_sensitivity',
          description: 'Run sensitivity analysis',
          zArgs: require('zod').z.object({
            projectId: require('zod').z.string(),
            deltas: require('zod').z.array(require('zod').z.number()),
          }),
          requiredRole: 'pm',
        },
      ],
      uiExtensions: [
        {
          type: 'button',
          location: 'project-header',
          component: 'SensitivityButton',
          props: { color: 'blue' },
        },
      ],
    };

    it('should validate a valid tool', () => {
      const result = zTool.safeParse(validTool);
      expect(result.success).toBe(true);
    });

    it('should validate tool without UI extensions', () => {
      const toolWithoutUI = { ...validTool };
      delete toolWithoutUI.uiExtensions;
      const result = zTool.safeParse(toolWithoutUI);
      expect(result.success).toBe(true);
    });
  });

  describe('zToolExecutionResult', () => {
    const validResult: ToolExecutionResult = {
      success: true,
      data: { roi: 15.5, range: { min: 12, max: 18 } },
      executionTime: 5000,
      toolId: 'feasibility-tool',
      action: 'run_sensitivity',
      runId: 'run-123',
      logs: ['Starting analysis...', 'Analysis completed'],
    };

    it('should validate a successful execution result', () => {
      const result = zToolExecutionResult.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should validate a failed execution result', () => {
      const failedResult = { ...validResult, success: false, error: 'Something went wrong' };
      const result = zToolExecutionResult.safeParse(failedResult);
      expect(result.success).toBe(true);
    });

    it('should reject negative execution time', () => {
      const invalidResult = { ...validResult, executionTime: -1000 };
      const result = zToolExecutionResult.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });
  });
});
