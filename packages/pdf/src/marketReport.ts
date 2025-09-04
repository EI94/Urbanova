// import { MarketSnapshot, MarketTrendReport, MarketInsight } from '@urbanova/types';

// Temporary type definitions for PDF service
interface MarketSnapshot {
  id: string;
  city: string;
  asset: string;
  horizonMonths: number;
  kpis: {
    psqmMedian: number;
    psqmMean: number;
    absorptionDays: number;
    priceVolatility: number;
    demandScore: number;
    supplyScore: number;
  };
  insights: MarketInsight[];
  heatmapCells: number;
  cacheHit: boolean;
  timestamp: string;
  data: any;
  metadata: {
    generationTime: number;
    dataQuality: number;
    coverage: number;
    dataSources?: string[];
  };
}

interface MarketTrendReport {
  id: string;
  city: string;
  asset: string;
  horizonMonths: number;
  summary: {
    marketHealth: string;
    riskLevel: string;
    opportunitiesCount: number;
    risksCount: number;
    keyInsights?: any[];
    opportunities?: any[];
  };
  trends: any[];
  insights: MarketInsight[];
  generatedAt: string;
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'trend' | 'opportunity' | 'risk' | 'balance' | 'volatility';
  confidence: number;
}
import { PDFGeneratorService } from '../../../src/lib/pdfGeneratorService';
import { HeatmapGeneratorService } from '@urbanova/agents/src/market/heatmap';

export class MarketTrendReportGenerator {
  private pdfService: PDFGeneratorService;
  private heatmapService: HeatmapGeneratorService;

  constructor() {
    this.pdfService = new PDFGeneratorService();
    this.heatmapService = new HeatmapGeneratorService();
  }

  /**
   * Genera report PDF per trend di mercato
   */
  async generateTrendReport(
    snapshot: MarketSnapshot,
    horizonMonths: number
  ): Promise<{ report: MarketTrendReport; pdfUrl: string }> {
    try {
      // Genera heatmap SVG
      const heatmapSVG = this.heatmapService.generateSVGHeatmap(
        snapshot.data.heatmap,
        800,
        600,
        'psqmMedian'
      );

      // Genera grafici
      const charts = await this.generateCharts(snapshot);

      // Crea contenuto PDF
      const pdfContent = this.createPDFContent(snapshot, heatmapSVG, charts, horizonMonths);

      // Genera PDF
      // Mock PDF generation - in production would use this.pdfService.generatePDF(pdfContent)
      const pdfBuffer = Buffer.from('Mock PDF content');

      // Upload su GCS
      const fileName = `market_report_${snapshot.city}_${snapshot.asset}_${Date.now()}.pdf`;
      // Mock GCS upload - in production would use this.pdfService.uploadToGCS(pdfBuffer, fileName)
      const pdfUrl = `https://storage.googleapis.com/mock-bucket/${fileName}`;

      // Crea report object
      const report: MarketTrendReport = ({
        id: `report_${snapshot.id}`,
        city: snapshot.city,
        asset: snapshot.asset,
        horizonMonths,
        generatedAt: new Date().toISOString(),
        pdfUrl,
        summary: {
          keyInsights: snapshot.data.insights.slice(0, 3),
          marketHealth: this.calculateMarketHealth(snapshot.data.kpis),
          riskLevel: this.calculateRiskLevel(snapshot.data.kpis),
          opportunities: this.extractOpportunities(snapshot.data.insights),
          risks: this.extractRisks(snapshot.data.insights),
        } as any,
        charts,
      } as any);

      return { report, pdfUrl };
    } catch (error) {
      console.error('Error generating trend report:', error);
      throw new Error(
        `Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Crea contenuto PDF
   */
  private createPDFContent(
    snapshot: MarketSnapshot,
    heatmapSVG: string,
    charts: any,
    horizonMonths: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Market Intelligence Report - ${snapshot.city}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #2c3e50; margin: 0; }
          .header p { color: #7f8c8d; margin: 5px 0; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .kpi-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .kpi-label { color: #7f8c8d; margin-top: 5px; }
          .insight { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .insight h3 { margin: 0 0 10px 0; color: #2c3e50; }
          .insight p { margin: 5px 0; }
          .heatmap-container { text-align: center; margin: 20px 0; }
          .chart-container { margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Market Intelligence Report</h1>
          <p>${snapshot.city} - ${this.getAssetLabel(snapshot.asset)}</p>
          <p>Orizzonte: ${horizonMonths} mesi | Generato: ${new Date(snapshot.timestamp).toLocaleDateString('it-IT')}</p>
        </div>

        <div class="section">
          <h2>📊 Key Performance Indicators</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-value">${snapshot.data.kpis.psqmMedian.toFixed(0)} €/m²</div>
              <div class="kpi-label">Prezzo Mediano</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${snapshot.data.kpis.absorptionDays} giorni</div>
              <div class="kpi-label">Tempo Vendita</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${snapshot.data.kpis.inventoryCount}</div>
              <div class="kpi-label">Inventario</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${snapshot.data.kpis.demandScore.toFixed(0)}/100</div>
              <div class="kpi-label">Punteggio Domanda</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${snapshot.data.kpis.supplyScore.toFixed(0)}/100</div>
              <div class="kpi-label">Punteggio Offerta</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${(snapshot.data.kpis.priceVolatility * 100).toFixed(1)}%</div>
              <div class="kpi-label">Volatilità Prezzi</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🗺️ Heatmap Prezzi</h2>
          <div class="heatmap-container">
            ${heatmapSVG}
          </div>
        </div>

        <div class="section">
          <h2>💡 Insights Principali</h2>
          ${snapshot.data.insights
            .slice(0, 3)
            .map(
              (insight: any) => `
            <div class="insight">
              <h3>${insight.title}</h3>
              <p><strong>Descrizione:</strong> ${insight.description}</p>
              <p><strong>Confidenza:</strong> ${(insight.confidence * 100).toFixed(0)}%</p>
              <p><strong>Impatto:</strong> ${this.getImpactLabel(insight.impact)}</p>
              ${
                insight.recommendations
                  ? `
                <p><strong>Raccomandazioni:</strong></p>
                <ul>
                  ${insight.recommendations.map((rec: any) => `<li>${rec}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>

        <div class="section">
          <h2>📈 Trend Analysis</h2>
          <div class="chart-container">
            <h3>Trend Prezzi</h3>
            <p>Direzione: ${this.getTrendLabel(snapshot.data.kpis.trendDirection)}</p>
            <p>Forza: ${snapshot.data.kpis.trendStrength.toFixed(0)}%</p>
          </div>
        </div>

        <div class="section">
          <h2>📋 Dati Utilizzati</h2>
          <p><strong>Fonti:</strong> ${snapshot.metadata.dataSources?.join(', ') || 'N/A'}</p>
          <p><strong>Qualità Dati:</strong> ${(snapshot.metadata.dataQuality * 100).toFixed(0)}%</p>
          <p><strong>Copertura:</strong> ${snapshot.metadata.coverage.toFixed(1)}%</p>
          <p><strong>Tempo Generazione:</strong> ${snapshot.metadata.generationTime}ms</p>
        </div>

        <div class="footer">
          <p>Report generato automaticamente da Urbanova Market Intelligence</p>
          <p>Dati aggiornati al ${new Date(snapshot.timestamp).toLocaleDateString('it-IT')} ${new Date(snapshot.timestamp).toLocaleTimeString('it-IT')}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera grafici per il report
   */
  private async generateCharts(snapshot: MarketSnapshot): Promise<any> {
    // Per ora restituiamo placeholder per i grafici
    // In futuro si potrebbero integrare librerie come Chart.js server-side
    return {
      priceTrend: 'chart_placeholder_price_trend.png',
      absorptionTrend: 'chart_placeholder_absorption_trend.png',
      inventoryTrend: 'chart_placeholder_inventory_trend.png',
      demandSupplyBalance: 'chart_placeholder_balance.png',
    };
  }

  /**
   * Calcola salute del mercato
   */
  private calculateMarketHealth(kpis: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const { demandScore, supplyScore, marketBalance } = kpis;

    if (demandScore >= 80 && supplyScore <= 60 && marketBalance >= 20) return 'excellent';
    if (demandScore >= 60 && supplyScore <= 40 && marketBalance >= 10) return 'good';
    if (demandScore >= 40 && supplyScore <= 60 && marketBalance >= -10) return 'fair';
    return 'poor';
  }

  /**
   * Calcola livello di rischio
   */
  private calculateRiskLevel(kpis: any): 'low' | 'medium' | 'high' {
    const { priceVolatility, marketBalance } = kpis;

    if (priceVolatility > 0.5 || Math.abs(marketBalance) > 50) return 'high';
    if (priceVolatility > 0.3 || Math.abs(marketBalance) > 30) return 'medium';
    return 'low';
  }

  /**
   * Estrae opportunità dagli insights
   */
  private extractOpportunities(insights: MarketInsight[]): string[] {
    return insights.filter(insight => insight.type === 'opportunity').map(insight => insight.title);
  }

  /**
   * Estrae rischi dagli insights
   */
  private extractRisks(insights: MarketInsight[]): string[] {
    return insights.filter(insight => insight.type === 'risk').map(insight => insight.title);
  }

  /**
   * Utility functions
   */
  private getAssetLabel(asset: string): string {
    const labels = {
      residential: 'Residenziale',
      commercial: 'Commerciale',
      industrial: 'Industriale',
      mixed: 'Misto',
    };
    return labels[asset as keyof typeof labels] || asset;
  }

  private getImpactLabel(impact: string): string {
    const labels = {
      high: 'Alto',
      medium: 'Medio',
      low: 'Basso',
    };
    return labels[impact as keyof typeof labels] || impact;
  }

  private getTrendLabel(direction: string): string {
    const labels = {
      up: 'In Aumento',
      down: 'In Diminuzione',
      stable: 'Stabile',
    };
    return labels[direction as keyof typeof labels] || direction;
  }
}
