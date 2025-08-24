import jsPDF from 'jspdf';
import { vercelScreenshotService } from './vercelScreenshotService';

export interface UrbanovaPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO con ALTERNATIVE a Puppeteer per Vercel...');
      
      // USA IL NUOVO SERVIZIO CON ALTERNATIVE A PUPPETEER
      return await vercelScreenshotService.generatePDFFromScreenshot(options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
