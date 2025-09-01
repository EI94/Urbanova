import { AuctionsScraperService } from '../../landScraper/auctions';
import { DealNormalized } from '@urbanova/types';

describe('AuctionsScraperService', () => {
  let service: AuctionsScraperService;

  beforeEach(() => {
    service = new AuctionsScraperService();
  });

  describe('findAuctions', () => {
    it('should return auctions for a valid city', async () => {
      const city = 'Torino';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBeGreaterThan(0);

      // Check that all returned deals are for the requested city
      auctions.forEach(auction => {
        expect(auction.city.toLowerCase()).toBe(city.toLowerCase());
        expect(auction.source).toBe('auction');
      });
    });

    it('should return empty array for unknown city', async () => {
      const city = 'UnknownCity123';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
    });

    it('should handle city names with special characters', async () => {
      const city = 'San Giovanni in Persiceto';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      // May or may not have auctions, but should not crash
    });

    it('should return normalized deals', async () => {
      const city = 'Milano';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        const auction = auctions[0];
        expect(auction).toBeDefined();

        // Check required fields
        expect(auction!.id).toBeDefined();
        expect(auction!.source).toBe('auction');
        expect(auction!.address).toBeDefined();
        expect(auction!.city).toBeDefined();
        expect(auction!.policy).toBeDefined();
        expect(auction!.trust).toBeDefined();
        expect(auction!.fingerprint).toBeDefined();
        expect(auction!.discoveredAt).toBeInstanceOf(Date);
        expect(auction!.updatedAt).toBeInstanceOf(Date);
        expect(auction!.metadata).toBeDefined();
      }
    });
  });

  describe('getAuctionDetails', () => {
    it('should return auction details for valid auction ID', async () => {
      const auctionId = 'auction-123';
      const details = await service.getAuctionDetails(auctionId);

      expect(details).toBeDefined();
      expect(details?.id).toBe(auctionId);
      expect(details?.source).toBe('auction');
      expect(details?.address).toBeDefined();
      expect(details?.city).toBeDefined();
    });

    it('should return null for invalid auction ID', async () => {
      const auctionId = 'invalid-auction-999';
      const details = await service.getAuctionDetails(auctionId);

      expect(details).toBeNull();
    });
  });

  describe('getUpcomingAuctions', () => {
    it('should return upcoming auctions for a city', async () => {
      const city = 'Roma';
      const upcoming = await service.getUpcomingAuctions(city);

      expect(Array.isArray(upcoming)).toBe(true);

      if (upcoming.length > 0) {
        upcoming.forEach(auction => {
          expect(auction.city.toLowerCase()).toBe(city.toLowerCase());
          expect(auction.source).toBe('auction');
          expect(auction.metadata?.auctionDate).toBeDefined();
        });
      }
    });

    it('should return empty array when no upcoming auctions', async () => {
      const city = 'SmallVillage';
      const upcoming = await service.getUpcomingAuctions(city);

      expect(Array.isArray(upcoming)).toBe(true);
      expect(upcoming.length).toBe(0);
    });
  });

  describe('getAuctionStats', () => {
    it('should return auction statistics for a city', async () => {
      const city = 'Torino';
      const stats = await service.getAuctionStats(city);

      expect(stats).toBeDefined();
      expect(stats.totalAuctions).toBeGreaterThanOrEqual(0);
      expect(stats.activeAuctions).toBeGreaterThanOrEqual(0);
      expect(stats.upcomingAuctions).toBeGreaterThanOrEqual(0);
      expect(stats.averageStartingPrice).toBeGreaterThanOrEqual(0);
      expect(stats.city).toBe(city);
    });

    it('should handle cities with no auction data', async () => {
      const city = 'NoAuctionsCity';
      const stats = await service.getAuctionStats(city);

      expect(stats).toBeDefined();
      expect(stats.totalAuctions).toBe(0);
      expect(stats.activeAuctions).toBe(0);
      expect(stats.upcomingAuctions).toBe(0);
      expect(stats.averageStartingPrice).toBe(0);
      expect(stats.city).toBe(city);
    });
  });

  describe('auction data quality', () => {
    it('should return deals with reasonable trust scores', async () => {
      const city = 'Milano';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        auctions.forEach(auction => {
          expect(auction.trust).toBeGreaterThanOrEqual(0);
          expect(auction.trust).toBeLessThanOrEqual(1);
        });
      }
    });

    it('should return deals with valid policy values', async () => {
      const city = 'Torino';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        auctions.forEach(auction => {
          expect(['allowed', 'limited', 'blocked']).toContain(auction.policy);
        });
      }
    });

    it('should return deals with valid zoning hints', async () => {
      const city = 'Roma';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        auctions.forEach(auction => {
          if (auction.zoningHint) {
            expect(['residential', 'commercial', 'mixed', 'industrial', 'agricultural']).toContain(
              auction.zoningHint
            );
          }
        });
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty city string', async () => {
      const city = '';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
    });

    it('should handle very long city names', async () => {
      const city = 'A'.repeat(1000);
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBe(0);
    });

    it('should handle city names with numbers', async () => {
      const city = 'City123';
      const auctions = await service.findAuctions(city);

      expect(Array.isArray(auctions)).toBe(true);
      // May or may not have auctions, but should not crash
    });

    it('should handle concurrent calls to same city', async () => {
      const city = 'Torino';

      const promises = [
        service.findAuctions(city),
        service.findAuctions(city),
        service.findAuctions(city),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('metadata consistency', () => {
    it('should include auction-specific metadata', async () => {
      const city = 'Milano';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        auctions.forEach(auction => {
          expect(auction.metadata).toBeDefined();
          expect(auction.metadata.auctionType).toBeDefined();
          expect(auction.metadata.startingPrice).toBeDefined();
          expect(auction.metadata.auctionDate).toBeDefined();
        });
      }
    });

    it('should have consistent metadata structure', async () => {
      const city = 'Torino';
      const auctions = await service.findAuctions(city);

      if (auctions.length > 0) {
        const firstAuction = auctions[0];
        expect(firstAuction).toBeDefined();
        const metadataKeys = Object.keys(firstAuction!.metadata);

        // All auctions should have the same metadata structure
        auctions.forEach(auction => {
          const auctionKeys = Object.keys(auction.metadata);
          expect(auctionKeys).toEqual(metadataKeys);
        });
      }
    });
  });
});
