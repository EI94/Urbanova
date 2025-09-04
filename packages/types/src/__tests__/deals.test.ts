import { describe, it, expect } from '@jest/globals';
import {
  zDealNormalized,
  zSearchFilter,
  zWatchlist,
  zDealAlert,
  zPolicy,
  zZoningHint,
  type DealNormalized,
  type SearchFilter,
  type Watchlist,
  type DealAlert,
} from '../deals';

describe('Deals Types & Zod Schemas', () => {
  describe('zPolicy', () => {
    it('should validate allowed policies', () => {
      expect(zPolicy.parse('allowed')).toBe('allowed');
      expect(zPolicy.parse('limited')).toBe('limited');
      expect(zPolicy.parse('blocked')).toBe('blocked');
    });

    it('should reject invalid policies', () => {
      expect(() => zPolicy.parse('invalid')).toThrow();
      expect(() => zPolicy.parse('')).toThrow();
    });
  });

  describe('zZoningHint', () => {
    it('should validate allowed zoning hints', () => {
      expect(zZoningHint.parse('residential')).toBe('residential');
      expect(zZoningHint.parse('commercial')).toBe('commercial');
      expect(zZoningHint.parse('mixed')).toBe('mixed');
      expect(zZoningHint.parse('industrial')).toBe('industrial');
      expect(zZoningHint.parse('agricultural')).toBe('agricultural');
    });

    it('should reject invalid zoning hints', () => {
      expect(() => zZoningHint.parse('invalid')).toThrow();
      expect(() => zZoningHint.parse('')).toThrow();
    });
  });

  describe('zDealNormalized', () => {
    const validDeal: DealNormalized = {
      id: 'deal-123',
      link: 'https://example.com/deal',
      source: 'idealista',
      address: 'Via Roma 123, Milano',
      city: 'Milano',
      lat: 45.4642,
      lng: 9.19,
      surface: 150,
      priceAsk: 500000,
      zoningHint: 'residential',
      policy: 'allowed',
      trust: 0.85,
      discoveredAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      fingerprint: 'hash123' as any,
      metadata: { originalPrice: '500.000€' },
    };

    it('should validate a complete deal', () => {
      const result = zDealNormalized.parse(validDeal);
      expect(result).toEqual(validDeal);
    });

    it('should validate a deal without optional fields', () => {
      const minimalDeal = {
        ...validDeal,
        link: undefined,
        lat: undefined,
        lng: undefined,
        priceAsk: undefined,
        zoningHint: undefined,
      };
      const result = zDealNormalized.parse(minimalDeal);
      expect(result.id).toBe('deal-123');
      expect(result.link).toBeUndefined();
    });

    it('should reject invalid coordinates', () => {
      const invalidLat = { ...validDeal, lat: 100 }; // Invalid latitude
      const invalidLng = { ...validDeal, lng: 200 }; // Invalid longitude

      expect(() => zDealNormalized.parse(invalidLat)).toThrow();
      expect(() => zDealNormalized.parse(invalidLng)).toThrow();
    });

    it('should reject invalid trust score', () => {
      const invalidTrust = { ...validDeal, trust: 1.5 }; // > 1
      const negativeTrust = { ...validDeal, trust: -0.1 }; // < 0

      expect(() => zDealNormalized.parse(invalidTrust)).toThrow();
      expect(() => zDealNormalized.parse(negativeTrust)).toThrow();
    });

    it('should reject invalid surface', () => {
      const invalidSurface = { ...validDeal, surface: 0 }; // Must be positive
      const negativeSurface = { ...validDeal, surface: -100 };

      expect(() => zDealNormalized.parse(invalidSurface)).toThrow();
      expect(() => zDealNormalized.parse(negativeSurface)).toThrow();
    });

    it('should reject invalid URL', () => {
      const invalidUrl = { ...validDeal, link: 'not-a-url' };
      expect(() => zDealNormalized.parse(invalidUrl)).toThrow();
    });
  });

  describe('zSearchFilter', () => {
    const validFilter: SearchFilter = {
      city: 'Torino',
      budgetMax: 800000,
      surfaceMin: 100,
      zoning: ['residential', 'mixed'],
      includeAuctions: true,
      includeOffMarket: false,
      maxDistance: 10,
    };

    it('should validate a complete filter', () => {
      const result = zSearchFilter.parse(validFilter);
      expect(result).toEqual(validFilter);
    });

    it('should validate a minimal filter', () => {
      const minimalFilter = { city: 'Milano' };
      const result = zSearchFilter.parse(minimalFilter);
      expect(result.city).toBe('Milano');
      expect(result.budgetMax).toBeUndefined();
    });

    it('should reject invalid budget', () => {
      const invalidBudget = { ...validFilter, budgetMax: 0 };
      expect(() => zSearchFilter.parse(invalidBudget)).toThrow();
    });

    it('should reject invalid surface', () => {
      const invalidSurface = { ...validFilter, surfaceMin: -50 };
      expect(() => zSearchFilter.parse(invalidSurface)).toThrow();
    });

    it('should reject invalid distance', () => {
      const invalidDistance = { ...validFilter, maxDistance: 0 };
      expect(() => zSearchFilter.parse(invalidDistance)).toThrow();
    });
  });

  describe('zWatchlist', () => {
    const validWatchlist: Watchlist = {
      id: 'watchlist-123',
      userId: 'user-456',
      filter: {
        city: 'Roma',
        budgetMax: 600000,
        surfaceMin: 80,
      },
      lastCheckedAt: new Date('2024-01-25'),
      createdAt: new Date('2024-01-20'),
      isActive: true,
      notifications: {
        chat: true,
        email: false,
        minTrustScore: 0.7,
      },
    };

    it('should validate a complete watchlist', () => {
      const result = zWatchlist.parse(validWatchlist);
      expect(result).toEqual(validWatchlist);
    });

    it('should reject invalid trust score in notifications', () => {
      const invalidTrust = {
        ...validWatchlist,
        notifications: { ...validWatchlist.notifications, minTrustScore: 1.5 },
      };
      expect(() => zWatchlist.parse(invalidTrust)).toThrow();
    });
  });

  describe('zDealAlert', () => {
    const validAlert: DealAlert = {
      id: 'alert-789',
      watchlistId: 'watchlist-123',
      dealId: 'deal-456',
      createdAt: new Date('2024-01-25'),
      isRead: false,
      message: 'Nuova opportunità a Torino!',
      trustScore: 0.92,
    };

    it('should validate a complete alert', () => {
      const result = zDealAlert.parse(validAlert);
      expect(result).toEqual(validAlert);
    });

    it('should reject invalid trust score', () => {
      const invalidTrust = { ...validAlert, trustScore: 2.0 };
      expect(() => zDealAlert.parse(invalidTrust)).toThrow();
    });
  });

  describe('Type compatibility', () => {
    it('should ensure DealNormalized has all required fields', () => {
      const deal: DealNormalized = {
        id: 'test',
        source: 'test',
        address: 'test',
        city: 'test',
        surface: 100,
        policy: 'allowed',
        trust: 0.5,
        discoveredAt: new Date(),
        updatedAt: new Date(),
        fingerprint: 'test' as any,
        metadata: {},
      };
      expect(deal.id).toBeDefined();
      expect(deal.source).toBeDefined();
      expect(deal.address).toBeDefined();
      expect(deal.city).toBeDefined();
      expect(deal.surface).toBeDefined();
      expect(deal.policy).toBeDefined();
      expect(deal.trust).toBeDefined();
      expect(deal.discoveredAt).toBeDefined();
      expect(deal.updatedAt).toBeDefined();
      expect(deal.fingerprint).toBeDefined();
      expect(deal.metadata).toBeDefined();
    });

    it('should ensure SearchFilter has required city field', () => {
      const filter: SearchFilter = {
        city: 'Milano',
      };
      expect(filter.city).toBeDefined();
    });

    it('should ensure Watchlist has all required fields', () => {
      const watchlist: Watchlist = {
        id: 'test',
        userId: 'test',
        filter: { city: 'test' },
        lastCheckedAt: new Date(),
        createdAt: new Date(),
        isActive: true,
        notifications: {
          chat: true,
          email: false,
          minTrustScore: 0.5,
        },
      };
      expect(watchlist.id).toBeDefined();
      expect(watchlist.userId).toBeDefined();
      expect(watchlist.filter).toBeDefined();
      expect(watchlist.lastCheckedAt).toBeDefined();
      expect(watchlist.createdAt).toBeDefined();
      expect(watchlist.isActive).toBeDefined();
      expect(watchlist.notifications).toBeDefined();
    });
  });
});
