import jsPDF from 'jspdf';
import { FeasibilityProject } from './feasibilityService';

interface UrbanovaPDFOptions {
  project: FeasibilityProject;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private cardWidth: number;
  private cardHeight: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.margin = 20;
    this.cardWidth = (this.pageWidth - 2 * this.margin - 10) / 2; // 2 colonne con gap
    this.cardHeight = 60;
  }

  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione report in stile Urbanova...');
      
      // Configurazione iniziale
      this.doc.setFont('helvetica');
      
      // Header principale
      this.generateMainHeader(options.project);
      
      // Metriche principali (4 card in alto)
      this.generateKeyMetricsCards(options);
      
      // Sezioni analisi (2 card sotto)
      this.generateAnalysisCards(options);
      
      // Raccomandazioni AI
      this.generateAIRecommendations(options);
      
      // Footer
      this.generateFooter();
      
      console.log('✅ Report generato con successo');
      return Buffer.from(this.doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore generazione report Urbanova:', error);
      throw new Error('Errore nella generazione del report');
    }
  }

  private generateMainHeader(project: FeasibilityProject) {
    // Header con sfondo blu
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Titolo principale centrato
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Studio di Fattibilità', this.pageWidth / 2, 25, { align: 'center' });
    
    // Sottotitolo
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Analisi completa dell\'investimento immobiliare', this.pageWidth / 2, 35, { align: 'center' });
    
    // Nome progetto
    this.doc.setTextColor(17, 24, 39); // Gray-900
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(project.name || 'Progetto', this.margin, 70);
    
    // Indirizzo
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text(project.address || 'Indirizzo non specificato', this.margin, 85);
    
    // Tag stato
    this.generateStatusTag(project.status || 'Non specificato', this.margin + 150, 70);
    
    // Data creazione
    this.doc.setFontSize(12);
    this.doc.text('Creato il', this.margin + 150, 85);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(new Date().toLocaleDateString('it-IT'), this.margin + 150, 95);
  }

  private generateKeyMetricsCards(options: UrbanovaPDFOptions) {
    const startY = 110;
    const cardSpacing = 5;
    
    // Card 1: Investimento Totale
    this.generateMetricCard(
      'Investimento Totale',
      `€${options.calculatedCosts.total.toLocaleString('it-IT')}`,
      '📊',
      this.margin,
      startY,
      '#3B82F6' // Blue
    );
    
    // Card 2: ROI Atteso
    this.generateMetricCard(
      'ROI Atteso',
      `${options.calculatedResults.roi.toFixed(1)}%`,
      '🎯',
      this.margin + this.cardWidth + cardSpacing,
      startY,
      '#10B981' // Green
    );
    
    // Card 3: Payback Period
    this.generateMetricCard(
      'Payback Period',
      `${options.calculatedResults.paybackPeriod.toFixed(1)} anni`,
      '⏰',
      this.margin,
      startY + this.cardHeight + cardSpacing,
      '#8B5CF6' // Purple
    );
    
    // Card 4: NPV
    this.generateMetricCard(
      'NPV',
      `€${options.calculatedResults.profit.toLocaleString('it-IT')}`,
      '📄',
      this.margin + this.cardWidth + cardSpacing,
      startY + this.cardHeight + cardSpacing,
      '#F59E0B' // Orange
    );
  }

  private generateMetricCard(title: string, value: string, icon: string, x: number, y: number, color: string) {
    // Sfondo card
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, this.cardWidth, this.cardHeight, 'F');
    
    // Bordo card
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, this.cardWidth, this.cardHeight, 'S');
    
    // Icona
    this.doc.setFontSize(20);
    this.doc.text(icon, x + 10, y + 20);
    
    // Titolo
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text(title, x + 35, y + 20);
    
    // Valore
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color);
    this.doc.text(value, x + 35, y + 40);
  }

  private generateAnalysisCards(options: UrbanovaPDFOptions) {
    const startY = 250;
    
    // Card Analisi del Rischio
    this.generateAnalysisCard(
      'Analisi del Rischio',
      '🎯',
      [
        { label: 'Livello di Rischio:', value: this.getRiskLevel(options.calculatedResults.margin), color: this.getRiskColor(options.calculatedResults.margin) },
        { label: 'Tasso Interno di Rendimento:', value: `${options.calculatedResults.roi.toFixed(1)}%`, color: '#000000' }
      ],
      this.margin,
      startY
    );
    
    // Card Trend di Mercato
    this.generateAnalysisCard(
      'Trend di Mercato',
      '📈',
      [
        { label: 'Direzione del Mercato:', value: this.getMarketTrend(options.calculatedResults.margin), color: '#10B981' }
      ],
      this.margin + this.cardWidth + 5,
      startY
    );
  }

  private generateAnalysisCard(title: string, icon: string, metrics: Array<{label: string, value: string, color: string}>, x: number, y: number) {
    // Sfondo card
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, this.cardWidth, this.cardHeight, 'F');
    
    // Bordo card
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, this.cardWidth, this.cardHeight, 'S');
    
    // Titolo con icona
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text(icon, x + 10, y + 20);
    this.doc.text(title, x + 35, y + 20);
    
    // Metriche
    let currentY = y + 35;
    metrics.forEach(metric => {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(metric.label, x + 10, currentY);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(metric.color);
      this.doc.text(metric.value, x + 10, currentY + 15);
      
      currentY += 25;
    });
  }

  private generateAIRecommendations(options: UrbanovaPDFOptions) {
    const startY = 320;
    
    // Sfondo card
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 50, 'F');
    
    // Bordo card
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 50, 'S');
    
    // Titolo
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('⭐ Raccomandazioni AI', this.margin + 10, startY + 20);
    
    // Raccomandazioni
    const recommendations = [
      `ROI atteso: ${options.calculatedResults.roi.toFixed(1)}%`,
      `Margine di profitto: €${options.calculatedResults.profit.toLocaleString('it-IT')}`,
      `Località strategica: ${options.project.address || 'Non specificata'}`,
      `Tipo immobile: ${options.project.propertyType || 'Non specificato'}`
    ];
    
    let currentY = startY + 35;
    recommendations.forEach((rec, index) => {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(59, 130, 246); // Blue
      this.doc.text('•', this.margin + 15, currentY);
      this.doc.setTextColor(17, 24, 39);
      this.doc.text(rec, this.margin + 25, currentY);
      currentY += 12;
    });
  }

  private generateStatusTag(status: string, x: number, y: number) {
    // Sfondo tag
    this.doc.setFillColor(243, 244, 246); // Gray-100
    this.doc.roundedRect(x, y - 5, 30, 15, 3, 3, 'F');
    
    // Bordo tag
    this.doc.setDrawColor(209, 213, 219); // Gray-300
    this.doc.roundedRect(x, y - 5, 30, 15, 3, 3, 'S');
    
    // Testo tag
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text(status, x + 15, y + 2, { align: 'center' });
  }

  private generateFooter() {
    const footerY = this.pageHeight - 20;
    
    // Linea separatrice
    this.doc.setDrawColor(229, 231, 235);
    this.doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);
    
    // Testo footer
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('Generato da Urbanova AI - Analisi di Fattibilità Intelligente', this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Data generazione: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}`, this.pageWidth / 2, footerY + 5, { align: 'center' });
  }

  private getRiskLevel(margin: number): string {
    if (margin < 0) return 'Alto';
    if (margin < 15) return 'Medio';
    return 'Basso';
  }

  private getRiskColor(margin: number): string {
    if (margin < 0) return '#EF4444'; // Red
    if (margin < 15) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  }

  private getMarketTrend(margin: number): string {
    if (margin > 20) return 'Positivo';
    if (margin > 0) return 'Neutrale';
    return 'Negativo';
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
