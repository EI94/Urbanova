import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const feasibilityManifest: ToolManifest;
export declare const feasibilityActions: ToolActionSpec[];
export declare const feasibilityTool: {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  run(
    ctx: any,
    args: {
      projectId: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      projectId: string;
      analysis: any;
      summary: string;
    };
  }>;
  run_sensitivity(
    ctx: any,
    args: {
      projectId: string;
      deltas: number[];
    }
  ): Promise<{
    success: boolean;
    data: {
      projectId: string;
      sensitivity: any;
      pdfUrl: any;
      summary: string;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map
