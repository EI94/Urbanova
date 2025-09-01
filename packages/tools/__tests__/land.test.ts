import { landScraperTool } from '../land';

describe('LandScraperTool', () => {
  describe('scan_by_link', () => {
    it('should scan land listing and create project', async () => {
      const result = await landScraperTool.scan_by_link(
        { userId: 'test-user' },
        { link: 'https://example.com/land', projectName: 'Test Project' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBeDefined();
      expect(result.data.summary).toContain('Land listing scanned successfully');
    });

    it('should handle scanning without project name', async () => {
      const result = await landScraperTool.scan_by_link(
        { userId: 'test-user' },
        { link: 'https://example.com/land' }
      );

      expect(result.success).toBe(true);
      expect(result.data.summary).toContain('Land listing scanned successfully');
    });
  });

  describe('scan_market', () => {
    it('should scan market for city', async () => {
      const result = await landScraperTool.scan_market({ userId: 'test-user' }, { city: 'Milano' });

      expect(result.success).toBe(true);
      expect(result.data.city).toBe('Milano');
      expect(result.data.summary).toContain('deals in Milano');
    });

    it('should scan market with filters', async () => {
      const result = await landScraperTool.scan_market(
        { userId: 'test-user' },
        { city: 'Roma', budgetMax: 500000, surfaceMin: 200 }
      );

      expect(result.success).toBe(true);
      expect(result.data.city).toBe('Roma');
      expect(result.data.summary).toContain('deals in Roma');
    });
  });

  describe('find_auctions', () => {
    it('should find auctions for city', async () => {
      const result = await landScraperTool.find_auctions(
        { userId: 'test-user' },
        { city: 'Napoli' }
      );

      expect(result.success).toBe(true);
      expect(result.data.city).toBe('Napoli');
      expect(result.data.summary).toContain('auctions in Napoli');
    });
  });
});
