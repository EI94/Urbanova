import jsPDF from 'jspdf';
import { realScreenshotService } from './realScreenshotService';

export interface UrbanovaPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO tramite SCREENSHOT REALI...');
      
      // USA IL SISTEMA SCREENSHOT REALI CON PUPPETEER
      return await realScreenshotService.generatePDFFromRealScreenshot(options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
