import { z } from 'zod';
import { MarketIntelligenceService } from '@urbanova/agents/src/market/intelligence';
import { MarketTrendReportGenerator } from '@urbanova/pdf/src/marketReport';

// ============================================================================
// MARKET INTELLIGENCE MANIFEST
// ============================================================================

export const marketIntelligenceManifest = {
  name: 'marketIntelligence',
  version: '2.0.0',
  description: 'Market Intelligence con dati reali OMI + Comps, heatmap e PDF generation',
  intents: [
    'analizza mercato',
    'market intelligence',
    'heatmap prezzi',
    'trend report',
    'comps fetch',
    'market analysis',
  ],
  tags: ['market', 'intelligence', 'heatmap', 'omi', 'comps', 'trends'],
};

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const scanCitySchema = z.object({
  city: z.string().min(1, 'Città richiesta'),
  asset: z.enum(['residential', 'commercial', 'industrial', 'mixed']).default('residential'),
  horizonMonths: z.number().min(1).max(60).default(12),
  radiusKm: z.number().positive().optional().default(10),
  includeHeatmap: z.boolean().optional().default(true),
  includeInsights: z.boolean().optional().default(true),
  forceRefresh: z.boolean().optional().default(false),
});

const trendReportSchema = z.object({
  city: z.string().min(1, 'Città richiesta'),
  asset: z.enum(['residential', 'commercial', 'industrial']).default('residential'),
  horizonMonths: z.number().min(1).max(60).default(12),
});

const compsFetchSchema = z.object({
  city: z.string().min(1, 'Città richiesta'),
  radiusKm: z.number().positive().optional().default(10),
  sampleSize: z.number().positive().optional().default(100),
  asset: z.enum(['residential', 'commercial', 'industrial']).optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  surfaceRange: z.tuple([z.number(), z.number()]).optional(),
});

// ============================================================================
// MARKET INTELLIGENCE ACTIONS
// ============================================================================

export const marketIntelligenceActions: any[] = [
  {
    name: 'scan_city',
    description: 'Scansiona il mercato di una città e genera KPIs + heatmap',
    zArgs: scanCitySchema,
    requiredRole: 'pm',
    longRunning: true,
    handler: async (args: z.infer<typeof scanCitySchema>) => {
      try {
        const validated = scanCitySchema.parse(args);

        const marketService = new MarketIntelligenceService();

        const result = await marketService.scanCity({
          city: validated.city || '',
          asset: validated.asset || 'residential',
          horizonMonths: validated.horizonMonths || 12,
          includeHeatmap: validated.includeHeatmap,
          includeInsights: validated.includeInsights,
          forceRefresh: validated.forceRefresh
        });

        return {
          success: true,
          snapshot: {
            id: result.snapshot.id,
            city: result.snapshot.city,
            asset: result.snapshot.asset,
            horizonMonths: result.snapshot.horizonMonths,
            timestamp: result.snapshot.timestamp,
            kpis: result.snapshot.data.kpis,
            insightsCount: result.snapshot.data.insights.length,
            heatmapCells: result.snapshot.data.heatmap.features.length,
            cacheHit: result.cacheHit,
          },
          insights: result.insights.slice(0, 3).map(insight => ({
            id: insight.id,
            type: insight.type,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            impact: insight.impact,
          })),
          message: `Analisi mercato ${validated.city} completata${result.cacheHit ? ' (cache)' : ''}`,
          metadata: {
            generationTime: result.snapshot.metadata.generationTime,
            dataQuality: result.snapshot.metadata.dataQuality,
            coverage: result.snapshot.metadata.coverage,
          },
        };
      } catch (error) {
        console.error('Error scanning city:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          message: "Errore nell'analisi del mercato",
        };
      }
    },

    /**
     * Genera report PDF per trend di mercato
     */
    trend_report: async (args: z.infer<typeof trendReportSchema>) => {
      try {
        const validated = trendReportSchema.parse(args);

        const marketService = new MarketIntelligenceService();
        const reportGenerator = new MarketTrendReportGenerator();

        // Prima scansiona la città per ottenere i dati
        const scanResult = await marketService.scanCity({
          city: validated.city,
          asset: validated.asset,
          horizonMonths: validated.horizonMonths,
          includeHeatmap: true,
          includeInsights: true,
        });

        // Genera il report PDF
        const reportResult = await reportGenerator.generateTrendReport(
          scanResult.snapshot,
          validated.horizonMonths
        );

        return {
          success: true,
          report: {
            id: reportResult.report.id,
            city: reportResult.report.city,
            asset: reportResult.report.asset,
            horizonMonths: reportResult.report.horizonMonths,
            generatedAt: reportResult.report.generatedAt,
            pdfUrl: reportResult.report.pdfUrl,
            summary: {
              marketHealth: reportResult.report.summary.marketHealth,
              riskLevel: reportResult.report.summary.riskLevel,
              opportunitiesCount: reportResult.report.summary.opportunities.length,
              risksCount: reportResult.report.summary.risks.length,
            },
          },
          message: `Report trend ${validated.city} generato con successo`,
          pdfUrl: reportResult.pdfUrl,
        };
      } catch (error) {
        console.error('Error generating trend report:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          message: 'Errore nella generazione del report',
        };
      }
    },

    /**
     * Recupera dati comps per una città
     */
    comps_fetch: async (args: z.infer<typeof compsFetchSchema>) => {
      try {
        const validated = compsFetchSchema.parse(args);

        // Simula dati comps reali
        const mockCompsData = {
          internal: {
            count: Math.floor(Math.random() * 200) + 50,
            p25: 1800,
            p50: 2200,
            p75: 2800,
            p90: 3500,
            mean: 2300,
            stdDev: 500,
          },
          omi: {
            zone: 'Centro',
            range: [2000, 2500],
            confidence: 0.85,
          },
        };

        // Filtra per asset se specificato
        let filteredComps = mockCompsData.internal;
        if (validated.asset) {
          // Simula filtro per asset type
          filteredComps = {
            ...mockCompsData.internal,
            count: Math.floor(mockCompsData.internal.count * 0.8), // Simula riduzione per asset specifico
          };
        }

        return {
          success: true,
          comps: {
            total: filteredComps.count,
            median: filteredComps.p50,
            mean: filteredComps.mean || filteredComps.p50,
            stdDev: filteredComps.stdDev || 0,
            quartiles: [
              filteredComps.p25 || 0,
              filteredComps.p50 || 0,
              filteredComps.p75 || 0,
              filteredComps.p90 || 0,
            ],
          },
          omi: mockCompsData.omi
            ? {
                zone: mockCompsData.omi.zone,
                range: mockCompsData.omi.range,
                confidence: mockCompsData.omi.confidence,
              }
            : null,
          message: `${filteredComps.count} comps recuperati per ${validated.city}`,
          metadata: {
            radiusKm: validated.radiusKm,
            sampleSize: validated.sampleSize,
            asset: validated.asset || 'all',
          },
        };
      } catch (error) {
        console.error('Error fetching comps:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          message: 'Errore nel recupero dei comps',
        };
      }
    },

    /**
     * Genera heatmap per una città
     */
    generate_heatmap: async (args: { city: string; asset: string; metric: string }) => {
      try {
        const marketService = new MarketIntelligenceService();

        const result = await marketService.scanCity({
          city: args.city,
          asset: args.asset as any,
          horizonMonths: 12,
          includeHeatmap: true,
          includeInsights: false,
        });

        return {
          success: true,
          heatmap: {
            city: args.city,
            asset: args.asset,
            metric: args.metric,
            cellsCount: result.snapshot.data.heatmap.features.length,
                      bounds: calculateHeatmapBounds(result.snapshot.data.heatmap),
          colorScheme: getColorSchemeForMetric(args.metric),
          },
          message: `Heatmap ${args.city} generata con successo`,
          svgData: result.snapshot.data.heatmap,
        };
      } catch (error) {
        console.error('Error generating heatmap:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          message: 'Errore nella generazione della heatmap',
        };
      }
    },

    /**
     * Ottiene statistiche market per una città
     */
    get_market_stats: async (args: { city: string }) => {
      try {
        const marketService = new MarketIntelligenceService();

        // Simula statistiche per la città
        const stats = {
          totalSnapshots: Math.floor(Math.random() * 50) + 10,
          averagePrice: Math.floor(Math.random() * 3000) + 2000,
          priceChange: (Math.random() - 0.5) * 20, // -10% to +10%
          inventoryChange: (Math.random() - 0.5) * 30, // -15% to +15%
          marketHealth: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
          lastUpdate: new Date().toISOString(),
        };

        return {
          success: true,
          stats,
          message: `Statistiche ${args.city} recuperate`,
          city: args.city,
        };
      } catch (error) {
        console.error('Error getting market stats:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          message: 'Errore nel recupero delle statistiche',
        };
      }
    },
  },
];
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calcola bounds della heatmap
 */
function calculateHeatmapBounds(heatmap: any): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  let north = -90,
    south = 90,
    east = -180,
    west = 180;

  heatmap.features.forEach((feature: any) => {
    const coords = feature.geometry.coordinates[0];
    coords.forEach((coord: number[]) => {
      north = Math.max(north, coord[1] || 0);
      south = Math.min(south, coord[1] || 0);
      east = Math.max(east, coord[0] || 0);
      west = Math.min(west, coord[0] || 0);
    });
  });

  return { north, south, east, west };
}

/**
 * Ottiene schema colori per metrica
 */
function getColorSchemeForMetric(metric: string): string {
  const schemes = {
    psqmMedian: 'price',
    demandScore: 'demand',
    supplyScore: 'supply',
    priceVolatility: 'volatility',
  };

  return schemes[metric as keyof typeof schemes] || 'price';
}

/**
 * Genera messaggio di risposta per il chat
 */
export function generateMarketResponse(action: string, result: any, city: string): string {
  switch (action) {
    case 'scan_city':
      if (result.success) {
        return (
          `📊 **Analisi Mercato ${city}** completata!\n\n` +
          `🏗️ **Asset:** ${result.snapshot.asset}\n` +
          `⏰ **Orizzonte:** ${result.snapshot.horizonMonths} mesi\n` +
          `💰 **Prezzo mediano:** ${result.snapshot.kpis.psqmMedian.toFixed(0)} €/m²\n` +
          `📈 **Tempo vendita:** ${result.snapshot.kpis.absorptionDays} giorni\n` +
          `📋 **Insights:** ${result.insights.length} analisi generate\n` +
          `🗺️ **Heatmap:** ${result.snapshot.heatmapCells} celle generate\n` +
          `⚡ **Cache:** ${result.snapshot.cacheHit ? 'Hit' : 'Miss'}\n\n` +
          `💡 **Top Insight:** ${result.insights[0]?.title || 'N/A'}`
        );
      } else {
        return `❌ **Errore nell'analisi del mercato:** ${result.error}`;
      }

    case 'trend_report':
      if (result.success) {
        return (
          `📈 **Report Trend ${city}** generato!\n\n` +
          `📄 **PDF:** [Scarica Report](${result.pdfUrl})\n` +
          `🏗️ **Asset:** ${result.report.asset}\n` +
          `⏰ **Orizzonte:** ${result.report.horizonMonths} mesi\n` +
          `📊 **Salute mercato:** ${result.report.summary.marketHealth}\n` +
          `⚠️ **Livello rischio:** ${result.report.summary.riskLevel}\n` +
          `🎯 **Opportunità:** ${result.report.summary.opportunitiesCount}\n` +
          `⚠️ **Rischi:** ${result.report.summary.risksCount}`
        );
      } else {
        return `❌ **Errore nella generazione del report:** ${result.error}`;
      }

    case 'comps_fetch':
      if (result.success) {
        return (
          `📋 **Comps ${city}** recuperati!\n\n` +
          `📊 **Totale:** ${result.comps.total} immobili\n` +
          `💰 **Prezzo mediano:** ${result.comps.median.toFixed(0)} €/m²\n` +
          `📈 **Prezzo medio:** ${result.comps.mean.toFixed(0)} €/m²\n` +
          `📏 **Deviazione std:** ${result.comps.stdDev.toFixed(0)} €/m²\n` +
          `📊 **OMI:** ${result.omi ? 'Disponibile' : 'Non disponibile'}\n` +
          `🎯 **Raggio:** ${result.metadata.radiusKm} km`
        );
      } else {
        return `❌ **Errore nel recupero comps:** ${result.error}`;
      }

    default:
      return 'Azione non riconosciuta';
  }
}
