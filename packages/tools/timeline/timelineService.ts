import { ProjectTimeline, WBS, RePlanProposal, RePlanTrigger } from '@urbanova/types';

/**
 * Timeline Service - Servizio per persistenza e gestione timeline
 *
 * Funzionalità:
 * - Salvataggio timeline
 * - Recupero timeline
 * - Applicazione re-plan
 * - Storico versioni
 */

export class TimelineService {
  private timelines: Map<string, ProjectTimeline> = new Map();
  private rePlanHistory: Map<string, RePlanProposal[]> = new Map();

  constructor() {
    console.log('💾 [TimelineService] Timeline Service inizializzato');
  }

  /**
   * Salva timeline
   */
  async saveTimeline(timeline: ProjectTimeline): Promise<void> {
    try {
      console.log(`💾 [TimelineService] Salvataggio timeline ${timeline.id}`);

      // Aggiorna timestamp
      timeline.updatedAt = new Date();

      // Salva in memoria (in produzione sarebbe Firestore)
      this.timelines.set(timeline.projectId, timeline);

      // Salva storico re-plan
      if (timeline.rePlanHistory.length > 0) {
        this.rePlanHistory.set(timeline.projectId, timeline.rePlanHistory);
      }

      console.log(`✅ [TimelineService] Timeline ${timeline.id} salvata`);
    } catch (error) {
      console.error(`❌ [TimelineService] Errore salvataggio timeline:`, error);
      throw error;
    }
  }

  /**
   * Ottieni timeline per progetto
   */
  async getTimeline(projectId: string): Promise<ProjectTimeline | null> {
    try {
      console.log(`📖 [TimelineService] Recupero timeline per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        console.log(`✅ [TimelineService] Timeline ${timeline.id} recuperata`);
        return timeline;
      } else {
        console.log(`⚠️ [TimelineService] Timeline non trovata per progetto ${projectId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore recupero timeline:`, error);
      return null;
    }
  }

  /**
   * Aggiorna timeline
   */
  async updateTimeline(projectId: string, newWBS: WBS): Promise<void> {
    try {
      console.log(`🔄 [TimelineService] Aggiornamento timeline per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        // Incrementa versione
        timeline.version += 1;
        timeline.wbs = newWBS;
        timeline.updatedAt = new Date();
        timeline.lastRegeneratedAt = new Date();

        // Salva aggiornamento
        this.timelines.set(projectId, timeline);

        console.log(
          `✅ [TimelineService] Timeline ${timeline.id} aggiornata alla versione ${timeline.version}`
        );
      } else {
        throw new Error(`Timeline non trovata per progetto ${projectId}`);
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore aggiornamento timeline:`, error);
      throw error;
    }
  }

  /**
   * Applica re-plan
   */
  async applyRePlan(proposal: RePlanProposal): Promise<void> {
    try {
      console.log(`🔄 [TimelineService] Applicazione re-plan ${proposal.id}`);

      const timeline = this.timelines.get(proposal.projectId);

      if (timeline) {
        // Aggiorna timeline con proposta
        timeline.wbs = proposal.proposedTimeline;
        timeline.version += 1;
        timeline.updatedAt = new Date();
        timeline.lastRegeneratedAt = new Date();

        // Aggiungi alla storia re-plan
        timeline.rePlanHistory.push(proposal);

        // Aggiorna trigger attivi
        const activeTrigger = timeline.activeTriggers.find(t => t.id === proposal.triggerId);
        if (activeTrigger) {
          activeTrigger.status = 'applied';
          activeTrigger.updatedAt = new Date();
        }

        // Aggiorna status proposta
        proposal.status = 'applied';
        proposal.appliedAt = new Date();
        proposal.updatedAt = new Date();

        // Salva aggiornamento
        this.timelines.set(proposal.projectId, timeline);

        console.log(`✅ [TimelineService] Re-plan ${proposal.id} applicato`);
      } else {
        throw new Error(`Timeline non trovata per progetto ${proposal.projectId}`);
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore applicazione re-plan:`, error);
      throw error;
    }
  }

  /**
   * Ottieni storico re-plan
   */
  async getRePlanHistory(projectId: string): Promise<RePlanProposal[]> {
    try {
      console.log(`📚 [TimelineService] Recupero storico re-plan per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        console.log(
          `✅ [TimelineService] Storico re-plan recuperato: ${timeline.rePlanHistory.length} proposte`
        );
        return timeline.rePlanHistory;
      } else {
        console.log(`⚠️ [TimelineService] Timeline non trovata per progetto ${projectId}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore recupero storico re-plan:`, error);
      return [];
    }
  }

  /**
   * Ottieni trigger attivi
   */
  async getActiveTriggers(projectId: string): Promise<RePlanTrigger[]> {
    try {
      console.log(`🔍 [TimelineService] Recupero trigger attivi per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        const activeTriggers = timeline.activeTriggers.filter(
          t => t.status === 'detected' || t.status === 'analyzing' || t.status === 'proposed'
        );

        console.log(`✅ [TimelineService] Trigger attivi recuperati: ${activeTriggers.length}`);
        return activeTriggers;
      } else {
        console.log(`⚠️ [TimelineService] Timeline non trovata per progetto ${projectId}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore recupero trigger attivi:`, error);
      return [];
    }
  }

  /**
   * Aggiungi trigger
   */
  async addTrigger(projectId: string, trigger: RePlanTrigger): Promise<void> {
    try {
      console.log(`➕ [TimelineService] Aggiunta trigger ${trigger.id} per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        timeline.activeTriggers.push(trigger);
        timeline.updatedAt = new Date();

        this.timelines.set(projectId, timeline);

        console.log(`✅ [TimelineService] Trigger ${trigger.id} aggiunto`);
      } else {
        throw new Error(`Timeline non trovata per progetto ${projectId}`);
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore aggiunta trigger:`, error);
      throw error;
    }
  }

  /**
   * Aggiorna status trigger
   */
  async updateTriggerStatus(
    projectId: string,
    triggerId: string,
    status: RePlanTrigger['status']
  ): Promise<void> {
    try {
      console.log(`🔄 [TimelineService] Aggiornamento status trigger ${triggerId} a ${status}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        const trigger = timeline.activeTriggers.find(t => t.id === triggerId);

        if (trigger) {
          trigger.status = status;
          trigger.updatedAt = new Date();
          timeline.updatedAt = new Date();

          this.timelines.set(projectId, timeline);

          console.log(`✅ [TimelineService] Status trigger ${triggerId} aggiornato a ${status}`);
        } else {
          throw new Error(`Trigger ${triggerId} non trovato`);
        }
      } else {
        throw new Error(`Timeline non trovata per progetto ${projectId}`);
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore aggiornamento status trigger:`, error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche timeline
   */
  async getTimelineStats(projectId: string): Promise<any> {
    try {
      console.log(`📊 [TimelineService] Calcolo statistiche timeline per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        const stats = {
          projectId,
          timelineId: timeline.id,
          version: timeline.version,
          totalTasks: timeline.wbs.totalTasks,
          completedTasks: timeline.wbs.completedTasks,
          overallProgress: timeline.wbs.overallProgress,
          criticalPathLength: timeline.wbs.criticalPath.length,
          criticalPathDuration: timeline.wbs.criticalPathDuration,
          startDate: timeline.wbs.startDate,
          endDate: timeline.wbs.endDate,
          rePlanCount: timeline.rePlanHistory.length,
          activeTriggersCount: timeline.activeTriggers.length,
          lastRegeneratedAt: timeline.lastRegeneratedAt,
          createdAt: timeline.createdAt,
          updatedAt: timeline.updatedAt,
        };

        console.log(`✅ [TimelineService] Statistiche calcolate`);
        return stats;
      } else {
        console.log(`⚠️ [TimelineService] Timeline non trovata per progetto ${projectId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore calcolo statistiche:`, error);
      return null;
    }
  }

  /**
   * Elimina timeline
   */
  async deleteTimeline(projectId: string): Promise<void> {
    try {
      console.log(`🗑️ [TimelineService] Eliminazione timeline per progetto ${projectId}`);

      const deleted = this.timelines.delete(projectId);

      if (deleted) {
        // Elimina anche storico re-plan
        this.rePlanHistory.delete(projectId);

        console.log(`✅ [TimelineService] Timeline per progetto ${projectId} eliminata`);
      } else {
        console.log(`⚠️ [TimelineService] Timeline per progetto ${projectId} non trovata`);
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore eliminazione timeline:`, error);
      throw error;
    }
  }

  /**
   * Lista tutti i progetti con timeline
   */
  async listProjectsWithTimeline(): Promise<string[]> {
    try {
      console.log(`📋 [TimelineService] Lista progetti con timeline`);

      const projectIds = Array.from(this.timelines.keys());

      console.log(`✅ [TimelineService] Trovati ${projectIds.length} progetti con timeline`);
      return projectIds;
    } catch (error) {
      console.error(`❌ [TimelineService] Errore lista progetti:`, error);
      return [];
    }
  }

  /**
   * Backup timeline
   */
  async backupTimeline(projectId: string): Promise<any> {
    try {
      console.log(`💾 [TimelineService] Backup timeline per progetto ${projectId}`);

      const timeline = this.timelines.get(projectId);

      if (timeline) {
        const backup = {
          projectId,
          timeline: { ...timeline },
          rePlanHistory: this.rePlanHistory.get(projectId) || [],
          backupDate: new Date(),
          version: timeline.version,
        };

        console.log(`✅ [TimelineService] Backup timeline ${timeline.id} creato`);
        return backup;
      } else {
        console.log(`⚠️ [TimelineService] Timeline non trovata per progetto ${projectId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore backup timeline:`, error);
      return null;
    }
  }

  /**
   * Ripristina timeline da backup
   */
  async restoreTimeline(backup: any): Promise<void> {
    try {
      console.log(
        `🔄 [TimelineService] Ripristino timeline da backup per progetto ${backup.projectId}`
      );

      if (backup.timeline) {
        this.timelines.set(backup.projectId, backup.timeline);

        if (backup.rePlanHistory) {
          this.rePlanHistory.set(backup.projectId, backup.rePlanHistory);
        }

        console.log(`✅ [TimelineService] Timeline ripristinata dalla versione ${backup.version}`);
      } else {
        throw new Error('Backup non valido');
      }
    } catch (error) {
      console.error(`❌ [TimelineService] Errore ripristino timeline:`, error);
      throw error;
    }
  }
}
