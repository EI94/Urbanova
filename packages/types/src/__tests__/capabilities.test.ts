import {
  zProjectSummaryArgs,
  zSensitivityArgs,
  zProjectSummary,
  zSensitivityResult,
  zProjectAliasResolution,
  ProjectSummary,
  SensitivityResult,
  ProjectAliasResolution,
  CHAT_INTENT_PATTERNS,
} from '../capabilities';

describe('Capability Types - Zod Schemas', () => {
  describe('zProjectSummaryArgs', () => {
    it('should validate valid project summary args', () => {
      const validArgs = {
        projectId: 'project123',
      };

      const result = zProjectSummaryArgs.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid project summary args', () => {
      const invalidArgs = {
        projectId: '', // Empty projectId
      };

      const result = zProjectSummaryArgs.safeParse(invalidArgs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('zSensitivityArgs', () => {
    it('should validate valid sensitivity args', () => {
      const validArgs = {
        projectId: 'project123',
        deltas: [-0.1, -0.05, 0.05, 0.1],
      };

      const result = zSensitivityArgs.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject sensitivity args with invalid deltas', () => {
      const invalidArgs = {
        projectId: 'project123',
        deltas: [-0.3, 0.25], // Out of bounds
      };

      const result = zSensitivityArgs.safeParse(invalidArgs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });

    it('should reject empty deltas array', () => {
      const invalidArgs = {
        projectId: 'project123',
        deltas: [], // Empty array
      };

      const result = zSensitivityArgs.safeParse(invalidArgs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });

    it('should reject too many deltas', () => {
      const invalidArgs = {
        projectId: 'project123',
        deltas: [-0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4], // 11 deltas
      };

      const result = zSensitivityArgs.safeParse(invalidArgs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('zProjectSummary', () => {
    it('should validate valid project summary', () => {
      const validSummary: ProjectSummary = {
        roi: 15.5,
        marginPct: 25.0,
        paybackYears: 4.5,
        docs: {
          complete: 8,
          total: 10,
          missing: ['DURC', 'Planimetria'],
        },
        milestones: [
          {
            title: 'Approvazione Permessi',
            due: '2024-12-15',
            status: 'due',
          },
          {
            title: 'Inizio Lavori',
            due: '2024-11-30',
            status: 'overdue',
          },
        ],
      };

      const result = zProjectSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should validate project summary with optional fields', () => {
      const validSummary: ProjectSummary = {
        docs: {
          complete: 5,
          total: 10,
          missing: ['CDU', 'VISURA', 'DURC', 'Planimetria', 'Progetto'],
        },
        milestones: [],
      };

      const result = zProjectSummary.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject invalid milestone status', () => {
      const invalidSummary = {
        docs: {
          complete: 5,
          total: 10,
          missing: ['CDU'],
        },
        milestones: [
          {
            title: 'Test Milestone',
            due: '2024-12-15',
            status: 'invalid_status' as any,
          },
        ],
      };

      const result = zProjectSummary.safeParse(invalidSummary);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('zSensitivityResult', () => {
    it('should validate valid sensitivity result', () => {
      const validResult: SensitivityResult = {
        baseRoi: 15.0,
        range: {
          min: 12.0,
          max: 18.0,
        },
        pdfUrl: 'https://example.com/sensitivity-report.pdf',
      };

      const result = zSensitivityResult.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidResult = {
        baseRoi: 15.0,
        range: {
          min: 12.0,
          max: 18.0,
        },
        pdfUrl: 'not-a-valid-url',
      };

      const result = zSensitivityResult.safeParse(invalidResult);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('zProjectAliasResolution', () => {
    it('should validate valid project alias resolution', () => {
      const validResolution: ProjectAliasResolution = {
        projectId: 'project123',
        projectName: 'Progetto A',
        confidence: 0.95,
      };

      const result = zProjectAliasResolution.safeParse(validResolution);
      expect(result.success).toBe(true);
    });

    it('should validate resolution without project name', () => {
      const validResolution: ProjectAliasResolution = {
        projectId: 'project123',
        confidence: 0.8,
      };

      const result = zProjectAliasResolution.safeParse(validResolution);
      expect(result.success).toBe(true);
    });

    it('should reject invalid confidence', () => {
      const invalidResolution = {
        projectId: 'project123',
        confidence: 1.5, // > 1
      };

      const result = zProjectAliasResolution.safeParse(invalidResolution);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });
  });

  describe('CHAT_INTENT_PATTERNS', () => {
    it('should have summary patterns', () => {
      expect(CHAT_INTENT_PATTERNS.summary).toContain('riepilogo');
      expect(CHAT_INTENT_PATTERNS.summary).toContain('summary');
      expect(CHAT_INTENT_PATTERNS.summary).toContain("com'è messo");
      expect(CHAT_INTENT_PATTERNS.summary).toContain('stato documenti');
      expect(CHAT_INTENT_PATTERNS.summary).toContain('kpi');
    });

    it('should have sensitivity patterns', () => {
      expect(CHAT_INTENT_PATTERNS.sensitivity).toContain('sensitivity');
      expect(CHAT_INTENT_PATTERNS.sensitivity).toContain('±');
      expect(CHAT_INTENT_PATTERNS.sensitivity).toContain('scenario');
      expect(CHAT_INTENT_PATTERNS.sensitivity).toContain('variazione costi');
      expect(CHAT_INTENT_PATTERNS.sensitivity).toContain('variazione prezzi');
    });

    it('should have non-empty pattern arrays', () => {
      expect(CHAT_INTENT_PATTERNS.summary.length).toBeGreaterThan(0);
      expect(CHAT_INTENT_PATTERNS.sensitivity.length).toBeGreaterThan(0);
    });
  });
});
