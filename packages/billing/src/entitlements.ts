import {
  EntitlementCheck,
  BillingState,
  ToolAction,
  PLAN_ENTITLEMENTS,
  USAGE_METRICS,
  METRIC_COSTS,
} from '@urbanova/types';
import { getBillingState } from './data';

// ============================================================================
// ENTITLEMENT CHECKING
// ============================================================================

export async function checkEntitlement(
  workspaceId: string,
  toolId: string,
  action: ToolAction
): Promise<EntitlementCheck> {
  try {
    // Get current billing state
    const billingState = await getBillingState(workspaceId);

    if (!billingState) {
      return {
        allowed: false,
        reason: 'subscription_canceled',
        upgradeUrl: '/dashboard/billing',
      };
    }

    // Check if trial has expired
    if (billingState.trialEndsAt && new Date() > billingState.trialEndsAt) {
      return {
        allowed: false,
        reason: 'trial_expired',
        upgradeUrl: '/dashboard/billing',
      };
    }

    // Check if subscription is active
    if (billingState.status !== 'active' && billingState.status !== 'trialing') {
      return {
        allowed: false,
        reason: 'subscription_canceled',
        upgradeUrl: '/dashboard/billing',
      };
    }

    // Get current usage for this action
    const currentUsage = billingState.usageMonth[`${toolId}.${action}`] || 0;
    const limit = billingState.entitlements.actionsLimits[`${toolId}.${action}`];

    if (!limit) {
      // No limit defined for this action, allow it
      return { allowed: true };
    }

    // Check hard limit
    if (currentUsage >= limit.hard) {
      return {
        allowed: false,
        reason: 'hard_limit',
        currentUsage,
        limit: limit.hard,
        upgradeUrl: generateUpgradeUrl(billingState.plan),
      };
    }

    // Check soft limit
    if (currentUsage >= limit.soft) {
      return {
        allowed: true,
        warning: true,
        currentUsage,
        limit: limit.soft,
      };
    }

    // Within limits
    return { allowed: true };
  } catch (error) {
    console.error('Error checking entitlement:', error);
    // Default to allowing if there's an error
    return { allowed: true };
  }
}

// ============================================================================
// USAGE CALCULATION
// ============================================================================

export function calculateUsageCost(toolId: string, action: ToolAction, quantity: number): number {
  const metric = USAGE_METRICS[action];
  if (!metric) {
    console.warn(`No metric mapping found for action: ${action}`);
    return 0;
  }

  const costPerUnit = METRIC_COSTS[metric];
  return costPerUnit * quantity;
}

export function getUsageSummary(billingState: BillingState): Array<{
  toolAction: string;
  used: number;
  soft: number;
  hard: number;
  percentage: number;
  cost: number;
}> {
  const summary = [];

  for (const [toolAction, limit] of Object.entries(billingState.entitlements.actionsLimits)) {
    const used = billingState.usageMonth[toolAction] || 0;
    const percentage = Math.round((used / limit.hard) * 100);
    const cost = calculateUsageCost(toolAction.split('.')[0], toolAction as ToolAction, used);

    summary.push({
      toolAction,
      used,
      soft: limit.soft,
      hard: limit.hard,
      percentage,
      cost,
    });
  }

  return summary.sort((a, b) => b.percentage - a.percentage);
}

// ============================================================================
// UPGRADE RECOMMENDATIONS
// ============================================================================

export function getUpgradeRecommendation(billingState: BillingState): {
  recommended: boolean;
  reason?: string;
  suggestedPlan?: string;
  currentUsage: number;
  currentLimit: number;
} {
  const usageSummary = getUsageSummary(billingState);
  const highUsageItems = usageSummary.filter(item => item.percentage >= 80);

  if (highUsageItems.length === 0) {
    return {
      recommended: false,
      currentUsage: 0,
      currentLimit: 0,
    };
  }

  const highestUsage = highUsageItems[0];
  const currentPlan = billingState.plan;

  // Determine suggested plan
  let suggestedPlan: string | undefined;
  let reason: string | undefined;

  if (currentPlan === 'starter' && highestUsage.percentage >= 90) {
    suggestedPlan = 'pro';
    reason = `Stai utilizzando il ${highestUsage.percentage}% del limite per ${highestUsage.toolAction}`;
  } else if (currentPlan === 'pro' && highestUsage.percentage >= 90) {
    suggestedPlan = 'business';
    reason = `Stai utilizzando il ${highestUsage.percentage}% del limite per ${highestUsage.toolAction}`;
  }

  return {
    recommended: suggestedPlan !== undefined,
    reason,
    suggestedPlan,
    currentUsage: highestUsage.used,
    currentLimit: highestUsage.hard,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateUpgradeUrl(currentPlan: string): string {
  const baseUrl = '/dashboard/billing';

  switch (currentPlan) {
    case 'starter':
      return `${baseUrl}?plan=pro`;
    case 'pro':
      return `${baseUrl}?plan=business`;
    default:
      return baseUrl;
  }
}

export function getPlanComparison(): Array<{
  plan: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
}> {
  return [
    {
      plan: 'starter',
      name: 'Starter',
      price: 29,
      features: ['5 progetti', '1 utente', '1000 actions/mese', 'Supporto email'],
      limits: {
        projects: 5,
        users: 1,
        actions: 1000,
      },
    },
    {
      plan: 'pro',
      name: 'Pro',
      price: 99,
      features: [
        '25 progetti',
        '5 utenti',
        '10000 actions/mese',
        'Supporto prioritario',
        'Analisi avanzate',
      ],
      limits: {
        projects: 25,
        users: 5,
        actions: 10000,
      },
    },
    {
      plan: 'business',
      name: 'Business',
      price: 299,
      features: [
        '100 progetti',
        '20 utenti',
        '50000 actions/mese',
        'Supporto dedicato',
        'API access',
        'Custom integrations',
      ],
      limits: {
        projects: 100,
        users: 20,
        actions: 50000,
      },
    },
  ];
}

export function formatUsageMessage(check: EntitlementCheck, toolAction: string): string {
  if (check.allowed && !check.warning) {
    return `✅ ${toolAction} autorizzato`;
  }

  if (check.allowed && check.warning) {
    return `⚠️ ${toolAction} autorizzato (${check.currentUsage}/${check.limit} utilizzati)`;
  }

  if (!check.allowed) {
    switch (check.reason) {
      case 'hard_limit':
        return `❌ ${toolAction} bloccato: limite raggiunto (${check.currentUsage}/${check.limit})`;
      case 'trial_expired':
        return `❌ ${toolAction} bloccato: periodo di prova scaduto`;
      case 'subscription_canceled':
        return `❌ ${toolAction} bloccato: abbonamento non attivo`;
      default:
        return `❌ ${toolAction} bloccato`;
    }
  }

  return `❌ ${toolAction} non autorizzato`;
}
