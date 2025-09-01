// Tool Runner - Urbanova Tool OS
import {
  ToolActionSpec,
  ToolContext,
  ToolRun,
  ToolRunStatus,
  ToolExecutionResult,
  ToolLogger,
} from '@urbanova/types';
import { toolRegistry } from './registry';
import { securityManager } from './security';

export interface ToolRunRequest {
  toolId: string;
  action: string;
  args: Record<string, unknown>;
  context: ToolContext;
  // Support for PlanExecutionEngine
  ctx?: ToolContext;
}

export interface ToolRunOptions {
  onProgress?: (message: string) => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
  timeout?: number;
}

export class ToolRunner {
  private activeRuns = new Map<string, ToolRun>();

  /**
   * Esegue un'action di un tool
   */
  async runAction(
    request: ToolRunRequest,
    options: ToolRunOptions = {}
  ): Promise<ToolExecutionResult> {
    const { toolId, action, args } = request;
    // Support both context and ctx for PlanExecutionEngine compatibility
    const context = request.context || request.ctx;
    if (!context) {
      throw new Error('Context is required');
    }

    const startTime = Date.now();

    // Crea il ToolRun
    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toolRun: ToolRun = {
      id: runId,
      toolId,
      action,
      projectId: context.projectId,
      workspaceId: context.workspaceId,
      userId: context.userId,
      status: 'pending',
      startedAt: new Date(),
      args,
      logs: [],
      progress: 0,
    };

    // Registra il run attivo
    this.activeRuns.set(runId, toolRun);

    try {
      // Ottieni il tool e l'action
      const tool = toolRegistry.getTool(toolId);
      if (!tool) {
        throw new Error(`Tool non trovato: ${toolId}`);
      }

      const actionSpec = toolRegistry.getToolAction(toolId, action);
      if (!actionSpec) {
        throw new Error(`Action '${action}' non trovata nel tool '${toolId}'`);
      }

      // Verifica permessi
      const permissions = securityManager.checkPermissions(actionSpec, context);
      if (!permissions.allowed) {
        throw new Error(`Permessi insufficienti: ${permissions.reason}`);
      }

      // Aggiorna status a running
      toolRun.status = 'running';
      toolRun.progress = 10;
      this.logRun(toolRun, 'info', `Avvio esecuzione action '${action}' del tool '${toolId}'`);

      // Valida argomenti con Zod
      const validatedArgs = actionSpec.zArgs.parse(args);
      toolRun.progress = 20;
      this.logRun(toolRun, 'info', 'Argomenti validati con successo');

      // Crea context con callback per progress e log
      const enhancedContext: ToolContext = {
        ...context,
        onProgress: (message: string) => {
          options.onProgress?.(message);
          this.logRun(toolRun, 'info', message);
        },
        onLog: (level: 'info' | 'warn' | 'error', message: string) => {
          options.onLog?.(level, message);
          this.logRun(toolRun, level, message);
        },
      };

      // Esegui l'action (per ora mock, in futuro chiamerà il handler reale)
      toolRun.progress = 50;
      const result = await this.executeAction(actionSpec, validatedArgs, enhancedContext);

      // Aggiorna status e output
      toolRun.status = 'succeeded';
      toolRun.finishedAt = new Date();
      toolRun.output = result;
      toolRun.progress = 100;
      this.logRun(toolRun, 'info', 'Action completata con successo');

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime,
        toolId,
        action,
        runId,
        logs: toolRun.logs,
        // Support for PlanExecutionEngine
        outputRef: `output-${runId}`,
      };
    } catch (error) {
      // Gestione errori
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';

      toolRun.status = 'failed';
      toolRun.finishedAt = new Date();
      toolRun.error = errorMessage;
      toolRun.progress = 0;
      this.logRun(toolRun, 'error', `Errore durante l'esecuzione: ${errorMessage}`);

      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: errorMessage,
        executionTime,
        toolId,
        action,
        runId,
        logs: toolRun.logs,
        // Support for PlanExecutionEngine
        outputRef: undefined,
      };
    } finally {
      // Rimuovi il run dalla lista attiva
      this.activeRuns.delete(runId);
    }
  }

  /**
   * Esegue l'action specifica (per ora mock, in futuro chiamerà il handler reale)
   */
  private async executeAction(
    actionSpec: ToolActionSpec,
    args: any,
    context: ToolContext
  ): Promise<any> {
    // Per ora, restituisci un risultato mock basato sul tipo di action
    // In futuro, questo chiamerà il handler reale del tool

    context.logger.info(`Esecuzione action '${actionSpec.name}' con args:`, args);

    // Simula delay per action long-running
    if (actionSpec.longRunning) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Risultati mock basati sul nome dell'action
    if (actionSpec.name.includes('sensitivity')) {
      return {
        baseRoi: 15.5,
        range: { min: 12.0, max: 18.0 },
        pdfUrl: `https://storage.googleapis.com/urbanova-projects/sensitivity-${Date.now()}.pdf`,
        deltas: args.deltas || [-0.1, 0.1],
      };
    }

    if (actionSpec.name.includes('scrape')) {
      return {
        scrapedData: {
          title: 'Annuncio Scrapato',
          price: '€250.000',
          location: 'Roma, EUR',
          area: '120 m²',
        },
        source: args.url || 'unknown',
        timestamp: new Date().toISOString(),
      };
    }

    if (actionSpec.name.includes('analyze')) {
      return {
        analysis: {
          sentiment: 'positive',
          confidence: 0.85,
          keywords: ['investment', 'opportunity', 'growth'],
          summary: 'Analisi positiva del progetto con buone prospettive di crescita.',
        },
        model: 'gpt-4',
        timestamp: new Date().toISOString(),
      };
    }

    // Default result
    return {
      message: `Action '${actionSpec.name}' eseguita con successo`,
      args,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Aggiunge un log al ToolRun
   */
  private logRun(run: ToolRun, level: 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    run.logs.push(logEntry);

    // Limita i log a 1000 entries
    if (run.logs.length > 1000) {
      run.logs = run.logs.slice(-1000);
    }
  }

  /**
   * Ottiene un run attivo
   */
  getActiveRun(runId: string): ToolRun | undefined {
    return this.activeRuns.get(runId);
  }

  /**
   * Lista tutti i run attivi
   */
  listActiveRuns(): ToolRun[] {
    return Array.from(this.activeRuns.values());
  }

  /**
   * Cancella un run attivo
   */
  cancelRun(runId: string, userId: string): boolean {
    const run = this.activeRuns.get(runId);
    if (!run) {
      return false;
    }

    run.status = 'cancelled';
    run.cancelledAt = new Date();
    run.cancelledBy = userId;
    this.logRun(run, 'info', `Run cancellato da ${userId}`);

    return true;
  }

  /**
   * Ottiene statistiche dei run
   */
  getRunStats(): { active: number; total: number } {
    return {
      active: this.activeRuns.size,
      total: this.activeRuns.size, // Per ora solo attivi, in futuro includere completati
    };
  }
}

// Singleton instance
export const toolRunner = new ToolRunner();
