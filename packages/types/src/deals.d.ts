import { z } from 'zod';
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
declare const zPolicy: z.ZodEnum<['allowed', 'limited', 'blocked']>;
declare const zZoningHint: z.ZodEnum<
  ['residential', 'commercial', 'mixed', 'industrial', 'agricultural']
>;
declare const zDealNormalized: z.ZodObject<
  {
    id: z.ZodString;
    link: z.ZodOptional<z.ZodString>;
    source: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    surface: z.ZodOptional<z.ZodNumber>;
    priceAsk: z.ZodOptional<z.ZodNumber>;
    zoningHint: z.ZodOptional<
      z.ZodEnum<['residential', 'commercial', 'mixed', 'industrial', 'agricultural']>
    >;
    policy: z.ZodEnum<['allowed', 'limited', 'blocked']>;
    trust: z.ZodNumber;
    discoveredAt: z.ZodDate;
    updatedAt: z.ZodDate;
    fingerprint: z.ZodObject<
      {
        addressHash: z.ZodString;
        surfaceRange: z.ZodString;
        priceRange: z.ZodString;
        zoning: z.ZodString;
        hash: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        addressHash: string;
        surfaceRange: string;
        priceRange: string;
        zoning: string;
        hash: string;
      },
      {
        addressHash: string;
        surfaceRange: string;
        priceRange: string;
        zoning: string;
        hash: string;
      }
    >;
    metadata: z.ZodRecord<z.ZodString, z.ZodAny>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    metadata: Record<string, any>;
    updatedAt: Date;
    source: string;
    address: string;
    city: string;
    policy: 'allowed' | 'limited' | 'blocked';
    trust: number;
    discoveredAt: Date;
    fingerprint: {
      addressHash: string;
      surfaceRange: string;
      priceRange: string;
      zoning: string;
      hash: string;
    };
    link?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    surface?: number | undefined;
    priceAsk?: number | undefined;
    zoningHint?: 'residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural' | undefined;
  },
  {
    id: string;
    metadata: Record<string, any>;
    updatedAt: Date;
    source: string;
    address: string;
    city: string;
    policy: 'allowed' | 'limited' | 'blocked';
    trust: number;
    discoveredAt: Date;
    fingerprint: {
      addressHash: string;
      surfaceRange: string;
      priceRange: string;
      zoning: string;
      hash: string;
    };
    link?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    surface?: number | undefined;
    priceAsk?: number | undefined;
    zoningHint?: 'residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural' | undefined;
  }
>;
declare const zSearchFilter: z.ZodObject<
  {
    city: z.ZodString;
    budgetMax: z.ZodOptional<z.ZodNumber>;
    surfaceMin: z.ZodOptional<z.ZodNumber>;
    zoning: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<['residential', 'commercial', 'mixed', 'industrial', 'agricultural']>,
        'many'
      >
    >;
    includeAuctions: z.ZodOptional<z.ZodBoolean>;
    includeOffMarket: z.ZodOptional<z.ZodBoolean>;
    maxDistance: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    city: string;
    limit?: number | undefined;
    zoning?: ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[] | undefined;
    budgetMax?: number | undefined;
    surfaceMin?: number | undefined;
    includeAuctions?: boolean | undefined;
    includeOffMarket?: boolean | undefined;
    maxDistance?: number | undefined;
  },
  {
    city: string;
    limit?: number | undefined;
    zoning?: ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[] | undefined;
    budgetMax?: number | undefined;
    surfaceMin?: number | undefined;
    includeAuctions?: boolean | undefined;
    includeOffMarket?: boolean | undefined;
    maxDistance?: number | undefined;
  }
>;
declare const zWatchlist: z.ZodObject<
  {
    id: z.ZodString;
    userId: z.ZodString;
    filter: z.ZodObject<
      {
        city: z.ZodString;
        budgetMax: z.ZodOptional<z.ZodNumber>;
        surfaceMin: z.ZodOptional<z.ZodNumber>;
        zoning: z.ZodOptional<
          z.ZodArray<
            z.ZodEnum<['residential', 'commercial', 'mixed', 'industrial', 'agricultural']>,
            'many'
          >
        >;
        includeAuctions: z.ZodOptional<z.ZodBoolean>;
        includeOffMarket: z.ZodOptional<z.ZodBoolean>;
        maxDistance: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
      },
      'strip',
      z.ZodTypeAny,
      {
        city: string;
        limit?: number | undefined;
        zoning?:
          | ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[]
          | undefined;
        budgetMax?: number | undefined;
        surfaceMin?: number | undefined;
        includeAuctions?: boolean | undefined;
        includeOffMarket?: boolean | undefined;
        maxDistance?: number | undefined;
      },
      {
        city: string;
        limit?: number | undefined;
        zoning?:
          | ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[]
          | undefined;
        budgetMax?: number | undefined;
        surfaceMin?: number | undefined;
        includeAuctions?: boolean | undefined;
        includeOffMarket?: boolean | undefined;
        maxDistance?: number | undefined;
      }
    >;
    lastCheckedAt: z.ZodDate;
    createdAt: z.ZodDate;
    isActive: z.ZodBoolean;
    notifications: z.ZodObject<
      {
        chat: z.ZodBoolean;
        email: z.ZodBoolean;
        minTrustScore: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        chat: boolean;
        email: boolean;
        minTrustScore: number;
      },
      {
        chat: boolean;
        email: boolean;
        minTrustScore: number;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    filter: {
      city: string;
      limit?: number | undefined;
      zoning?:
        | ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[]
        | undefined;
      budgetMax?: number | undefined;
      surfaceMin?: number | undefined;
      includeAuctions?: boolean | undefined;
      includeOffMarket?: boolean | undefined;
      maxDistance?: number | undefined;
    };
    createdAt: Date;
    userId: string;
    lastCheckedAt: Date;
    isActive: boolean;
    notifications: {
      chat: boolean;
      email: boolean;
      minTrustScore: number;
    };
  },
  {
    id: string;
    filter: {
      city: string;
      limit?: number | undefined;
      zoning?:
        | ('residential' | 'commercial' | 'mixed' | 'industrial' | 'agricultural')[]
        | undefined;
      budgetMax?: number | undefined;
      surfaceMin?: number | undefined;
      includeAuctions?: boolean | undefined;
      includeOffMarket?: boolean | undefined;
      maxDistance?: number | undefined;
    };
    createdAt: Date;
    userId: string;
    lastCheckedAt: Date;
    isActive: boolean;
    notifications: {
      chat: boolean;
      email: boolean;
      minTrustScore: number;
    };
  }
>;
declare const zDealAlert: z.ZodObject<
  {
    id: z.ZodString;
    watchlistId: z.ZodString;
    dealId: z.ZodString;
    createdAt: z.ZodDate;
    isRead: z.ZodBoolean;
    message: z.ZodString;
    trustScore: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    message: string;
    createdAt: Date;
    watchlistId: string;
    dealId: string;
    isRead: boolean;
    trustScore: number;
  },
  {
    id: string;
    message: string;
    createdAt: Date;
    watchlistId: string;
    dealId: string;
    isRead: boolean;
    trustScore: number;
  }
>;
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
//# sourceMappingURL=deals.d.ts.map
