import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
export declare const marketIntelligenceManifest: ToolManifest;
export declare const marketIntelligenceActions: ToolActionSpec[];
export declare const marketIntelligenceTool: {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  scan_city(
    ctx: any,
    args: {
      city: string;
      asset: 'residenziale' | 'studentato' | 'retail' | 'uffici';
      horizonMonths?: number;
    }
  ): Promise<{
    success: boolean;
    data: {
      kpis: {
        pricePerSqm: {
          p50: any;
          p75: number;
        };
        absorptionTime: any;
        pipelineSupply: any;
        marketTrend: any;
      };
      heatmapData: any;
      insights: string[];
      summary: string;
    };
  }>;
  trend_report(
    ctx: any,
    args: {
      city: string;
      horizonMonths: number;
    }
  ): Promise<{
    success: boolean;
    data: {
      city: string;
      horizonMonths: number;
      pdfUrl: any;
      summary: string;
    };
  }>;
  comps_fetch(
    ctx: any,
    args: {
      city: string;
      radiusKm?: number;
      sampleSize?: number;
    }
  ): Promise<{
    success: boolean;
    data: {
      city: string;
      radiusKm: number;
      comparables: any;
      totalFound: any;
      summary: string;
    };
  }>;
};
//# sourceMappingURL=index.d.ts.map
