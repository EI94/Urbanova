import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const landScraperManifest: ToolManifest;
export declare const landScraperActions: ToolActionSpec[];
export declare const landScraperTool: {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  scan_by_link(
    ctx: any,
    args: {
      link: string;
      projectName?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      scanResult: RealLandScrapingResult;
      projectId: string | undefined;
      summary: string;
    };
  }>;
  scan_market(
    ctx: any,
    args: {
      city: string;
      budgetMax?: number;
      surfaceMin?: number;
    }
  ): Promise<{
    success: boolean;
    data: {
      city: string;
      deals: any;
      totalFound: any;
      summary: string;
    };
  }>;
  find_auctions(
    ctx: any,
    args: {
      city: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      city: string;
      auctions: any;
      totalFound: any;
      summary: string;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map
