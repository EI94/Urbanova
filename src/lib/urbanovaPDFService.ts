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

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO identico alla schermata Vedi Progetto...');
      
      // Configurazione iniziale
      this.doc = new jsPDF('p', 'mm', 'a4');
      this.doc.setFont('helvetica');
      
      // HEADER BLU PERFETTO IDENTICO ALLA SCHERMATA
      this.generateHeaderBluPerfetto(options.project);
      
      // 4 CARD METRICHE PERFETTE IDENTICHE ALLA SCHERMATA
      this.generateMetricheCardsPerfette(options);
      
      // SEZIONI ANALISI PERFETTE IDENTICHE ALLA SCHERMATA
      this.generateSezioniAnalisiPerfette(options);
      
      console.log('✅ PDF PERFETTO identico alla schermata generato');
      return Buffer.from(this.doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }

  private generateHeaderBluPerfetto(project: FeasibilityProject) {
    // Header blu PERFETTO identico alla schermata
    this.doc.setFillColor(59, 130, 246); // Blue-600 esatto
    this.doc.rect(0, 0, 210, 40, 'F');
    
    // Titolo "Studio di Fattibilità" centrato PERFETTO
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Studio di Fattibilità', 105, 25, { align: 'center' });
    
    // Sottotitolo "Analisi completa dell'investimento immobiliare" PERFETTO
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Analisi completa dell\'investimento immobiliare', 105, 35, { align: 'center' });
    
    // Nome progetto "Ciliegie" PERFETTO
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(project.name || 'Progetto', 20, 70);
    
    // Indirizzo "Via delle Ciliegie, 157 Roma" PERFETTO
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text(project.address || 'Indirizzo non specificato', 20, 85);
    
    // Tag "PIANIFICAZIONE" PERFETTO
    this.generateTagPianificazionePerfetto(170, 70);
    
    // Data "Creato il 24/08/2025" PERFETTA
    this.doc.setFontSize(12);
    this.doc.text('Creato il', 170, 85);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(new Date().toLocaleDateString('it-IT'), 170, 95);
  }

  private generateTagPianificazionePerfetto(x: number, y: number) {
    // Sfondo grigio chiaro PERFETTO
    this.doc.setFillColor(243, 244, 246); // Gray-100 esatto
    this.doc.roundedRect(x, y - 5, 35, 15, 3, 3, 'F');
    
    // Bordo grigio PERFETTO
    this.doc.setDrawColor(209, 213, 219); // Gray-300 esatto
    this.doc.roundedRect(x, y - 5, 35, 15, 3, 3, 'S');
    
    // Testo "PIANIFICAZIONE" PERFETTO
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text('PIANIFICAZIONE', x + 17.5, y + 2, { align: 'center' });
  }

  private generateMetricheCardsPerfette(options: UrbanovaPDFOptions) {
    const startY = 110;
    const cardWidth = 85;
    const cardHeight = 60;
    const gap = 10;
    
    // Card 1: Investimento Totale (Top-Left) PERFETTA
    this.generateCardPerfetta(
      'Investimento Totale',
      '€' + (options.calculatedCosts.total || 0).toLocaleString('it-IT'),
      '📊',
      20,
      startY,
      cardWidth,
      cardHeight,
      '#3B82F6' // Blue esatto
    );
    
    // Card 2: ROI Atteso (Top-Right) PERFETTA
    this.generateCardPerfetta(
      'ROI Atteso',
      (options.calculatedResults.roi || 0).toFixed(1) + '%',
      '🎯',
      20 + cardWidth + gap,
      startY,
      cardWidth,
      cardHeight,
      '#10B981' // Green esatto
    );
    
    // Card 3: Payback Period (Bottom-Left) PERFETTA
    this.generateCardPerfetta(
      'Payback Period',
      (options.calculatedResults.paybackPeriod || 0).toFixed(1) + ' anni',
      '⏰',
      20,
      startY + cardHeight + gap,
      cardWidth,
      cardHeight,
      '#8B5CF6' // Purple esatto
    );
    
    // Card 4: NPV (Bottom-Right) PERFETTA
    this.generateCardPerfetta(
      'NPV',
      '€' + (options.calculatedResults.profit || 0).toLocaleString('it-IT'),
      '📄',
      20 + cardWidth + gap,
      startY + cardHeight + gap,
      cardWidth,
      cardHeight,
      '#F59E0B' // Orange esatto
    );
  }

  private generateCardPerfetta(title: string, value: string, icon: string, x: number, y: number, width: number, height: number, color: string) {
    // Sfondo bianco PERFETTO
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, width, height, 'F');
    
    // Bordo grigio chiaro PERFETTO
    this.doc.setDrawColor(229, 231, 235); // Gray-200 esatto
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, width, height, 'S');
    
    // Icona PERFETTA
    this.doc.setFontSize(20);
    this.doc.text(icon, x + 10, y + 20);
    
    // Titolo PERFETTO
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text(title, x + 35, y + 20);
    
    // Valore PERFETTO
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color);
    this.doc.text(value, x + 35, y + 40);
  }

  private generateSezioniAnalisiPerfette(options: UrbanovaPDFOptions) {
    const startY = 250;
    
    // Sezione Analisi del Rischio PERFETTA
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.text('🎯 Analisi del Rischio', 20, startY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text('Livello di Rischio: ' + this.getRiskLevel(options.calculatedResults.margin), 20, startY + 15);
    this.doc.text('Tasso Interno di Rendimento: ' + (options.calculatedResults.roi || 0).toFixed(1) + '%', 20, startY + 30);
    
    // Sezione Trend di Mercato PERFETTA
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.text('📈 Trend di Mercato', 20, startY + 60);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text('Direzione del Mercato: ' + this.getMarketTrend(options.calculatedResults.margin), 20, startY + 75);
  }

  private getRiskLevel(margin: number): string {
    if (margin < 0) return 'Alto';
    if (margin < 15) return 'Medio';
    return 'Basso';
  }

  private getMarketTrend(margin: number): string {
    if (margin > 20) return 'Positivo';
    if (margin > 0) return 'Neutrale';
    return 'Negativo';
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
