// Urbanova OS - Main Export
export { capabilityRegistry } from './registry';
export { planner } from './planner';
export { router } from './router';
export { qnaService } from './qna';

// Export Interactive Planner
export * from './interactive';

// Import e registra capability
import { echoCapability } from './capabilities';
import { projectGetSummaryCapability, feasibilitySensitivityCapability } from './capabilities';
import { capabilityRegistry } from './registry';
import { planner } from './planner';
import { router } from './router';
import { qnaService } from './qna';

// Registra tutte le capability
capabilityRegistry.register(echoCapability);
capabilityRegistry.register(projectGetSummaryCapability);
capabilityRegistry.register(feasibilitySensitivityCapability);

// Re-export types
export type {
  // Capability,
  // CapabilitySpec,
  // CapabilityContext,
  // Plan,
  // PlanMode,
  // QnaAnswer,
  // CapabilityExecutionResult,
  // QnaExecutionResult,
} from '@urbanova/types';

// Main OS class
export class UrbanovaOS {
  /**
   * Esegue un comando testuale
   */
  async execute(request: {
    text: string;
    userId: string;
    source: string;
    projectId?: string;
  }): Promise<any> {
    const { text, userId, source, projectId } = request;

    // Crea il context
    const context = {
      userId,
      sender: source,
      projectId,
      now: new Date(),
      logger: console,
      db: null,
    };

    const plan = this.planner.classify(text);
    const result = await this.router.execute(plan, context);

    return {
      plan,
      result,
    };
  }

  /**
   * Registra una nuova capability
   */
  registerCapability(capability: any): void {
    this.registry.register(capability);
  }

  /**
   * Ottiene informazioni su una capability
   */
  getCapabilityInfo(name: string): any {
    return this.router.getCapabilityInfo(name);
  }

  /**
   * Lista tutte le capability disponibili
   */
  listCapabilities(): any[] {
    return this.router.listCapabilities();
  }

  /**
   * Ottiene statistiche del sistema
   */
  getStats(): any {
    return {
      capabilities: this.registry.getStats(),
      totalCapabilities: this.registry.list().length,
    };
  }

  // Accesso ai servizi interni
  get registry() {
    return capabilityRegistry;
  }
  get planner() {
    return planner;
  }
  get router() {
    return router;
  }
  get qna() {
    return qnaService;
  }
}

// Singleton instance
export const urbanovaOS = new UrbanovaOS();
