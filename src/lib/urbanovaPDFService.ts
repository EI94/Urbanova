import jsPDF from 'jspdf';
import { webScreenshotPDFService } from './webScreenshotPDFService';

export interface UrbanovaPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO con SCREENSHOT PAGINA WEB...');
      
      // USA IL SERVIZIO SCREENSHOT DELLA PAGINA WEB PERFETTA
      return await webScreenshotPDFService.generatePDFFromWebPage(options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
