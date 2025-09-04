import { schemas } from '../interactive';
import { SessionStatus } from '../interactive';

describe('Interactive Types Zod Schemas', () => {
  describe('zPlanStep', () => {
    it('should validate a valid plan step', () => {
      const validStep = {
        id: 'step-1',
        toolId: 'feasibility',
        action: 'run_sensitivity',
        description: 'Run sensitivity analysis',
        zArgs: { projectId: 'proj-123', deltas: [0.1, 0.2] },
        requiredRole: 'pm',
        confirm: true,
        longRunning: false,
        order: 1,
      };

      const result = schemas.zPlanStep.safeParse(validStep);
      expect(result.success).toBe(true);
    });

    it('should require mandatory fields', () => {
      const invalidStep = {
        id: 'step-1',
        toolId: 'feasibility',
        // missing action
        description: 'Run sensitivity analysis',
        requiredRole: 'pm',
        order: 1,
      };

      const result = schemas.zPlanStep.safeParse(invalidStep);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('action'))).toBe(true);
      }
    });
  });

  describe('zRequirement', () => {
    it('should validate a valid requirement', () => {
      const validRequirement = {
        id: 'req-1',
        field: 'projectId',
        description: 'Project ID is required',
        type: 'text' as const,
        required: true,
        currentValue: 'proj-123',
      };

      const result = schemas.zRequirement.safeParse(validRequirement);
      expect(result.success).toBe(true);
    });

    it('should validate select type with options', () => {
      const selectRequirement = {
        id: 'req-2',
        field: 'assetType',
        description: 'Select asset type',
        type: 'select' as const,
        required: true,
        options: ['residenziale', 'uffici', 'retail'],
      };

      const result = schemas.zRequirement.safeParse(selectRequirement);
      expect(result.success).toBe(true);
    });
  });

  describe('zAssumption', () => {
    it('should validate a valid assumption', () => {
      const validAssumption = {
        id: 'assump-1',
        description: 'Project will complete within 18 months',
        confidence: 'high' as const,
        source: 'historical data',
      };

      const result = schemas.zAssumption.safeParse(validAssumption);
      expect(result.success).toBe(true);
    });

    it('should require confidence level', () => {
      const invalidAssumption = {
        id: 'assump-1',
        description: 'Project will complete within 18 months',
        // missing confidence
      };

      const result = schemas.zAssumption.safeParse(invalidAssumption);
      expect(result.success).toBe(false);
    });
  });

  describe('zRisk', () => {
    it('should validate a valid risk', () => {
      const validRisk = {
        id: 'risk-1',
        description: 'Construction delays due to weather',
        severity: 'medium' as const,
        mitigation: 'Include buffer time in schedule',
      };

      const result = schemas.zRisk.safeParse(validRisk);
      expect(result.success).toBe(true);
    });

    it('should require severity level', () => {
      const invalidRisk = {
        id: 'risk-1',
        description: 'Construction delays due to weather',
        // missing severity
      };

      const result = schemas.zRisk.safeParse(invalidRisk);
      expect(result.success).toBe(false);
    });
  });

  describe('zPlan', () => {
    it('should validate a valid plan', () => {
      const validPlan = {
        id: 'plan-1',
        title: 'Feasibility Analysis',
        description: 'Run comprehensive feasibility analysis',
        steps: [
          {
            id: 'step-1',
            toolId: 'feasibility',
            action: 'run',
            description: 'Run feasibility analysis',
            requiredRole: 'pm',
            order: 1,
          },
        ],
        requirements: [
          {
            id: 'req-1',
            field: 'projectId',
            description: 'Project ID required',
            type: 'text' as const,
            required: true,
          },
        ],
        assumptions: [
          {
            id: 'assump-1',
            description: 'Project will complete on time',
            confidence: 'medium' as const,
          },
        ],
        risks: [
          {
            id: 'risk-1',
            description: 'Market volatility',
            severity: 'high' as const,
          },
        ],
        estimatedDuration: 30,
        totalCost: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = (schemas as any).zPlan.safeParse(validPlan);
      expect(result.success).toBe(true);
    });
  });

  describe('zUserReply', () => {
    it('should validate a confirm reply', () => {
      const validReply = {
        id: 'reply-1',
        type: 'confirm' as const,
        timestamp: new Date(),
        userId: 'user-123',
      };

      const result = schemas.zUserReply.safeParse(validReply);
      expect(result.success).toBe(true);
    });

    it('should validate an edit reply with data', () => {
      const editReply = {
        id: 'reply-2',
        type: 'edit' as const,
        timestamp: new Date(),
        userId: 'user-123',
        data: { projectId: 'new-proj-456' },
      };

      const result = schemas.zUserReply.safeParse(editReply);
      expect(result.success).toBe(true);
    });
  });

  describe('zTaskSession', () => {
    it('should validate a valid task session', () => {
      const validSession = {
        id: 'session-1',
        projectId: 'proj-123',
        userId: 'user-123',
        status: SessionStatus.COLLECTING,
        plan: {
          id: 'plan-1',
          title: 'Test Plan',
          description: 'Test Description',
          steps: [],
          requirements: [],
          assumptions: [],
          risks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = schemas.zTaskSession.safeParse(validSession);
      expect(result.success).toBe(true);
    });
  });

  describe('zPlanValidation', () => {
    it('should validate a valid plan validation result', () => {
      const validValidation = {
        missing: [
          {
            id: 'req-1',
            field: 'projectId',
            description: 'Project ID is missing',
            type: 'text' as const,
            required: true,
          },
        ],
        ready: false,
        warnings: ['Project ID not found'],
        errors: [],
      };

      const result = schemas.zPlanValidation.safeParse(validValidation);
      expect(result.success).toBe(true);
    });
  });

  describe('zPlanPreview', () => {
    it('should validate a valid plan preview', () => {
      const validPreview = {
        title: 'Feasibility Analysis',
        description: 'Run comprehensive feasibility analysis',
        steps: [
          {
            id: 'step-1',
            description: 'Run feasibility analysis',
            toolId: 'feasibility',
            action: 'run',
            status: 'pending' as const,
          },
        ],
        missing: [
          {
            id: 'req-1',
            field: 'projectId',
            description: 'Project ID is missing',
            type: 'text' as const,
            required: true,
          },
        ],
        assumptions: [
          {
            id: 'assump-1',
            description: 'Project will complete on time',
            confidence: 'medium' as const,
          },
        ],
        risks: [
          {
            id: 'risk-1',
            description: 'Market volatility',
            severity: 'high' as const,
          },
        ],
        estimatedDuration: 30,
        totalCost: 5000,
        ctas: ['confirm', 'edit', 'dryrun', 'cancel'] as const,
      };

      const result = schemas.zPlanPreview.safeParse(validPreview);
      expect(result.success).toBe(true);
    });
  });
});
