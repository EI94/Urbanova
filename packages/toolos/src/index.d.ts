export type { Tool, ToolManifest, ToolCategory, ToolActionSpec, RetryPolicy, ToolInstall, ToolRun, ToolRunStatus, ToolContext, ToolLogger, ToolUIExtension, ToolExecutionResult, ToolRegistryStats, ToolSearchCriteria, } from '@urbanova/types';
export { zToolManifest, zToolActionSpec, zToolInstall, zToolRun, zTool, zToolExecutionResult, } from '@urbanova/types';
export declare class UrbanovaToolOS {
    private initialized;
    /**
     * Inizializza il Tool OS e registra i tool di default
     */
    initialize(): Promise<void>;
    /**
     * Registra un nuovo tool
     */
    registerTool(manifest: any, actions: any[]): void;
    /**
     * Esegue un'action di un tool
     */
    runAction(request: any, options?: any): Promise<any>;
    /**
     * Ottiene informazioni su un tool
     */
    getTool(id: string): any;
    /**
     * Lista tutti i tool disponibili
     */
    listTools(): any[];
    /**
     * Cerca tool per criteri
     */
    searchTools(criteria: any): any[];
    /**
     * Ottiene statistiche del registry
     */
    getRegistryStats(): any;
    /**
     * Ottiene statistiche dei run
     */
    getRunStats(): any;
    /**
     * Ottiene tool per intent
     */
    getToolsByIntent(intent: string): any[];
    /**
     * Ottiene action per intent e tool
     */
    getActionByIntent(toolId: string, intent: string): any;
    /**
     * Verifica permessi per un'action
     */
    checkPermissions(action: any, context: any): any;
    get registry(): import("./registry").ToolRegistry;
    get runner(): import("./runner").ToolRunner;
    get security(): import("./security").SecurityManager;
    isInitialized(): boolean;
    getDefaultToolsInfo(): any;
}
export declare const urbanovaToolOS: UrbanovaToolOS;
//# sourceMappingURL=index.d.ts.map