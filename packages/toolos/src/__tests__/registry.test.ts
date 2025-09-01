import { ToolRegistry } from '../registry';
import { ToolManifest, ToolActionSpec, ToolCategory } from '@urbanova/types';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  afterEach(() => {
    registry.clear();
  });

  const mockManifest: ToolManifest = {
    id: 'test-tool',
    name: 'Test Tool',
    version: '1.0.0',
    category: 'analysis',
    description: 'A test tool for testing purposes',
    intents: ['test', 'analysis'],
    tags: ['test', 'mock'],
  };

  const mockActions: ToolActionSpec[] = [
    {
      name: 'run_test',
      description: 'Run a test action',
      zArgs: require('zod').z.object({
        input: require('zod').z.string(),
      }),
      requiredRole: 'pm',
    },
    {
      name: 'analyze_data',
      description: 'Analyze test data',
      zArgs: require('zod').z.object({
        data: require('zod').z.array(require('zod').z.number()),
      }),
      requiredRole: 'owner',
    },
  ];

  describe('registerTool', () => {
    it('should register a tool successfully', () => {
      registry.registerTool(mockManifest, mockActions);
      expect(registry.hasTool('test-tool')).toBe(true);
    });

    it('should throw error for duplicate tool ID', () => {
      registry.registerTool(mockManifest, mockActions);
      expect(() => {
        registry.registerTool(mockManifest, mockActions);
      }).toThrow("Tool con ID 'test-tool' già registrato");
    });

    it('should throw error for duplicate action names', () => {
      const duplicateActions = [
        { ...mockActions[0] },
        { ...mockActions[0] }, // Same name
      ];
      expect(() => {
        registry.registerTool(mockManifest, duplicateActions);
      }).toThrow("Tool 'test-tool' ha action con nomi duplicati");
    });
  });

  describe('getTool', () => {
    it('should return tool by ID', () => {
      registry.registerTool(mockManifest, mockActions);
      const tool = registry.getTool('test-tool');
      expect(tool).toBeDefined();
      expect(tool?.manifest.id).toBe('test-tool');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getTool('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getToolAction', () => {
    it('should return action by name', () => {
      registry.registerTool(mockManifest, mockActions);
      const action = registry.getToolAction('test-tool', 'run_test');
      expect(action).toBeDefined();
      expect(action?.name).toBe('run_test');
    });

    it('should return undefined for non-existent action', () => {
      registry.registerTool(mockManifest, mockActions);
      const action = registry.getToolAction('test-tool', 'non-existent');
      expect(action).toBeUndefined();
    });
  });

  describe('listTools', () => {
    it('should return all registered tools', () => {
      registry.registerTool(mockManifest, mockActions);
      const tools = registry.listTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].manifest.id).toBe('test-tool');
    });

    it('should return empty array when no tools registered', () => {
      const tools = registry.listTools();
      expect(tools).toHaveLength(0);
    });
  });

  describe('listToolsByCategory', () => {
    it('should return tools by category', () => {
      registry.registerTool(mockManifest, mockActions);
      const tools = registry.listToolsByCategory('analysis');
      expect(tools).toHaveLength(1);
      expect(tools[0].manifest.category).toBe('analysis');
    });

    it('should return empty array for non-existent category', () => {
      registry.registerTool(mockManifest, mockActions);
      const tools = registry.listToolsByCategory('non-existent');
      expect(tools).toHaveLength(0);
    });
  });

  describe('searchTools', () => {
    it('should search by category', () => {
      registry.registerTool(mockManifest, mockActions);
      const results = registry.searchTools({ category: 'analysis' });
      expect(results).toHaveLength(1);
    });

    it('should search by tags', () => {
      registry.registerTool(mockManifest, mockActions);
      const results = registry.searchTools({ tags: ['test'] });
      expect(results).toHaveLength(1);
    });

    it('should search by text', () => {
      registry.registerTool(mockManifest, mockActions);
      const results = registry.searchTools({ search: 'test' });
      expect(results).toHaveLength(1);
    });

    it('should combine multiple criteria', () => {
      registry.registerTool(mockManifest, mockActions);
      const results = registry.searchTools({
        category: 'analysis',
        tags: ['test'],
        search: 'tool',
      });
      expect(results).toHaveLength(1);
    });
  });

  describe('getToolsByIntent', () => {
    it('should return tools matching intent', () => {
      registry.registerTool(mockManifest, mockActions);
      const tools = registry.getToolsByIntent('test');
      expect(tools).toHaveLength(1);
    });

    it('should return empty array for non-matching intent', () => {
      registry.registerTool(mockManifest, mockActions);
      const tools = registry.getToolsByIntent('non-matching');
      expect(tools).toHaveLength(0);
    });
  });

  describe('getActionByIntent', () => {
    it('should return action matching intent', () => {
      registry.registerTool(mockManifest, mockActions);
      const action = registry.getActionByIntent('test-tool', 'run');
      expect(action).toBeDefined();
      expect(action?.name).toBe('run_test');
    });

    it('should return undefined for non-matching intent', () => {
      registry.registerTool(mockManifest, mockActions);
      const action = registry.getActionByIntent('test-tool', 'non-matching');
      expect(action).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      registry.registerTool(mockManifest, mockActions);
      const stats = registry.getStats();

      expect(stats.total).toBe(1);
      expect(stats.byCategory.analysis).toBe(1);
      expect(stats.enabled).toBe(1);
      expect(stats.disabled).toBe(0);
    });
  });

  describe('unregisterTool', () => {
    it('should unregister tool successfully', () => {
      registry.registerTool(mockManifest, mockActions);
      expect(registry.hasTool('test-tool')).toBe(true);

      const result = registry.unregisterTool('test-tool');
      expect(result).toBe(true);
      expect(registry.hasTool('test-tool')).toBe(false);
    });

    it('should return false for non-existent tool', () => {
      const result = registry.unregisterTool('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all tools', () => {
      registry.registerTool(mockManifest, mockActions);
      expect(registry.listTools()).toHaveLength(1);

      registry.clear();
      expect(registry.listTools()).toHaveLength(0);
    });
  });
});
