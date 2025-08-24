import jsPDF from 'jspdf';
import playwright from 'playwright-core';

export interface VercelScreenshotOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class VercelScreenshotService {
  async generatePDFFromScreenshot(options: VercelScreenshotOptions): Promise<Buffer> {
    try {
      console.log('📸 Generazione PDF con ALTERNATIVE a Puppeteer per Vercel...');
      
      // PRIMO TENTATIVO: Playwright (alternativa a Puppeteer)
      try {
        console.log('🔄 Tentativo Playwright...');
        const screenshot = await this.takeScreenshotWithPlaywright(options);
        return this.convertScreenshotToPDF(screenshot, options);
      } catch (playwrightError) {
        console.log('❌ Playwright fallito, uso jsPDF perfetto...');
      }

      // SECONDO TENTATIVO: jsPDF perfetto (fallback garantito)
      console.log('🔄 Fallback: jsPDF perfetto...');
      return this.createPerfectPDFWithJsPDF(options);
      
    } catch (error) {
      console.error('❌ Errore critico screenshot:', error);
      throw new Error('Impossibile generare PDF. Contatta il supporto tecnico.');
    }
  }

  private async takeScreenshotWithPlaywright(options: VercelScreenshotOptions): Promise<Buffer> {
    try {
      console.log('🔄 Avvio Playwright per screenshot...');
      
      const htmlContent = this.generatePerfectHTML(options);
      
      const browser = await playwright.webkit.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      
      await page.setViewportSize({ width: 1200, height: 1600 });
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });
      
      await page.waitForTimeout(2000);
      
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true
      });
      
      await browser.close();
      
      console.log('✅ Screenshot Playwright completato');
      return screenshot as Buffer;
      
    } catch (error) {
      console.error('❌ Errore Playwright:', error);
      throw error;
    }
  }

  public createPerfectPDFWithJsPDF(options: VercelScreenshotOptions): Buffer {
    try {
      console.log('🔄 Creazione PDF perfetto con jsPDF...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica');
      
      this.generateHeaderBluPerfetto(doc, options.project);
      this.generateMetricheCardsPerfette(doc, options);
      this.generateSezioniAnalisiPerfette(doc, options);
      
      console.log('✅ PDF perfetto con jsPDF generato');
      return Buffer.from(doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore PDF jsPDF:', error);
      throw error;
    }
  }

  private convertScreenshotToPDF(screenshot: Buffer, options: VercelScreenshotOptions): Buffer {
    try {
      console.log('🔄 Conversione screenshot in PDF...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const base64Image = screenshot.toString('base64');
      
      const imgWidth = pageWidth - 20;
      const imgHeight = (screenshot.length / screenshot.length) * imgWidth;
      
      doc.addImage(
        `data:image/png;base64,${base64Image}`,
        'PNG',
        10,
        10,
        imgWidth,
        imgHeight
      );
      
      console.log('✅ PDF da screenshot generato');
      return Buffer.from(doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore conversione screenshot in PDF:', error);
      throw error;
    }
  }

  private generateHeaderBluPerfetto(doc: jsPDF, project: any) {
    // Header blu perfetto
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo Urbanova
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('URBANOVA', 20, 25);
    
    // Nome progetto
    doc.setFontSize(16);
    doc.text(project.name || 'Studio di Fattibilità', 20, 35);
    
    // Tag pianificazione
    this.generateTagPianificazionePerfetto(doc, 150, 25);
  }

  private generateTagPianificazionePerfetto(doc: jsPDF, x: number, y: number) {
    doc.setFillColor(34, 197, 94);
    doc.rect(x, y - 5, 50, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PIANIFICAZIONE', x + 5, y + 5);
  }

  private generateMetricheCardsPerfette(doc: jsPDF, options: VercelScreenshotOptions) {
    const { calculatedResults } = options;
    
    // Card Utile Netto
    this.generateCardPerfetta(
      doc, 
      'Utile Netto', 
      `€${calculatedResults?.utileNetto?.toLocaleString() || '0'}`, 
      '💰', 
      20, 
      60, 
      50, 
      30, 
      '#10B981'
    );
    
    // Card ROI
    this.generateCardPerfetta(
      doc, 
      'ROI', 
      `${calculatedResults?.roi?.toFixed(1) || '0'}%`, 
      '📈', 
      80, 
      60, 
      50, 
      30, 
      '#3B82F6'
    );
    
    // Card Marginalità
    this.generateCardPerfetta(
      doc, 
      'Marginalità', 
      `${calculatedResults?.marginalita?.toFixed(1) || '0'}%`, 
      '🎯', 
      140, 
      60, 
      50, 
      30, 
      '#8B5CF6'
    );
  }

  private generateCardPerfetta(doc: jsPDF, title: string, value: string, icon: string, x: number, y: number, width: number, height: number, color: string) {
    // Bordo card
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);
    
    // Sfondo colorato
    doc.setFillColor(color);
    doc.rect(x, y, width, 15, 'F');
    
    // Titolo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 5, y + 10);
    
    // Valore
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 5, y + 25);
    
    // Icona
    doc.setFontSize(16);
    doc.text(icon, x + width - 15, y + 10);
  }

  private generateSezioniAnalisiPerfette(doc: jsPDF, options: VercelScreenshotOptions) {
    const { project, calculatedCosts, calculatedRevenues } = options;
    
    let yPosition = 110;
    
    // Sezione Dati Base
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPosition, 170, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DATI BASE PROGETTO', 25, yPosition + 12);
    
    yPosition += 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Superficie Totale: ${project.superficieTotale || '0'} m²`, 25, yPosition);
    doc.text(`Numero Unità: ${project.numeroUnita || '0'}`, 25, yPosition + 8);
    doc.text(`Prezzo Vendita: €${project.prezzoVendita?.toLocaleString() || '0'}/m²`, 25, yPosition + 16);
    
    yPosition += 40;
    
    // Sezione Costi
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPosition, 170, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COSTI DI COSTRUZIONE', 25, yPosition + 12);
    
    yPosition += 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Costo Terreno: €${calculatedCosts?.costoTerreno?.toLocaleString() || '0'}`, 25, yPosition);
    doc.text(`Costo Costruzione: €${calculatedCosts?.costoCostruzione?.toLocaleString() || '0'}`, 25, yPosition + 8);
    doc.text(`Costo Totale: €${calculatedCosts?.costoTotale?.toLocaleString() || '0'}`, 25, yPosition + 16);
    
    yPosition += 40;
    
    // Sezione Ricavi
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPosition, 170, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RICAVI', 25, yPosition + 12);
    
    yPosition += 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ricavo Totale: €${calculatedRevenues?.ricavoTotale?.toLocaleString() || '0'}`, 25, yPosition);
    doc.text(`Utile Lordo: €${calculatedRevenues?.utileLordo?.toLocaleString() || '0'}`, 25, yPosition + 8);
  }

  private generatePerfectHTML(options: VercelScreenshotOptions): string {
    const { project, calculatedCosts, calculatedRevenues, calculatedResults } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Studio di Fattibilità - ${project.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            border: 2px solid #e5e7eb;
          }
          .metric-value {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
          }
          .metric-title {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .data-label {
            color: #6b7280;
            font-weight: 500;
          }
          .data-value {
            color: #1f2937;
            font-weight: bold;
          }
          .tag {
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 36px;">URBANOVA</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${project.name || 'Studio di Fattibilità'}</p>
          <span class="tag" style="margin-top: 15px; display: inline-block;">PIANIFICAZIONE</span>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card" style="border-color: #10b981;">
            <div class="metric-value" style="color: #10b981;">€${calculatedResults?.utileNetto?.toLocaleString() || '0'}</div>
            <div class="metric-title">Utile Netto</div>
          </div>
          <div class="metric-card" style="border-color: #3b82f6;">
            <div class="metric-value" style="color: #3b82f6;">${calculatedResults?.roi?.toFixed(1) || '0'}%</div>
            <div class="metric-title">ROI</div>
          </div>
          <div class="metric-card" style="border-color: #8b5cf6;">
            <div class="metric-value" style="color: #8b5cf6;">${calculatedResults?.marginalita?.toFixed(1) || '0'}%</div>
            <div class="metric-title">Marginalità</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">DATI BASE PROGETTO</div>
          <div class="data-row">
            <span class="data-label">Superficie Totale</span>
            <span class="data-value">${project.superficieTotale || '0'} m²</span>
          </div>
          <div class="data-row">
            <span class="data-label">Numero Unità</span>
            <span class="data-value">${project.numeroUnita || '0'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Prezzo Vendita</span>
            <span class="data-value">€${project.prezzoVendita?.toLocaleString() || '0'}/m²</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">COSTI DI COSTRUZIONE</div>
          <div class="data-row">
            <span class="data-label">Costo Terreno</span>
            <span class="data-value">€${calculatedCosts?.costoTerreno?.toLocaleString() || '0'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Costo Costruzione</span>
            <span class="data-value">€${calculatedCosts?.costoCostruzione?.toLocaleString() || '0'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Costo Totale</span>
            <span class="data-value">€${calculatedCosts?.costoTotale?.toLocaleString() || '0'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">RICAVI</div>
          <div class="data-row">
            <span class="data-label">Ricavo Totale</span>
            <span class="data-value">€${calculatedRevenues?.ricavoTotale?.toLocaleString() || '0'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Utile Lordo</span>
            <span class="data-value">€${calculatedRevenues?.utileLordo?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const vercelScreenshotService = new VercelScreenshotService();
