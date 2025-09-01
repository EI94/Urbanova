import { docHunterTool } from '../docs';

describe('DocHunterTool', () => {
  describe('request_doc', () => {
    it('should request CDU document', async () => {
      const result = await docHunterTool.request_doc(
        { userId: 'test-user' },
        { projectId: 'test-project-123', kind: 'CDU', recipient: 'test@example.com' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.documentType).toBe('CDU');
      expect(result.data.recipient).toBe('test@example.com');
      expect(result.data.summary).toContain('CDU requested successfully');
    });

    it('should request VISURA document', async () => {
      const result = await docHunterTool.request_doc(
        { userId: 'test-user' },
        { projectId: 'test-project-456', kind: 'VISURA', recipient: 'user@example.com' }
      );

      expect(result.success).toBe(true);
      expect(result.data.documentType).toBe('VISURA');
      expect(result.data.summary).toContain('VISURA requested successfully');
    });

    it('should request DURC document', async () => {
      const result = await docHunterTool.request_doc(
        { userId: 'test-user' },
        { projectId: 'test-project-789', kind: 'DURC', recipient: 'admin@example.com' }
      );

      expect(result.success).toBe(true);
      expect(result.data.documentType).toBe('DURC');
      expect(result.data.summary).toContain('DURC requested successfully');
    });

    it('should request PLANIMETRIA document', async () => {
      const result = await docHunterTool.request_doc(
        { userId: 'test-user' },
        { projectId: 'test-project-101', kind: 'PLANIMETRIA', recipient: 'architect@example.com' }
      );

      expect(result.success).toBe(true);
      expect(result.data.documentType).toBe('PLANIMETRIA');
      expect(result.data.summary).toContain('PLANIMETRIA requested successfully');
    });
  });

  describe('status', () => {
    it('should check document status for project', async () => {
      const result = await docHunterTool.status(
        { userId: 'test-user' },
        { projectId: 'test-project-123' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-123');
      expect(result.data.documents).toBeDefined();
      expect(result.data.totalRequests).toBeGreaterThan(0);
      expect(result.data.summary).toContain('document requests for project');
    });

    it('should handle different project IDs', async () => {
      const result = await docHunterTool.status(
        { userId: 'test-user' },
        { projectId: 'test-project-456' }
      );

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('test-project-456');
      expect(result.data.documents).toBeDefined();
    });
  });
});
