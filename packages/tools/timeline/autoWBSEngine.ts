import {
  WBS,
  WBSTask,
  WBSDependency,
  Fact,
  DocHunterFact,
  ProcurementFact,
  SALFact,
  ListingFact,
} from '@urbanova/types';

/**
 * Auto WBS Engine - Genera WBS da fatti reali
 *
 * Funzionalità:
 * - Fact Collection da servizi
 * - Task Inference da stati
 * - Dependency Mapping automatico
 * - Critical Path Calculation
 */

export class AutoWBSEngine {
  constructor() {
    console.log('🔧 [AutoWBSEngine] Auto WBS Engine inizializzato');
  }

  /**
   * Genera WBS da fatti reali
   */
  async generateWBS(projectId: string, facts: Fact[]): Promise<WBS> {
    console.log(`📋 [AutoWBSEngine] Generazione WBS per progetto ${projectId}`);

    try {
      // 1. Inferisci task dai fatti
      const tasks = await this.inferTasksFromFacts(projectId, facts);
      console.log(`📝 [AutoWBSEngine] Inferiti ${tasks.length} task`);

      // 2. Mappa dipendenze
      const dependencies = await this.mapDependencies(tasks);
      console.log(`🔗 [AutoWBSEngine] Mappate ${dependencies.length} dipendenze`);

      // 3. Calcola date e durate
      const scheduledTasks = await this.calculateScheduling(tasks, dependencies);
      console.log(`📅 [AutoWBSEngine] Scheduling calcolato`);

      // 4. Calcola progresso
      const tasksWithProgress = await this.calculateProgress(scheduledTasks);
      console.log(`📊 [AutoWBSEngine] Progresso calcolato`);

      // 5. Crea WBS
      const wbs: WBS = {
        id: `wbs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        projectId,
        name: `WBS ${projectId}`,
        description: `Work Breakdown Structure generata automaticamente da ${facts.length} fatti reali`,
        tasks: tasksWithProgress,
        dependencies,
        criticalPath: [], // Sarà calcolato dal TimelineTool
        criticalPathDuration: 0,
        startDate: this.calculateStartDate(tasksWithProgress),
        endDate: this.calculateEndDate(tasksWithProgress),
        overallProgress: this.calculateOverallProgress(tasksWithProgress),
        completedTasks: tasksWithProgress.filter(t => t.status === 'completed').length,
        totalTasks: tasksWithProgress.length,
        version: 1,
        generatedAt: new Date(),
        generatedBy: 'auto_wbs_engine',
        sourceFacts: facts,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(`✅ [AutoWBSEngine] WBS generata con successo`);
      return wbs;
    } catch (error) {
      console.error(`❌ [AutoWBSEngine] Errore generazione WBS:`, error);
      throw error;
    }
  }

  /**
   * Inferisci task dai fatti
   */
  private async inferTasksFromFacts(projectId: string, facts: Fact[]): Promise<WBSTask[]> {
    const tasks: WBSTask[] = [];

    // Doc Hunter facts → task
    const docHunterFacts = facts.filter(f => 'documentType' in f) as DocHunterFact[];
    for (const fact of docHunterFacts) {
      const task = this.createDocHunterTask(fact);
      tasks.push(task);
    }

    // Procurement facts → task
    const procurementFacts = facts.filter(f => 'rdoId' in f) as ProcurementFact[];
    for (const fact of procurementFacts) {
      const task = this.createProcurementTask(fact);
      tasks.push(task);
    }

    // SAL facts → task
    const salFacts = facts.filter(f => 'authorizationType' in f) as SALFact[];
    for (const fact of salFacts) {
      const task = this.createSALTask(fact);
      tasks.push(task);
    }

    // Listing facts → task
    const listingFacts = facts.filter(f => 'portalId' in f) as ListingFact[];
    for (const fact of listingFacts) {
      const task = this.createListingTask(fact);
      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Crea task da Doc Hunter fact
   */
  private createDocHunterTask(fact: DocHunterFact): WBSTask {
    const taskId = `task-doc-${fact.vendorId}-${fact.documentType}`;

    return {
      id: taskId,
      name: `Verifica ${fact.documentType} - ${fact.vendorName}`,
      description: `Verifica documento ${fact.documentType} per vendor ${fact.vendorName}`,
      type: 'task',
      status: this.mapDocHunterStatus(fact.status),
      priority: this.calculatePriority(fact.status),
      estimatedDuration: this.calculateDocHunterDuration(fact.documentType),
      startDate: fact.lastChecked,
      endDate: new Date(
        fact.lastChecked.getTime() +
          this.calculateDocHunterDuration(fact.documentType) * 24 * 60 * 60 * 1000
      ),
      dependencies: [],
      dependents: [],
      resources: [fact.vendorId],
      progress: this.calculateDocHunterProgress(fact.status),
      completedWork: fact.status === 'valid' ? 100 : 0,
      totalWork: 100,
      sourceFact: fact,
      factId: `${fact.vendorId}-${fact.documentType}`,
      projectId: fact.projectId,
      children: [],
      isCritical: false,
      slack: 0,
      customFields: {
        documentType: fact.documentType,
        vendorName: fact.vendorName,
        documentNumber: fact.documentNumber,
        issuingAuthority: fact.issuingAuthority,
        validUntil: fact.validUntil,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Crea task da Procurement fact
   */
  private createProcurementTask(fact: ProcurementFact): WBSTask {
    const taskId = `task-proc-${fact.rdoId}`;

    return {
      id: taskId,
      name: `RDO: ${fact.rdoTitle}`,
      description: `Richiesta di Offerta per ${fact.rdoTitle}`,
      type: 'milestone',
      status: this.mapProcurementStatus(fact.status),
      priority: this.calculatePriority(fact.status),
      estimatedDuration: this.calculateProcurementDuration(fact.status),
      startDate: fact.createdAt,
      endDate: fact.deadline,
      dependencies: [],
      dependents: [],
      resources: [fact.createdBy],
      progress: this.calculateProcurementProgress(fact.status),
      completedWork: this.calculateProcurementCompletedWork(fact.status),
      totalWork: 100,
      sourceFact: fact,
      factId: fact.rdoId,
      projectId: fact.projectId,
      children: [],
      isCritical: false,
      slack: 0,
      customFields: {
        category: fact.category,
        estimatedValue: fact.estimatedValue,
        location: fact.location,
        offersCount: fact.offersCount,
        awardedVendor: fact.awardedVendor,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Crea task da SAL fact
   */
  private createSALTask(fact: SALFact): WBSTask {
    const taskId = `task-sal-${fact.authorizationType}`;

    return {
      id: taskId,
      name: `${fact.authorizationType}: ${fact.description}`,
      description: `Autorizzazione ${fact.authorizationType} presso ${fact.authority}`,
      type: 'task',
      status: this.mapSALStatus(fact.status),
      priority: this.calculatePriority(fact.status),
      estimatedDuration: this.calculateSALDuration(fact.authorizationType),
      startDate: fact.submissionDate,
      endDate: fact.expectedResponseDate,
      dependencies: [],
      dependents: [],
      resources: ['project_manager'],
      progress: this.calculateSALProgress(fact.status),
      completedWork: this.calculateSALCompletedWork(fact.status),
      totalWork: 100,
      sourceFact: fact,
      factId: `${fact.authorizationType}-${fact.referenceNumber}`,
      projectId: fact.projectId,
      children: [],
      isCritical: false,
      slack: 0,
      customFields: {
        authority: fact.authority,
        referenceNumber: fact.referenceNumber,
        requirements: fact.requirements,
        documents: fact.documents,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Crea task da Listing fact
   */
  private createListingTask(fact: ListingFact): WBSTask {
    const taskId = `task-listing-${fact.portalId}`;

    return {
      id: taskId,
      name: `Listing: ${fact.listingTitle}`,
      description: `Pubblicazione su ${fact.portalName}`,
      type: 'task',
      status: this.mapListingStatus(fact.status),
      priority: this.calculatePriority(fact.status),
      estimatedDuration: this.calculateListingDuration(fact.status),
      startDate: fact.pushDate,
      endDate: new Date(
        fact.pushDate.getTime() + this.calculateListingDuration(fact.status) * 24 * 60 * 60 * 1000
      ),
      dependencies: [],
      dependents: [],
      resources: ['marketing_manager'],
      progress: this.calculateListingProgress(fact.status),
      completedWork: this.calculateListingCompletedWork(fact.status),
      totalWork: 100,
      sourceFact: fact,
      factId: fact.portalId,
      projectId: fact.projectId,
      children: [],
      isCritical: false,
      slack: 0,
      customFields: {
        portalName: fact.portalName,
        price: fact.price,
        currency: fact.currency,
        propertyType: fact.propertyType,
        viewsCount: fact.viewsCount,
        leadsCount: fact.leadsCount,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Mappa status Doc Hunter
   */
  private mapDocHunterStatus(status: string): WBSTask['status'] {
    switch (status) {
      case 'valid':
        return 'completed';
      case 'pending':
        return 'in_progress';
      case 'expired':
        return 'blocked';
      case 'invalid':
        return 'blocked';
      default:
        return 'not_started';
    }
  }

  /**
   * Mappa status Procurement
   */
  private mapProcurementStatus(status: string): WBSTask['status'] {
    switch (status) {
      case 'awarded':
        return 'completed';
      case 'comparing':
        return 'in_progress';
      case 'offers_received':
        return 'in_progress';
      case 'published':
        return 'in_progress';
      case 'draft':
        return 'not_started';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'not_started';
    }
  }

  /**
   * Mappa status SAL
   */
  private mapSALStatus(status: string): WBSTask['status'] {
    switch (status) {
      case 'approved':
        return 'completed';
      case 'under_review':
        return 'in_progress';
      case 'submitted':
        return 'in_progress';
      case 'pending':
        return 'not_started';
      case 'rejected':
        return 'blocked';
      case 'expired':
        return 'blocked';
      default:
        return 'not_started';
    }
  }

  /**
   * Mappa status Listing
   */
  private mapListingStatus(status: string): WBSTask['status'] {
    switch (status) {
      case 'published':
        return 'completed';
      case 'monitoring':
        return 'in_progress';
      case 'pushed':
        return 'in_progress';
      case 'preparing':
        return 'not_started';
      case 'expired':
        return 'blocked';
      case 'removed':
        return 'cancelled';
      default:
        return 'not_started';
    }
  }

  /**
   * Calcola priorità
   */
  private calculatePriority(status: string): WBSTask['priority'] {
    if (status === 'expired' || status === 'blocked') return 'critical';
    if (status === 'in_progress') return 'high';
    if (status === 'completed') return 'low';
    return 'medium';
  }

  /**
   * Calcola durata Doc Hunter
   */
  private calculateDocHunterDuration(documentType: string): number {
    switch (documentType) {
      case 'DURC':
        return 5;
      case 'visura':
        return 3;
      case 'certification':
        return 7;
      default:
        return 5;
    }
  }

  /**
   * Calcola durata Procurement
   */
  private calculateProcurementDuration(status: string): number {
    switch (status) {
      case 'draft':
        return 7;
      case 'published':
        return 14;
      case 'offers_received':
        return 21;
      case 'comparing':
        return 28;
      case 'awarded':
        return 35;
      default:
        return 21;
    }
  }

  /**
   * Calcola durata SAL
   */
  private calculateSALDuration(authorizationType: string): number {
    switch (authorizationType) {
      case 'CDU':
        return 60;
      case 'SCIA':
        return 30;
      case 'permits':
        return 45;
      case 'building_permit':
        return 90;
      case 'environmental_clearance':
        return 120;
      default:
        return 60;
    }
  }

  /**
   * Calcola durata Listing
   */
  private calculateListingDuration(status: string): number {
    switch (status) {
      case 'preparing':
        return 3;
      case 'pushed':
        return 7;
      case 'published':
        return 30;
      case 'monitoring':
        return 90;
      default:
        return 30;
    }
  }

  /**
   * Calcola progresso Doc Hunter
   */
  private calculateDocHunterProgress(status: string): number {
    switch (status) {
      case 'valid':
        return 100;
      case 'pending':
        return 50;
      case 'expired':
        return 0;
      case 'invalid':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Calcola progresso Procurement
   */
  private calculateProcurementProgress(status: string): number {
    switch (status) {
      case 'awarded':
        return 100;
      case 'comparing':
        return 80;
      case 'offers_received':
        return 60;
      case 'published':
        return 40;
      case 'draft':
        return 20;
      default:
        return 0;
    }
  }

  /**
   * Calcola progresso SAL
   */
  private calculateSALProgress(status: string): number {
    switch (status) {
      case 'approved':
        return 100;
      case 'under_review':
        return 70;
      case 'submitted':
        return 40;
      case 'pending':
        return 20;
      default:
        return 0;
    }
  }

  /**
   * Calcola progresso Listing
   */
  private calculateListingProgress(status: string): number {
    switch (status) {
      case 'published':
        return 100;
      case 'monitoring':
        return 80;
      case 'pushed':
        return 60;
      case 'preparing':
        return 30;
      default:
        return 0;
    }
  }

  /**
   * Calcola work completato Procurement
   */
  private calculateProcurementCompletedWork(status: string): number {
    return this.calculateProcurementProgress(status);
  }

  /**
   * Calcola work completato SAL
   */
  private calculateSALCompletedWork(status: string): number {
    return this.calculateSALProgress(status);
  }

  /**
   * Calcola work completato Listing
   */
  private calculateListingCompletedWork(status: string): number {
    return this.calculateListingProgress(status);
  }

  /**
   * Mappa dipendenze tra task
   */
  private async mapDependencies(tasks: WBSTask[]): Promise<WBSDependency[]> {
    const dependencies: WBSDependency[] = [];

    // Dipendenze logiche basate su tipi di task
    const procurementTasks = tasks.filter(t => t.sourceFact && 'rdoId' in t.sourceFact);
    const salTasks = tasks.filter(t => t.sourceFact && 'authorizationType' in t.sourceFact);
    const listingTasks = tasks.filter(t => t.sourceFact && 'portalId' in t.sourceFact);

    // SAL deve essere completato prima di Procurement
    for (const salTask of salTasks) {
      for (const procTask of procurementTasks) {
        dependencies.push({
          id: `dep-${salTask.id}-${procTask.id}`,
          fromTaskId: salTask.id,
          toTaskId: procTask.id,
          type: 'finish_to_start',
          lag: 0,
          projectId: salTask.projectId,
          description: 'Autorizzazione richiesta prima di RDO',
          isCritical: false,
          createdAt: new Date(),
        });
      }
    }

    // Procurement deve essere completato prima di Listing
    for (const procTask of procurementTasks) {
      for (const listingTask of listingTasks) {
        dependencies.push({
          id: `dep-${procTask.id}-${listingTask.id}`,
          fromTaskId: procTask.id,
          toTaskId: listingTask.id,
          type: 'finish_to_start',
          lag: 0,
          projectId: procTask.projectId,
          description: 'RDO completata prima di pubblicazione',
          isCritical: false,
          createdAt: new Date(),
        });
      }
    }

    return dependencies;
  }

  /**
   * Calcola scheduling dei task
   */
  private async calculateScheduling(
    tasks: WBSTask[],
    dependencies: WBSDependency[]
  ): Promise<WBSTask[]> {
    // Simula calcolo scheduling
    // In produzione, implementerebbe algoritmo CPM (Critical Path Method)

    const scheduledTasks = [...tasks];

    // Aggiorna dipendenze nei task
    for (const task of scheduledTasks) {
      task.dependencies = dependencies.filter(d => d.toTaskId === task.id).map(d => d.fromTaskId);

      task.dependents = dependencies.filter(d => d.fromTaskId === task.id).map(d => d.toTaskId);
    }

    return scheduledTasks;
  }

  /**
   * Calcola progresso dei task
   */
  private async calculateProgress(tasks: WBSTask[]): Promise<WBSTask[]> {
    return tasks.map(task => ({
      ...task,
      progress: this.calculateTaskProgress(task),
      completedWork: this.calculateTaskCompletedWork(task),
      totalWork: 100,
    }));
  }

  /**
   * Calcola progresso di un singolo task
   */
  private calculateTaskProgress(task: WBSTask): number {
    // Basato su status e date
    if (task.status === 'completed') return 100;
    if (task.status === 'cancelled') return 0;

    const now = new Date();
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  /**
   * Calcola work completato di un singolo task
   */
  private calculateTaskCompletedWork(task: WBSTask): number {
    return this.calculateTaskProgress(task);
  }

  /**
   * Calcola data inizio WBS
   */
  private calculateStartDate(tasks: WBSTask[]): Date {
    if (tasks.length === 0) return new Date();

    const startDates = tasks.map(t => new Date(t.startDate));
    return new Date(Math.min(...startDates.map(d => d.getTime())));
  }

  /**
   * Calcola data fine WBS
   */
  private calculateEndDate(tasks: WBSTask[]): Date {
    if (tasks.length === 0) return new Date();

    const endDates = tasks.map(t => new Date(t.endDate));
    return new Date(Math.max(...endDates.map(d => d.getTime())));
  }

  /**
   * Calcola progresso complessivo
   */
  private calculateOverallProgress(tasks: WBSTask[]): number {
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }
}
