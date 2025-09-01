import { z } from 'zod';
export type PlanId = 'starter' | 'pro' | 'business';
export type ToolAction =
  | 'ocr.process'
  | 'feasibility.run_bp'
  | 'land-scraper.scan_market'
  | 'doc-hunter.request'
  | 'messaging.send_wa'
  | 'market-intelligence.scan_city'
  | 'market-intelligence.trend_report'
  | 'deal-caller.send_questionnaire';
export type UsageMetric =
  | 'ocr_pages'
  | 'feasibility_runs'
  | 'scraper_scans'
  | 'doc_requests'
  | 'wa_messages'
  | 'market_scans'
  | 'trend_reports'
  | 'questionnaires';
export interface ActionLimit {
  soft: number;
  hard: number;
}
export interface Entitlement {
  projectsMax: number;
  usersMax: number;
  actionsLimits: Record<ToolAction, ActionLimit>;
}
export declare const zActionLimit: z.ZodObject<
  {
    soft: z.ZodNumber;
    hard: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    hard: number;
    soft: number;
  },
  {
    hard: number;
    soft: number;
  }
>;
export declare const zEntitlement: z.ZodObject<
  {
    projectsMax: z.ZodNumber;
    usersMax: z.ZodNumber;
    actionsLimits: z.ZodRecord<
      z.ZodString,
      z.ZodObject<
        {
          soft: z.ZodNumber;
          hard: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          hard: number;
          soft: number;
        },
        {
          hard: number;
          soft: number;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectsMax: number;
    usersMax: number;
    actionsLimits: Record<
      string,
      {
        hard: number;
        soft: number;
      }
    >;
  },
  {
    projectsMax: number;
    usersMax: number;
    actionsLimits: Record<
      string,
      {
        hard: number;
        soft: number;
      }
    >;
  }
>;
export interface UsageEvent {
  id: string;
  workspaceId: string;
  toolId: string;
  action: ToolAction;
  qty: number;
  runId: string;
  timestamp: Date;
  stripeItemId?: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  metadata?: Record<string, any>;
}
export declare const zUsageEvent: z.ZodObject<
  {
    id: z.ZodString;
    workspaceId: z.ZodString;
    toolId: z.ZodString;
    action: z.ZodString;
    qty: z.ZodNumber;
    runId: z.ZodString;
    timestamp: z.ZodDate;
    stripeItemId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<['pending', 'sent', 'failed']>;
    retryCount: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status: 'pending' | 'failed' | 'sent';
    timestamp: Date;
    workspaceId: string;
    toolId: string;
    action: string;
    qty: number;
    runId: string;
    retryCount: number;
    metadata?: Record<string, any> | undefined;
    stripeItemId?: string | undefined;
  },
  {
    id: string;
    status: 'pending' | 'failed' | 'sent';
    timestamp: Date;
    workspaceId: string;
    toolId: string;
    action: string;
    qty: number;
    runId: string;
    retryCount: number;
    metadata?: Record<string, any> | undefined;
    stripeItemId?: string | undefined;
  }
>;
export interface BillingState {
  workspaceId: string;
  stripeCustomerId: string;
  stripeSubId?: string;
  plan: PlanId;
  trialEndsAt?: Date;
  entitlements: Entitlement;
  usageMonth: Record<string, number>;
  lastBillingDate: Date;
  nextBillingDate: Date;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  metadata?: Record<string, any>;
}
export declare const zBillingState: z.ZodObject<
  {
    workspaceId: z.ZodString;
    stripeCustomerId: z.ZodString;
    stripeSubId: z.ZodOptional<z.ZodString>;
    plan: z.ZodEnum<['starter', 'pro', 'business']>;
    trialEndsAt: z.ZodOptional<z.ZodDate>;
    entitlements: z.ZodObject<
      {
        projectsMax: z.ZodNumber;
        usersMax: z.ZodNumber;
        actionsLimits: z.ZodRecord<
          z.ZodString,
          z.ZodObject<
            {
              soft: z.ZodNumber;
              hard: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              hard: number;
              soft: number;
            },
            {
              hard: number;
              soft: number;
            }
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        projectsMax: number;
        usersMax: number;
        actionsLimits: Record<
          string,
          {
            hard: number;
            soft: number;
          }
        >;
      },
      {
        projectsMax: number;
        usersMax: number;
        actionsLimits: Record<
          string,
          {
            hard: number;
            soft: number;
          }
        >;
      }
    >;
    usageMonth: z.ZodRecord<z.ZodString, z.ZodNumber>;
    lastBillingDate: z.ZodDate;
    nextBillingDate: z.ZodDate;
    status: z.ZodEnum<['active', 'past_due', 'canceled', 'trialing']>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'canceled' | 'active' | 'past_due' | 'trialing';
    workspaceId: string;
    stripeCustomerId: string;
    plan: 'starter' | 'pro' | 'business';
    entitlements: {
      projectsMax: number;
      usersMax: number;
      actionsLimits: Record<
        string,
        {
          hard: number;
          soft: number;
        }
      >;
    };
    usageMonth: Record<string, number>;
    lastBillingDate: Date;
    nextBillingDate: Date;
    metadata?: Record<string, any> | undefined;
    stripeSubId?: string | undefined;
    trialEndsAt?: Date | undefined;
  },
  {
    status: 'canceled' | 'active' | 'past_due' | 'trialing';
    workspaceId: string;
    stripeCustomerId: string;
    plan: 'starter' | 'pro' | 'business';
    entitlements: {
      projectsMax: number;
      usersMax: number;
      actionsLimits: Record<
        string,
        {
          hard: number;
          soft: number;
        }
      >;
    };
    usageMonth: Record<string, number>;
    lastBillingDate: Date;
    nextBillingDate: Date;
    metadata?: Record<string, any> | undefined;
    stripeSubId?: string | undefined;
    trialEndsAt?: Date | undefined;
  }
>;
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  tax_exempt?: 'none' | 'exempt' | 'reverse';
  tax_ids?: Array<{
    type: string;
    value: string;
    verification: {
      status: 'pending' | 'verified' | 'unverified';
    };
  }>;
}
export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  trial_start?: number;
  trial_end?: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: 'month' | 'year';
          usage_type: 'licensed' | 'metered';
        };
      };
      quantity?: number;
    }>;
  };
}
export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  created: number;
  due_date?: number;
  tax: number;
  total_tax_amounts: Array<{
    amount: number;
    inclusive: boolean;
    tax_rate: {
      percentage: number;
      country: string;
    };
  }>;
}
export interface CheckoutSession {
  id: string;
  url: string;
  customer: string;
  subscription?: string;
  mode: 'subscription' | 'payment';
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}
export interface CustomerPortalSession {
  id: string;
  url: string;
  customer: string;
  return_url: string;
}
export interface EntitlementCheck {
  allowed: boolean;
  reason?: 'hard_limit' | 'soft_limit' | 'trial_expired' | 'subscription_canceled';
  currentUsage?: number;
  limit?: number;
  warning?: boolean;
  upgradeUrl?: string;
}
export declare const zEntitlementCheck: z.ZodObject<
  {
    allowed: z.ZodBoolean;
    reason: z.ZodOptional<
      z.ZodEnum<['hard_limit', 'soft_limit', 'trial_expired', 'subscription_canceled']>
    >;
    currentUsage: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    warning: z.ZodOptional<z.ZodBoolean>;
    upgradeUrl: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    allowed: boolean;
    limit?: number | undefined;
    reason?: 'hard_limit' | 'soft_limit' | 'trial_expired' | 'subscription_canceled' | undefined;
    currentUsage?: number | undefined;
    warning?: boolean | undefined;
    upgradeUrl?: string | undefined;
  },
  {
    allowed: boolean;
    limit?: number | undefined;
    reason?: 'hard_limit' | 'soft_limit' | 'trial_expired' | 'subscription_canceled' | undefined;
    currentUsage?: number | undefined;
    warning?: boolean | undefined;
    upgradeUrl?: string | undefined;
  }
>;
export interface UsageReport {
  workspaceId: string;
  period: 'current_month' | 'last_month' | 'current_year';
  metrics: Record<
    UsageMetric,
    {
      used: number;
      limit: number;
      percentage: number;
      cost: number;
    }
  >;
  totalCost: number;
  breakdown: Array<{
    metric: UsageMetric;
    used: number;
    cost: number;
    description: string;
  }>;
  generatedAt: Date;
}
export declare const zUsageReport: z.ZodObject<
  {
    workspaceId: z.ZodString;
    period: z.ZodEnum<['current_month', 'last_month', 'current_year']>;
    metrics: z.ZodRecord<
      z.ZodString,
      z.ZodObject<
        {
          used: z.ZodNumber;
          limit: z.ZodNumber;
          percentage: z.ZodNumber;
          cost: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          limit: number;
          used: number;
          percentage: number;
          cost: number;
        },
        {
          limit: number;
          used: number;
          percentage: number;
          cost: number;
        }
      >
    >;
    totalCost: z.ZodNumber;
    breakdown: z.ZodArray<
      z.ZodObject<
        {
          metric: z.ZodString;
          used: z.ZodNumber;
          cost: z.ZodNumber;
          description: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          description: string;
          metric: string;
          used: number;
          cost: number;
        },
        {
          description: string;
          metric: string;
          used: number;
          cost: number;
        }
      >,
      'many'
    >;
    generatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    generatedAt: Date;
    workspaceId: string;
    period: 'current_month' | 'last_month' | 'current_year';
    metrics: Record<
      string,
      {
        limit: number;
        used: number;
        percentage: number;
        cost: number;
      }
    >;
    totalCost: number;
    breakdown: {
      description: string;
      metric: string;
      used: number;
      cost: number;
    }[];
  },
  {
    generatedAt: Date;
    workspaceId: string;
    period: 'current_month' | 'last_month' | 'current_year';
    metrics: Record<
      string,
      {
        limit: number;
        used: number;
        percentage: number;
        cost: number;
      }
    >;
    totalCost: number;
    breakdown: {
      description: string;
      metric: string;
      used: number;
      cost: number;
    }[];
  }
>;
export declare const PLAN_ENTITLEMENTS: Record<PlanId, Entitlement>;
export declare const USAGE_METRICS: Record<ToolAction, UsageMetric>;
export declare const METRIC_DESCRIPTIONS: Record<UsageMetric, string>;
export declare const METRIC_COSTS: Record<UsageMetric, number>;
//# sourceMappingURL=billing.d.ts.map
