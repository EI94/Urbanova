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
      console.log('🎨 Generazione PDF IDENTICO alla schermata Vedi Progetto...');
      
      // Configurazione iniziale
      this.doc.setFont('helvetica');
      
      // HEADER BLU IDENTICO ALLA SCHERMATA
      this.generateHeaderBlu(options.project);
      
      // 4 CARD METRICHE IDENTICHE ALLA SCHERMATA
      this.generateMetricheCards(options);
      
      // SEZIONI ANALISI IDENTICHE ALLA SCHERMATA
      this.generateSezioniAnalisi(options);
      
      console.log('✅ PDF IDENTICO alla schermata generato');
      return Buffer.from(this.doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }

  private generateHeaderBlu(project: FeasibilityProject) {
    // Header blu identico alla schermata
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(0, 0, 210, 40, 'F');
    
    // Titolo "Studio di Fattibilità" centrato
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Studio di Fattibilità', 105, 25, { align: 'center' });
    
    // Sottotitolo "Analisi completa dell'investimento immobiliare"
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Analisi completa dell\'investimento immobiliare', 105, 35, { align: 'center' });
    
    // Nome progetto "Ciliegie"
    this.doc.setTextColor(17, 24, 39); // Gray-900
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(project.name || 'Progetto', 20, 70);
    
    // Indirizzo "Via delle Ciliegie, 157 Roma"
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text(project.address || 'Indirizzo non specificato', 20, 85);
    
    // Tag "PIANIFICAZIONE"
    this.generateTagPianificazione(170, 70);
    
    // Data "Creato il 24/08/2025"
    this.doc.setFontSize(12);
    this.doc.text('Creato il', 170, 85);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(new Date().toLocaleDateString('it-IT'), 170, 95);
  }

  private generateTagPianificazione(x: number, y: number) {
    // Sfondo grigio chiaro
    this.doc.setFillColor(243, 244, 246); // Gray-100
    this.doc.roundedRect(x, y - 5, 35, 15, 3, 3, 'F');
    
    // Bordo grigio
    this.doc.setDrawColor(209, 213, 219); // Gray-300
    this.doc.roundedRect(x, y - 5, 35, 15, 3, 3, 'S');
    
    // Testo "PIANIFICAZIONE"
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text('PIANIFICAZIONE', x + 17.5, y + 2, { align: 'center' });
  }

  private generateMetricheCards(options: UrbanovaPDFOptions) {
    const startY = 110;
    const cardWidth = 85;
    const cardHeight = 60;
    const gap = 10;
    
    // Card 1: Investimento Totale (Top-Left)
    this.generateCard(
      'Investimento Totale',
      '€' + (options.calculatedCosts.total || 0).toLocaleString('it-IT'),
      '📊',
      20,
      startY,
      cardWidth,
      cardHeight,
      '#3B82F6' // Blue
    );
    
    // Card 2: ROI Atteso (Top-Right)
    this.generateCard(
      'ROI Atteso',
      (options.calculatedResults.roi || 0).toFixed(1) + '%',
      '🎯',
      20 + cardWidth + gap,
      startY,
      cardWidth,
      cardHeight,
      '#10B981' // Green
    );
    
    // Card 3: Payback Period (Bottom-Left)
    this.generateCard(
      'Payback Period',
      (options.calculatedResults.paybackPeriod || 0).toFixed(1) + ' anni',
      '⏰',
      20,
      startY + cardHeight + gap,
      cardWidth,
      cardHeight,
      '#8B5CF6' // Purple
    );
    
    // Card 4: NPV (Bottom-Right)
    this.generateCard(
      'NPV',
      '€' + (options.calculatedResults.profit || 0).toLocaleString('it-IT'),
      '📄',
      20 + cardWidth + gap,
      startY + cardHeight + gap,
      cardWidth,
      cardHeight,
      '#F59E0B' // Orange
    );
  }

  private generateCard(title: string, value: string, icon: string, x: number, y: number, width: number, height: number, color: string) {
    // Sfondo bianco
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, width, height, 'F');
    
    // Bordo grigio chiaro
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, width, height, 'S');
    
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

  private generateSezioniAnalisi(options: UrbanovaPDFOptions) {
    const startY = 250;
    
    // Sezione Analisi del Rischio
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('🎯 Analisi del Rischio', 20, startY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('Livello di Rischio: ' + this.getRiskLevel(options.calculatedResults.margin), 20, startY + 15);
    this.doc.text('Tasso Interno di Rendimento: ' + (options.calculatedResults.roi || 0).toFixed(1) + '%', 20, startY + 30);
    
    // Sezione Trend di Mercato
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('📈 Trend di Mercato', 20, startY + 60);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
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
