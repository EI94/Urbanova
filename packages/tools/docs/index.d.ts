import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const docHunterManifest: ToolManifest;
export declare const docHunterActions: ToolActionSpec[];
export declare const docHunterTool: {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  request_doc(
    ctx: any,
    args: {
      projectId: string;
      kind: 'CDU' | 'VISURA' | 'DURC' | 'PLANIMETRIA';
      recipient: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      requestId: string;
      projectId: string;
      documentType: 'CDU' | 'VISURA' | 'DURC' | 'PLANIMETRIA';
      status: string;
      summary: string;
    };
  }>;
  status(
    ctx: any,
    args: {
      projectId: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      projectId: string;
      documents: (
        | {
            requestId: string;
            documentType: string;
            status: string;
            requestedAt: Date;
            estimatedCompletion: Date;
            completedAt?: undefined;
          }
        | {
            requestId: string;
            documentType: string;
            status: string;
            requestedAt: Date;
            completedAt: Date;
            estimatedCompletion?: undefined;
          }
      )[];
      totalRequests: number;
      summary: string;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map
