import { z } from 'zod';

// ============================================================================
// CORE DEAL TYPES
// ============================================================================

/**
 * Normalized deal data after deduplication and trust scoring
 */
interface DealNormalized {
  /** Unique identifier for the deal */
  id: string;

  /** Original source URL (if available) */
  link?: string;

  /** Source identifier (e.g., 'idealista', 'immobiliare', 'asta') */
  source: string;

  /** Full address string */
  address: string;

  /** City name */
  city: string;

  /** Latitude coordinate (if available) */
  lat?: number;

  /** Longitude coordinate (if available) */
  lng?: number;

  /** Surface area in square meters */
  surface?: number | undefined;

  /** Asking price in EUR (if available) */
  priceAsk?: number | undefined;

  /** Zoning hint (e.g., 'residential', 'commercial', 'mixed') */
  zoningHint?: string | undefined;

  /** Data compliance policy */
  policy: 'allowed' | 'limited' | 'blocked';

  /** Trust score from 0 to 1 */
  trust: number;

  /** When the deal was first discovered */
  discoveredAt: Date;

  /** When the deal was last updated */
  updatedAt: Date;

  /** Deal fingerprint for deduplication */
  fingerprint: DealFingerprint;

  /** Additional metadata */
  metadata: Record<string, any>;
}

/**
 * Search filter for finding deals
 */
interface SearchFilter {
  /** City to search in */
  city: string;

  /** Maximum budget in EUR */
  budgetMax?: number;

  /** Minimum surface area in square meters */
  surfaceMin?: number;

  /** Zoning types to include */
  zoning?: string[];

  /** Whether to include auction deals */
  includeAuctions?: boolean;

  /** Whether to include off-market deals */
  includeOffMarket?: boolean;

  /** Maximum distance from city center in km */
  maxDistance?: number;

  /** Maximum number of results to return */
  limit?: number;
}

/**
 * User watchlist for monitoring specific market conditions
 */
interface Watchlist {
  /** Unique identifier for the watchlist */
  id: string;

  /** User who owns this watchlist */
  userId: string;

  /** Search filter for this watchlist */
  filter: SearchFilter;

  /** When the watchlist was last checked */
  lastCheckedAt: Date;

  /** When the watchlist was created */
  createdAt: Date;

  /** Whether the watchlist is active */
  isActive: boolean;

  /** Notification preferences */
  notifications: {
    /** Whether to send chat notifications */
    chat: boolean;
    /** Whether to send email notifications */
    email: boolean;
    /** Minimum trust score to trigger notifications */
    minTrustScore: number;
  };
}

/**
 * Deal alert when a new high-score deal appears
 */
interface DealAlert {
  /** Unique identifier for the alert */
  id: string;

  /** Watchlist that triggered this alert */
  watchlistId: string;

  /** Deal that triggered this alert */
  dealId: string;

  /** When the alert was created */
  createdAt: Date;

  /** Whether the alert has been read */
  isRead: boolean;

  /** Alert message */
  message: string;

  /** Trust score of the deal */
  trustScore: number;
}

/**
 * Deal search result with ranking
 */
interface DealSearchResult {
  deals: DealNormalized[];
  duplicates: DealNormalized[];
  totalFound: number;
  totalReturned: number;
  scanDuration: number;
  scanTimestamp: Date;
  error?: string;
}

/**
 * Deal fingerprint for deduplication
 */
interface DealFingerprint {
  /** Normalized address hash */
  addressHash: string;
  /** Surface range (e.g., '100-150') */
  surfaceRange: string;
  /** Price range (e.g., '500k-800k') */
  priceRange: string;
  /** Zoning type */
  zoning: string;
  /** Combined hash for uniqueness */
  hash: string;
}

/**
 * Trust score calculation factors
 */
interface TrustFactors {
  /** Source reliability (0..1) */
  sourceReliability: number;
  /** Data completeness (0..1) */
  dataCompleteness: number;
  /** Freshness (0..1, based on age) */
  freshness: number;
  /** Cross-source validation (0..1) */
  crossValidation: number;
  /** Overall trust score */
  overall: number;
  /** Recent activity (0..1) */
  recentActivity: number;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const zPolicy = z.enum(['allowed', 'limited', 'blocked']);
const zZoningHint = z.enum(['residential', 'commercial', 'mixed', 'industrial', 'agricultural']);

const zDealNormalized = z.object({
  id: z.string(),
  link: z.string().url().optional(),
  source: z.string(),
  address: z.string(),
  city: z.string(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  surface: z.number().positive().optional(),
  priceAsk: z.number().positive().optional(),
  zoningHint: zZoningHint.optional(),
  policy: zPolicy,
  trust: z.number().min(0).max(1),
  discoveredAt: z.date(),
  updatedAt: z.date(),
  fingerprint: z.object({
    addressHash: z.string(),
    surfaceRange: z.string(),
    priceRange: z.string(),
    zoning: z.string(),
    hash: z.string(),
  }),
  metadata: z.record(z.any()),
});

const zSearchFilter = z.object({
  city: z.string(),
  budgetMax: z.number().positive().optional(),
  surfaceMin: z.number().positive().optional(),
  zoning: z.array(zZoningHint).optional(),
  includeAuctions: z.boolean().optional(),
  includeOffMarket: z.boolean().optional(),
  maxDistance: z.number().positive().optional(),
  limit: z.number().positive().optional(),
});

const zWatchlist = z.object({
  id: z.string(),
  userId: z.string(),
  filter: zSearchFilter,
  lastCheckedAt: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
  notifications: z.object({
    chat: z.boolean(),
    email: z.boolean(),
    minTrustScore: z.number().min(0).max(1),
  }),
});

const zDealAlert = z.object({
  id: z.string(),
  watchlistId: z.string(),
  dealId: z.string(),
  createdAt: z.date(),
  isRead: z.boolean(),
  message: z.string(),
  trustScore: z.number().min(0).max(1),
});

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  DealNormalized,
  SearchFilter,
  Watchlist,
  DealAlert,
  DealSearchResult,
  DealFingerprint,
  TrustFactors,
};

export { zDealNormalized, zSearchFilter, zWatchlist, zDealAlert, zPolicy, zZoningHint };
