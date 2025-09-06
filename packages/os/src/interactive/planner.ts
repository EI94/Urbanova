import { v4 as uuidv4 } from 'uuid';
import { urbanovaToolOS } from '@urbanova/toolos';
import {
  InteractivePlan as Plan,
  InteractivePlanStep as PlanStep,
  InteractiveRequirement as Requirement,
  InteractiveAssumption as Assumption,
  InteractiveRisk as Risk,
  InteractivePlanValidation as PlanValidation,
  SessionStatus,
} from '@urbanova/types';
import { ToolActionSpec } from '@urbanova/types';

export interface PlanningContext {
  userId: string;
  projectId?: string;
  workspaceId: string;
  userRole: string;
  availableTools: string[];
}

export interface PlanningInput {
  text: string;
  projectId?: string;
  userId: string;
  workspaceId: string;
  userRole: string;
}

export interface ResolvedContext extends PlanningContext {
  projectId?: string;
  projectAlias?: string;
  inferredDefaults: Record<string, unknown>;
  latestFeasibilityInputs?: Record<string, unknown>;
}

export class InteractivePlanner {
  private toolRegistry = urbanovaToolOS.registry;

  /**
   * Resolve context from user input and project data
   */
  async resolveContext(
    inputText: string,
    userId: string,
    workspaceId: string,
    userRole: string,
    existingProjectId?: string
  ): Promise<ResolvedContext> {
    const context: ResolvedContext = {
      userId,
      workspaceId,
      userRole,
      availableTools: [],
      inferredDefaults: {},
      latestFeasibilityInputs: {},
    };

    // Use existing projectId if provided, otherwise try to resolve from text
    if (existingProjectId) {
      context.projectId = existingProjectId;
      // Load latest feasibility inputs for that project if present
      context.latestFeasibilityInputs = await this.loadLatestFeasibilityInputs(existingProjectId);
    } else {
      // Resolve project alias → projectId by fuzzy search
      const projectId = await this.resolveProjectAlias(inputText);
      if (projectId) {
        context.projectId = projectId;
        context.projectAlias = this.extractProjectAlias(inputText) as any;

        // Load latest feasibility inputs for that project if present
        context.latestFeasibilityInputs = await this.loadLatestFeasibilityInputs(projectId);
      }
    }

    // Infer defaults based on input text and context
    context.inferredDefaults = this.inferDefaults(inputText, context);

    return context;
  }

  /**
   * Resolve project alias to projectId using fuzzy search
   */
  private async resolveProjectAlias(inputText: string): Promise<string | undefined> {
    // Extract potential project references
    const projectPatterns = [
      /progetto\s+([A-Za-z0-9\s]+)/gi,
      /project\s+([A-Za-z0-9\s]+)/gi,
      /([A-Za-z0-9\s]+)\s+progetto/gi,
    ];

    for (const pattern of projectPatterns) {
      const match = inputText.match(pattern);
      if (match && match[1]) {
        const alias = match[1].trim();
        // In production, this would query the database
        // For now, return a mock projectId
        return `project-${alias.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }

    return undefined;
  }

  /**
   * Extract project alias from input text
   */
  private extractProjectAlias(inputText: string): string | undefined {
    const projectPatterns = [
      /progetto\s+([A-Za-z0-9\s]+)/gi,
      /project\s+([A-Za-z0-9\s]+)/gi,
      /([A-Za-z0-9\s]+)\s+progetto/gi,
    ];

    for (const pattern of projectPatterns) {
      const match = inputText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Load latest feasibility inputs for a project
   */
  private async loadLatestFeasibilityInputs(projectId: string): Promise<Record<string, unknown>> {
    // In production, this would query the database for latest feasibility inputs
    // For now, return mock data
    return {
      projectId,
      deltas: [-0.1, -0.05, 0.05, 0.1],
      targetMargin: 0.15,
      horizonMonths: 24,
    };
  }

  /**
   * Infer defaults based on input text and context
   */
  private inferDefaults(inputText: string, context: ResolvedContext): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};

    // Default sensitivity deltas if not specified
    if (
      inputText.toLowerCase().includes('sensitivity') ||
      inputText.toLowerCase().includes('scenario')
    ) {
      defaults.deltas = [-0.1, -0.05, 0.05, 0.1];
    }

    // Default horizon for feasibility analysis
    if (
      inputText.toLowerCase().includes('fattibilità') ||
      inputText.toLowerCase().includes('feasibility')
    ) {
      defaults.horizonMonths = 24;
    }

    // Use latest feasibility inputs if available
    if (context.latestFeasibilityInputs) {
      Object.assign(defaults, context.latestFeasibilityInputs);
    }

    return defaults;
  }

  /**
   * Draft a plan based on user input
   */
  async draftPlan(input: PlanningInput): Promise<{ plan: Plan; session: any }> {
    // Resolve context from input
    const resolvedContext = await this.resolveContext(
      input.text,
      input.userId,
      input.workspaceId,
      input.userRole,
      input.projectId
    );

    // Analyze intent and map to tool actions
    const intent = this.analyzeIntent(input.text);
    const toolActions = this.mapIntentToToolActions(intent, resolvedContext);

    // Create plan steps
    const steps: PlanStep[] = toolActions.map((toolAction, index) => ({
      id: crypto.randomUUID(),
      order: index + 1,
      toolId: toolAction.toolId,
      action: toolAction.actionName,
      description: toolAction.description,
      zArgs: toolAction.defaultArgs,
      requiredRole: toolAction.requiredRole,
      confirm: toolAction.confirm || false,
      longRunning: toolAction.longRunning || false,
    }));

    // Extract requirements from tool actions
    const requirements: Requirement[] = this.extractRequirements(toolActions, resolvedContext);

    // Generate assumptions and risks
    const assumptions: Assumption[] = this.generateAssumptions(
      input.text,
      toolActions,
      resolvedContext
    );
    const risks: Risk[] = this.generateRisks(input.text, toolActions, resolvedContext);

    // Estimate duration and cost
    const estimatedDuration = this.estimateDuration(toolActions);
    const totalCost = this.estimateCost(toolActions);

    const plan: Plan = {
      id: crypto.randomUUID(),
      title: this.generatePlanTitle(intent),
      description: this.generatePlanDescription(intent, toolActions),
      steps,
      requirements,
      assumptions,
      risks,
      estimatedDuration,
      totalCost,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session = {
      id: crypto.randomUUID(),
      projectId: resolvedContext.projectId,
      userId: input.userId,
      status: 'awaiting_confirm',
      plan,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { plan, session };
  }

  /**
   * Validate a plan against tool schemas
   */
  validatePlan(plan: Plan): PlanValidation {
    const missing: Requirement[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const step of plan.steps) {
      const tool = this.toolRegistry.getTool(step.toolId);
      if (!tool) {
        errors.push(`Tool ${step.toolId} not found`);
        continue;
      }

      const action = tool.actions.find((a: ToolActionSpec) => a.name === step.action);
      if (!action) {
        errors.push(`Action ${step.action} not found in tool ${step.toolId}`);
        continue;
      }

      // Validate args against action schema
      const validation = this.validateActionArgs(step, action);
      missing.push(...validation.missing);
      warnings.push(...validation.warnings);
      errors.push(...validation.errors);
    }

    const ready = missing.length === 0 && errors.length === 0;

    return {
      missing,
      ready,
      warnings,
      errors,
    };
  }

  private analyzeIntent(text: string): string {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('sensitivity') ||
      lowerText.includes('fattibilità') ||
      lowerText.includes('feasibility')
    ) {
      return 'feasibility_analysis';
    }
    if (lowerText.includes('scansiona') || lowerText.includes('scan')) {
      return 'land_scanning';
    }
    if (lowerText.includes('design') || lowerText.includes('progetto')) {
      return 'design_creation';
    }
    if (lowerText.includes('market') || lowerText.includes('mercato')) {
      return 'market_analysis';
    }
    if (lowerText.includes('documenti') || lowerText.includes('docs')) {
      return 'document_management';
    }

    return 'general_analysis';
  }

  private mapIntentToToolActions(
    intent: string,
    ctx: PlanningContext
  ): Array<{
    toolId: string;
    actionName: string;
    description: string;
    defaultArgs: Record<string, unknown>;
    requiredRole: string;
    confirm: boolean;
    longRunning: boolean;
  }> {
    const actions: Array<{
      toolId: string;
      actionName: string;
      description: string;
      defaultArgs: Record<string, unknown>;
      requiredRole: string;
      confirm: boolean;
      longRunning: boolean;
    }> = [];

    switch (intent) {
      case 'feasibility_analysis':
        actions.push({
          toolId: 'feasibility',
          actionName: 'run_sensitivity',
          description: 'Esegui analisi di fattibilità con scenario di sensibilità',
          defaultArgs: { projectId: ctx.projectId, deltas: [0.1, 0.2, 0.3] },
          requiredRole: 'pm',
          confirm: true,
          longRunning: true,
        });
        break;

      case 'land_scanning':
        actions.push({
          toolId: 'land',
          actionName: 'scan_by_link',
          description: 'Scansiona annuncio immobiliare per estrarre informazioni',
          defaultArgs: { link: '', projectName: '' },
          requiredRole: 'sales',
          confirm: false,
          longRunning: false,
        });
        break;

      case 'design_creation':
        actions.push({
          toolId: 'design',
          actionName: 'create_design',
          description: 'Crea design architettonico basato su template e parametri',
          defaultArgs: { projectId: ctx.projectId, templateId: '', params: {} },
          requiredRole: 'designer',
          confirm: true,
          longRunning: true,
        });
        break;

      case 'market_analysis':
        actions.push({
          toolId: 'market',
          actionName: 'scan_city',
          description: 'Analizza mercato immobiliare per città e tipo di asset',
          defaultArgs: { city: '', asset: 'residenziale' as const },
          requiredRole: 'analyst',
          confirm: false,
          longRunning: false,
        });
        break;

      case 'document_management':
        actions.push({
          toolId: 'docs',
          actionName: 'request_doc',
          description: 'Richiedi documenti necessari per il progetto',
          defaultArgs: { projectId: ctx.projectId, kind: 'CDU' as const, recipient: '' },
          requiredRole: 'pm',
          confirm: false,
          longRunning: false,
        });
        break;

      default:
        // General analysis - suggest multiple tools
        actions.push(
          {
            toolId: 'feasibility',
            actionName: 'run',
            description: 'Esegui analisi di fattibilità base',
            defaultArgs: { projectId: ctx.projectId },
            requiredRole: 'pm',
            confirm: true,
            longRunning: false,
          },
          {
            toolId: 'market',
            actionName: 'trend_report',
            description: 'Genera report trend di mercato',
            defaultArgs: { city: '', horizonMonths: 12 },
            requiredRole: 'analyst',
            confirm: false,
            longRunning: true,
          }
        );
    }

    return actions;
  }

  private extractRequirements(
    toolActions: Array<{
      toolId: string;
      actionName: string;
      defaultArgs: Record<string, unknown>;
    }>,
    ctx: PlanningContext
  ): Requirement[] {
    const requirements: Requirement[] = [];

    for (const action of toolActions) {
      const tool = this.toolRegistry.getTool(action.toolId);
      if (!tool) continue;

      const actionSpec = tool.actions.find(a => a.name === action.actionName);
      if (!actionSpec) continue;

      // Check if projectId is required but not provided
      if (actionSpec.zArgs && !ctx.projectId) {
        requirements.push({
          id: uuidv4(),
          field: 'projectId',
          description: 'ID del progetto è richiesto per questa azione',
          type: 'text',
          required: true,
        });
      }

      // Check for other required fields based on action schema
      if (actionSpec.zArgs) {
        // This is a simplified check - in production you'd parse the zod schema
        // to extract required fields and their types
        if (action.toolId === 'land' && action.actionName === 'scan_by_link') {
          requirements.push({
            id: uuidv4(),
            field: 'link',
            description: "URL dell'annuncio da scansionare",
            type: 'text',
            required: true,
          });
        }
      }
    }

    return requirements;
  }

  private generateAssumptions(
    intent: string,
    toolActions: Array<{
      toolId: string;
      actionName: string;
    }>,
    ctx: PlanningContext
  ): Assumption[] {
    const assumptions: Assumption[] = [];

    // General assumptions
    assumptions.push({
      id: uuidv4(),
      description: 'Utente ha i permessi necessari per eseguire le azioni richieste',
      confidence: 'high',
      source: 'user_role_check',
    });

    if (ctx.projectId) {
      assumptions.push({
        id: uuidv4(),
        description: 'Progetto esiste ed è accessibile',
        confidence: 'high',
        source: 'project_context',
      });
    }

    // Tool-specific assumptions
    if (toolActions.some(a => a.toolId === 'feasibility')) {
      assumptions.push({
        id: uuidv4(),
        description: 'Dati finanziari del progetto sono aggiornati e completi',
        confidence: 'medium',
        source: 'feasibility_tool',
      });
    }

    if (toolActions.some(a => a.toolId === 'market')) {
      assumptions.push({
        id: uuidv4(),
        description: 'Dati di mercato sono disponibili per la città specificata',
        confidence: 'medium',
        source: 'market_intelligence',
      });
    }

    return assumptions;
  }

  private generateRisks(
    intent: string,
    toolActions: Array<{
      toolId: string;
      actionName: string;
    }>,
    ctx: PlanningContext
  ): Risk[] {
    const risks: Risk[] = [];

    // General risks
    risks.push({
      id: uuidv4(),
      description: 'Servizi esterni potrebbero non essere disponibili',
      severity: 'medium',
      mitigation: 'Implementare retry logic e fallback',
    });

    // Tool-specific risks
    if (toolActions.some(a => a.toolId === 'feasibility' && a.actionName === 'run_sensitivity')) {
      risks.push({
        id: uuidv4(),
        description: 'Analisi di sensibilità potrebbe richiedere molto tempo',
        severity: 'low',
        mitigation: 'Eseguire in background e notificare al completamento',
      });
    }

    if (toolActions.some(a => a.toolId === 'land')) {
      risks.push({
        id: uuidv4(),
        description: 'Web scraping potrebbe fallire per cambiamenti nei siti target',
        severity: 'medium',
        mitigation: 'Monitorare e aggiornare selettori CSS regolarmente',
      });
    }

    if (toolActions.some(a => a.toolId === 'design')) {
      risks.push({
        id: uuidv4(),
        description: 'AI design potrebbe non soddisfare i requisiti specifici',
        severity: 'medium',
        mitigation: "Revisione umana obbligatoria prima dell'approvazione",
      });
    }

    return risks;
  }

  private generatePlanTitle(intent: string): string {
    const titles: Record<string, string> = {
      feasibility_analysis: 'Analisi di Fattibilità',
      land_scanning: 'Scansione Terreni e Annunci',
      design_creation: 'Creazione Design Architettonico',
      market_analysis: 'Analisi di Mercato',
      document_management: 'Gestione Documenti',
      general_analysis: 'Analisi Generale Progetto',
    };

    return titles[intent] || 'Piano di Azione';
  }

  private generatePlanDescription(
    intent: string,
    toolActions: Array<{
      toolId: string;
      actionName: string;
      description: string;
    }>
  ): string {
    const descriptions: Record<string, string> = {
      feasibility_analysis:
        "Esegue un'analisi completa di fattibilità del progetto con scenario di sensibilità",
      land_scanning:
        'Scansiona annunci immobiliari per identificare opportunità e analizzare terreni',
      design_creation: 'Crea design architettonici utilizzando AI e template personalizzabili',
      market_analysis:
        'Analizza trend di mercato e genera report per supportare decisioni di investimento',
      document_management:
        'Gestisce la raccolta e validazione di documenti necessari per il progetto',
      general_analysis: "Esegue un'analisi generale del progetto utilizzando strumenti disponibili",
    };

    return (
      descriptions[intent] || "Esegue le azioni richieste per completare l'obiettivo specificato"
    );
  }

  private estimateDuration(
    toolActions: Array<{
      longRunning: boolean;
    }>
  ): number {
    let totalMinutes = 0;

    for (const action of toolActions) {
      if (action.longRunning) {
        totalMinutes += 15; // Long running actions
      } else {
        totalMinutes += 2; // Quick actions
      }
    }

    return totalMinutes;
  }

  private estimateCost(
    toolActions: Array<{
      toolId: string;
      actionName: string;
    }>
  ): number | undefined {
    // In a real implementation, you'd have cost models for different tools
    // For now, return undefined to indicate no cost estimation
    return undefined;
  }

  private validateActionArgs(
    step: PlanStep,
    action: ToolActionSpec
  ): {
    missing: Requirement[];
    warnings: string[];
    errors: string[];
  } {
    const missing: Requirement[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    // This is a simplified validation - in production you'd use the actual zod schema
    // to validate the args against the action's zArgs schema

    if (action.zArgs && typeof action.zArgs === 'object' && step.zArgs) {
      // Check for required fields based on action type
      if (step.toolId === 'feasibility' && step.action === 'run_sensitivity') {
        if (!step.zArgs.projectId) {
          missing.push({
            id: uuidv4(),
            field: 'projectId',
            description: "ID del progetto è richiesto per l'analisi di sensibilità",
            type: 'text',
            required: true,
          });
        }
        if (!step.zArgs.deltas) {
          missing.push({
            id: uuidv4(),
            field: 'deltas',
            description: "Array di delta per l'analisi di sensibilità",
            type: 'number',
            required: true,
          });
        }
      }
    }

    return { missing, warnings, errors };
  }

  /**
   * Merge inferred defaults with tool actions
   */
  private mergeDefaultsWithActions(
    toolActions: Array<{
      toolId: string;
      actionName: string;
      description: string;
      defaultArgs: Record<string, unknown>;
      requiredRole: string;
      confirm: boolean;
      longRunning: boolean;
    }>,
    inferredDefaults: Record<string, unknown>
  ) {
    return toolActions.map(action => ({
      ...action,
      defaultArgs: {
        ...action.defaultArgs,
        ...inferredDefaults,
      },
    }));
  }
}
