import {
  zCapabilitySpec,
  zCapabilityContext,
  zPlan,
  zQnaAnswer,
  zProjectSemanticKPI,
  zProjectSemanticIndex,
  CapabilitySpec,
  CapabilityContext,
  Plan,
  QnaAnswer,
  ProjectSemanticKPI,
  ProjectSemanticIndex,
} from '../os';

describe('OS Types - Zod Schemas', () => {
  describe('zCapabilitySpec', () => {
    it('should validate valid capability spec', () => {
      const validSpec = {
        name: 'test.capability',
        description: 'A test capability',
        zArgs: { type: 'object' }, // Mock Zod schema
        requiredRole: 'pm' as const,
        confirm: true,
        dryRun: false,
      };

      const result = zCapabilitySpec.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it('should reject invalid capability spec', () => {
      const invalidSpec = {
        name: '', // Empty name
        description: 'A test capability',
        zArgs: { type: 'object' },
        requiredRole: 'invalid_role' as any, // Invalid role
      };

      const result = zCapabilitySpec.safeParse(invalidSpec);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('zCapabilityContext', () => {
    it('should validate valid capability context', () => {
      const validContext = {
        userId: 'user123',
        sender: 'whatsapp:+1234567890',
        projectId: 'project456',
        now: new Date(),
        logger: { info: jest.fn() },
        db: { collection: jest.fn() },
      };

      const result = zCapabilityContext.safeParse(validContext);
      expect(result.success).toBe(true);
    });

    it('should reject invalid capability context', () => {
      const invalidContext = {
        userId: '', // Empty userId
        sender: 'whatsapp:+1234567890',
        now: 'invalid-date', // Invalid date
        logger: { info: jest.fn() },
        db: { collection: jest.fn() },
      };

      const result = zCapabilityContext.safeParse(invalidContext);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('zPlan', () => {
    it('should validate valid plan', () => {
      const validPlan = {
        mode: 'ACTION' as const,
        intent: 'echo.say',
        args: { text: 'hello' },
        confidence: 0.95,
        projectId: 'project123',
      };

      const result = zPlan.safeParse(validPlan);
      expect(result.success).toBe(true);
    });

    it('should validate QNA plan', () => {
      const validQnaPlan = {
        mode: 'QNA' as const,
        confidence: 0.8,
        projectId: 'project123',
      };

      const result = zPlan.safeParse(validQnaPlan);
      expect(result.success).toBe(true);
    });

    it('should reject invalid plan', () => {
      const invalidPlan = {
        mode: 'INVALID' as any, // Invalid mode
        confidence: 1.5, // Invalid confidence > 1
      };

      const result = zPlan.safeParse(invalidPlan);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('zQnaAnswer', () => {
    it('should validate valid QNA answer', () => {
      const validAnswer = {
        answer: 'Il progetto A ha una documentazione completa e aggiornata.',
        citations: [
          {
            title: 'Documentazione Progetto A',
            docId: 'doc123',
            page: 1,
            url: 'https://example.com/doc123',
          },
        ],
      };

      const result = zQnaAnswer.safeParse(validAnswer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid QNA answer', () => {
      const invalidAnswer = {
        answer: '', // Empty answer
        citations: [
          {
            docId: '', // Empty docId
          },
        ],
      };

      const result = zQnaAnswer.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('zProjectSemanticKPI', () => {
    it('should validate valid semantic KPI', () => {
      const validKPI = {
        projectId: 'project123',
        timestamp: new Date(),
        metrics: {
          totalBudget: 1000000,
          currentSpend: 500000,
          progress: 75,
          roi: 15.5,
          riskLevel: 'MEDIUM' as const,
          status: 'IN_PROGRESS',
        },
        lastUpdated: new Date(),
      };

      const result = zProjectSemanticKPI.safeParse(validKPI);
      expect(result.success).toBe(true);
    });

    it('should reject invalid semantic KPI', () => {
      const invalidKPI = {
        projectId: 'project123',
        timestamp: new Date(),
        metrics: {
          totalBudget: 1000000,
          currentSpend: 500000,
          progress: 150, // Invalid progress > 100
          roi: 15.5,
          riskLevel: 'INVALID' as any, // Invalid risk level
          status: 'IN_PROGRESS',
        },
        lastUpdated: new Date(),
      };

      const result = zProjectSemanticKPI.safeParse(invalidKPI);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('zProjectSemanticIndex', () => {
    it('should validate valid semantic index', () => {
      const validIndex = {
        projectId: 'project123',
        documents: [
          {
            docId: 'doc123',
            title: 'Documento 1',
            textSnippet: 'Questo è un documento importante',
            url: 'https://example.com/doc123',
            type: 'pdf',
            lastModified: new Date(),
          },
        ],
        lastIndexed: new Date(),
      };

      const result = zProjectSemanticIndex.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should reject invalid semantic index', () => {
      const invalidIndex = {
        projectId: 'project123',
        documents: [
          {
            docId: '', // Empty docId
            title: 'Documento 1',
            textSnippet: 'Questo è un documento importante',
            type: 'pdf',
            lastModified: new Date(),
          },
        ],
        lastIndexed: new Date(),
      };

      const result = zProjectSemanticIndex.safeParse(invalidIndex);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });
});
