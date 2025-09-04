import {
  RePlanTrigger,
  RePlanProposal,
  RePlanPreview,
  WBS,
  WBSTask,
  WBSDependency,
  TaskShift,
  ResourceChange,
  CostImpact,
  TimelineRiskAssessment,
  Fact,
} from '@urbanova/types';

/**
 * Re-Plan Engine - Motore di ripianificazione automatica
 *
 * Funzionalità:
 * - Trigger Detection
 * - Impact Analysis
 * - Proposal Generation
 * - Preview Creation
 */

export class RePlanEngine {
  constructor() {
    console.log('🔄 [RePlanEngine] Re-Plan Engine inizializzato');
  }

  /**
   * Rileva trigger per re-plan
   */
  async detectTriggers(projectId: string): Promise<RePlanTrigger[]> {
    console.log(`🔍 [RePlanEngine] Rilevamento trigger per progetto ${projectId}`);

    const triggers: RePlanTrigger[] = [];

    try {
      // 1. Document expiry triggers
      const docTriggers = await this.detectDocumentExpiryTriggers(projectId);
      triggers.push(...docTriggers);

      // 2. SAL delay triggers
      const salTriggers = await this.detectSALDelayTriggers(projectId);
      triggers.push(...salTriggers);

      // 3. Procurement delay triggers
      const procTriggers = await this.detectProcurementDelayTriggers(projectId);
      triggers.push(...procTriggers);

      // 4. Resource conflict triggers
      const resourceTriggers = await this.detectResourceConflictTriggers(projectId);
      triggers.push(...resourceTriggers);

      console.log(`🔍 [RePlanEngine] Rilevati ${triggers.length} trigger`);
    } catch (error) {
      console.error(`❌ [RePlanEngine] Errore rilevamento trigger:`, error);
    }

    return triggers;
  }

  /**
   * Rileva trigger specifico
   */
  async detectTrigger(projectId: string, cause: string, details: any): Promise<RePlanTrigger> {
    console.log(`🔍 [RePlanEngine] Rilevamento trigger specifico: ${cause}`);

    const triggerId = `trigger-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Analizza causa e determina tipo
    const type = this.analyzeTriggerType(cause, details);
    const severity = this.calculateTriggerSeverity(cause, details);
    const impact = await this.analyzeTriggerImpact(projectId, cause, details);

    const trigger: RePlanTrigger = {
      id: triggerId,
      type,
      projectId,
      cause,
      details,
      severity,
      detectedAt: new Date(),
      impact,
      status: 'detected',
      detectedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`🔍 [RePlanEngine] Trigger rilevato: ${type} (${severity})`);

    return trigger;
  }

  /**
   * Analizza impatto del trigger
   */
  async analyzeImpact(trigger: RePlanTrigger): Promise<RePlanProposal> {
    console.log(`📊 [RePlanEngine] Analisi impatto per trigger ${trigger.id}`);

    try {
      // 1. Ottieni timeline corrente
      const currentTimeline = await this.getCurrentTimeline(trigger.projectId);

      // 2. Genera timeline proposta
      const proposedTimeline = await this.generateProposedTimeline(trigger, currentTimeline);

      // 3. Calcola cambiamenti
      const changes = await this.calculateChanges(currentTimeline, proposedTimeline);

      // 4. Valuta impatto
      const impact = await this.assessImpact(changes);

      // 5. Determina conferma richiesta
      const confirmation = this.determineConfirmationRequired(impact);

      const proposal: RePlanProposal = {
        id: `proposal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        triggerId: trigger.id,
        projectId: trigger.projectId,
        currentTimeline,
        proposedTimeline,
        changes,
        impact,
        confirmation,
        status: 'draft',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(`📊 [RePlanEngine] Proposta generata: ${impact.totalDelay} giorni di ritardo`);

      return proposal;
    } catch (error) {
      console.error(`❌ [RePlanEngine] Errore analisi impatto:`, error);
      throw error;
    }
  }

  /**
   * Rileva trigger scadenza documenti
   */
  private async detectDocumentExpiryTriggers(projectId: string): Promise<RePlanTrigger[]> {
    const triggers: RePlanTrigger[] = [];

    // Simula rilevamento documenti in scadenza
    const expiringDocs = [
      {
        vendorId: 'vendor-001',
        documentType: 'DURC',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
        vendorName: 'Costruzioni ABC SRL',
      },
    ];

    for (const doc of expiringDocs) {
      const daysUntilExpiry = Math.ceil(
        (doc.validUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      if (daysUntilExpiry <= 30) {
        triggers.push({
          id: `trigger-doc-${doc.vendorId}-${doc.documentType}`,
          type: 'document_expiry',
          projectId,
          cause: `Documento ${doc.documentType} in scadenza`,
          details: {
            vendorId: doc.vendorId,
            vendorName: doc.vendorName,
            documentType: doc.documentType,
            validUntil: doc.validUntil,
            daysUntilExpiry,
          },
          severity: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 15 ? 'high' : 'medium',
          detectedAt: new Date(),
          impact: {
            affectedTasks: [`task-doc-${doc.vendorId}-${doc.documentType}`],
            delayDays: daysUntilExpiry <= 7 ? 14 : 7,
            costImpact: daysUntilExpiry <= 7 ? 5000 : 2000,
            riskLevel: daysUntilExpiry <= 7 ? 'high' : 'medium',
            description: `Rinnovo documento ${doc.documentType} per ${doc.vendorName}`,
          },
          status: 'detected',
          detectedBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return triggers;
  }

  /**
   * Rileva trigger ritardi SAL
   */
  private async detectSALDelayTriggers(projectId: string): Promise<RePlanTrigger[]> {
    const triggers: RePlanTrigger[] = [];

    // Simula rilevamento ritardi SAL
    const delayedSALs = [
      {
        authorizationType: 'CDU',
        expectedResponseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 giorni di ritardo
        authority: 'Comune di Milano',
        description: 'Concessione Demanio Urbano',
      },
    ];

    for (const sal of delayedSALs) {
      const delayDays = Math.ceil(
        (Date.now() - sal.expectedResponseDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (delayDays > 0) {
        triggers.push({
          id: `trigger-sal-${sal.authorizationType}`,
          type: 'sal_delay',
          projectId,
          cause: `Ritardo autorizzazione ${sal.authorizationType}`,
          details: {
            authorizationType: sal.authorizationType,
            authority: sal.authority,
            description: sal.description,
            expectedResponseDate: sal.expectedResponseDate,
            delayDays,
          },
          severity: delayDays > 30 ? 'critical' : delayDays > 15 ? 'high' : 'medium',
          detectedAt: new Date(),
          impact: {
            affectedTasks: [`task-sal-${sal.authorizationType}`],
            delayDays: delayDays + 10, // Buffer aggiuntivo
            costImpact: delayDays * 1000, // 1000€ al giorno
            riskLevel: delayDays > 30 ? 'high' : 'medium',
            description: `Ritardo autorizzazione ${sal.authorizationType} presso ${sal.authority}`,
          },
          status: 'detected',
          detectedBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return triggers;
  }

  /**
   * Rileva trigger ritardi Procurement
   */
  private async detectProcurementDelayTriggers(projectId: string): Promise<RePlanTrigger[]> {
    const triggers: RePlanTrigger[] = [];

    // Simula rilevamento ritardi Procurement
    const delayedRDOs = [
      {
        rdoId: 'rdo-001',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 giorni di ritardo
        rdoTitle: 'Cappotto termico 2.000 mq',
        status: 'comparing',
      },
    ];

    for (const rdo of delayedRDOs) {
      const delayDays = Math.ceil((Date.now() - rdo.deadline.getTime()) / (24 * 60 * 60 * 1000));

      if (delayDays > 0) {
        triggers.push({
          id: `trigger-proc-${rdo.rdoId}`,
          type: 'procurement_delay',
          projectId,
          cause: `Ritardo RDO: ${rdo.rdoTitle}`,
          details: {
            rdoId: rdo.rdoId,
            rdoTitle: rdo.rdoTitle,
            deadline: rdo.deadline,
            status: rdo.status,
            delayDays,
          },
          severity: delayDays > 14 ? 'critical' : delayDays > 7 ? 'high' : 'medium',
          detectedAt: new Date(),
          impact: {
            affectedTasks: [`task-proc-${rdo.rdoId}`],
            delayDays: delayDays + 5, // Buffer aggiuntivo
            costImpact: delayDays * 500, // 500€ al giorno
            riskLevel: delayDays > 14 ? 'high' : 'medium',
            description: `Ritardo completamento RDO ${rdo.rdoTitle}`,
          },
          status: 'detected',
          detectedBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return triggers;
  }

  /**
   * Rileva trigger conflitti risorse
   */
  private async detectResourceConflictTriggers(projectId: string): Promise<RePlanTrigger[]> {
    const triggers: RePlanTrigger[] = [];

    // Simula rilevamento conflitti risorse
    const resourceConflicts = [
      {
        resourceId: 'project_manager',
        conflictingTasks: ['task-sal-CDU', 'task-proc-rdo-001'],
        conflictType: 'overlap',
        overlapDays: 10,
      },
    ];

    for (const conflict of resourceConflicts) {
      triggers.push({
        id: `trigger-resource-${conflict.resourceId}`,
        type: 'resource_conflict',
        projectId,
        cause: `Conflitto risorse: ${conflict.resourceId}`,
        details: {
          resourceId: conflict.resourceId,
          conflictingTasks: conflict.conflictingTasks,
          conflictType: conflict.conflictType,
          overlapDays: conflict.overlapDays,
        },
        severity:
          conflict.overlapDays > 15 ? 'critical' : conflict.overlapDays > 7 ? 'high' : 'medium',
        detectedAt: new Date(),
        impact: {
          affectedTasks: conflict.conflictingTasks,
          delayDays: conflict.overlapDays,
          costImpact: conflict.overlapDays * 200, // 200€ al giorno
          riskLevel: conflict.overlapDays > 15 ? 'high' : 'medium',
          description: `Conflitto risorse ${conflict.resourceId} su ${conflict.conflictingTasks.length} task`,
        },
        status: 'detected',
        detectedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return triggers;
  }

  /**
   * Analizza tipo di trigger
   */
  private analyzeTriggerType(cause: string, details: any): RePlanTrigger['type'] {
    if (cause.includes('documento') || cause.includes('DURC') || cause.includes('visura')) {
      return 'document_expiry';
    }
    if (cause.includes('SAL') || cause.includes('autorizzazione') || cause.includes('CDU')) {
      return 'sal_delay';
    }
    if (cause.includes('RDO') || cause.includes('procurement') || cause.includes('offerta')) {
      return 'procurement_delay';
    }
    if (cause.includes('risorse') || cause.includes('conflitto') || cause.includes('overlap')) {
      return 'resource_conflict';
    }
    if (cause.includes('scope') || cause.includes('ambito')) {
      return 'scope_change';
    }
    return 'risk_materialized';
  }

  /**
   * Calcola severità trigger
   */
  private calculateTriggerSeverity(cause: string, details: any): RePlanTrigger['severity'] {
    // Logica basata su cause e dettagli
    if (cause.includes('critico') || cause.includes('urgente')) {
      return 'critical';
    }
    if (cause.includes('ritardo') || cause.includes('scadenza')) {
      return 'high';
    }
    if (cause.includes('conflitto') || cause.includes('overlap')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Analizza impatto trigger
   */
  private async analyzeTriggerImpact(
    projectId: string,
    cause: string,
    details: any
  ): Promise<RePlanTrigger['impact']> {
    // Simula analisi impatto
    const delayDays = details.delayDays || 7;
    const costImpact = details.costImpact || 1000;

    return {
      affectedTasks: details.affectedTasks || [],
      delayDays,
      costImpact,
      riskLevel: delayDays > 30 ? 'high' : delayDays > 15 ? 'medium' : 'low',
      description: `Impatto stimato: ${delayDays} giorni di ritardo, ${costImpact}€ di costo aggiuntivo`,
    };
  }

  /**
   * Ottieni timeline corrente
   */
  private async getCurrentTimeline(projectId: string): Promise<WBS> {
    // Simula recupero timeline corrente
    return {
      id: `wbs-current-${projectId}`,
      projectId,
      name: `WBS ${projectId} - Corrente`,
      description: 'Timeline corrente',
      tasks: [],
      dependencies: [],
      criticalPath: [],
      criticalPathDuration: 0,
      startDate: new Date(),
      endDate: new Date(),
      overallProgress: 0,
      completedTasks: 0,
      totalTasks: 0,
      version: 1,
      generatedAt: new Date(),
      generatedBy: 'system',
      sourceFacts: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Genera timeline proposta
   */
  private async generateProposedTimeline(
    trigger: RePlanTrigger,
    currentTimeline: WBS
  ): Promise<WBS> {
    // Simula generazione timeline proposta
    const proposedTimeline = { ...currentTimeline };

    // Applica modifiche basate sul trigger
    proposedTimeline.id = `wbs-proposed-${trigger.projectId}`;
    proposedTimeline.name = `WBS ${trigger.projectId} - Proposta`;
    proposedTimeline.description = `Timeline proposta per trigger ${trigger.type}`;
    proposedTimeline.version = currentTimeline.version + 1;
    proposedTimeline.generatedAt = new Date();
    proposedTimeline.updatedAt = new Date();

    return proposedTimeline;
  }

  /**
   * Calcola cambiamenti tra timeline
   */
  private async calculateChanges(
    currentTimeline: WBS,
    proposedTimeline: WBS
  ): Promise<{
    shiftedTasks: TaskShift[];
    newDependencies: WBSDependency[];
    resourceChanges: ResourceChange[];
    costImpact: CostImpact;
  }> {
    // Simula calcolo cambiamenti
    return {
      shiftedTasks: [],
      newDependencies: [],
      resourceChanges: [],
      costImpact: {
        originalCost: 100000,
        newCost: 105000,
        difference: 5000,
        breakdown: {
          labor: 3000,
          materials: 1000,
          overhead: 500,
          contingency: 500,
        },
        currency: 'EUR',
      },
    };
  }

  /**
   * Valuta impatto dei cambiamenti
   */
  private async assessImpact(changes: any): Promise<{
    totalDelay: number;
    criticalPathChanges: string[];
    riskAssessment: TimelineRiskAssessment;
    recommendations: string[];
  }> {
    // Simula valutazione impatto
    return {
      totalDelay: 7,
      criticalPathChanges: ['task-sal-CDU', 'task-proc-rdo-001'],
      riskAssessment: {
        overallRisk: 'medium',
        risks: [
          {
            id: 'risk-001',
            description: 'Ritardo autorizzazioni',
            probability: 70,
            impact: 'high',
            mitigation: 'Accelerare procedure burocratiche',
          },
        ],
        recommendations: [
          'Contattare autorità competenti',
          'Preparare documentazione aggiuntiva',
          'Valutare alternative temporanee',
        ],
      },
      recommendations: [
        'Accelerare procedure burocratiche',
        'Allocare risorse aggiuntive',
        'Monitorare progresso giornaliero',
      ],
    };
  }

  /**
   * Determina se è richiesta conferma
   */
  private determineConfirmationRequired(impact: any): {
    required: boolean;
    approver?: string;
    deadline?: Date;
    autoApply: boolean;
  } {
    // Logica per determinare se serve conferma
    const requiresConfirmation =
      impact.totalDelay > 14 || impact.riskAssessment.overallRisk === 'high';

    return {
      required: requiresConfirmation,
      approver: requiresConfirmation ? 'project_manager' : undefined,
      deadline: requiresConfirmation ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined, // 24 ore
      autoApply: !requiresConfirmation,
    } as any;
  }
}
