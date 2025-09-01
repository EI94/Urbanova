// Tool Registry - Urbanova Tool OS
import {
  Tool,
  ToolManifest,
  ToolActionSpec,
  ToolRegistryStats,
  ToolSearchCriteria,
} from '@urbanova/types';

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  /**
   * Registra un nuovo tool
   */
  registerTool(manifest: ToolManifest, actions: ToolActionSpec[]): void {
    const tool: Tool = {
      manifest,
      actions,
    };

    // Validazione
    if (this.tools.has(manifest.id)) {
      throw new Error(`Tool con ID '${manifest.id}' già registrato`);
    }

    // Verifica che le action abbiano nomi unici
    const actionNames = actions.map(a => a.name);
    const uniqueActionNames = new Set(actionNames);
    if (actionNames.length !== uniqueActionNames.size) {
      throw new Error(`Tool '${manifest.id}' ha action con nomi duplicati`);
    }

    this.tools.set(manifest.id, tool);
    console.log(`✅ [ToolRegistry] Tool registrato: ${manifest.id} (${actions.length} actions)`);
  }

  /**
   * Ottiene un tool per ID
   */
  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  /**
   * Ottiene un'action specifica di un tool
   */
  getToolAction(toolId: string, actionName: string): ToolActionSpec | undefined {
    const tool = this.tools.get(toolId);
    if (!tool) return undefined;

    return tool.actions.find(action => action.name === actionName);
  }

  /**
   * Lista tutti i tool registrati
   */
  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Lista i tool per categoria
   */
  listToolsByCategory(category: string): Tool[] {
    return this.listTools().filter(tool => tool.manifest.category === category);
  }

  /**
   * Cerca tool per criteri
   */
  searchTools(criteria: ToolSearchCriteria): Tool[] {
    let results = this.listTools();

    if (criteria.category) {
      results = results.filter(tool => tool.manifest.category === criteria.category);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(tool =>
        tool.manifest.tags?.some(tag => criteria.tags!.includes(tag))
      );
    }

    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      results = results.filter(
        tool =>
          tool.manifest.name.toLowerCase().includes(searchLower) ||
          tool.manifest.description.toLowerCase().includes(searchLower) ||
          tool.manifest.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return results;
  }

  /**
   * Verifica se un tool esiste
   */
  hasTool(id: string): boolean {
    return this.tools.has(id);
  }

  /**
   * Rimuove un tool
   */
  unregisterTool(id: string): boolean {
    return this.tools.delete(id);
  }

  /**
   * Pulisce tutti i tool
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Ottiene statistiche del registry
   */
  getStats(): ToolRegistryStats {
    const tools = this.listTools();
    const byCategory: Record<string, number> = {};

    tools.forEach(tool => {
      const category = tool.manifest.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      total: tools.length,
      byCategory,
      enabled: tools.length, // Per ora tutti i tool sono considerati enabled
      disabled: 0,
    };
  }

  /**
   * Ottiene tool per intent (usando manifest.intents)
   */
  getToolsByIntent(intent: string): Tool[] {
    return this.listTools().filter(tool =>
      tool.manifest.intents?.some(toolIntent =>
        intent.toLowerCase().includes(toolIntent.toLowerCase())
      )
    );
  }

  /**
   * Ottiene action per intent e tool
   */
  getActionByIntent(toolId: string, intent: string): ToolActionSpec | undefined {
    const tool = this.tools.get(toolId);
    if (!tool) return undefined;

    // Cerca action che corrispondono all'intent
    return tool.actions.find(
      action =>
        intent.toLowerCase().includes(action.name.toLowerCase()) ||
        intent.toLowerCase().includes(action.description.toLowerCase())
    );
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
