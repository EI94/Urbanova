import jsPDF from 'jspdf';

export interface PerfectPDFOptions {
  project: any;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export class PerfectPDFService {
  async generatePerfectPDF(options: PerfectPDFOptions): Promise<Buffer> {
    try {
      console.log('🎨 GENERAZIONE PDF PERFETTO - Identico alla schermata Vedi Progetto...');

      // CREA PDF PERFETTO CON JSPDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // CONFIGURAZIONE INIZIALE
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      let yPosition = margin;

      // HEADER URBANOVA
      pdf.setFillColor(59, 130, 246); // #3b82f6
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🏗️ URBANOVA', pageWidth / 2, 25, { align: 'center' });

      yPosition = 50;

      // TITOLO REPORT
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Studio di Fattibilità', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 20;

      // INFORMAZIONI PROGETTO
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📋 Dati Base Progetto', margin, yPosition);

      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      if (options.project) {
        const project = options.project;

        // Nome progetto
        if (project.name) {
          pdf.text(`Nome Progetto: ${project.name}`, margin, yPosition);
          yPosition += 8;
        }

        // Località
        if (project.location) {
          pdf.text(`Località: ${project.location}`, margin, yPosition);
          yPosition += 8;
        }

        // Superficie totale
        if (project.totalArea) {
          pdf.text(`Superficie Totale: ${project.totalArea} m²`, margin, yPosition);
          yPosition += 8;
        }

        // Numero unità
        if (project.units) {
          pdf.text(`Numero Unità: ${project.units}`, margin, yPosition);
          yPosition += 8;
        }

        // Prezzo vendita
        if (project.salePrice) {
          pdf.text(
            `Prezzo Vendita: €${project.salePrice.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }
      }

      yPosition += 10;

      // COSTI DI COSTRUZIONE
      if (options.calculatedCosts) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('💰 Costi di Costruzione', margin, yPosition);

        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const costs = options.calculatedCosts;

        if (costs.totalConstructionCost) {
          pdf.text(
            `Costo Totale Costruzione: €${costs.totalConstructionCost.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }

        if (costs.costPerSquareMeter) {
          pdf.text(
            `Costo per m²: €${costs.costPerSquareMeter.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }

        if (costs.finishingCosts) {
          pdf.text(
            `Costi di Finitura: €${costs.finishingCosts.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }
      }

      yPosition += 10;

      // RICAVI
      if (options.calculatedRevenues) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('💵 Ricavi', margin, yPosition);

        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const revenues = options.calculatedRevenues;

        if (revenues.totalRevenue) {
          pdf.text(
            `Ricavo Totale: €${revenues.totalRevenue.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }

        if (revenues.revenuePerSquareMeter) {
          pdf.text(
            `Ricavo per m²: €${revenues.revenuePerSquareMeter.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }
      }

      yPosition += 10;

      // RISULTATI FINALI
      if (options.calculatedResults) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 Risultati Finali', margin, yPosition);

        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const results = options.calculatedResults;

        if (results.totalInvestment) {
          pdf.text(
            `Investimento Totale: €${results.totalInvestment.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }

        if (results.totalProfit) {
          pdf.text(
            `Profitto Totale: €${results.totalProfit.toLocaleString('it-IT')}`,
            margin,
            yPosition
          );
          yPosition += 8;
        }

        if (results.profitMargin) {
          pdf.text(`Margine di Profitto: ${results.profitMargin.toFixed(2)}%`, margin, yPosition);
          yPosition += 8;
        }

        if (results.roi) {
          pdf.text(`ROI: ${results.roi.toFixed(2)}%`, margin, yPosition);
          yPosition += 8;
        }
      }

      yPosition += 15;

      // FOOTER
      pdf.setFillColor(59, 130, 246); // #3b82f6
      pdf.rect(0, pageHeight - 30, pageWidth, 30, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        '🏗️ Urbanova AI - Analisi di Fattibilità Intelligente',
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' }
      );
      pdf.text('© 2024 Urbanova. Tutti i diritti riservati.', pageWidth / 2, pageHeight - 15, {
        align: 'center',
      });

      console.log('✅ PDF perfetto generato con successo!');

      // CONVERTI IN BUFFER
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      return pdfBuffer;
    } catch (error) {
      console.error('❌ Errore generazione PDF perfetto:', error);
      throw new Error('Errore nella generazione del PDF perfetto');
    }
  }
}

export const perfectPDFService = new PerfectPDFService();
