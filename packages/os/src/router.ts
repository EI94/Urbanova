// Router - Urbanova OS
import { Plan, CapabilityContext, CapabilityExecutionResult } from '@urbanova/types';
import { capabilityRegistry } from './registry';
import { qnaService } from './qna';

export class Router {
  /**
   * Esegue il piano ricevuto dal planner
   */
  async execute(plan: Plan, context: CapabilityContext): Promise<CapabilityExecutionResult | any> {
    const startTime = Date.now();

    console.log(`[Router] Esecuzione piano:`, plan);

    try {
      if (plan.mode === 'ACTION') {
        const result = await this.executeCapability(plan, context);
        console.log(`[Router] Capability result:`, result);
        return result;
      } else {
        const result = await this.executeQna(plan, context);
        console.log(`[Router] QNA result:`, result);
        return result;
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        executionTime,
        capability: plan.intent || 'unknown',
        args: plan.args,
      } as CapabilityExecutionResult;
      console.log(`[Router] Error result:`, errorResult);
      return errorResult;
    }
  }

  /**
   * Esegue una capability
   */
  private async executeCapability(
    plan: Plan,
    context: CapabilityContext
  ): Promise<CapabilityExecutionResult> {
    const startTime = Date.now();

    if (!plan.intent) {
      throw new Error('Intent non specificato per capability');
    }

    const capability = capabilityRegistry.get(plan.intent);
    if (!capability) {
      throw new Error(`Capability non trovata: ${plan.intent}`);
    }

    // Validazione argomenti con Zod
    try {
      const validatedArgs = capability.spec.zArgs.parse(plan.args);

      // Esegui capability
      const result = await capability.handler(context, validatedArgs);

      const executionTime = Date.now() - startTime;
      return {
        success: true,
        data: result,
        executionTime,
        capability: plan.intent,
        args: validatedArgs,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore validazione argomenti',
        executionTime,
        capability: plan.intent,
        args: plan.args,
      };
    }
  }

  /**
   * Esegue QNA
   */
  private async executeQna(plan: Plan, context: CapabilityContext): Promise<any> {
    // Per ora, restituisci un messaggio di fallback
    // In futuro, questo chiamerà il servizio QNA
    return {
      success: true,
      data: {
        message: 'Funzionalità QNA non ancora implementata',
        mode: 'QNA',
        projectId: plan.projectId,
      },
      executionTime: 0,
      capability: 'qna',
      args: {},
    };
  }

  /**
   * Lista tutte le capability disponibili
   */
  listCapabilities(): string[] {
    return capabilityRegistry.list().map(cap => cap.spec.name);
  }

  /**
   * Ottiene informazioni su una capability specifica
   */
  getCapabilityInfo(name: string): any {
    const capability = capabilityRegistry.get(name);
    if (!capability) {
      return null;
    }

    return {
      name: capability.spec.name,
      description: capability.spec.description,
      requiredRole: capability.spec.requiredRole,
      confirm: capability.spec.confirm,
      dryRun: capability.spec.dryRun,
      argsSchema: capability.spec.zArgs,
    };
  }
}

// Singleton instance
export const router = new Router();
