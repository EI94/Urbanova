import PDFDocument from 'pdfkit';
import { RankedOffer, ComparisonStatistics, OutlierAnalysis } from '@urbanova/types';

/**
 * Servizio PDF Generator per report di confronto offerte
 *
 * Genera PDF professionali con:
 * - Tabella comparativa dettagliata
 * - Grafici di confronto prezzo/tempo/qualità
 * - Analisi outlier e raccomandazioni
 * - Statistiche e metriche
 * - Branding Urbanova
 */

export interface PDFGenerationOptions {
  includeCharts?: boolean;
  includeOutlierAnalysis?: boolean;
  includeRecommendations?: boolean;
  customStyling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

export interface ComparisonReportData {
  rdoId: string;
  rdoTitle: string;
  generatedAt: Date;
  rankedOffers: RankedOffer[];
  statistics: ComparisonStatistics;
  outliers: OutlierAnalysis[];
  scoringWeights: {
    price: number;
    time: number;
    quality: number;
  };
}

export class PDFGeneratorService {
  private defaultOptions: PDFGenerationOptions = {
    includeCharts: true,
    includeOutlierAnalysis: true,
    includeRecommendations: true,
    customStyling: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Helvetica',
    },
  };

  /**
   * Genera PDF di confronto completo
   */
  async generateComparisonReport(
    data: ComparisonReportData,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    const opts = { ...this.defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Genera contenuto PDF
        this.generateHeader(doc, data, opts);
        this.generateSummary(doc, data, opts);
        this.generateComparisonTable(doc, data, opts);

        if (opts.includeCharts) {
          this.generateCharts(doc, data, opts);
        }

        if (opts.includeOutlierAnalysis && data.outliers.length > 0) {
          this.generateOutlierAnalysis(doc, data, opts);
        }

        if (opts.includeRecommendations) {
          this.generateRecommendations(doc, data, opts);
        }

        this.generateFooter(doc, opts);

        doc.end();
      } catch (error) {
        reject(new Error(`Errore generazione PDF: ${error.message}`));
      }
    });
  }

  /**
   * Genera header del documento
   */
  private generateHeader(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    // Logo Urbanova (placeholder)
    doc
      .rect(50, 50, 100, 40)
      .fillColor(primaryColor)
      .fill()
      .fillColor('white')
      .fontSize(16)
      .text('URBANOVA', 60, 65, { width: 80, align: 'center' });

    // Titolo principale
    doc
      .fontSize(24)
      .fillColor('black')
      .font(fontFamily + '-Bold')
      .text('Confronto Offerte RDO', 200, 60);

    // Sottotitolo
    doc.fontSize(14).fillColor('gray').font(fontFamily).text(data.rdoTitle, 200, 90);

    // Metadata
    doc
      .fontSize(10)
      .fillColor('black')
      .text(`RDO ID: ${data.rdoId}`, 200, 120)
      .text(`Generato il: ${data.generatedAt.toLocaleDateString('it-IT')}`, 200, 135)
      .text(`Offerte analizzate: ${data.rankedOffers.length}`, 200, 150);

    // Linea separatrice
    doc.moveTo(50, 180).lineTo(550, 180).strokeColor(primaryColor).lineWidth(2).stroke();

    doc.y = 200;
  }

  /**
   * Genera riepilogo esecutivo
   */
  private generateSummary(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font(fontFamily + '-Bold')
      .text('Riepilogo Esecutivo', 50, doc.y);

    doc.y += 20;

    // Top 3 offerte
    doc
      .fontSize(14)
      .fillColor('black')
      .font(fontFamily + '-Bold')
      .text('Top 3 Offerte:', 50, doc.y);

    doc.y += 20;

    data.rankedOffers.slice(0, 3).forEach((rankedOffer, index) => {
      const offer = rankedOffer.offer;
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

      doc
        .fontSize(12)
        .fillColor('black')
        .font(fontFamily + '-Bold')
        .text(`${medal} ${rankedOffer.rank}. ${offer.vendorName}`, 70, doc.y);

      doc
        .fontSize(10)
        .fillColor('gray')
        .font(fontFamily)
        .text(
          `Score: ${Math.round(rankedOffer.score)}/100 | Prezzo: €${offer.totalPrice} | Tempo: ${offer.totalTime} giorni`,
          70,
          doc.y + 15
        );

      doc.y += 35;
    });

    // Statistiche chiave
    doc
      .fontSize(14)
      .fillColor('black')
      .font(fontFamily + '-Bold')
      .text('Statistiche Chiave:', 50, doc.y);

    doc.y += 20;

    const stats = [
      `Prezzo medio: €${Math.round(data.statistics.averagePrice)}`,
      `Range prezzi: €${Math.round(data.statistics.priceRange.min)} - €${Math.round(data.statistics.priceRange.max)}`,
      `Tempo medio: ${Math.round(data.statistics.averageTime)} giorni`,
      `Qualità media: ${data.statistics.averageQuality.toFixed(1)}/10`,
      `Outliers rilevati: ${data.outliers.length}`,
    ];

    stats.forEach(stat => {
      doc.fontSize(10).fillColor('black').font(fontFamily).text(`• ${stat}`, 70, doc.y);
      doc.y += 15;
    });

    doc.y += 20;
  }

  /**
   * Genera tabella di confronto dettagliata
   */
  private generateComparisonTable(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font(fontFamily + '-Bold')
      .text('Confronto Dettagliato', 50, doc.y);

    doc.y += 20;

    // Header tabella
    const headers = ['Rank', 'Vendor', 'Score', 'Prezzo', 'Tempo', 'Qualità', 'Raccomandazione'];
    const columnWidths = [40, 120, 50, 80, 60, 60, 100];
    let x = 50;

    doc
      .fontSize(10)
      .fillColor('white')
      .font(fontFamily + '-Bold');

    headers.forEach((header, index) => {
      doc.rect(x, doc.y, columnWidths[index], 20).fillColor(primaryColor).fill();

      doc.text(header, x + 5, doc.y + 5, { width: columnWidths[index] - 10, align: 'center' });
      x += columnWidths[index];
    });

    doc.y += 25;

    // Righe dati
    data.rankedOffers.forEach((rankedOffer, rowIndex) => {
      const offer = rankedOffer.offer;
      x = 50;

      // Alterna colori righe
      const rowColor = rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff';

      doc.rect(x, doc.y, 510, 25).fillColor(rowColor).fill();

      // Rank
      doc
        .fontSize(10)
        .fillColor('black')
        .font(fontFamily + '-Bold')
        .text(rankedOffer.rank.toString(), x + 15, doc.y + 5, { width: 30, align: 'center' });
      x += 40;

      // Vendor
      doc.font(fontFamily).text(offer.vendorName, x + 5, doc.y + 5, { width: 110, align: 'left' });
      x += 120;

      // Score
      doc
        .font(fontFamily + '-Bold')
        .text(Math.round(rankedOffer.score).toString(), x + 5, doc.y + 5, {
          width: 40,
          align: 'center',
        });
      x += 50;

      // Prezzo
      doc
        .font(fontFamily)
        .text(`€${offer.totalPrice}`, x + 5, doc.y + 5, { width: 70, align: 'right' });
      x += 80;

      // Tempo
      doc.text(`${offer.totalTime}g`, x + 5, doc.y + 5, { width: 50, align: 'center' });
      x += 60;

      // Qualità
      doc.text(`${offer.qualityScore}/10`, x + 5, doc.y + 5, { width: 50, align: 'center' });
      x += 60;

      // Raccomandazione
      const recColor = this.getRecommendationColor(rankedOffer.recommendation);
      doc
        .fillColor(recColor)
        .text(rankedOffer.recommendation.toUpperCase(), x + 5, doc.y + 5, {
          width: 90,
          align: 'center',
        });

      doc.y += 30;
    });

    doc.y += 20;
  }

  /**
   * Genera grafici di confronto
   */
  private generateCharts(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font(fontFamily + '-Bold')
      .text('Analisi Grafica', 50, doc.y);

    doc.y += 20;

    // Grafico a barre per score
    this.generateBarChart(doc, data, 'Score per Vendor', 'score', primaryColor, fontFamily);
    doc.y += 150;

    // Grafico a barre per prezzi
    this.generateBarChart(doc, data, 'Confronto Prezzi', 'totalPrice', '#10b981', fontFamily);
    doc.y += 150;

    // Grafico radar per criteri
    this.generateRadarChart(doc, data, primaryColor, fontFamily);
    doc.y += 200;
  }

  /**
   * Genera grafico a barre
   */
  private generateBarChart(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    title: string,
    field: string,
    color: string,
    fontFamily: string
  ): void {
    doc
      .fontSize(14)
      .fillColor('black')
      .font(fontFamily + '-Bold')
      .text(title, 50, doc.y);

    doc.y += 20;

    const chartWidth = 400;
    const chartHeight = 100;
    const chartX = 50;
    const chartY = doc.y;
    const barWidth = chartWidth / data.rankedOffers.length;

    // Trova valore massimo per normalizzazione
    const maxValue = Math.max(
      ...data.rankedOffers.map(ro => ro.offer[field as keyof typeof ro.offer] as number)
    );

    // Disegna barre
    data.rankedOffers.forEach((rankedOffer, index) => {
      const value = rankedOffer.offer[field as keyof typeof rankedOffer.offer] as number;
      const barHeight = (value / maxValue) * chartHeight;
      const x = chartX + index * barWidth;
      const y = chartY + chartHeight - barHeight;

      // Barra
      doc
        .rect(x + 5, y, barWidth - 10, barHeight)
        .fillColor(color)
        .fill();

      // Valore
      doc
        .fontSize(8)
        .fillColor('black')
        .font(fontFamily)
        .text(value.toString(), x + barWidth / 2 - 10, y - 15, { width: 20, align: 'center' });

      // Label vendor (abbreviata)
      const vendorName = rankedOffer.offer.vendorName.split(' ')[0];
      doc.text(vendorName, x + barWidth / 2 - 15, chartY + chartHeight + 5, {
        width: 30,
        align: 'center',
      });
    });

    // Asse Y
    doc
      .moveTo(chartX, chartY)
      .lineTo(chartX, chartY + chartHeight)
      .strokeColor('black')
      .lineWidth(1)
      .stroke();

    // Asse X
    doc
      .moveTo(chartX, chartY + chartHeight)
      .lineTo(chartX + chartWidth, chartY + chartHeight)
      .strokeColor('black')
      .lineWidth(1)
      .stroke();

    doc.y = chartY + chartHeight + 40;
  }

  /**
   * Genera grafico radar per criteri
   */
  private generateRadarChart(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    color: string,
    fontFamily: string
  ): void {
    doc
      .fontSize(14)
      .fillColor('black')
      .font(fontFamily + '-Bold')
      .text('Analisi Multi-Criterio', 50, doc.y);

    doc.y += 20;

    const centerX = 300;
    const centerY = doc.y + 80;
    const radius = 60;
    const criteria = ['Prezzo', 'Tempo', 'Qualità'];

    // Disegna cerchi concentrici
    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i;
      doc.circle(centerX, centerY, r).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    }

    // Disegna assi
    criteria.forEach((criterion, index) => {
      const angle = (index * 2 * Math.PI) / criteria.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      doc.moveTo(centerX, centerY).lineTo(x, y).strokeColor('#d1d5db').lineWidth(1).stroke();

      // Label criterio
      const labelX = centerX + Math.cos(angle) * (radius + 15);
      const labelY = centerY + Math.sin(angle) * (radius + 15);
      doc
        .fontSize(10)
        .fillColor('black')
        .font(fontFamily)
        .text(criterion, labelX - 15, labelY - 5, { width: 30, align: 'center' });
    });

    // Disegna poligono per top offer
    const topOffer = data.rankedOffers[0];
    const points: [number, number][] = [];

    criteria.forEach((criterion, index) => {
      const angle = (index * 2 * Math.PI) / criteria.length - Math.PI / 2;
      let value = 0;

      switch (criterion) {
        case 'Prezzo':
          value =
            100 -
            ((topOffer.offer.totalPrice - data.statistics.priceRange.min) /
              (data.statistics.priceRange.max - data.statistics.priceRange.min)) *
              100;
          break;
        case 'Tempo':
          value =
            100 -
            ((topOffer.offer.totalTime - data.statistics.timeRange.min) /
              (data.statistics.timeRange.max - data.statistics.timeRange.min)) *
              100;
          break;
        case 'Qualità':
          value = topOffer.offer.qualityScore * 10;
          break;
      }

      const r = (value / 100) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      points.push([x, y]);
    });

    // Disegna poligono
    if (points.length > 0) {
      doc.moveTo(points[0][0], points[0][1]);
      points.forEach(point => {
        doc.lineTo(point[0], point[1]);
      });
      doc
        .closePath()
        .fillColor(color + '40')
        .fill()
        .strokeColor(color)
        .lineWidth(2)
        .stroke();
    }

    doc.y = centerY + radius + 50;
  }

  /**
   * Genera analisi outlier
   */
  private generateOutlierAnalysis(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font(fontFamily + '-Bold')
      .text('Analisi Outlier', 50, doc.y);

    doc.y += 20;

    data.outliers.forEach((outlier, index) => {
      doc
        .fontSize(12)
        .fillColor('black')
        .font(fontFamily + '-Bold')
        .text(`${index + 1}. ${outlier.vendorName}`, 50, doc.y);

      doc
        .fontSize(10)
        .fillColor('gray')
        .font(fontFamily)
        .text(outlier.description, 70, doc.y + 15, { width: 450, align: 'left' });

      doc
        .fontSize(10)
        .fillColor('orange')
        .font(fontFamily + '-Bold')
        .text(`Raccomandazione: ${outlier.recommendation}`, 70, doc.y + 30, {
          width: 450,
          align: 'left',
        });

      doc.y += 50;
    });

    doc.y += 20;
  }

  /**
   * Genera raccomandazioni
   */
  private generateRecommendations(
    doc: PDFKit.PDFDocument,
    data: ComparisonReportData,
    options: PDFGenerationOptions
  ): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font(fontFamily + '-Bold')
      .text('Raccomandazioni', 50, doc.y);

    doc.y += 20;

    const recommendations = this.generateRecommendationsList(data);

    recommendations.forEach((rec, index) => {
      doc
        .fontSize(10)
        .fillColor('black')
        .font(fontFamily)
        .text(`${index + 1}. ${rec}`, 50, doc.y, { width: 450, align: 'left' });
      doc.y += 15;
    });

    doc.y += 20;
  }

  /**
   * Genera lista raccomandazioni
   */
  private generateRecommendationsList(data: ComparisonReportData): string[] {
    const recommendations: string[] = [];

    // Analisi score
    const topScore = Math.max(...data.rankedOffers.map(ro => ro.score));
    const avgScore =
      data.rankedOffers.reduce((sum, ro) => sum + ro.score, 0) / data.rankedOffers.length;

    if (topScore > avgScore * 1.5) {
      recommendations.push("Considera l'offerta con score più alto come favorita");
    }

    // Analisi prezzi
    const priceSpread = data.statistics.priceRange.max - data.statistics.priceRange.min;
    const avgPrice = data.statistics.averagePrice;

    if (priceSpread > avgPrice * 0.5) {
      recommendations.push('Elevata variabilità prezzi - verifica outlier');
    }

    // Analisi outlier
    if (data.outliers.length > 0) {
      recommendations.push(`Rilevati ${data.outliers.length} outlier - richiedi chiarimenti`);
    }

    // Raccomandazione finale
    const topOffer = data.rankedOffers[0];
    recommendations.push(`Raccomandazione: ${topOffer.offer.vendorName} come vincitore principale`);

    return recommendations;
  }

  /**
   * Genera footer del documento
   */
  private generateFooter(doc: PDFKit.PDFDocument, options: PDFGenerationOptions): void {
    const { primaryColor, fontFamily } = options.customStyling!;

    // Linea separatrice
    doc
      .moveTo(50, doc.y + 20)
      .lineTo(550, doc.y + 20)
      .strokeColor(primaryColor)
      .lineWidth(1)
      .stroke();

    doc.y += 30;

    // Footer info
    doc
      .fontSize(8)
      .fillColor('gray')
      .font(fontFamily)
      .text('Report generato automaticamente da Urbanova Procurement System', 50, doc.y, {
        width: 500,
        align: 'center',
      })
      .text('Per supporto tecnico: procurement-support@urbanova.com', 50, doc.y + 15, {
        width: 500,
        align: 'center',
      })
      .text(`© ${new Date().getFullYear()} Urbanova - Tutti i diritti riservati`, 50, doc.y + 30, {
        width: 500,
        align: 'center',
      });
  }

  /**
   * Ottieni colore per raccomandazione
   */
  private getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'strong':
        return '#10b981'; // verde
      case 'good':
        return '#3b82f6'; // blu
      case 'acceptable':
        return '#f59e0b'; // giallo
      case 'weak':
        return '#ef4444'; // rosso
      default:
        return '#6b7280'; // grigio
    }
  }
}
