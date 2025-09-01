import { DealNormalizerService } from '../../landScraper/normalizer';
import { DealNormalized, type DealFingerprint } from '@urbanova/types';

describe('DealNormalizerService', () => {
  let service: DealNormalizerService;

  beforeEach(() => {
    service = new DealNormalizerService();
  });

  describe('generateFingerprint', () => {
    it('should generate consistent fingerprints for identical deals', async () => {
      const deal1 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const deal2 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const fp1 = await service.generateFingerprint(deal1);
      const fp2 = await service.generateFingerprint(deal2);

      expect(fp1).toStrictEqual(fp2);
      expect(typeof fp1).toBe('object');
      expect(fp1.hash.length).toBeGreaterThan(10);
    });

    it('should generate different fingerprints for different deals', async () => {
      const deal1 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
      };

      const deal2 = {
        address: 'Via Roma 123, Torino',
        surface: 150, // Different surface
        priceAsk: 500000,
      };

      const fp1 = await service.generateFingerprint(deal1);
      const fp2 = await service.generateFingerprint(deal2);

      expect(fp1).not.toBe(fp2);
    });

    it('should handle deals with missing optional fields', async () => {
      const deal = {
        address: 'Via Roma 123, Torino',
        // Missing surface, price, zoning
      };

      const fingerprint = await service.generateFingerprint(deal);

      expect(typeof fingerprint).toBe('object');
      expect(fingerprint.hash.length).toBeGreaterThan(0);
    });

    it('should generate fingerprint for deal', async () => {
      const deal = {
        address: 'Via Roma 123, Torino',
        surface: 150,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const fingerprint = await service.generateFingerprint(deal);

      expect(fingerprint).toBeDefined();
      expect(fingerprint.addressHash).toBeDefined();
      expect(fingerprint.surfaceRange).toBeDefined();
      expect(fingerprint.priceRange).toBeDefined();
      expect(fingerprint.zoning).toBeDefined();
      expect(fingerprint.hash).toBeDefined();
    });
  });

  describe('calculateTrustScore', () => {
    it('should return a score between 0 and 1', async () => {
      const deal = {
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const score = await service.calculateTrustScore(deal);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should give higher scores to deals with more complete data', async () => {
      const completeDeal = {
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
        lat: 45.0703,
        lng: 7.6869,
      };

      const incompleteDeal = {
        source: 'unknown',
        address: 'Via Roma 123, Torino',
        // Missing most fields
      };

      const completeScore = await service.calculateTrustScore(completeDeal);
      const incompleteScore = await service.calculateTrustScore(incompleteDeal);

      expect(completeScore).toBeGreaterThan(incompleteScore);
    });

    it('should give higher scores to trusted sources', async () => {
      const trustedSourceDeal = {
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
      };

      const unknownSourceDeal = {
        source: 'unknown-site',
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
      };

      const trustedScore = await service.calculateTrustScore(trustedSourceDeal);
      const unknownScore = await service.calculateTrustScore(unknownSourceDeal);

      expect(trustedScore).toBeGreaterThan(unknownScore);
    });
  });

  describe('normalizeDeal', () => {
    it('should normalize a raw deal into DealNormalized format', async () => {
      const rawDeal = {
        id: 'test-123',
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        city: 'Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
        link: 'https://example.com',
      };

      const normalized = await service.normalizeDeal(rawDeal);

      expect(normalized).toBeDefined();
      expect(normalized?.id).toBe('test-123');
      expect(normalized?.source).toBe('idealista');
      expect(normalized?.address).toBe('Via Roma 123, Torino');
      expect(normalized?.city).toBe('Torino');
      expect(normalized?.surface).toBe(100);
      expect(normalized?.priceAsk).toBe(500000);
      expect(normalized?.zoningHint).toBe('residential');
      expect(normalized?.link).toBe('https://example.com');
      expect(normalized?.policy).toBe('allowed');
      expect(normalized?.trust).toBeGreaterThan(0);
      expect(normalized?.fingerprint).toBeDefined();
      expect(normalized?.discoveredAt).toBeInstanceOf(Date);
      expect(normalized?.updatedAt).toBeInstanceOf(Date);
      expect(normalized?.metadata).toBeDefined();
    });

    it('should handle deals with missing optional fields', async () => {
      const rawDeal = {
        id: 'test-123',
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        city: 'Torino',
        // Missing surface, price, zoning
      };

      const normalized = await service.normalizeDeal(rawDeal);

      expect(normalized).toBeDefined();
      expect(normalized?.surface).toBeUndefined();
      expect(normalized?.priceAsk).toBeUndefined();
      expect(normalized?.zoningHint).toBeUndefined();
    });

    it('should return null for invalid deals', async () => {
      const invalidDeal = {
        // Missing required fields
      };

      const normalized = await service.normalizeDeal(invalidDeal);

      expect(normalized).toBeNull();
    });

    it('should normalize deal with all fields', async () => {
      const rawDeal = {
        id: 'deal-123',
        address: 'Via Roma 123, Torino',
        city: 'Torino',
        surface: 150,
        priceAsk: 500000,
        zoningHint: 'residential',
        source: 'idealista',
        link: 'https://idealista.it/deal-123',
      };

      const result = await service.normalizeDeal(rawDeal);

      expect(result).toBeDefined();
      expect(result!.id).toBe('deal-123');
      expect(result!.address).toBe('Via Roma 123, Torino');
      expect(result!.city).toBe('Torino');
      expect(result!.surface).toBe(150);
      expect(result!.priceAsk).toBe(500000);
      expect(result!.zoningHint).toBe('residential');
      expect(result!.source).toBe('idealista');
      expect(result!.link).toBe('https://idealista.it/deal-123');
      expect(result!.policy).toBe('allowed');
      expect(result!.trust).toBeGreaterThan(0);
      expect(result!.discoveredAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
      expect(result!.fingerprint).toBeDefined();
      expect(result!.fingerprint.addressHash).toBeDefined();
      expect(result!.fingerprint.surfaceRange).toBeDefined();
      expect(result!.fingerprint.priceRange).toBeDefined();
      expect(result!.fingerprint.zoning).toBeDefined();
      expect(result!.fingerprint.hash).toBeDefined();
      expect(result!.metadata).toBeDefined();
    });
  });

  describe('areDuplicates', () => {
    it('should identify identical deals as duplicates', async () => {
      const deal1 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const deal2 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const areDuplicates = await service.areDuplicates(deal1, deal2);

      expect(areDuplicates).toBe(true);
    });

    it('should identify similar deals as duplicates', async () => {
      const deal1 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
      };

      const deal2 = {
        address: 'Via Roma 123, Torino',
        surface: 105, // Slightly different surface
        priceAsk: 510000, // Slightly different price
        zoningHint: 'residential',
      };

      const areDuplicates = await service.areDuplicates(deal1, deal2);

      expect(areDuplicates).toBe(true);
    });

    it('should not identify different deals as duplicates', async () => {
      const deal1 = {
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
      };

      const deal2 = {
        address: 'Via Milano 456, Milano', // Different address
        surface: 100,
        priceAsk: 500000,
      };

      const areDuplicates = await service.areDuplicates(deal1, deal2);

      expect(areDuplicates).toBe(false);
    });
  });

  describe('mergeDuplicates', () => {
    it('should merge duplicate deals preserving best data', async () => {
      const deal1 = {
        id: 'deal-1',
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        surface: 100,
        priceAsk: 500000,
        zoningHint: 'residential',
        trust: 0.8,
        discoveredAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const deal2 = {
        id: 'deal-2',
        source: 'immobiliare',
        address: 'Via Roma 123, Torino',
        surface: 105, // Slightly different
        priceAsk: 510000, // Slightly different
        zoningHint: 'residential',
        trust: 0.9, // Higher trust
        discoveredAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      const merged = await service.mergeDuplicates(deal1, deal2);

      expect(merged).toBeDefined();
      expect(merged.id).toBe('deal-1'); // Keep first ID
      expect(merged.source).toBe('idealista,immobiliare'); // Combine sources
      expect(merged.surface).toBe(105); // Keep most recent/accurate
      expect(merged.priceAsk).toBe(510000); // Keep most recent/accurate
      expect(merged.trust).toBe(0.9); // Keep highest trust
      expect(merged.discoveredAt).toEqual(new Date('2024-01-01')); // Keep earliest
      expect(merged.updatedAt).toEqual(new Date('2024-01-02')); // Keep latest
    });

    it('should handle merging with missing fields', async () => {
      const deal1 = {
        id: 'deal-1',
        source: 'idealista',
        address: 'Via Roma 123, Torino',
        surface: 100,
        // Missing price and zoning
      };

      const deal2 = {
        id: 'deal-2',
        source: 'immobiliare',
        address: 'Via Roma 123, Torino',
        priceAsk: 500000,
        zoningHint: 'residential',
        // Missing surface
      };

      const merged = await service.mergeDuplicates(deal1, deal2);

      expect(merged).toBeDefined();
      expect(merged.surface).toBe(100);
      expect(merged.priceAsk).toBe(500000);
      expect(merged.zoningHint).toBe('residential');
    });
  });

  describe('edge cases', () => {
    it('should handle empty or null deals gracefully', async () => {
      const emptyDeal = {};
      const nullDeal = null as any;

      const normalizedEmpty = await service.normalizeDeal(emptyDeal);
      const normalizedNull = await service.normalizeDeal(nullDeal);

      expect(normalizedEmpty).toBeNull();
      expect(normalizedNull).toBeNull();
    });

    it('should handle deals with extreme values', async () => {
      const extremeDeal = {
        id: 'extreme-123',
        source: 'test',
        address: 'Via Roma 123, Torino',
        city: 'Torino',
        surface: 999999, // Very large surface
        priceAsk: 999999999, // Very large price
        zoningHint: 'residential',
      };

      const normalized = await service.normalizeDeal(extremeDeal);

      expect(normalized).toBeDefined();
      expect(normalized?.surface).toBe(999999);
      expect(normalized?.priceAsk).toBe(999999999);
    });

    it('should handle deals with special characters in address', async () => {
      const specialDeal = {
        id: 'special-123',
        source: 'test',
        address: 'Via Roma 123, 10100 Torino (TO), Italia',
        city: 'Torino',
        surface: 100,
        priceAsk: 500000,
      };

      const normalized = await service.normalizeDeal(specialDeal);

      expect(normalized).toBeDefined();
      expect(normalized?.address).toBe('Via Roma 123, 10100 Torino (TO), Italia');
      expect(normalized?.city).toBe('Torino');
    });
  });
});
