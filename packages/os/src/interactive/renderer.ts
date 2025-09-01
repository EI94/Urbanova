import {
  InteractiveTaskSession as TaskSession,
  InteractivePlanPreview as PlanPreview,
  SessionStatus,
  zPlanPreview,
} from '../../../types/dist/interactive';

export interface RenderOptions {
  includeAssumptions?: boolean;
  includeRisks?: boolean;
  includeCosts?: boolean;
  includeDuration?: boolean;
  maxSteps?: number;
}

export class PlanRenderer {
  /**
   * Build a plan preview object for chat rendering
   */
  buildPlanPreview(session: TaskSession, options: RenderOptions = {}): PlanPreview {
    const {
      includeAssumptions = true,
      includeRisks = true,
      includeCosts = true,
      includeDuration = true,
      maxSteps = 10,
    } = options;

    // Determine step status based on session state
    const steps = session.plan.steps.slice(0, maxSteps).map(step => ({
      id: step.id,
      description: step.description,
      toolId: step.toolId,
      action: step.action,
      status: this.getStepStatus(step, session),
    }));

    // Determine which CTAs to show based on session status
    const ctas = this.getAvailableCTAs(session);

    const preview: PlanPreview = {
      title: session.plan.title,
      description: session.plan.description,
      steps,
      missing: session.plan.requirements,
      assumptions: includeAssumptions ? session.plan.assumptions : [],
      risks: includeRisks ? session.plan.risks : [],
      estimatedDuration: includeDuration ? session.plan.estimatedDuration : undefined,
      totalCost: includeCosts ? session.plan.totalCost : undefined,
      ctas,
    };

    return preview;
  }

  /**
   * Generate a human-readable summary of the plan
   */
  generatePlanSummary(session: TaskSession): string {
    const { plan } = session;

    let summary = `📋 **${plan.title}**\n\n`;
    summary += `${plan.description}\n\n`;

    if (plan.steps.length > 0) {
      summary += `**Azioni da eseguire:**\n`;
      plan.steps.forEach((step, index) => {
        summary += `${index + 1}. ${step.description}\n`;
      });
      summary += '\n';
    }

    if (plan.requirements.length > 0) {
      summary += `**Informazioni richieste:**\n`;
      plan.requirements.forEach(req => {
        summary += `• ${req.description}\n`;
      });
      summary += '\n';
    }

    if (plan.assumptions.length > 0) {
      summary += `**Assunzioni:**\n`;
      plan.assumptions.forEach(assump => {
        const confidence = this.getConfidenceEmoji(assump.confidence);
        summary += `${confidence} ${assump.description}\n`;
      });
      summary += '\n';
    }

    if (plan.risks.length > 0) {
      summary += `**Rischi identificati:**\n`;
      plan.risks.forEach(risk => {
        const severity = this.getSeverityEmoji(risk.severity);
        summary += `${severity} ${risk.description}`;
        if (risk.mitigation) {
          summary += `\n  💡 Mitigazione: ${risk.mitigation}`;
        }
        summary += '\n';
      });
      summary += '\n';
    }

    if (plan.estimatedDuration) {
      summary += `⏱️ **Tempo stimato:** ${plan.estimatedDuration} minuti\n`;
    }

    if (plan.totalCost) {
      summary += `💰 **Costo stimato:** €${plan.totalCost.toLocaleString()}\n`;
    }

    return summary;
  }

  /**
   * Generate CTA buttons text for chat
   */
  generateCTAText(session: TaskSession): string {
    const ctas = this.getAvailableCTAs(session);

    if (ctas.length === 0) {
      return '';
    }

    let ctaText = '\n**Azioni disponibili:**\n';

    ctas.forEach(cta => {
      switch (cta) {
        case 'confirm':
          ctaText += '✅ `/plan confirm` - Conferma ed esegui\n';
          break;
        case 'edit':
          ctaText += '✏️ `/plan edit` - Modifica parametri\n';
          break;
        case 'dryrun':
          ctaText += '🔍 `/plan dryrun` - Simula senza eseguire\n';
          break;
        case 'cancel':
          ctaText += '❌ `/plan cancel` - Annulla piano\n';
          break;
      }
    });

    return ctaText;
  }

  /**
   * Generate a compact plan status message
   */
  generateStatusMessage(session: TaskSession): string {
    const { status, plan } = session;

    switch (status) {
      case SessionStatus.COLLECTING:
        return `🔄 **${plan.title}** - Raccolta informazioni in corso...`;

      case SessionStatus.AWAITING_CONFIRM:
        return `⏳ **${plan.title}** - In attesa di conferma per procedere`;

      case SessionStatus.RUNNING:
        return `🚀 **${plan.title}** - Esecuzione in corso...`;

      case SessionStatus.SUCCEEDED:
        return `✅ **${plan.title}** - Completato con successo`;

      case SessionStatus.FAILED:
        return `❌ **${plan.title}** - Fallito: ${session.error || 'Errore sconosciuto'}`;

      case SessionStatus.CANCELLED:
        return `🚫 **${plan.title}** - Annullato dall'utente`;

      default:
        return `❓ **${plan.title}** - Stato sconosciuto`;
    }
  }

  /**
   * Generate a progress update message
   */
  generateProgressMessage(session: TaskSession, currentStep: number, totalSteps: number): string {
    const progress = Math.round((currentStep / totalSteps) * 100);
    const step = session.plan.steps[currentStep - 1];

    return (
      `📊 **Progresso: ${progress}%** (${currentStep}/${totalSteps})\n` +
      `🔄 Esecuzione: ${step?.description || 'Passo sconosciuto'}`
    );
  }

  /**
   * Generate a completion message with results
   */
  generateCompletionMessage(session: TaskSession, results: Record<string, unknown>): string {
    const { plan } = session;

    let message = `🎉 **${plan.title} completato con successo!**\n\n`;

    if (Object.keys(results).length > 0) {
      message += `**Risultati:**\n`;
      Object.entries(results).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('http')) {
          message += `• ${key}: [Link](${value})\n`;
        } else {
          message += `• ${key}: ${String(value)}\n`;
        }
      });
      message += '\n';
    }

    if (plan.estimatedDuration) {
      const actualDuration =
        session.completedAt && session.startedAt
          ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 60000)
          : null;

      if (actualDuration) {
        message += `⏱️ **Tempo di esecuzione:** ${actualDuration} minuti`;
        if (actualDuration > plan.estimatedDuration) {
          message += ` (${actualDuration - plan.estimatedDuration} minuti in più del previsto)`;
        } else if (actualDuration < plan.estimatedDuration) {
          message += ` (${plan.estimatedDuration - actualDuration} minuti in meno del previsto)`;
        }
        message += '\n';
      }
    }

    return message;
  }

  /**
   * Get the status of a specific step
   */
  private getStepStatus(
    step: { id: string },
    session: TaskSession
  ): 'pending' | 'ready' | 'running' | 'completed' | 'failed' {
    if (session.status === SessionStatus.COLLECTING) {
      return 'pending';
    }

    if (session.status === SessionStatus.AWAITING_CONFIRM) {
      return 'ready';
    }

    if (session.status === SessionStatus.RUNNING) {
      if (session.currentStep && session.currentStep > 0) {
        const stepIndex = session.plan.steps.findIndex(s => s.id === step.id);
        if (stepIndex < session.currentStep) {
          return 'completed';
        } else if (stepIndex === session.currentStep) {
          return 'running';
        } else {
          return 'pending';
        }
      }
      return 'pending';
    }

    if (session.status === SessionStatus.SUCCEEDED) {
      return 'completed';
    }

    if (session.status === SessionStatus.FAILED) {
      return 'failed';
    }

    return 'pending';
  }

  /**
   * Get available CTAs based on session status
   */
  private getAvailableCTAs(session: TaskSession): Array<'confirm' | 'edit' | 'dryrun' | 'cancel'> {
    const ctas: Array<'confirm' | 'edit' | 'dryrun' | 'cancel'> = [];

    switch (session.status) {
      case SessionStatus.COLLECTING:
        ctas.push('edit', 'cancel');
        if (session.plan.requirements.length === 0) {
          ctas.push('confirm');
        }
        break;

      case SessionStatus.AWAITING_CONFIRM:
        ctas.push('confirm', 'edit', 'dryrun', 'cancel');
        break;

      case SessionStatus.RUNNING:
        ctas.push('cancel'); // Can only cancel while running
        break;

      case SessionStatus.SUCCEEDED:
      case SessionStatus.FAILED:
      case SessionStatus.CANCELLED:
        // No actions available for completed sessions
        break;
    }

    return ctas;
  }

  /**
   * Get confidence level emoji
   */
  private getConfidenceEmoji(confidence: 'low' | 'medium' | 'high'): string {
    switch (confidence) {
      case 'low':
        return '🟡';
      case 'medium':
        return '🟠';
      case 'high':
        return '🟢';
      default:
        return '⚪';
    }
  }

  /**
   * Get severity level emoji
   */
  private getSeverityEmoji(severity: 'low' | 'medium' | 'high' | 'critical'): string {
    switch (severity) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🟠';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Validate a plan preview object
   */
  validatePlanPreview(preview: unknown): { success: boolean; errors?: string[] } {
    const result = zPlanPreview.safeParse(preview);
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
      };
    }
  }
}
