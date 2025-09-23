// import { checkEntitlement, emitUsageEvent, calculateUsageForToolRun, getUsageMetadata } from '@urbanova/billing';
// import { ToolAction } from '@urbanova/types';

// Mock types for now
type ToolAction =
  | 'ocr.process'
  | 'feasibility.run_bp'
  | 'land-scraper.scan_market'
  | 'market-intelligence.scan_city'
  | 'deal-caller.send_questionnaire';

// ============================================================================
// TOOL RUNNER WITH BILLING INTEGRATION
// ============================================================================

interface ToolRunContext {
  workspaceId: string;
  userId: string;
  toolId: string;
  action: ToolAction;
  args: any;
}

interface ToolRunResult {
  success: boolean;
  data?: any;
  error?: string;
  runId: string;
  executionTime: number;
}

export class ToolRunner {
  private static instance: ToolRunner;

  private constructor() {}

  public static getInstance(): ToolRunner {
    if (!ToolRunner.instance) {
      ToolRunner.instance = new ToolRunner();
    }
    return ToolRunner.instance;
  }

  /**
   * Execute a tool with billing enforcement
   */
  async executeTool(context: ToolRunContext): Promise<ToolRunResult> {
    const startTime = Date.now();
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Check entitlements before execution (Mock for now)
      const entitlementCheck = {
        allowed: true,
        warning: false,
        currentUsage: 100,
        limit: 1000,
      };

      if (!entitlementCheck.allowed) {
        return {
          success: false,
          error: this.formatEntitlementError(entitlementCheck),
          runId,
          executionTime: Date.now() - startTime,
        };
      }

      // 2. Show warning for soft limits
      if (entitlementCheck.warning) {
        console.warn(`Soft limit warning: ${context.toolId}.${context.action}`, {
          currentUsage: entitlementCheck.currentUsage,
          limit: entitlementCheck.limit,
        });
      }

      // 3. Execute the tool
      const result = await this.executeToolAction(context, runId);

      // 4. Emit usage event after successful execution (Mock for now)
      if (result.success) {
        console.log(`Usage emitted: ${context.toolId}.${context.action}`);
      }

      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Tool execution error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        runId,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute the actual tool action
   */
  private async executeToolAction(context: ToolRunContext, runId: string): Promise<ToolRunResult> {
    // This would integrate with your existing tool execution system
    // For now, we'll simulate tool execution

    console.log(`Executing ${context.toolId}.${context.action}`, {
      runId,
      workspaceId: context.workspaceId,
      args: context.args,
    });

    // Simulate tool execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Simulate different tool results
    const mockResults = {
      'ocr.process': {
        success: true,
        data: {
          pagesProcessed: context.args.pages || 5,
          documentType: 'PDF',
          extractedText: 'Sample extracted text...',
        },
      },
      'feasibility.run_bp': {
        success: true,
        data: {
          projectId: context.args.projectId || 'proj-123',
          roi: 15.5,
          complexity: 'medium',
          pdfUrl: '/reports/bp-123.pdf',
        },
      },
      'land-scraper.scan_market': {
        success: true,
        data: {
          city: context.args.city || 'Milano',
          dealsFound: Math.floor(Math.random() * 50) + 10,
          avgPrice: 2500,
        },
      },
      'market-intelligence.scan_city': {
        success: true,
        data: {
          city: context.args.city || 'Milano',
          assetType: context.args.asset || 'residential',
          kpis: {
            medianPrice: 2200,
            absorptionDays: 45,
          },
        },
      },
      'deal-caller.send_questionnaire': {
        success: true,
        data: {
          projectId: context.args.projectId || 'proj-123',
          vendorEmail: context.args.vendorContact?.email || 'vendor@example.com',
          questionnaireUrl: '/vendor/qna?token=abc123',
        },
      },
    };

    const result = mockResults[context.action] || {
      success: true,
      data: { message: 'Tool executed successfully' },
    };

    return {
      ...result,
      runId,
      executionTime: 0, // Will be set by caller
    };
  }

  /**
   * Emit usage event after successful execution (Mock for now)
   */
  private async emitUsage(
    context: ToolRunContext,
    result: ToolRunResult,
    runId: string
  ): Promise<void> {
    // Mock usage emission
    console.log(`Usage emitted: ${context.toolId}.${context.action} = 1`);
  }

  /**
   * Format entitlement error for user display
   */
  private formatEntitlementError(check: any): string {
    switch (check.reason) {
      case 'hard_limit':
        return `Usage limit reached: ${check.currentUsage}/${check.limit}. Upgrade your plan to continue.`;
      case 'trial_expired':
        return 'Your trial period has expired. Please upgrade to continue using this feature.';
      case 'subscription_canceled':
        return 'Your subscription is not active. Please reactivate to use this feature.';
      default:
        return 'This action is not allowed with your current plan.';
    }
  }

  /**
   * Get usage summary for workspace
   */
  async getUsageSummary(workspaceId: string): Promise<any> {
    try {
      // This would integrate with your billing system
      // For now, return mock data
      return {
        workspaceId,
        currentMonth: {
          'ocr.process': 2500,
          'feasibility.run_bp': 45,
          'land-scraper.scan_market': 180,
          'market-intelligence.scan_city': 25,
          'deal-caller.send_questionnaire': 12,
        },
        totalCost: 72.95,
        plan: 'pro',
        status: 'active',
      };
    } catch (error) {
      console.error('Error getting usage summary:', error);
      return null;
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Execute a tool with automatic billing integration
 */
export async function executeTool(
  workspaceId: string,
  userId: string,
  toolId: string,
  action: ToolAction,
  args: any
): Promise<ToolRunResult> {
  const runner = ToolRunner.getInstance();

  return runner.executeTool({
    workspaceId,
    userId,
    toolId,
    action,
    args,
  });
}

/**
 * Check if a tool action is allowed for a workspace
 */
export async function checkToolAllowed(
  workspaceId: string,
  toolId: string,
  action: ToolAction
): Promise<{ allowed: boolean; warning?: boolean; message?: string }> {
  // Mock entitlement check
  return { allowed: true };
}
