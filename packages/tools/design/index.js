'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.designCenterTool = exports.designCenterActions = exports.designCenterManifest = void 0;
const aiDesignService_1 = require('../../../src/lib/aiDesignService');
const designCenterService_1 = require('../../../src/lib/designCenterService');
// Real Design Center Tool
exports.designCenterManifest = {
  id: 'design',
  name: 'Design Center',
  version: '1.0.0',
  icon: '🎨',
  category: 'analysis',
  description: 'Analyzes terrain and creates AI-powered designs',
  intents: ['design', 'terreno', 'progetto', 'ai', 'creazione', 'analisi'],
  tags: ['design', 'ai', 'terrain-analysis', 'project-creation', 'automation'],
};
exports.designCenterActions = [
  {
    name: 'analyze_terrain',
    description: 'Analyzes terrain characteristics for design planning',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: false,
  },
  {
    name: 'create_design',
    description: 'Creates AI-powered design based on terrain analysis',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: true,
  },
];
// Real service instances
const aiDesignService = new aiDesignService_1.AIDesignService();
const designCenterService = new designCenterService_1.DesignCenterService();
exports.designCenterTool = {
  manifest: exports.designCenterManifest,
  actions: exports.designCenterActions,
  async analyze_terrain(ctx, args) {
    console.log(`🎨 Real analyzing terrain for project: ${args.projectId}`);
    try {
      // Use real AI design service for terrain analysis
      const terrainAnalysis = await aiDesignService.analyzeTerrain(args.projectId);
      if (!terrainAnalysis.success) {
        throw new Error(`Terrain analysis failed: ${terrainAnalysis.error}`);
      }
      return {
        success: true,
        data: {
          projectId: args.projectId,
          analysis: terrainAnalysis.data,
          summary: `Terrain analysis completed. ${terrainAnalysis.data?.recommendations?.length || 0} recommendations generated.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real terrain analysis:', error);
      throw error;
    }
  },
  async create_design(ctx, args) {
    console.log(`🎨 Real creating design for project: ${args.projectId}`);
    try {
      // Use real AI design service for design creation
      const designResult = await aiDesignService.createDesign({
        projectId: args.projectId,
        templateId: args.templateId,
        parameters: args.params,
      });
      if (!designResult.success) {
        throw new Error(`Design creation failed: ${designResult.error}`);
      }
      // Use design center service for additional processing
      const enhancedDesign = await designCenterService.processDesign(designResult.data);
      return {
        success: true,
        data: {
          projectId: args.projectId,
          design: enhancedDesign,
          templateId: args.templateId,
          summary: `AI design created successfully using template ${args.templateId}.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real design creation:', error);
      throw error;
    }
  },
};
//# sourceMappingURL=index.js.map
