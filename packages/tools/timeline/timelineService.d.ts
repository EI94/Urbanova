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
export declare class TimelineService {
    private timelines;
    private rePlanHistory;
    constructor();
    /**
     * Salva timeline
     */
    saveTimeline(timeline: ProjectTimeline): Promise<void>;
    /**
     * Ottieni timeline per progetto
     */
    getTimeline(projectId: string): Promise<ProjectTimeline | null>;
    /**
     * Aggiorna timeline
     */
    updateTimeline(projectId: string, newWBS: WBS): Promise<void>;
    /**
     * Applica re-plan
     */
    applyRePlan(proposal: RePlanProposal): Promise<void>;
    /**
     * Ottieni storico re-plan
     */
    getRePlanHistory(projectId: string): Promise<RePlanProposal[]>;
    /**
     * Ottieni trigger attivi
     */
    getActiveTriggers(projectId: string): Promise<RePlanTrigger[]>;
    /**
     * Aggiungi trigger
     */
    addTrigger(projectId: string, trigger: RePlanTrigger): Promise<void>;
    /**
     * Aggiorna status trigger
     */
    updateTriggerStatus(projectId: string, triggerId: string, status: RePlanTrigger['status']): Promise<void>;
    /**
     * Ottieni statistiche timeline
     */
    getTimelineStats(projectId: string): Promise<any>;
    /**
     * Elimina timeline
     */
    deleteTimeline(projectId: string): Promise<void>;
    /**
     * Lista tutti i progetti con timeline
     */
    listProjectsWithTimeline(): Promise<string[]>;
    /**
     * Backup timeline
     */
    backupTimeline(projectId: string): Promise<any>;
    /**
     * Ripristina timeline da backup
     */
    restoreTimeline(backup: any): Promise<void>;
}
//# sourceMappingURL=timelineService.d.ts.map