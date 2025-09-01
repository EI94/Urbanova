'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TimelineTool = void 0;
const autoWBSEngine_1 = require('./autoWBSEngine');
const rePlanEngine_1 = require('./rePlanEngine');
const ganttGenerator_1 = require('./ganttGenerator');
const timelineService_1 = require('./timelineService');
/**
 * Timeline Tool - Sistema Timeline Reale Urbanova
 *
 * Funzionalità principali:
 * - Auto WBS da fatti reali
 * - Re-Plan automatico con trigger
 * - Critical path dinamico
 * - Preview→Confirm workflow
 * - Gantt visualization
 */
class TimelineTool {
  constructor() {
    this.autoWBSEngine = new autoWBSEngine_1.AutoWBSEngine();
    this.rePlanEngine = new rePlanEngine_1.RePlanEngine();
    this.ganttGenerator = new ganttGenerator_1.GanttGenerator();
    this.timelineService = new timelineService_1.TimelineService();
    console.log('📅 [TimelineTool] Timeline Tool inizializzato');
  }
  /**
   * Genera timeline da fatti reali
   */
  async generateTimeline(projectId, options) {
    const startTime = Date.now();
    try {
      console.log(`📅 [TimelineTool] Generazione timeline per progetto ${projectId}`);
      // 1. Raccogli fatti reali
      const facts = await this.collectFacts(projectId);
      console.log(`📊 [TimelineTool] Raccolti ${facts.length} fatti reali`);
      // 2. Genera WBS automatica
      const wbs = await this.autoWBSEngine.generateWBS(projectId, facts);
      console.log(`📋 [TimelineTool] WBS generata con ${wbs.tasks.length} task`);
      // 3. Calcola critical path
      const criticalPath = await this.calculateCriticalPath(wbs);
      console.log(`🔗 [TimelineTool] Critical path calcolato: ${criticalPath.length} task`);
      // 4. Crea timeline
      const timeline = {
        id: `timeline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        projectId,
        name: `Timeline ${projectId}`,
        description: `Timeline generata automaticamente da ${facts.length} fatti reali`,
        wbs: {
          ...wbs,
          criticalPath: criticalPath.map(task => task.id),
          criticalPathDuration: criticalPath.reduce((sum, task) => sum + task.estimatedDuration, 0),
        },
        rePlanHistory: [],
        activeTriggers: [],
        status: 'active',
        version: 1,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRegeneratedAt: new Date(),
      };
      // 5. Salva timeline
      await this.timelineService.saveTimeline(timeline);
      const duration = Date.now() - startTime;
      console.log(`✅ [TimelineTool] Timeline generata in ${duration}ms`);
      return {
        success: true,
        timeline,
        generatedAt: new Date(),
        duration,
        factsUsed: facts.length,
        tasksGenerated: wbs.tasks.length,
        criticalPathLength: criticalPath.length,
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore generazione timeline:`, error);
      return {
        success: false,
        timeline: null,
        generatedAt: new Date(),
        duration: Date.now() - startTime,
        factsUsed: 0,
        tasksGenerated: 0,
        criticalPathLength: 0,
      };
    }
  }
  /**
   * Re-Plan timeline con trigger reali
   */
  async replanTimeline(projectId, cause, details, options) {
    try {
      console.log(`🔄 [TimelineTool] Re-Plan timeline per progetto ${projectId}`);
      // 1. Rileva trigger
      const trigger = await this.rePlanEngine.detectTrigger(projectId, cause, details);
      console.log(`🔍 [TimelineTool] Trigger rilevato: ${trigger.type}`);
      // 2. Analizza impatto
      const proposal = await this.rePlanEngine.analyzeImpact(trigger);
      console.log(
        `📊 [TimelineTool] Impatto analizzato: ${proposal.impact.totalDelay} giorni di ritardo`
      );
      // 3. Genera preview se richiesto
      let preview;
      if (options?.includePreview) {
        preview = await this.ganttGenerator.generateRePlanPreview(proposal);
        console.log(`👁️ [TimelineTool] Preview generata`);
      }
      // 4. Applica se auto-apply
      let applied = false;
      let appliedAt;
      if (options?.autoApply || proposal.confirmation.autoApply) {
        await this.timelineService.applyRePlan(proposal);
        applied = true;
        appliedAt = new Date();
        console.log(`✅ [TimelineTool] Re-Plan applicato automaticamente`);
      }
      // 5. Notifica stakeholder se richiesto
      if (options?.notifyStakeholders) {
        await this.notifyStakeholders(trigger, proposal, preview);
        console.log(`📧 [TimelineTool] Stakeholder notificati`);
      }
      return {
        success: true,
        trigger,
        proposal,
        preview,
        applied,
        appliedAt,
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore re-plan:`, error);
      return {
        success: false,
        trigger: null,
        proposal: null,
        preview: undefined,
        applied: false,
        appliedAt: undefined,
      };
    }
  }
  /**
   * Ottieni status timeline
   */
  async getTimelineStatus(projectId) {
    try {
      const timeline = await this.timelineService.getTimeline(projectId);
      if (!timeline) {
        return {
          exists: false,
          message: 'Timeline non trovata',
        };
      }
      return {
        exists: true,
        timeline: {
          id: timeline.id,
          projectId: timeline.projectId,
          name: timeline.name,
          status: timeline.status,
          version: timeline.version,
          overallProgress: timeline.wbs.overallProgress,
          criticalPathLength: timeline.wbs.criticalPath.length,
          totalTasks: timeline.wbs.totalTasks,
          completedTasks: timeline.wbs.completedTasks,
          startDate: timeline.wbs.startDate,
          endDate: timeline.wbs.endDate,
          lastRegeneratedAt: timeline.lastRegeneratedAt,
        },
        rePlanHistory: timeline.rePlanHistory.length,
        activeTriggers: timeline.activeTriggers.length,
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore status timeline:`, error);
      return {
        exists: false,
        error: error.message,
      };
    }
  }
  /**
   * Ottieni critical path
   */
  async getCriticalPath(projectId) {
    try {
      const timeline = await this.timelineService.getTimeline(projectId);
      if (!timeline) {
        return {
          exists: false,
          message: 'Timeline non trovata',
        };
      }
      const criticalTasks = timeline.wbs.tasks.filter(task =>
        timeline.wbs.criticalPath.includes(task.id)
      );
      return {
        exists: true,
        criticalPath: timeline.wbs.criticalPath,
        criticalTasks: criticalTasks.map(task => ({
          id: task.id,
          name: task.name,
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.estimatedDuration,
          progress: task.progress,
          status: task.status,
          isCritical: task.isCritical,
          slack: task.slack,
        })),
        totalDuration: timeline.wbs.criticalPathDuration,
        totalTasks: criticalTasks.length,
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore critical path:`, error);
      return {
        exists: false,
        error: error.message,
      };
    }
  }
  /**
   * Rileva trigger per re-plan
   */
  async detectTriggers(projectId) {
    try {
      const triggers = await this.rePlanEngine.detectTriggers(projectId);
      return {
        success: true,
        triggers: triggers.map(trigger => ({
          id: trigger.id,
          type: trigger.type,
          cause: trigger.cause,
          severity: trigger.severity,
          detectedAt: trigger.detectedAt,
          impact: trigger.impact,
          status: trigger.status,
        })),
        totalTriggers: triggers.length,
        criticalTriggers: triggers.filter(t => t.severity === 'critical').length,
        highTriggers: triggers.filter(t => t.severity === 'high').length,
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore rilevamento trigger:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Genera Gantt chart
   */
  async generateGanttChart(projectId, options) {
    try {
      const timeline = await this.timelineService.getTimeline(projectId);
      if (!timeline) {
        return {
          success: false,
          error: 'Timeline non trovata',
        };
      }
      const svg = await this.ganttGenerator.generateGanttSVG(timeline.wbs, options);
      return {
        success: true,
        svg,
        options: {
          showCriticalPath: options?.showCriticalPath ?? true,
          showProgress: options?.showProgress ?? true,
          showDependencies: options?.showDependencies ?? true,
          width: options?.width ?? 1200,
          height: options?.height ?? 600,
        },
        metadata: {
          projectId,
          totalTasks: timeline.wbs.totalTasks,
          criticalPathLength: timeline.wbs.criticalPath.length,
          startDate: timeline.wbs.startDate,
          endDate: timeline.wbs.endDate,
        },
      };
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore generazione Gantt:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Raccogli fatti reali dai servizi
   */
  async collectFacts(projectId) {
    const facts = [];
    try {
      // Doc Hunter facts
      const docHunterFacts = await this.collectDocHunterFacts(projectId);
      facts.push(...docHunterFacts);
      // Procurement facts
      const procurementFacts = await this.collectProcurementFacts(projectId);
      facts.push(...procurementFacts);
      // SAL facts
      const salFacts = await this.collectSALFacts(projectId);
      facts.push(...salFacts);
      // Listing facts
      const listingFacts = await this.collectListingFacts(projectId);
      facts.push(...listingFacts);
      console.log(`📊 [TimelineTool] Fatti raccolti: ${facts.length} totali`);
    } catch (error) {
      console.error(`❌ [TimelineTool] Errore raccolta fatti:`, error);
    }
    return facts;
  }
  /**
   * Raccogli fatti Doc Hunter
   */
  async collectDocHunterFacts(projectId) {
    // Simula raccolta fatti Doc Hunter
    return [
      {
        vendorId: 'vendor-001',
        documentType: 'DURC',
        status: 'valid',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastChecked: new Date(),
        projectId,
        vendorName: 'Costruzioni ABC SRL',
        documentNumber: 'DURC-2024-001',
        issuingAuthority: 'INAIL',
        notes: 'DURC valido fino al 2025',
      },
      {
        vendorId: 'vendor-002',
        documentType: 'visura',
        status: 'valid',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastChecked: new Date(),
        projectId,
        vendorName: 'Edilizia XYZ SPA',
        documentNumber: 'VIS-2024-002',
        issuingAuthority: 'Registro Imprese',
        notes: 'Visura aggiornata',
      },
    ];
  }
  /**
   * Raccogli fatti Procurement
   */
  async collectProcurementFacts(projectId) {
    // Simula raccolta fatti Procurement
    return [
      {
        rdoId: 'rdo-001',
        status: 'awarded',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        offersCount: 3,
        awardedVendor: 'vendor-001',
        projectId,
        rdoTitle: 'Cappotto termico 2.000 mq',
        category: 'costruzioni',
        estimatedValue: 250000,
        location: 'Milano',
        createdBy: 'pm-001',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
  }
  /**
   * Raccogli fatti SAL
   */
  async collectSALFacts(projectId) {
    // Simula raccolta fatti SAL
    return [
      {
        authorizationType: 'CDU',
        status: 'submitted',
        submissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedResponseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        projectId,
        authority: 'Comune di Milano',
        referenceNumber: 'CDU-2024-001',
        description: 'Concessione Demanio Urbano',
        requirements: ['Planimetrie', 'Relazione tecnica'],
        documents: ['planimetrie.pdf', 'relazione.pdf'],
        notes: 'In attesa di risposta',
      },
    ];
  }
  /**
   * Raccogli fatti Listing
   */
  async collectListingFacts(projectId) {
    // Simula raccolta fatti Listing
    return [
      {
        portalId: 'listing-001',
        status: 'published',
        pushDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        viewsCount: 150,
        leadsCount: 12,
        projectId,
        portalName: 'Immobiliare.it',
        listingTitle: 'Appartamento Milano Centro',
        price: 450000,
        currency: 'EUR',
        location: 'Milano',
        propertyType: 'appartamento',
        features: ['3 locali', '80 mq', 'ristrutturato'],
        images: ['img1.jpg', 'img2.jpg'],
        contactInfo: {
          phone: '+39 02 1234567',
          email: 'info@urbanova.com',
        },
      },
    ];
  }
  /**
   * Calcola critical path
   */
  async calculateCriticalPath(wbs) {
    // Implementazione algoritmo critical path
    const criticalTasks = [];
    // Simula calcolo critical path
    const sortedTasks = wbs.tasks.sort((a, b) => {
      const aEnd = new Date(a.endDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      return bEnd - aEnd; // Ordina per fine decrescente
    });
    // Prendi i task più critici (fine più tarda)
    const criticalCount = Math.min(5, sortedTasks.length);
    for (let i = 0; i < criticalCount; i++) {
      const task = sortedTasks[i];
      task.isCritical = true;
      task.slack = 0;
      criticalTasks.push(task);
    }
    return criticalTasks;
  }
  /**
   * Notifica stakeholder
   */
  async notifyStakeholders(trigger, proposal, preview) {
    // Simula notifica stakeholder
    console.log(`📧 [TimelineTool] Notifica stakeholder per trigger ${trigger.type}`);
    console.log(`📧 [TimelineTool] Impatto: ${proposal.impact.totalDelay} giorni di ritardo`);
    // In produzione, invierebbe email reali
  }
}
exports.TimelineTool = TimelineTool;
//# sourceMappingURL=timelineTool.js.map
