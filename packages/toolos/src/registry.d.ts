import { Tool, ToolManifest, ToolActionSpec, ToolRegistryStats, ToolSearchCriteria } from '@urbanova/types';
export declare class ToolRegistry {
    private tools;
    /**
     * Registra un nuovo tool
     */
    registerTool(manifest: ToolManifest, actions: ToolActionSpec[]): void;
    /**
     * Ottiene un tool per ID
     */
    getTool(id: string): Tool | undefined;
    /**
     * Ottiene un'action specifica di un tool
     */
    getToolAction(toolId: string, actionName: string): ToolActionSpec | undefined;
    /**
     * Lista tutti i tool registrati
     */
    listTools(): Tool[];
    /**
     * Lista i tool per categoria
     */
    listToolsByCategory(category: string): Tool[];
    /**
     * Cerca tool per criteri
     */
    searchTools(criteria: ToolSearchCriteria): Tool[];
    /**
     * Verifica se un tool esiste
     */
    hasTool(id: string): boolean;
    /**
     * Rimuove un tool
     */
    unregisterTool(id: string): boolean;
    /**
     * Pulisce tutti i tool
     */
    clear(): void;
    /**
     * Ottiene statistiche del registry
     */
    getStats(): ToolRegistryStats;
    /**
     * Ottiene tool per intent (usando manifest.intents)
     */
    getToolsByIntent(intent: string): Tool[];
    /**
     * Ottiene action per intent e tool
     */
    getActionByIntent(toolId: string, intent: string): ToolActionSpec | undefined;
}
export declare const toolRegistry: ToolRegistry;
//# sourceMappingURL=registry.d.ts.map