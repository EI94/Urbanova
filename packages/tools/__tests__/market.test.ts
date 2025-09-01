import { marketIntelligenceTool } from '../market';

describe('MarketIntelligenceTool', () => {
  describe('scan_city', () => {
    it('should scan residential market for city', async () => {
      const result = await marketIntelligenceTool.scan_city(
        { userId: 'test-user' },
        { city: 'Milano', asset: 'residenziale' }
      );

      expect(result.success).toBe(true);
      expect(result.data.kpis).toBeDefined();
      expect(result.data.insights).toBeDefined();
      expect(result.data.summary).toContain('Market scan completed for Milano');
    });

    it('should scan student housing market', async () => {
      const result = await marketIntelligenceTool.scan_city(
        { userId: 'test-user' },
        { city: 'Roma', asset: 'studentato', horizonMonths: 18 }
      );

      expect(result.success).toBe(true);
      expect(result.data.kpis).toBeDefined();
      expect(result.data.summary).toContain('Market scan completed for Roma');
    });

    it('should scan retail market', async () => {
      const result = await marketIntelligenceTool.scan_city(
        { userId: 'test-user' },
        { city: 'Napoli', asset: 'retail' }
      );

      expect(result.success).toBe(true);
      expect(result.data.kpis).toBeDefined();
      expect(result.data.summary).toContain('Market scan completed for Napoli');
    });

    it('should scan office market', async () => {
      const result = await marketIntelligenceTool.scan_city(
        { userId: 'test-user' },
        { city: 'Torino', asset: 'uffici' }
      );

      expect(result.success).toBe(true);
      expect(result.data.kpis).toBeDefined();
      expect(result.data.summary).toContain('Market scan completed for Torino');
    });
  });

  describe('trend_report', () => {
    it('should create trend report for city', async () => {
      const result = await marketIntelligenceTool.trend_report(
        { userId: 'test-user' },
        { city: 'Firenze', horizonMonths: 12 }
      );

      expect(result.success).toBe(true);
      expect(result.data.city).toBe('Firenze');
      expect(result.data.horizonMonths).toBe(12);
      expect(result.data.pdfUrl).toBeDefined();
      expect(result.data.summary).toContain('Trend report created for Firenze');
    });

    it('should handle different time horizons', async () => {
      const result = await marketIntelligenceTool.trend_report(
        { userId: 'test-user' },
        { city: 'Bologna', horizonMonths: 24 }
      );

      expect(result.success).toBe(true);
      expect(result.data.horizonMonths).toBe(24);
      expect(result.data.summary).toContain('24 month horizon');
    });
  });

  describe('comps_fetch', () => {
    it('should fetch comparables for city', async () => {
      const result = await marketIntelligenceTool.comps_fetch(
        { userId: 'test-user' },
        { city: 'Palermo' }
      );

      expect(result.success).toBe(true);
      expect(result.data.city).toBe('Palermo');
      expect(result.data.radiusKm).toBe(5); // Default
      expect(result.data.sampleSize).toBe(10); // Default
      expect(result.data.summary).toContain('comparable properties in Palermo');
    });

    it('should fetch comparables with custom radius', async () => {
      const result = await marketIntelligenceTool.comps_fetch(
        { userId: 'test-user' },
        { city: 'Genova', radiusKm: 10 }
      );

      expect(result.success).toBe(true);
      expect(result.data.radiusKm).toBe(10);
      expect(result.data.summary).toContain('comparable properties in Genova');
    });

    it('should fetch comparables with custom sample size', async () => {
      const result = await marketIntelligenceTool.comps_fetch(
        { userId: 'test-user' },
        { city: 'Bari', sampleSize: 25 }
      );

      expect(result.success).toBe(true);
      expect(result.data.sampleSize).toBe(25);
      expect(result.data.summary).toContain('comparable properties in Bari');
    });

    it('should fetch comparables with both custom parameters', async () => {
      const result = await marketIntelligenceTool.comps_fetch(
        { userId: 'test-user' },
        { city: 'Catania', radiusKm: 15, sampleSize: 30 }
      );

      expect(result.success).toBe(true);
      expect(result.data.radiusKm).toBe(15);
      expect(result.data.sampleSize).toBe(30);
      expect(result.data.summary).toContain('comparable properties in Catania');
    });
  });
});
