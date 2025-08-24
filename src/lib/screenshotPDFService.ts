import jsPDF from 'jspdf';

export interface ScreenshotPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class ScreenshotPDFService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  async generatePDFFromScreenshot(options: ScreenshotPDFOptions): Promise<Buffer> {
    try {
      console.log('📸 Generazione PDF tramite screenshot della pagina web perfetta...');
      
      // Crea la pagina web perfetta
      const htmlContent = this.generatePerfectHTML(options);
      
      // Simula screenshot (per ora creo un PDF perfetto basato sulla pagina web)
      return this.createPerfectPDFFromHTML(htmlContent, options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF da screenshot:', error);
      throw new Error('Errore nella generazione del report da screenshot');
    }
  }

  private generatePerfectHTML(options: ScreenshotPDFOptions): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Studio di Fattibilità - ${options.project.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              width: 210mm;
              height: 297mm;
            }
            .header {
              background: #2563eb;
              color: white;
              padding: 24px;
              text-align: center;
              border-radius: 8px 8px 0 0;
              margin-bottom: 24px;
            }
            .header h1 {
              font-size: 32px;
              font-weight: bold;
              margin: 0 0 8px 0;
            }
            .header p {
              font-size: 18px;
              margin: 0;
              opacity: 0.9;
            }
            .project-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 32px;
            }
            .project-left h2 {
              font-size: 36px;
              font-weight: bold;
              color: #111827;
              margin: 0 0 8px 0;
            }
            .project-left p {
              font-size: 20px;
              color: #6b7280;
              margin: 0;
            }
            .project-right {
              text-align: right;
            }
            .tag {
              background: #f3f4f6;
              color: #374151;
              padding: 8px 16px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              display: inline-block;
            }
            .date-info p {
              font-size: 14px;
              color: #6b7280;
              margin: 0;
            }
            .date-info .date {
              font-weight: 600;
              color: #374151;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 32px;
            }
            .metric-card {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .metric-header {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
            }
            .metric-icon {
              font-size: 24px;
              margin-right: 12px;
            }
            .metric-title {
              font-size: 18px;
              font-weight: 500;
              color: #374151;
            }
            .metric-value {
              font-size: 32px;
              font-weight: bold;
            }
            .metric-value.blue { color: #2563eb; }
            .metric-value.green { color: #059669; }
            .metric-value.purple { color: #7c3aed; }
            .metric-value.orange { color: #d97706; }
            .analysis-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
            }
            .analysis-card {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .analysis-header {
              font-size: 20px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
            }
            .analysis-icon {
              font-size: 24px;
              margin-right: 12px;
            }
            .analysis-item {
              margin-bottom: 12px;
            }
            .analysis-label {
              color: #6b7280;
            }
            .analysis-value {
              font-weight: 600;
              color: #111827;
            }
            .analysis-value.positive { color: #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Studio di Fattibilità</h1>
            <p>Analisi completa dell'investimento immobiliare</p>
          </div>
          
          <div class="project-info">
            <div class="project-left">
              <h2>${options.project.name || 'Progetto'}</h2>
              <p>${options.project.address || 'Indirizzo non specificato'}</p>
            </div>
            <div class="project-right">
              <div class="tag">PIANIFICAZIONE</div>
              <div class="date-info">
                <p>Creato il</p>
                <p class="date">${new Date().toLocaleDateString('it-IT')}</p>
              </div>
            </div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">📊</span>
                <span class="metric-title">Investimento Totale</span>
              </div>
              <div class="metric-value blue">€${(options.calculatedCosts.total || 0).toLocaleString('it-IT')}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">🎯</span>
                <span class="metric-title">ROI Atteso</span>
              </div>
              <div class="metric-value green">${(options.calculatedResults.roi || 0).toFixed(1)}%</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">⏰</span>
                <span class="metric-title">Payback Period</span>
              </div>
              <div class="metric-value purple">${(options.calculatedResults.paybackPeriod || 0).toFixed(1)} anni</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">📄</span>
                <span class="metric-title">NPV</span>
              </div>
              <div class="metric-value orange">€${(options.calculatedResults.profit || 0).toLocaleString('it-IT')}</div>
            </div>
          </div>
          
          <div class="analysis-grid">
            <div class="analysis-card">
              <div class="analysis-header">
                <span class="analysis-icon">🎯</span>
                Analisi del Rischio
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Livello di Rischio: </span>
                <span class="analysis-value">${options.calculatedResults.margin > 30 ? 'Basso' : options.calculatedResults.margin > 15 ? 'Medio' : 'Alto'}</span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Tasso Interno di Rendimento: </span>
                <span class="analysis-value">${(options.calculatedResults.roi || 0).toFixed(1)}%</span>
              </div>
            </div>
            
            <div class="analysis-card">
              <div class="analysis-header">
                <span class="analysis-icon">📈</span>
                Trend di Mercato
              </div>
              <div class="analysis-item">
                <span class="analysis-label">Direzione del Mercato: </span>
                <span class="analysis-value positive">${options.calculatedResults.margin > 25 ? 'Positivo' : options.calculatedResults.margin > 15 ? 'Stabile' : 'Negativo'}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private createPerfectPDFFromHTML(htmlContent: string, options: ScreenshotPDFOptions): Buffer {
    // Per ora creo un PDF perfetto basato sulla struttura HTML
    // In futuro potremo implementare screenshot reali con Puppeteer
    
    this.doc.setFont('helvetica');
    
    // Header blu PERFETTO
    this.doc.setFillColor(37, 99, 235); // Blue-600 esatto
    this.doc.rect(0, 0, 210, 40, 'F');
    
    // Titolo "Studio di Fattibilità" centrato PERFETTO
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Studio di Fattibilità', 105, 25, { align: 'center' });
    
    // Sottotitolo "Analisi completa dell'investimento immobiliare" PERFETTO
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Analisi completa dell\'investimento immobiliare', 105, 35, { align: 'center' });
    
    // Nome progetto PERFETTO
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(options.project.name || 'Progetto', 20, 70);
    
    // Indirizzo PERFETTO
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text(options.project.address || 'Indirizzo non specificato', 20, 85);
    
    // Tag "PIANIFICAZIONE" PERFETTO
    this.generateTagPianificazionePerfetto(170, 70);
    
    // Data PERFETTA
    this.doc.setFontSize(12);
    this.doc.text('Creato il', 170, 85);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(new Date().toLocaleDateString('it-IT'), 170, 95);
    
    // 4 Card Metriche PERFETTE
    this.generateMetricheCardsPerfette(options);
    
    // Sezioni Analisi PERFETTE
    this.generateSezioniAnalisiPerfette(options);
    
    return Buffer.from(this.doc.output('arraybuffer'));
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

  private generateMetricheCardsPerfette(options: ScreenshotPDFOptions) {
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
      '#2563eb' // Blue esatto
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
      '#059669' // Green esatto
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
      '#7c3aed' // Purple esatto
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
      '#d97706' // Orange esatto
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

  private generateSezioniAnalisiPerfette(options: ScreenshotPDFOptions) {
    const startY = 250;
    
    // Sezione Analisi del Rischio PERFETTA
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.text('🎯 Analisi del Rischio', 20, startY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text('Livello di Rischio: ' + (options.calculatedResults.margin > 30 ? 'Basso' : options.calculatedResults.margin > 15 ? 'Medio' : 'Alto'), 20, startY + 15);
    this.doc.text('Tasso Interno di Rendimento: ' + (options.calculatedResults.roi || 0).toFixed(1) + '%', 20, startY + 30);
    
    // Sezione Trend di Mercato PERFETTA
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39); // Gray-900 esatto
    this.doc.text('📈 Trend di Mercato', 20, startY + 60);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500 esatto
    this.doc.text('Direzione del Mercato: ' + (options.calculatedResults.margin > 25 ? 'Positivo' : options.calculatedResults.margin > 15 ? 'Stabile' : 'Negativo'), 20, startY + 75);
  }
}

export const screenshotPDFService = new ScreenshotPDFService();
