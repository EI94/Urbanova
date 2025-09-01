import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const designCenterManifest: ToolManifest;
export declare const designCenterActions: ToolActionSpec[];
export declare const designCenterTool: {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  analyze_terrain(
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
  create_design(
    ctx: any,
    args: {
      projectId: string;
      templateId: string;
      params: Record<string, unknown>;
    }
  ): Promise<{
    success: boolean;
    data: {
      projectId: string;
      design: any;
      templateId: string;
      summary: string;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map
