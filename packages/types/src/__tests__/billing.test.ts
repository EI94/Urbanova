import {
  zActionLimit,
  zEntitlement,
  zUsageEvent,
  zBillingState,
  zEntitlementCheck,
  zUsageReport,
  PLAN_ENTITLEMENTS,
  USAGE_METRICS,
  METRIC_DESCRIPTIONS,
  METRIC_COSTS,
} from '../billing';

describe('Billing Types', () => {
  describe('zActionLimit', () => {
    it('should validate valid action limit', () => {
      const validLimit = { soft: 100, hard: 1000 };
      const result = zActionLimit.safeParse(validLimit);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action limit', () => {
      const invalidLimit = { soft: -1, hard: 0 };
      const result = zActionLimit.safeParse(invalidLimit);
      expect(result.success).toBe(false);
    });

    it('should reject when soft > hard', () => {
      const invalidLimit = { soft: 1000, hard: 100 };
      const result = zActionLimit.safeParse(invalidLimit);
      expect(result.success).toBe(false);
    });
  });

  describe('zEntitlement', () => {
    it('should validate valid entitlement', () => {
      const validEntitlement = {
        projectsMax: 5,
        usersMax: 1,
        actionsLimits: {
          'ocr.process': { soft: 500, hard: 1000 },
          'feasibility.run_bp': { soft: 50, hard: 100 },
        },
      };
      const result = zEntitlement.safeParse(validEntitlement);
      expect(result.success).toBe(true);
    });

    it('should reject invalid entitlement', () => {
      const invalidEntitlement = {
        projectsMax: -1,
        usersMax: 0,
        actionsLimits: {},
      };
      const result = zEntitlement.safeParse(invalidEntitlement);
      expect(result.success).toBe(false);
    });
  });

  describe('zUsageEvent', () => {
    it('should validate valid usage event', () => {
      const validEvent = {
        id: 'event-123',
        workspaceId: 'workspace-456',
        toolId: 'ocr',
        action: 'ocr.process',
        qty: 10,
        runId: 'run-789',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      };
      const result = zUsageEvent.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid usage event', () => {
      const invalidEvent = {
        id: 'event-123',
        workspaceId: 'workspace-456',
        toolId: 'ocr',
        action: 'ocr.process',
        qty: -1, // Invalid quantity
        runId: 'run-789',
        timestamp: new Date(),
        status: 'invalid-status' as any,
        retryCount: -1,
      };
      const result = zUsageEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('zBillingState', () => {
    it('should validate valid billing state', () => {
      const validState = {
        workspaceId: 'workspace-123',
        stripeCustomerId: 'cus_123456789',
        plan: 'starter' as const,
        entitlements: {
          projectsMax: 5,
          usersMax: 1,
          actionsLimits: {
            'ocr.process': { soft: 500, hard: 1000 },
          },
        },
        usageMonth: { 'ocr.process': 100 },
        lastBillingDate: new Date(),
        nextBillingDate: new Date(),
        status: 'active' as const,
      };
      const result = zBillingState.safeParse(validState);
      expect(result.success).toBe(true);
    });

    it('should reject invalid billing state', () => {
      const invalidState = {
        workspaceId: '',
        stripeCustomerId: '',
        plan: 'invalid-plan' as any,
        entitlements: {},
        usageMonth: {},
        lastBillingDate: 'invalid-date',
        nextBillingDate: 'invalid-date',
        status: 'invalid-status' as any,
      };
      const result = zBillingState.safeParse(invalidState);
      expect(result.success).toBe(false);
    });
  });

  describe('zEntitlementCheck', () => {
    it('should validate allowed entitlement check', () => {
      const validCheck = {
        allowed: true,
      };
      const result = zEntitlementCheck.safeParse(validCheck);
      expect(result.success).toBe(true);
    });

    it('should validate blocked entitlement check', () => {
      const validCheck = {
        allowed: false,
        reason: 'hard_limit' as const,
        currentUsage: 1000,
        limit: 500,
      };
      const result = zEntitlementCheck.safeParse(validCheck);
      expect(result.success).toBe(true);
    });

    it('should validate warning entitlement check', () => {
      const validCheck = {
        allowed: true,
        warning: true,
        currentUsage: 800,
        limit: 1000,
      };
      const result = zEntitlementCheck.safeParse(validCheck);
      expect(result.success).toBe(true);
    });
  });

  describe('zUsageReport', () => {
    it('should validate valid usage report', () => {
      const validReport = {
        workspaceId: 'workspace-123',
        period: 'current_month' as const,
        metrics: {
          ocr_pages: {
            used: 500,
            limit: 1000,
            percentage: 50,
            cost: 5.0,
          },
        },
        totalCost: 5.0,
        breakdown: [
          {
            metric: 'ocr_pages',
            used: 500,
            cost: 5.0,
            description: 'Pagine OCR processate',
          },
        ],
        generatedAt: new Date(),
      };
      const result = zUsageReport.safeParse(validReport);
      expect(result.success).toBe(true);
    });
  });

  describe('PLAN_ENTITLEMENTS', () => {
    it('should have valid entitlements for all plans', () => {
      expect(PLAN_ENTITLEMENTS.starter).toBeDefined();
      expect(PLAN_ENTITLEMENTS.pro).toBeDefined();
      expect(PLAN_ENTITLEMENTS.business).toBeDefined();

      // Check structure
      Object.values(PLAN_ENTITLEMENTS).forEach(entitlement => {
        expect(entitlement.projectsMax).toBeGreaterThan(0);
        expect(entitlement.usersMax).toBeGreaterThan(0);
        expect(Object.keys(entitlement.actionsLimits).length).toBeGreaterThan(0);

        // Check action limits
        Object.values(entitlement.actionsLimits).forEach(limit => {
          expect(limit.soft).toBeGreaterThan(0);
          expect(limit.hard).toBeGreaterThan(limit.soft);
        });
      });
    });

    it('should have progressive limits', () => {
      expect(PLAN_ENTITLEMENTS.pro.projectsMax).toBeGreaterThan(
        PLAN_ENTITLEMENTS.starter.projectsMax
      );
      expect(PLAN_ENTITLEMENTS.business.projectsMax).toBeGreaterThan(
        PLAN_ENTITLEMENTS.pro.projectsMax
      );
    });
  });

  describe('USAGE_METRICS', () => {
    it('should map all tool actions to metrics', () => {
      const toolActions = [
        'ocr.process',
        'feasibility.run_bp',
        'land-scraper.scan_market',
        'doc-hunter.request',
        'messaging.send_wa',
        'market-intelligence.scan_city',
        'market-intelligence.trend_report',
        'deal-caller.send_questionnaire',
      ];

      toolActions.forEach(action => {
        expect(USAGE_METRICS[action as keyof typeof USAGE_METRICS]).toBeDefined();
      });
    });
  });

  describe('METRIC_DESCRIPTIONS', () => {
    it('should have descriptions for all metrics', () => {
      const metrics = [
        'ocr_pages',
        'feasibility_runs',
        'scraper_scans',
        'doc_requests',
        'wa_messages',
        'market_scans',
        'trend_reports',
        'questionnaires',
      ];

      metrics.forEach(metric => {
        expect(METRIC_DESCRIPTIONS[metric as keyof typeof METRIC_DESCRIPTIONS]).toBeDefined();
        expect(METRIC_DESCRIPTIONS[metric as keyof typeof METRIC_DESCRIPTIONS]).toBeTruthy();
      });
    });
  });

  describe('METRIC_COSTS', () => {
    it('should have positive costs for all metrics', () => {
      Object.values(METRIC_COSTS).forEach(cost => {
        expect(cost).toBeGreaterThan(0);
      });
    });

    it('should have reasonable cost ranges', () => {
      // OCR should be cheapest
      expect(METRIC_COSTS.ocr_pages).toBeLessThan(0.1);

      // Trend reports should be most expensive
      expect(METRIC_COSTS.trend_reports).toBeGreaterThan(0.5);
    });
  });
});
