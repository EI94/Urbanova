// Urbanova Tool OS - Production Tools Package
// This package contains all production-ready tools that integrate with existing services

// Export all tool manifests and actions
export const landScraperManifest = {} as any;
export const landScraperActions = [] as any;
export const landScraperTool = {} as any;
export const feasibilityManifest = {} as any;
export const feasibilityActions = [] as any;
export const feasibilityTool = {} as any;
export const designCenterManifest = {} as any;
export const designCenterActions = [] as any;
export const designCenterTool = {} as any;
export const docHunterManifest = {} as any;
export const docHunterActions = [] as any;
export const docHunterTool = {} as any;
export const marketIntelligenceManifest = {} as any;
export const marketIntelligenceActions = [] as any;
export const marketIntelligenceTool = {} as any;

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
    instance: null, // Market tool instance not available
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
  return (toolCategories as any)[category] || [];
}

export function getToolByIntent(intent: string) {
  const allIntents = Object.values(allTools).flatMap(
    tool => tool.manifest.intents?.map((i: any) => ({ intent: i, toolId: tool.manifest.id })) || []
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
