import { GenerateTimelineResponse, RePlanResponse } from '@urbanova/types';
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
export declare class TimelineTool {
  private autoWBSEngine;
  private rePlanEngine;
  private ganttGenerator;
  private timelineService;
  constructor();
  /**
   * Genera timeline da fatti reali
   */
  generateTimeline(
    projectId: string,
    options?: {
      includeHistory?: boolean;
      forceRegenerate?: boolean;
      includeFacts?: boolean;
    }
  ): Promise<GenerateTimelineResponse>;
  /**
   * Re-Plan timeline con trigger reali
   */
  replanTimeline(
    projectId: string,
    cause: string,
    details: any,
    options?: {
      autoApply?: boolean;
      includePreview?: boolean;
      notifyStakeholders?: boolean;
    }
  ): Promise<RePlanResponse>;
  /**
   * Ottieni status timeline
   */
  getTimelineStatus(projectId: string): Promise<any>;
  /**
   * Ottieni critical path
   */
  getCriticalPath(projectId: string): Promise<any>;
  /**
   * Rileva trigger per re-plan
   */
  detectTriggers(projectId: string): Promise<any>;
  /**
   * Genera Gantt chart
   */
  generateGanttChart(
    projectId: string,
    options?: {
      showCriticalPath?: boolean;
      showProgress?: boolean;
      showDependencies?: boolean;
      width?: number;
      height?: number;
    }
  ): Promise<any>;
  /**
   * Raccogli fatti reali dai servizi
   */
  private collectFacts;
  /**
   * Raccogli fatti Doc Hunter
   */
  private collectDocHunterFacts;
  /**
   * Raccogli fatti Procurement
   */
  private collectProcurementFacts;
  /**
   * Raccogli fatti SAL
   */
  private collectSALFacts;
  /**
   * Raccogli fatti Listing
   */
  private collectListingFacts;
  /**
   * Calcola critical path
   */
  private calculateCriticalPath;
  /**
   * Notifica stakeholder
   */
  private notifyStakeholders;
}
//# sourceMappingURL=timelineTool.d.ts.map
