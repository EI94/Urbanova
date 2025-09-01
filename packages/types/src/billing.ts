import { z } from 'zod';

// ============================================================================
// CORE TYPES
// ============================================================================

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

// ============================================================================
// ENTITLEMENTS
// ============================================================================

export interface ActionLimit {
  soft: number;
  hard: number;
}

export interface Entitlement {
  projectsMax: number;
  usersMax: number;
  actionsLimits: Record<ToolAction, ActionLimit>;
}

export const zActionLimit = z.object({
  soft: z.number().positive(),
  hard: z.number().positive(),
});

export const zEntitlement = z.object({
  projectsMax: z.number().positive(),
  usersMax: z.number().positive(),
  actionsLimits: z.record(z.string(), zActionLimit),
});

// ============================================================================
// USAGE EVENTS
// ============================================================================

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

export const zUsageEvent = z.object({
  id: z.string(),
  workspaceId: z.string(),
  toolId: z.string(),
  action: z.string(),
  qty: z.number().positive(),
  runId: z.string(),
  timestamp: z.date(),
  stripeItemId: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed']),
  retryCount: z.number().min(0),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// BILLING STATE
// ============================================================================

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

export const zBillingState = z.object({
  workspaceId: z.string(),
  stripeCustomerId: z.string(),
  stripeSubId: z.string().optional(),
  plan: z.enum(['starter', 'pro', 'business']),
  trialEndsAt: z.date().optional(),
  entitlements: zEntitlement,
  usageMonth: z.record(z.string(), z.number()),
  lastBillingDate: z.date(),
  nextBillingDate: z.date(),
  status: z.enum(['active', 'past_due', 'canceled', 'trialing']),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

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

// ============================================================================
// CHECKOUT & PORTAL
// ============================================================================

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

// ============================================================================
// ENFORCEMENT RESULTS
// ============================================================================

export interface EntitlementCheck {
  allowed: boolean;
  reason?: 'hard_limit' | 'soft_limit' | 'trial_expired' | 'subscription_canceled';
  currentUsage?: number;
  limit?: number;
  warning?: boolean;
  upgradeUrl?: string;
}

export const zEntitlementCheck = z.object({
  allowed: z.boolean(),
  reason: z.enum(['hard_limit', 'soft_limit', 'trial_expired', 'subscription_canceled']).optional(),
  currentUsage: z.number().optional(),
  limit: z.number().optional(),
  warning: z.boolean().optional(),
  upgradeUrl: z.string().optional(),
});

// ============================================================================
// USAGE REPORTS
// ============================================================================

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

export const zUsageReport = z.object({
  workspaceId: z.string(),
  period: z.enum(['current_month', 'last_month', 'current_year']),
  metrics: z.record(
    z.string(),
    z.object({
      used: z.number(),
      limit: z.number(),
      percentage: z.number(),
      cost: z.number(),
    })
  ),
  totalCost: z.number(),
  breakdown: z.array(
    z.object({
      metric: z.string(),
      used: z.number(),
      cost: z.number(),
      description: z.string(),
    })
  ),
  generatedAt: z.date(),
});

// ============================================================================
// CONSTANTS
// ============================================================================

export const PLAN_ENTITLEMENTS: Record<PlanId, Entitlement> = {
  starter: {
    projectsMax: 5,
    usersMax: 1,
    actionsLimits: {
      'ocr.process': { soft: 500, hard: 1000 },
      'feasibility.run_bp': { soft: 50, hard: 100 },
      'land-scraper.scan_market': { soft: 200, hard: 500 },
      'doc-hunter.request': { soft: 100, hard: 200 },
      'messaging.send_wa': { soft: 500, hard: 1000 },
      'market-intelligence.scan_city': { soft: 50, hard: 100 },
      'market-intelligence.trend_report': { soft: 10, hard: 25 },
      'deal-caller.send_questionnaire': { soft: 50, hard: 100 },
    },
  },
  pro: {
    projectsMax: 25,
    usersMax: 5,
    actionsLimits: {
      'ocr.process': { soft: 5000, hard: 10000 },
      'feasibility.run_bp': { soft: 500, hard: 1000 },
      'land-scraper.scan_market': { soft: 2000, hard: 5000 },
      'doc-hunter.request': { soft: 1000, hard: 2000 },
      'messaging.send_wa': { soft: 5000, hard: 10000 },
      'market-intelligence.scan_city': { soft: 500, hard: 1000 },
      'market-intelligence.trend_report': { soft: 100, hard: 250 },
      'deal-caller.send_questionnaire': { soft: 500, hard: 1000 },
    },
  },
  business: {
    projectsMax: 100,
    usersMax: 20,
    actionsLimits: {
      'ocr.process': { soft: 25000, hard: 50000 },
      'feasibility.run_bp': { soft: 2500, hard: 5000 },
      'land-scraper.scan_market': { soft: 10000, hard: 25000 },
      'doc-hunter.request': { soft: 5000, hard: 10000 },
      'messaging.send_wa': { soft: 25000, hard: 50000 },
      'market-intelligence.scan_city': { soft: 2500, hard: 5000 },
      'market-intelligence.trend_report': { soft: 500, hard: 1250 },
      'deal-caller.send_questionnaire': { soft: 2500, hard: 5000 },
    },
  },
};

export const USAGE_METRICS: Record<ToolAction, UsageMetric> = {
  'ocr.process': 'ocr_pages',
  'feasibility.run_bp': 'feasibility_runs',
  'land-scraper.scan_market': 'scraper_scans',
  'doc-hunter.request': 'doc_requests',
  'messaging.send_wa': 'wa_messages',
  'market-intelligence.scan_city': 'market_scans',
  'market-intelligence.trend_report': 'trend_reports',
  'deal-caller.send_questionnaire': 'questionnaires',
};

export const METRIC_DESCRIPTIONS: Record<UsageMetric, string> = {
  ocr_pages: 'Pagine OCR processate',
  feasibility_runs: 'Analisi di fattibilità eseguite',
  scraper_scans: 'Scansioni market eseguite',
  doc_requests: 'Richieste documenti',
  wa_messages: 'Messaggi WhatsApp inviati',
  market_scans: 'Analisi mercato eseguite',
  trend_reports: 'Report trend generati',
  questionnaires: 'Questionari inviati',
};

export const METRIC_COSTS: Record<UsageMetric, number> = {
  ocr_pages: 0.01,
  feasibility_runs: 0.5,
  scraper_scans: 0.1,
  doc_requests: 0.25,
  wa_messages: 0.05,
  market_scans: 0.25,
  trend_reports: 1.0,
  questionnaires: 0.1,
};
