import jsPDF from 'jspdf';
import { screenshotPDFService } from './screenshotPDFService';

export interface UrbanovaPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class UrbanovaPDFService {
  async generateUrbanovaStyleReport(options: UrbanovaPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 Generazione PDF PERFETTO tramite sistema screenshot...');
      
      // USA IL NUOVO SISTEMA SCREENSHOT CHE CREA PDF PERFETTI
      return await screenshotPDFService.generatePDFFromScreenshot(options);
      
    } catch (error) {
      console.error('❌ Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del report');
    }
  }
}

export const urbanovaPDFService = new UrbanovaPDFService();
