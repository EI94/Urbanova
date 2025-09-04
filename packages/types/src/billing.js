"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRIC_COSTS = exports.METRIC_DESCRIPTIONS = exports.USAGE_METRICS = exports.PLAN_ENTITLEMENTS = exports.zUsageReport = exports.zEntitlementCheck = exports.zBillingState = exports.zUsageEvent = exports.zEntitlement = exports.zActionLimit = void 0;
const zod_1 = require("zod");
exports.zActionLimit = zod_1.z.object({
    soft: zod_1.z.number().positive(),
    hard: zod_1.z.number().positive(),
});
exports.zEntitlement = zod_1.z.object({
    projectsMax: zod_1.z.number().positive(),
    usersMax: zod_1.z.number().positive(),
    actionsLimits: zod_1.z.record(zod_1.z.string(), exports.zActionLimit),
});
exports.zUsageEvent = zod_1.z.object({
    id: zod_1.z.string(),
    workspaceId: zod_1.z.string(),
    toolId: zod_1.z.string(),
    action: zod_1.z.string(),
    qty: zod_1.z.number().positive(),
    runId: zod_1.z.string(),
    timestamp: zod_1.z.date(),
    stripeItemId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'sent', 'failed']),
    retryCount: zod_1.z.number().min(0),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.zBillingState = zod_1.z.object({
    workspaceId: zod_1.z.string(),
    stripeCustomerId: zod_1.z.string(),
    stripeSubId: zod_1.z.string().optional(),
    plan: zod_1.z.enum(['starter', 'pro', 'business']),
    trialEndsAt: zod_1.z.date().optional(),
    entitlements: exports.zEntitlement,
    usageMonth: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    lastBillingDate: zod_1.z.date(),
    nextBillingDate: zod_1.z.date(),
    status: zod_1.z.enum(['active', 'past_due', 'canceled', 'trialing']),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.zEntitlementCheck = zod_1.z.object({
    allowed: zod_1.z.boolean(),
    reason: zod_1.z.enum(['hard_limit', 'soft_limit', 'trial_expired', 'subscription_canceled']).optional(),
    currentUsage: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional(),
    warning: zod_1.z.boolean().optional(),
    upgradeUrl: zod_1.z.string().optional(),
});
exports.zUsageReport = zod_1.z.object({
    workspaceId: zod_1.z.string(),
    period: zod_1.z.enum(['current_month', 'last_month', 'current_year']),
    metrics: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        used: zod_1.z.number(),
        limit: zod_1.z.number(),
        percentage: zod_1.z.number(),
        cost: zod_1.z.number(),
    })),
    totalCost: zod_1.z.number(),
    breakdown: zod_1.z.array(zod_1.z.object({
        metric: zod_1.z.string(),
        used: zod_1.z.number(),
        cost: zod_1.z.number(),
        description: zod_1.z.string(),
    })),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// CONSTANTS
// ============================================================================
exports.PLAN_ENTITLEMENTS = {
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
exports.USAGE_METRICS = {
    'ocr.process': 'ocr_pages',
    'feasibility.run_bp': 'feasibility_runs',
    'land-scraper.scan_market': 'scraper_scans',
    'doc-hunter.request': 'doc_requests',
    'messaging.send_wa': 'wa_messages',
    'market-intelligence.scan_city': 'market_scans',
    'market-intelligence.trend_report': 'trend_reports',
    'deal-caller.send_questionnaire': 'questionnaires',
};
exports.METRIC_DESCRIPTIONS = {
    ocr_pages: 'Pagine OCR processate',
    feasibility_runs: 'Analisi di fattibilità eseguite',
    scraper_scans: 'Scansioni market eseguite',
    doc_requests: 'Richieste documenti',
    wa_messages: 'Messaggi WhatsApp inviati',
    market_scans: 'Analisi mercato eseguite',
    trend_reports: 'Report trend generati',
    questionnaires: 'Questionari inviati',
};
exports.METRIC_COSTS = {
    ocr_pages: 0.01,
    feasibility_runs: 0.5,
    scraper_scans: 0.1,
    doc_requests: 0.25,
    wa_messages: 0.05,
    market_scans: 0.25,
    trend_reports: 1.0,
    questionnaires: 0.1,
};
//# sourceMappingURL=billing.js.map