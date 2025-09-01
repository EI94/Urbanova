import { WBS, RePlanProposal, RePlanPreview } from '@urbanova/types';
/**
 * Gantt Generator - Genera Gantt SVG con critical path
 *
 * Funzionalità:
 * - Gantt SVG generation
 * - Critical path highlighting
 * - Progress visualization
 * - Dependency arrows
 * - Re-plan preview
 */
export declare class GanttGenerator {
  constructor();
  /**
   * Genera Gantt SVG
   */
  generateGanttSVG(
    wbs: WBS,
    options?: {
      showCriticalPath?: boolean;
      showProgress?: boolean;
      showDependencies?: boolean;
      width?: number;
      height?: number;
    }
  ): Promise<string>;
  /**
   * Genera preview per re-plan
   */
  generateRePlanPreview(proposal: RePlanProposal): Promise<RePlanPreview>;
  /**
   * Genera contenuto SVG
   */
  private generateSVGContent;
  /**
   * Genera header con date
   */
  private generateHeader;
  /**
   * Genera barre dei task
   */
  private generateTaskBars;
  /**
   * Genera labels dei task
   */
  private generateLabels;
  /**
   * Genera dipendenze
   */
  private generateDependencies;
  /**
   * Genera legenda
   */
  private generateLegend;
  /**
   * Genera summary dei cambiamenti
   */
  private generateChangesSummary;
  /**
   * Genera summary dell'impatto
   */
  private generateImpactSummary;
  /**
   * Genera SVG di errore
   */
  private generateErrorSVG;
}
//# sourceMappingURL=ganttGenerator.d.ts.map
