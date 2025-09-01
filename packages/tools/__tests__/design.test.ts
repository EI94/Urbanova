import { designCenterTool } from '../design';

describe('DesignCenterTool', () => {
  describe('analyze_terrain', () => {
    it('should analyze terrain for project', async () => {
      const result = await designCenterTool.analyze_terrain(
        { userId: 'test-user' },
        { projectId: 'test-project-123' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.summary).toContain('Terrain analysis completed');
    });
  });

  describe('create_design', () => {
    it('should create AI-powered design', async () => {
      const result = await designCenterTool.create_design(
        { userId: 'test-user' },
        {
          projectId: 'test-project-123',
          templateId: 'residential-villa',
          params: { floors: 2, bedrooms: 4, style: 'modern' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.templateId).toBe('residential-villa');
      expect(result.data.summary).toContain('AI design created successfully');
    });

    it('should handle different template types', async () => {
      const result = await designCenterTool.create_design(
        { userId: 'test-user' },
        {
          projectId: 'test-project-456',
          templateId: 'commercial-office',
          params: { floors: 5, offices: 20, parking: 50 },
        }
      );

      expect(result.success).toBe(true);
      expect(result.data.templateId).toBe('commercial-office');
      expect(result.data.summary).toContain('AI design created successfully');
    });
  });
});
