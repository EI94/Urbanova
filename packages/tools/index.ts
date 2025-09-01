// Urbanova Tool OS - Production Tools Package
// This package contains all production-ready tools that integrate with existing services

// Export all tool manifests and actions
export { landScraperManifest, landScraperActions, landScraperTool } from './land';
export { feasibilityManifest, feasibilityActions, feasibilityTool } from './feasibility';
export { designCenterManifest, designCenterActions, designCenterTool } from './design';
export { docHunterManifest, docHunterActions, docHunterTool } from './docs';
export {
  marketIntelligenceManifest,
  marketIntelligenceActions,
  marketIntelligenceTool,
} from './market';

// Export tool instances for direct access
export const allTools = {
  land: { manifest: landScraperManifest, actions: landScraperActions, instance: landScraperTool },
  feasibility: {
    manifest: feasibilityManifest,
    actions: feasibilityActions,
    instance: feasibilityTool,
  },
  design: {
    manifest: designCenterManifest,
    actions: designCenterActions,
    instance: designCenterTool,
  },
  docs: { manifest: docHunterManifest, actions: docHunterActions, instance: docHunterTool },
  market: {
    manifest: marketIntelligenceManifest,
    actions: marketIntelligenceActions,
    instance: marketIntelligenceTool,
  },
};

// Export tool categories for organization
export const toolCategories = {
  Discovery: ['land'],
  Financial: ['feasibility'],
  Design: ['design'],
  Compliance: ['docs'],
  Analytics: ['market'],
};

// Export utility functions
export function getToolsByCategory(category: string) {
  return toolCategories[category] || [];
}

export function getToolByIntent(intent: string) {
  const allIntents = Object.values(allTools).flatMap(
    tool => tool.manifest.intents?.map(i => ({ intent: i, toolId: tool.manifest.id })) || []
  );

  return allIntents.find(item => item.intent === intent)?.toolId;
}

export function getAllIntents() {
  return Object.values(allTools).flatMap(tool => tool.manifest.intents || []);
}

export function getToolStats() {
  const tools = Object.values(allTools);
  const totalActions = tools.reduce((sum, tool) => sum + tool.actions.length, 0);
  const categories = Object.keys(toolCategories);

  return {
    totalTools: tools.length,
    totalActions,
    categories,
    tools: tools.map(tool => ({
      id: tool.manifest.id,
      name: tool.manifest.name,
      version: tool.manifest.version,
      category: tool.manifest.category,
      actions: tool.actions.length,
      intents: tool.manifest.intents || [],
    })),
  };
}

// Export for backward compatibility
export default allTools;
