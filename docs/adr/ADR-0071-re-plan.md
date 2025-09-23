# ADR-0071: Re-Plan - Ripianificazione Automatica

## Status

Accepted

## Context

Il progetto necessita di un sistema di **Re-Plan automatico** che rilevi trigger reali e proponga ripianificazioni intelligenti. I trigger devono essere basati su eventi reali come:

- **Documento scade/ritarda**: DURC, visura, certificazioni
- **SAL slitta**: CDU, SCIA, permessi con ritardi
- **Procurement delays**: RDO con scadenze ritardate
- **Resource conflicts**: Conflitti di risorse o dipendenze

Il sistema deve implementare un flusso **preview→confirm** per garantire controllo umano sulle ripianificazioni.

## Decision

Implementare un sistema di **Re-Plan** che:

### 1. **Trigger Detection Engine**

- **Document Expiry Monitor**: Monitora scadenze documenti
- **SAL Delay Detector**: Rileva ritardi autorizzazioni
- **Procurement Delay Tracker**: Traccia ritardi RDO
- **Resource Conflict Analyzer**: Analizza conflitti risorse

### 2. **Impact Analysis Engine**

- **Dependency Impact**: Analizza impatto su dipendenze
- **Critical Path Recalculation**: Ricalcola percorso critico
- **Resource Reallocation**: Propone riallocazione risorse
- **Cost Impact Assessment**: Valuta impatto costi

### 3. **Preview→Confirm Workflow**

- **Proposal Generation**: Genera proposta ripianificazione
- **Visual Preview**: Mostra preview grafica cambiamenti
- **Impact Summary**: Riassume impatti e rischi
- **User Confirmation**: Richiede conferma utente
- **Automatic Application**: Applica dopo conferma

## Consequences

### Positive

- ✅ **Rilevamento automatico** di problemi reali
- ✅ **Proposte intelligenti** di ripianificazione
- ✅ **Controllo umano** tramite preview→confirm
- ✅ **Minimizzazione ritardi** tramite azioni proattive
- ✅ **Trasparenza completa** degli impatti

### Negative

- ⚠️ **Complessità** nell'analisi impatti
- ⚠️ **False positives** nei trigger
- ⚠️ **Overhead** per preview generation

### Neutral

- 🔄 **Evoluzione continua** delle regole trigger
- 🔄 **Apprendimento** da decisioni utente

## Implementation

### Phase 1: Trigger Detection

```typescript
interface RePlanTrigger {
  type: 'document_expiry' | 'sal_delay' | 'procurement_delay' | 'resource_conflict';
  projectId: string;
  cause: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  impact: {
    affectedTasks: string[];
    delayDays: number;
    costImpact: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

class TriggerDetectionEngine {
  async detectTriggers(projectId: string): Promise<RePlanTrigger[]> {
    const triggers: RePlanTrigger[] = [];

    // Document expiry triggers
    const expiringDocs = await this.checkDocumentExpiry(projectId);
    triggers.push(...expiringDocs);

    // SAL delay triggers
    const salDelays = await this.checkSALDelays(projectId);
    triggers.push(...salDelays);

    // Procurement delay triggers
    const procurementDelays = await this.checkProcurementDelays(projectId);
    triggers.push(...procurementDelays);

    // Resource conflict triggers
    const resourceConflicts = await this.checkResourceConflicts(projectId);
    triggers.push(...resourceConflicts);

    return triggers;
  }
}
```

### Phase 2: Impact Analysis

```typescript
interface RePlanProposal {
  triggerId: string;
  projectId: string;
  currentTimeline: Timeline;
  proposedTimeline: Timeline;
  changes: {
    shiftedTasks: TaskShift[];
    newDependencies: Dependency[];
    resourceChanges: ResourceChange[];
    costImpact: CostImpact;
  };
  impact: {
    totalDelay: number;
    criticalPathChanges: string[];
    riskAssessment: RiskAssessment;
    recommendations: string[];
  };
  confirmation: {
    required: boolean;
    approver: string;
    deadline: Date;
  };
}

class ImpactAnalysisEngine {
  async analyzeImpact(trigger: RePlanTrigger): Promise<RePlanProposal> {
    // 1. Analyze current timeline
    const currentTimeline = await this.getCurrentTimeline(trigger.projectId);

    // 2. Generate proposed timeline
    const proposedTimeline = await this.generateProposedTimeline(trigger, currentTimeline);

    // 3. Calculate changes and impacts
    const changes = await this.calculateChanges(currentTimeline, proposedTimeline);
    const impact = await this.assessImpact(changes);

    return {
      triggerId: trigger.type,
      projectId: trigger.projectId,
      currentTimeline,
      proposedTimeline,
      changes,
      impact,
      confirmation: this.determineConfirmationRequired(impact),
    };
  }
}
```

### Phase 3: Preview→Confirm Workflow

```typescript
class RePlanWorkflow {
  async handleTrigger(trigger: RePlanTrigger): Promise<void> {
    // 1. Generate proposal
    const proposal = await this.impactAnalysisEngine.analyzeImpact(trigger);

    // 2. Create preview
    const preview = await this.createPreview(proposal);

    // 3. Send for confirmation
    if (proposal.confirmation.required) {
      await this.sendForConfirmation(proposal, preview);
    } else {
      // Auto-apply for low impact changes
      await this.applyRePlan(proposal);
    }
  }

  async createPreview(proposal: RePlanProposal): Promise<RePlanPreview> {
    return {
      beforeAfter: {
        before: this.generateGanttSVG(proposal.currentTimeline),
        after: this.generateGanttSVG(proposal.proposedTimeline),
      },
      changes: this.generateChangesSummary(proposal.changes),
      impact: this.generateImpactSummary(proposal.impact),
      recommendations: proposal.impact.recommendations,
    };
  }

  async sendForConfirmation(proposal: RePlanProposal, preview: RePlanPreview): Promise<void> {
    // Send to project manager for approval
    await this.notifyProjectManager(proposal, preview);
  }

  async applyRePlan(proposal: RePlanProposal): Promise<void> {
    // Apply the proposed timeline
    await this.timelineService.updateTimeline(proposal.projectId, proposal.proposedTimeline);

    // Log the re-plan action
    await this.logRePlanAction(proposal);
  }
}
```

### Phase 4: Integration with Auto WBS

```typescript
class TimelineService {
  async handleRePlanTrigger(trigger: RePlanTrigger): Promise<void> {
    // 1. Regenerate WBS with new facts
    const newWBS = await this.autoWBSEngine.generateWBS(trigger.projectId);

    // 2. Generate re-plan proposal
    const proposal = await this.rePlanEngine.analyzeImpact(trigger);

    // 3. Update timeline
    await this.updateTimeline(trigger.projectId, proposal.proposedTimeline);

    // 4. Notify stakeholders
    await this.notifyStakeholders(trigger, proposal);
  }
}
```

## References

- [ADR-0070: Auto WBS](./ADR-0070-auto-wbs.md)
- [ADR-0069: Procurement System](./ADR-0069-procurement-system.md)
- [ADR-0068: Doc Hunter Integration](./ADR-0068-doc-hunter.md)
- [ADR-0067: SAL Management](./ADR-0067-sal-management.md)
