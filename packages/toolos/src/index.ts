// Urbanova Tool OS - Main Export
import { toolRegistry } from './registry';
import { toolRunner } from './runner';
import { securityManager } from './security';
import { registerDefaultTools, verifyDefaultTools } from './registerDefault';

// Re-export types
export type {
  Tool,
  ToolManifest,
  ToolCategory,
  ToolActionSpec,
  RetryPolicy,
  ToolInstall,
  ToolRun,
  ToolRunStatus,
  ToolContext,
  ToolLogger,
  ToolUIExtension,
  ToolExecutionResult,
  ToolRegistryStats,
  ToolSearchCriteria,
} from '@urbanova/types';

export {
  zToolManifest,
  zToolActionSpec,
  zToolInstall,
  zToolRun,
  zTool,
  zToolExecutionResult,
} from '@urbanova/types';

// Main ToolOS class
export class UrbanovaToolOS {
  private initialized: boolean = false;

  /**
   * Inizializza il Tool OS e registra i tool di default
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔄 Tool OS già inizializzato');
      return;
    }

    try {
      console.log('🚀 Inizializzazione Urbanova Tool OS...');

      // Registra tool di default
      await registerDefaultTools(toolRegistry);

      // Verifica registrazione
      const verification = await verifyDefaultTools(toolRegistry);
      if (!verification.success) {
        console.warn(
          '⚠️ Alcuni tool non sono stati registrati correttamente:',
          (verification as any).verification.missing
        );
      }

      this.initialized = true;
      console.log('✅ Urbanova Tool OS inizializzato con successo');
    } catch (error) {
      console.error('❌ Errore durante inizializzazione Tool OS:', error);
      throw error;
    }
  }

  /**
   * Registra un nuovo tool
   */
  registerTool(manifest: any, actions: any[]): void {
    toolRegistry.registerTool(manifest, actions);
  }

  /**
   * Esegue un'action di un tool
   */
  async runAction(request: any, options: any = {}): Promise<any> {
    return await toolRunner.runAction(request, options);
  }

  /**
   * Ottiene informazioni su un tool
   */
  getTool(id: string): any {
    return toolRegistry.getTool(id);
  }

  /**
   * Lista tutti i tool disponibili
   */
  listTools(): any[] {
    return toolRegistry.listTools();
  }

  /**
   * Cerca tool per criteri
   */
  searchTools(criteria: any): any[] {
    return toolRegistry.searchTools(criteria);
  }

  /**
   * Ottiene statistiche del registry
   */
  getRegistryStats(): any {
    return toolRegistry.getStats();
  }

  /**
   * Ottiene statistiche dei run
   */
  getRunStats(): any {
    return toolRunner.getRunStats();
  }

  /**
   * Ottiene tool per intent
   */
  getToolsByIntent(intent: string): any[] {
    return toolRegistry.getToolsByIntent(intent);
  }

  /**
   * Ottiene action per intent e tool
   */
  getActionByIntent(toolId: string, intent: string): any {
    return toolRegistry.getActionByIntent(toolId, intent);
  }

  /**
   * Verifica permessi per un'action
   */
  checkPermissions(action: any, context: any): any {
    return securityManager.checkPermissions(action, context);
  }

  // Accesso ai servizi interni
  get registry() {
    return toolRegistry;
  }
  get runner() {
    return toolRunner;
  }
  get security() {
    return securityManager;
  }

  // Initialization status
  isInitialized(): boolean {
    return this.initialized;
  }

  // Get default tools info
  getDefaultToolsInfo(): any {
    if (!this.initialized) {
      throw new Error('Tool OS non ancora inizializzato. Chiama initialize() prima.');
    }

    const tools = this.listTools();
    const categories = new Set<string>();

    const toolsInfo = tools.map(tool => {
      categories.add(tool.manifest.category);
      return {
        id: tool.manifest.id,
        name: tool.manifest.name,
        version: tool.manifest.version,
        category: tool.manifest.category,
        actions: tool.actions.length,
        intents: tool.manifest.intents || [],
      };
    });

    return {
      tools: toolsInfo,
      summary: {
        totalTools: tools.length,
        totalActions: tools.reduce((sum, tool) => sum + tool.actions.length, 0),
        categories: Array.from(categories),
      },
    };
  }
}

// Singleton instance
export const urbanovaToolOS = new UrbanovaToolOS();

// Auto-initialize when module is imported
urbanovaToolOS.initialize().catch(error => {
  console.error('❌ Errore durante auto-inizializzazione Tool OS:', error);
});
