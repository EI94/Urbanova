'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.marketIntelligenceTool =
  exports.marketIntelligenceActions =
  exports.marketIntelligenceManifest =
    void 0;
const territorialIntelligenceService_1 = require('../../../src/lib/territorialIntelligenceService');
const infra_1 = require('@urbanova/infra');
const pdfGeneratorService_1 = require('../../../src/lib/pdfGeneratorService');
// Real Market Intelligence Tool
exports.marketIntelligenceManifest = {
  id: 'market',
  name: 'Market Intelligence (AI Landscape)',
  version: '1.0.0',
  icon: '📈',
  category: 'analysis',
  description: 'Provides market intelligence and trend analysis',
  intents: [
    'market',
    'trend',
    'prezzi',
    'comparable',
    'comps',
    'OMI',
    'assorbimento',
    'dove costruire',
    'rendimenti',
  ],
  tags: ['market-intelligence', 'trends', 'pricing', 'comparables', 'omni', 'absorption', 'yields'],
};
exports.marketIntelligenceActions = [
  {
    name: 'scan_city',
    description: 'Scans city market data and computes KPIs',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: false,
  },
  {
    name: 'trend_report',
    description: 'Creates trend report with charts and summary',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: true,
  },
  {
    name: 'comps_fetch',
    description: 'Fetches comparable properties from land scraping data',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: false,
  },
];
// Real service instances
const territorialIntelligence =
  new territorialIntelligenceService_1.TerritorialIntelligenceService();
const pdfService = new pdfGeneratorService_1.PDFGeneratorService();
exports.marketIntelligenceTool = {
  manifest: exports.marketIntelligenceManifest,
  actions: exports.marketIntelligenceActions,
  async scan_city(ctx, args) {
    console.log(`📈 Real scanning city market: ${args.city}, asset: ${args.asset}`);
    try {
      // Use real territorial intelligence service
      const marketData = await territorialIntelligence.analyzeMarket({
        city: args.city,
        propertyType: args.asset,
        horizonMonths: args.horizonMonths || 12,
      });
      if (!marketData.success) {
        throw new Error(`Market analysis failed: ${marketData.error}`);
      }
      // Compute KPIs from the data
      const kpis = {
        pricePerSqm: {
          p50: marketData.data?.averagePrice || 0,
          p75: marketData.data?.averagePrice ? marketData.data.averagePrice * 1.25 : 0,
        },
        absorptionTime: marketData.data?.absorptionTime || 'Unknown',
        pipelineSupply: marketData.data?.pipelineSupply || 0,
        marketTrend: marketData.data?.trend || 'STABLE',
      };
      // Generate insights
      const insights = [
        `Market in ${args.city} shows ${kpis.marketTrend.toLowerCase()} trend`,
        `Average price per m²: €${kpis.pricePerSqm.p50}`,
        `Estimated absorption time: ${kpis.absorptionTime} months`,
      ];
      return {
        success: true,
        data: {
          kpis,
          heatmapData: marketData.data?.heatmapData || [],
          insights,
          summary: `Market scan completed for ${args.city}. ${insights.length} insights generated.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real market scan:', error);
      throw error;
    }
  },
  async trend_report(ctx, args) {
    console.log(`📈 Real creating trend report for city: ${args.city}`);
    try {
      // Get market data for trend analysis
      const marketData = await territorialIntelligence.analyzeMarket({
        city: args.city,
        propertyType: 'residenziale', // Default to residential
        horizonMonths: args.horizonMonths,
      });
      if (!marketData.success) {
        throw new Error(`Market analysis failed: ${marketData.error}`);
      }
      // Create PDF report
      const reportData = {
        city: args.city,
        horizonMonths: args.horizonMonths,
        marketData: marketData.data,
        generatedAt: new Date().toISOString(),
      };
      const pdfBuffer = await pdfService.generateMarketReport(reportData);
      // Upload to GCS
      const bucketName = process.env.GCS_BUCKET_MATERIALS || 'urbanova-materials';
      const path = `reports/market/${args.city}/${Date.now()}.pdf`;
      const uploadResult = await (0, infra_1.uploadPdfAndGetUrl)(bucketName, path, pdfBuffer, {
        city: args.city,
        type: 'market-trend-report',
        generatedAt: new Date().toISOString(),
      });
      if (!uploadResult.success || !uploadResult.storageRef?.signedUrl) {
        throw new Error('Failed to upload PDF to GCS');
      }
      return {
        success: true,
        data: {
          city: args.city,
          horizonMonths: args.horizonMonths,
          pdfUrl: uploadResult.storageRef.signedUrl,
          summary: `Trend report created for ${args.city} with ${args.horizonMonths} month horizon.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real trend report creation:', error);
      throw error;
    }
  },
  async comps_fetch(ctx, args) {
    console.log(`📈 Real fetching comparables for city: ${args.city}`);
    try {
      // Use territorial intelligence service to get comparable data
      const compsData = await territorialIntelligence.getComparables({
        city: args.city,
        radiusKm: args.radiusKm || 5,
        sampleSize: args.sampleSize || 10,
      });
      if (!compsData.success) {
        throw new Error(`Comparables fetch failed: ${compsData.error}`);
      }
      return {
        success: true,
        data: {
          city: args.city,
          radiusKm: args.radiusKm || 5,
          comparables: compsData.data?.comparables || [],
          totalFound: compsData.data?.comparables?.length || 0,
          summary: `Found ${compsData.data?.comparables?.length || 0} comparable properties in ${args.city}`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real comparables fetch:', error);
      throw error;
    }
  },
};
//# sourceMappingURL=index.js.map
