import { MarketScannerService } from '../../landScraper/marketScanner';
import { SearchFilter, DealSearchResult, DealNormalized } from '@urbanova/types';

describe('MarketScannerService', () => {
  let service: MarketScannerService;

  beforeEach(() => {
    service = new MarketScannerService();
  });

  describe('scanByLink', () => {
    it('should scan a property by idealista link', async () => {
      const link = 'https://www.idealista.it/immobile/12345678/';
      const deal = await service.scanByLink(link);

      expect(deal).toBeDefined();
      expect(deal?.source).toBe('idealista');
      expect(deal?.city).toBe('Torino');
      expect(deal?.surface).toBe(110);
      expect(deal?.priceAsk).toBe(720000);
      expect(deal?.zoningHint).toBe('residential');
      expect(deal?.policy).toBe('allowed');
      expect(deal?.trust).toBeGreaterThan(0);
      expect(deal?.fingerprint).toBeDefined();
    });

    it('should scan a property by immobiliare link', async () => {
      const link = 'https://www.immobiliare.it/annunci/87654321/';
      const deal = await service.scanByLink(link);

      expect(deal).toBeDefined();
      expect(deal?.source).toBe('immobiliare');
      expect(deal?.city).toBe('Milano');
      expect(deal?.surface).toBe(95);
      expect(deal?.priceAsk).toBe(850000);
      expect(deal?.zoningHint).toBe('residential');
    });

    it('should scan an auction link', async () => {
      const link = 'https://www.auction-site.com/auction/123';
      const deal = await service.scanByLink(link);

      expect(deal).toBeDefined();
      expect(deal?.source).toBe('auction');
      expect(deal?.city).toBe('Roma');
      expect(deal?.surface).toBe(200);
      expect(deal?.priceAsk).toBe(450000);
      expect(deal?.zoningHint).toBe('mixed');
    });

    it('should return null for unrecognized links', async () => {
      const link = 'https://unknown-site.com/property/123';
      const deal = await service.scanByLink(link);

      expect(deal).toBeNull();
    });

    it('should handle invalid URLs gracefully', async () => {
      const link = 'not-a-valid-url';
      const deal = await service.scanByLink(link);

      expect(deal).toBeNull();
    });
  });

  describe('scanMarket', () => {
    it('should scan market with basic city filter', async () => {
      const filter: SearchFilter = {
        city: 'Torino',
        limit: 10,
      };

      const result = await service.scanMarket(filter);

      expect(result).toBeDefined();
      expect(result.deals).toBeDefined();
      expect(Array.isArray(result.deals)).toBe(true);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
      expect(result.totalReturned).toBeLessThanOrEqual(filter.limit!);
      expect(result.scanDuration).toBeGreaterThan(0);
      expect(result.filters).toEqual(filter);
      expect(result.scanTimestamp).toBeInstanceOf(Date);
      expect(result.error).toBeUndefined();
    });

    it('should scan market with comprehensive filters', async () => {
      const filter: SearchFilter = {
        city: 'Milano',
        budgetMax: 1000000,
        surfaceMin: 80,
        zoning: ['residential'],
        includeAuctions: true,
        limit: 20,
      };

      const result = await service.scanMarket(filter);

      expect(result).toBeDefined();
      expect(result.deals.length).toBeLessThanOrEqual(filter.limit!);

      // Check that all returned deals match the filters
      result.deals.forEach(deal => {
        expect(deal.city.toLowerCase()).toBe(filter.city.toLowerCase());
        if (filter.budgetMax && deal.priceAsk) {
          expect(deal.priceAsk).toBeLessThanOrEqual(filter.budgetMax);
        }
        if (filter.surfaceMin && deal.surface) {
          expect(deal.surface).toBeGreaterThanOrEqual(filter.surfaceMin);
        }
        if (filter.zoning && filter.zoning.length > 0 && deal.zoningHint) {
          expect(filter.zoning).toContain(deal.zoningHint);
        }
      });
    });

    it('should include auctions when requested', async () => {
      const filter: SearchFilter = {
        city: 'Torino',
        includeAuctions: true,
        limit: 15,
      };

      const result = await service.scanMarket(filter);

      expect(result).toBeDefined();

      // Should find some auction deals
      const auctionDeals = result.deals.filter(deal => deal.source === 'auction');
      expect(auctionDeals.length).toBeGreaterThan(0);
    });

    it('should rank deals by trust score', async () => {
      const filter: SearchFilter = {
        city: 'Milano',
        limit: 10,
      };

      const result = await service.scanMarket(filter);

      expect(result).toBeDefined();

      // Deals should be sorted by trust score (descending)
      for (let i = 1; i < result.deals.length; i++) {
        const prevDeal = result.deals[i - 1];
        const currentDeal = result.deals[i];
        expect(prevDeal).toBeDefined();
        expect(currentDeal).toBeDefined();
        expect(prevDeal!.trust).toBeGreaterThanOrEqual(currentDeal!.trust);
      }
    });

    it('should handle scan errors gracefully', async () => {
      // Test with an invalid filter that might cause errors
      const filter: SearchFilter = {
        city: 'InvalidCity123',
        limit: -1, // Invalid limit
      };

      const result = await service.scanMarket(filter);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.deals).toEqual([]);
      expect(result.totalFound).toBe(0);
      expect(result.totalReturned).toBe(0);
    });
  });

  describe('findAuctions', () => {
    it('should find auctions in a major city', async () => {
      const city = 'Torino';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBeGreaterThan(0);

      auctions.forEach(auction => {
        expect(auction.city.toLowerCase()).toBe(city.toLowerCase());
        expect(auction.source).toBe('auction');
        expect(auction.policy).toBe('allowed');
        expect(auction.trust).toBeGreaterThan(0);
      });
    });

    it('should return empty array for cities with no auctions', async () => {
      const city = 'SmallVillage';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
    });

    it('should normalize auction deals', async () => {
      const city = 'Milano';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        const auction = auctions[0];
        expect(auction).toBeDefined();

        expect(auction!.id).toBeDefined();
        expect(auction!.fingerprint).toBeDefined();
        expect(auction!.discoveredAt).toBeInstanceOf(Date);
        expect(auction!.updatedAt).toBeInstanceOf(Date);
        expect(auction!.metadata).toBeDefined();
      }
    });
  });

  describe('getMarketStats', () => {
    it('should return comprehensive market statistics', async () => {
      const city = 'Torino';
      const stats = await service.getMarketStats(city);

      expect(stats).toBeDefined();
      expect(stats.totalDeals).toBeGreaterThan(0);
      expect(stats.averagePrice).toBeGreaterThan(0);
      expect(stats.averageSurface).toBeGreaterThan(0);
      expect(stats.priceRange.min).toBeGreaterThan(0);
      expect(stats.priceRange.max).toBeGreaterThan(stats.priceRange.min);
      expect(stats.surfaceRange.min).toBeGreaterThan(0);
      expect(stats.surfaceRange.max).toBeGreaterThan(stats.surfaceRange.min);
      expect(stats.sourceBreakdown).toBeDefined();
      expect(stats.trustScoreDistribution).toBeDefined();
      expect(stats.lastUpdated).toBeInstanceOf(Date);
      expect(stats.city).toBe(city);
    });

    it('should handle cities with no market data', async () => {
      const city = 'NoMarketCity';
      const stats = await service.getMarketStats(city);

      expect(stats).toBeDefined();
      expect(stats.totalDeals).toBe(0);
      expect(stats.averagePrice).toBe(0);
      expect(stats.averageSurface).toBe(0);
      expect(stats.city).toBe(city);
    });

    it('should provide meaningful source breakdown', async () => {
      const city = 'Milano';
      const stats = await service.getMarketStats(city);

      expect(stats.sourceBreakdown).toBeDefined();

      // Should have data for major sources
      expect(stats.sourceBreakdown.idealista).toBeGreaterThan(0);
      expect(stats.sourceBreakdown.immobiliare).toBeGreaterThan(0);
      expect(stats.sourceBreakdown.auctions).toBeGreaterThan(0);
    });

    it('should provide meaningful trust score distribution', async () => {
      const city = 'Roma';
      const stats = await service.getMarketStats(city);

      expect(stats.trustScoreDistribution).toBeDefined();

      // Should have data for different trust score ranges
      const totalDeals = Object.values(stats.trustScoreDistribution).reduce(
        (sum, count) => sum + count,
        0
      );
      expect(totalDeals).toBe(stats.totalDeals);
    });
  });

  describe('getTrendingDeals', () => {
    it('should return trending deals for a specific city', async () => {
      const city = 'Torino';
      const limit = 5;
      const deals = await service.getTrendingDeals(city, limit);

      expect(Array.isArray(deals)).toBe(true);
      expect(deals.length).toBeLessThanOrEqual(limit);

      deals.forEach(deal => {
        expect(deal.city.toLowerCase()).toBe(city.toLowerCase());
        expect(deal.trust).toBeGreaterThan(0.8); // High trust score for trending
        expect(deal.metadata?.trending).toBe(true);
      });
    });

    it('should return trending deals without city filter', async () => {
      const limit = 8;
      const deals = await service.getTrendingDeals(undefined, limit);

      expect(Array.isArray(deals)).toBe(true);
      expect(deals.length).toBeLessThanOrEqual(limit);

      deals.forEach(deal => {
        expect(deal.trust).toBeGreaterThan(0.8);
        expect(deal.metadata?.trending).toBe(true);
      });
    });

    it('should respect the limit parameter', async () => {
      const limit = 3;
      const deals = await service.getTrendingDeals('Milano', limit);

      expect(deals.length).toBeLessThanOrEqual(limit);
    });

    it('should sort deals by trust score', async () => {
      const deals = await service.getTrendingDeals('Roma', 10);

      if (deals.length > 1) {
        for (let i = 1; i < deals.length; i++) {
          const prevDeal = deals[i - 1];
          const currentDeal = deals[i];
          expect(prevDeal).toBeDefined();
          expect(currentDeal).toBeDefined();
          expect(prevDeal!.trust).toBeGreaterThanOrEqual(currentDeal!.trust);
        }
      }
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty city names', async () => {
      const emptyCity = '';
      const auctions = await service.findAuctions(emptyCity);
      const stats = await service.getMarketStats(emptyCity);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
      expect(stats.totalDeals).toBe(0);
    });

    it('should handle very long city names', async () => {
      const longCity = 'A'.repeat(1000);
      const auctions = await service.findAuctions(longCity);
      const stats = await service.getMarketStats(longCity);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
      expect(stats.totalDeals).toBe(0);
    });

    it('should handle concurrent market scans', async () => {
      const filter: SearchFilter = { city: 'Torino', limit: 10 };

      const promises = [
        service.scanMarket(filter),
        service.scanMarket(filter),
        service.scanMarket(filter),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.deals).toBeDefined();
      });
    });

    it('should handle filters with extreme values', async () => {
      const extremeFilter: SearchFilter = {
        city: 'Torino',
        budgetMax: 999999999,
        surfaceMin: 999999,
        limit: 1000,
      };

      const result = await service.scanMarket(extremeFilter);

      expect(result).toBeDefined();
      // Should not crash, may return empty results
      expect(Array.isArray(result.deals)).toBe(true);
    });
  });

  describe('data quality and validation', () => {
    it('should return deals with valid trust scores', async () => {
      const filter: SearchFilter = { city: 'Torino', limit: 20 };
      const result = await service.scanMarket(filter);

      result.deals.forEach(deal => {
        expect(deal.trust).toBeGreaterThanOrEqual(0);
        expect(deal.trust).toBeLessThanOrEqual(1);
      });
    });

    it('should return deals with valid policy values', async () => {
      const filter: SearchFilter = { city: 'Milano', limit: 20 };
      const result = await service.scanMarket(filter);

      result.deals.forEach(deal => {
        expect(['allowed', 'limited', 'blocked']).toContain(deal.policy);
      });
    });

    it('should return deals with consistent data structure', async () => {
      const filter: SearchFilter = { city: 'Roma', limit: 10 };
      const result = await service.scanMarket(filter);

      result.deals.forEach(deal => {
        expect(deal.id).toBeDefined();
        expect(deal.source).toBeDefined();
        expect(deal.address).toBeDefined();
        expect(deal.city).toBeDefined();
        expect(deal.policy).toBeDefined();
        expect(deal.trust).toBeDefined();
        expect(deal.fingerprint).toBeDefined();
        expect(deal.discoveredAt).toBeInstanceOf(Date);
        expect(deal.updatedAt).toBeInstanceOf(Date);
        expect(deal.metadata).toBeDefined();
      });
    });
  });
});
