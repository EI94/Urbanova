import jsPDF from 'jspdf';
import { vercelWorkingScreenshotService } from './vercelWorkingScreenshotService';

export interface UrbanovaPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO con SCREENSHOT ALTERNATIVO per Vercel...');
      
      // USA IL SERVIZIO DI SCREENSHOT ALTERNATIVO CHE FUNZIONA SU VERCEL
      return await vercelWorkingScreenshotService.generatePDFFromScreenshot(options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
