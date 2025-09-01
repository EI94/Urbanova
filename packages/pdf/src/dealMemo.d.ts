import type { Deal, FeasibilityResult, Project } from '@urbanova/types';
export interface FeasibilityReportGenerator {
  generateDealMemo(project: Project, deal: Deal, feasibility: FeasibilityResult): Promise<string>;
}
export declare class RealFeasibilityReportGenerator implements FeasibilityReportGenerator {
  private pdfService;
  constructor();
  generateDealMemo(project: Project, deal: Deal, feasibility: FeasibilityResult): Promise<string>;
  private generateDealMemoPDF;
}
export declare const feasibilityReportGenerator: RealFeasibilityReportGenerator;
export declare const generateDealMemo: (
  project: Project,
  deal: Deal,
  feasibility: FeasibilityResult
) => Promise<string>;
export declare function createProjectDeepLink(projectId: string): string;
export declare function formatFinancialMetrics(feasibility: FeasibilityResult): {
  roi: string;
  paybackYears: string;
};
//# sourceMappingURL=dealMemo.d.ts.map
