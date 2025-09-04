"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zZoningHint = exports.zPolicy = exports.zDealAlert = exports.zWatchlist = exports.zSearchFilter = exports.zDealNormalized = void 0;
const zod_1 = require("zod");
// ============================================================================
// ZOD SCHEMAS
// ============================================================================
const zPolicy = zod_1.z.enum(['allowed', 'limited', 'blocked']);
exports.zPolicy = zPolicy;
const zZoningHint = zod_1.z.enum(['residential', 'commercial', 'mixed', 'industrial', 'agricultural']);
exports.zZoningHint = zZoningHint;
const zDealNormalized = zod_1.z.object({
    id: zod_1.z.string(),
    link: zod_1.z.string().url().optional(),
    source: zod_1.z.string(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lng: zod_1.z.number().min(-180).max(180).optional(),
    surface: zod_1.z.number().positive().optional(),
    priceAsk: zod_1.z.number().positive().optional(),
    zoningHint: zZoningHint.optional(),
    policy: zPolicy,
    trust: zod_1.z.number().min(0).max(1),
    discoveredAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    fingerprint: zod_1.z.object({
        addressHash: zod_1.z.string(),
        surfaceRange: zod_1.z.string(),
        priceRange: zod_1.z.string(),
        zoning: zod_1.z.string(),
        hash: zod_1.z.string(),
    }),
    metadata: zod_1.z.record(zod_1.z.any()),
});
exports.zDealNormalized = zDealNormalized;
const zSearchFilter = zod_1.z.object({
    city: zod_1.z.string(),
    budgetMax: zod_1.z.number().positive().optional(),
    surfaceMin: zod_1.z.number().positive().optional(),
    zoning: zod_1.z.array(zZoningHint).optional(),
    includeAuctions: zod_1.z.boolean().optional(),
    includeOffMarket: zod_1.z.boolean().optional(),
    maxDistance: zod_1.z.number().positive().optional(),
    limit: zod_1.z.number().positive().optional(),
});
exports.zSearchFilter = zSearchFilter;
const zWatchlist = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    filter: zSearchFilter,
    lastCheckedAt: zod_1.z.date(),
    createdAt: zod_1.z.date(),
    isActive: zod_1.z.boolean(),
    notifications: zod_1.z.object({
        chat: zod_1.z.boolean(),
        email: zod_1.z.boolean(),
        minTrustScore: zod_1.z.number().min(0).max(1),
    }),
});
exports.zWatchlist = zWatchlist;
const zDealAlert = zod_1.z.object({
    id: zod_1.z.string(),
    watchlistId: zod_1.z.string(),
    dealId: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    isRead: zod_1.z.boolean(),
    message: zod_1.z.string(),
    trustScore: zod_1.z.number().min(0).max(1),
});
exports.zDealAlert = zDealAlert;
//# sourceMappingURL=deals.js.map