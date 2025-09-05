import { ToolContext, ToolRun, ToolExecutionResult } from '@urbanova/types';
export interface ToolRunRequest {
    toolId: string;
    action: string;
    args: Record<string, unknown>;
    context: ToolContext;
    ctx?: ToolContext;
}
export interface ToolRunOptions {
    onProgress?: (message: string) => void;
    onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
    timeout?: number;
}
export declare class ToolRunner {
    private activeRuns;
    /**
     * Esegue un'action di un tool
     */
    runAction(request: ToolRunRequest, options?: ToolRunOptions): Promise<ToolExecutionResult>;
    /**
     * Esegue l'action specifica (per ora mock, in futuro chiamerà il handler reale)
     */
    private executeAction;
    /**
     * Aggiunge un log al ToolRun
     */
    private logRun;
    /**
     * Ottiene un run attivo
     */
    getActiveRun(runId: string): ToolRun | undefined;
    /**
     * Lista tutti i run attivi
     */
    listActiveRuns(): ToolRun[];
    /**
     * Cancella un run attivo
     */
    cancelRun(runId: string, userId: string): boolean;
    /**
     * Ottiene statistiche dei run
     */
    getRunStats(): {
        active: number;
        total: number;
    };
}
export declare const toolRunner: ToolRunner;
//# sourceMappingURL=runner.d.ts.map