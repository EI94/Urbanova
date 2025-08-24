import jsPDF from 'jspdf';
import playwright from 'playwright-core';

export interface RealScreenshotOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class RealScreenshotService {
  async generatePDFFromRealScreenshot(options: RealScreenshotOptions): Promise<Buffer> {
    try {
      console.log('📸 Generazione PDF con SCREENSHOT REALE della schermata Vedi Progetto...');
      
      // GENERA SCREENSHOT REALE DELLA SCHERMATA VEDI PROGETTO
      const screenshot = await this.takeRealScreenshot(options);
      
      // INSERISCI SCREENSHOT NEL PDF
      return this.createPDFWithScreenshot(screenshot, options);
      
    } catch (error) {
      console.error('❌ Errore screenshot reale:', error);
      throw new Error('Impossibile generare screenshot reale. Contatta il supporto tecnico.');
    }
  }

  private async takeRealScreenshot(options: RealScreenshotOptions): Promise<Buffer> {
    try {
      console.log('🔄 Generazione screenshot reale della schermata Vedi Progetto...');
      
      // GENERA HTML PERFETTO IDENTICO ALLA SCHERMATA VEDI PROGETTO
      const htmlContent = this.generatePerfectVediProgettoHTML(options);
      
      // AVVIA PLAYWRIGHT PER SCREENSHOT REALE
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
      
      // IMPOSTA VIEWPORT PER SCHERMATA PERFETTA
      await page.setViewportSize({ width: 1200, height: 1600 });
      
      // CARICA HTML PERFETTO
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });
      
      // ASPETTA RENDERING PERFETTO
      await page.waitForTimeout(3000);
      
      // SCREENSHOT PERFETTO DELLA SCHERMATA VEDI PROGETTO
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        quality: 100
      });
      
      await browser.close();
      
      console.log('✅ Screenshot reale della schermata Vedi Progetto completato');
      return screenshot as Buffer;
      
    } catch (error) {
      console.error('❌ Errore screenshot reale:', error);
      throw error;
    }
  }

  private createPDFWithScreenshot(screenshot: Buffer, options: RealScreenshotOptions): Buffer {
    try {
      console.log('🔄 Creazione PDF con screenshot reale...');
      
      // CREA PDF A4
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // CONVERTI SCREENSHOT IN BASE64
      const base64Image = screenshot.toString('base64');
      
      // CALCOLA DIMENSIONI PER MANTENERE ASPECT RATIO
      const imgWidth = pageWidth - 20; // 10mm margini
      const imgHeight = (imgWidth * 1600) / 1200; // Mantieni proporzioni originali
      
      // INSERISCI SCREENSHOT REALE NEL PDF
      doc.addImage(
        `data:image/png;base64,${base64Image}`,
        'PNG',
        10, // x
        10, // y
        imgWidth,
        imgHeight
      );
      
      console.log('✅ PDF con screenshot reale generato');
      return Buffer.from(doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('❌ Errore creazione PDF con screenshot:', error);
      throw error;
    }
  }

  private generatePerfectVediProgettoHTML(options: RealScreenshotOptions): string {
    const { project, calculatedCosts, calculatedRevenues, calculatedResults } = options;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Studio di Fattibilità - ${project.name || 'Progetto'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            color: #1f2937;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          /* HEADER BLU PERFETTO IDENTICO ALLA SCHERMATA */
          .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 40px;
            border-radius: 16px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .header-left h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .header-left p {
            font-size: 20px;
            opacity: 0.9;
          }
          
          .tag-pianificazione {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* GRIGLIA METRICHE PERFETTA IDENTICA ALLA SCHERMATA */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .metric-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 2px solid #e5e7eb;
          }
          
          .metric-header {
            padding: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
          }
          
          .metric-header.green { background: #10b981; }
          .metric-header.blue { background: #3b82f6; }
          .metric-header.purple { background: #8b5cf6; }
          
          .metric-value {
            padding: 30px 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
          }
          
          /* SEZIONI ANALISI PERFETTE IDENTICHE ALLA SCHERMATA */
          .section {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            overflow: hidden;
          }
          
          .section-header {
            background: #f3f4f6;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
          }
          
          .section-content {
            padding: 20px;
          }
          
          .data-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .data-row:last-child {
            border-bottom: none;
          }
          
          .data-label {
            color: #6b7280;
            font-weight: 500;
          }
          
          .data-value {
            color: #1f2937;
            font-weight: bold;
          }
          
          /* RESPONSIVE PER SCREENSHOT PERFETTO */
          @media (max-width: 768px) {
            .metrics-grid {
              grid-template-columns: 1fr;
            }
            
            .header {
              flex-direction: column;
              text-align: center;
              gap: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER BLU PERFETTO IDENTICO ALLA SCHERMATA -->
          <div class="header">
            <div class="header-left">
              <h1>URBANOVA</h1>
              <p>${project.name || 'Studio di Fattibilità'}</p>
            </div>
            <div class="tag-pianificazione">PIANIFICAZIONE</div>
          </div>
          
          <!-- GRIGLIA METRICHE PERFETTA IDENTICA ALLA SCHERMATA -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header green">Utile Netto</div>
              <div class="metric-value">€${calculatedResults?.utileNetto?.toLocaleString() || '0'}</div>
            </div>
            <div class="metric-card">
              <div class="metric-header blue">ROI</div>
              <div class="metric-value">${calculatedResults?.roi?.toFixed(1) || '0.0'}%</div>
            </div>
            <div class="metric-card">
              <div class="metric-header purple">Marginalità</div>
              <div class="metric-value">${calculatedResults?.marginalita?.toFixed(1) || '0'}%</div>
            </div>
          </div>
          
          <!-- SEZIONE DATI BASE PROGETTO PERFETTA IDENTICA ALLA SCHERMATA -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">DATI BASE PROGETTO</div>
            </div>
            <div class="section-content">
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
          </div>
          
          <!-- SEZIONE COSTI DI COSTRUZIONE PERFETTA IDENTICA ALLA SCHERMATA -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">COSTI DI COSTRUZIONE</div>
            </div>
            <div class="section-content">
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
          </div>
          
          <!-- SEZIONE RICAVI PERFETTA IDENTICA ALLA SCHERMATA -->
          <div class="section">
            <div class="section-header">
              <div class="section-title">RICAVI</div>
            </div>
            <div class="section-content">
              <div class="data-row">
                <span class="data-label">Ricavo Totale</span>
                <span class="data-value">€${calculatedRevenues?.ricavoTotale?.toLocaleString() || '0'}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Utile Lordo</span>
                <span class="data-value">€${calculatedRevenues?.utileLordo?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const realScreenshotService = new RealScreenshotService();
