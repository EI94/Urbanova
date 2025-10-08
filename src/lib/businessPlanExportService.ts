/**
 * 📄 BUSINESS PLAN EXPORT SERVICE
 * 
 * Servizio per export Business Plan in PDF ed Excel
 * Con design professionale e leggibile
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BusinessPlanInput, BusinessPlanOutput, ScenarioComparison } from './businessPlanService';

class BusinessPlanExportService {
  
  /**
   * 📄 EXPORT PDF - ONE PAGER PROFESSIONALE
   */
  async exportToPDF(
    input: BusinessPlanInput,
    outputs: BusinessPlanOutput[],
    comparison?: ScenarioComparison
  ): Promise<Blob> {
    console.log('📄 [Export] Generazione PDF Business Plan...');
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Helper per formattazione
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(Math.round(num));
    };
    
    // ============================================================================
    // HEADER
    // ============================================================================
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue-600
    doc.text('BUSINESS PLAN', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.text(input.projectName, 105, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(input.location || 'Località non specificata', 105, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // ============================================================================
    // SCENARIO MIGLIORE (se comparison disponibile)
    // ============================================================================
    if (comparison && comparison.ranking.length > 0) {
      const bestScenario = outputs.find(
        o => o.scenarioId === comparison.ranking[0].scenarioId
      )!;
      
      doc.setFillColor(16, 185, 129); // Green-500
      doc.rect(15, yPosition, 180, 12, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('SCENARIO MIGLIORE', 20, yPosition + 8);
      
      doc.setFontSize(10);
      doc.text(bestScenario.scenarioName, 160, yPosition + 8);
      
      yPosition += 20;
      
      // Metriche principali in boxes
      const metrics = [
        { label: 'VAN', value: `€${formatNumber(bestScenario.metrics.npv)}` },
        { label: 'TIR', value: `${bestScenario.metrics.irr.toFixed(1)}%` },
        { label: 'Margine', value: `${bestScenario.summary.marginPercentage.toFixed(1)}%` },
        { label: 'Payback', value: `${bestScenario.metrics.payback.toFixed(1)} anni` }
      ];
      
      let xPos = 15;
      metrics.forEach((metric) => {
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.rect(xPos, yPosition, 42, 20);
        
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.text(metric.label, xPos + 21, yPosition + 8, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setTextColor(17, 24, 39); // Gray-900
        doc.text(metric.value, xPos + 21, yPosition + 15, { align: 'center' });
        
        xPos += 45;
      });
      
      yPosition += 30;
    }
    
    // ============================================================================
    // CONFRONTO SCENARI
    // ============================================================================
    if (outputs.length > 1) {
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99);
      doc.text('Confronto Scenari', 15, yPosition);
      yPosition += 8;
      
      const tableData = outputs.map(output => [
        output.scenarioName,
        `€${formatNumber(output.metrics.npv)}`,
        `${output.metrics.irr.toFixed(1)}%`,
        `${output.summary.marginPercentage.toFixed(1)}%`,
        `${output.metrics.payback.toFixed(1)}y`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Scenario', 'VAN', 'TIR', 'Margine', 'Payback']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // ============================================================================
    // CASH FLOW (primo scenario)
    // ============================================================================
    if (outputs.length > 0 && yPosition < 250) {
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99);
      doc.text(`Cash Flow: ${outputs[0].scenarioName}`, 15, yPosition);
      yPosition += 8;
      
      const cashFlowData = outputs[0].cashFlow.map(cf => [
        cf.period.toUpperCase(),
        cf.revenue > 0 ? `€${formatNumber(cf.revenue)}` : '-',
        cf.constructionCost > 0 ? `-€${formatNumber(cf.constructionCost)}` : '-',
        cf.landPayment > 0 ? `-€${formatNumber(cf.landPayment)}` : '-',
        cf.netCashFlow >= 0 ? `+€${formatNumber(cf.netCashFlow)}` : `-€${formatNumber(Math.abs(cf.netCashFlow))}`,
        cf.cumulativeCashFlow >= 0 ? `+€${formatNumber(cf.cumulativeCashFlow)}` : `-€${formatNumber(Math.abs(cf.cumulativeCashFlow))}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Periodo', 'Ricavi', 'Costruzione', 'Terreno', 'CF Netto', 'CF Cumul.']],
        body: cashFlowData,
        theme: 'striped',
        headStyles: {
          fillColor: [139, 92, 246],
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'right', fontStyle: 'bold' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // ============================================================================
    // NUOVA PAGINA: LEVE DI NEGOZIAZIONE
    // ============================================================================
    if (outputs.some(o => o.negotiationLevers.length > 0)) {
      doc.addPage();
      yPosition = 20;
      
      doc.setFontSize(18);
      doc.setTextColor(139, 92, 246); // Purple-600
      doc.text('LEVE DI NEGOZIAZIONE', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      outputs.forEach(output => {
        if (output.negotiationLevers.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(75, 85, 99);
          doc.text(output.scenarioName, 15, yPosition);
          yPosition += 8;
          
          output.negotiationLevers.forEach(lever => {
            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128);
            doc.text(`• ${lever.description}`, 20, yPosition);
            yPosition += 6;
            
            doc.setFontSize(9);
            doc.setTextColor(139, 92, 246);
            doc.text(`  ${lever.explanation}`, 25, yPosition);
            yPosition += 8;
          });
          
          yPosition += 5;
        }
      });
    }
    
    // ============================================================================
    // FOOTER
    // ============================================================================
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generato da Urbanova • ${new Date().toLocaleDateString('it-IT')} • Pagina ${i} di ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
    }
    
    // Return as Blob
    return doc.output('blob');
  }
  
  /**
   * 📊 EXPORT EXCEL - DATI COMPLETI
   */
  async exportToExcel(
    input: BusinessPlanInput,
    outputs: BusinessPlanOutput[]
  ): Promise<string> {
    console.log('📊 [Export] Generazione Excel Business Plan...');
    
    // Genera CSV (Excel-compatible)
    let csv = '\uFEFF'; // BOM per UTF-8
    
    // ============================================================================
    // HEADER
    // ============================================================================
    csv += `BUSINESS PLAN - ${input.projectName}\n`;
    csv += `Località: ${input.location || 'N/A'}\n`;
    csv += `Data: ${new Date().toLocaleDateString('it-IT')}\n`;
    csv += '\n';
    
    // ============================================================================
    // RIEPILOGO SCENARI
    // ============================================================================
    csv += 'RIEPILOGO SCENARI\n';
    csv += 'Scenario;VAN (€);TIR (%);Margine (%);Payback (anni);DSCR Min;Ricavi Tot;Costi Tot;Utile\n';
    
    outputs.forEach(output => {
      csv += `${output.scenarioName};`;
      csv += `${output.metrics.npv.toFixed(0)};`;
      csv += `${output.metrics.irr.toFixed(2)};`;
      csv += `${output.summary.marginPercentage.toFixed(2)};`;
      csv += `${output.metrics.payback.toFixed(2)};`;
      csv += `${output.metrics.dscr.min.toFixed(2)};`;
      csv += `${output.summary.totalRevenue.toFixed(0)};`;
      csv += `${output.summary.totalCosts.toFixed(0)};`;
      csv += `${output.summary.profit.toFixed(0)}\n`;
    });
    
    csv += '\n';
    
    // ============================================================================
    // CASH FLOW PER SCENARIO
    // ============================================================================
    outputs.forEach(output => {
      csv += `\nCASH FLOW - ${output.scenarioName}\n`;
      csv += 'Periodo;Mesi;Ricavi;Costruzione;Soft Costs;Terreno;Interessi;CF Netto;CF Cumulato\n';
      
      output.cashFlow.forEach(cf => {
        csv += `${cf.period};`;
        csv += `${cf.months};`;
        csv += `${cf.revenue.toFixed(0)};`;
        csv += `${cf.constructionCost.toFixed(0)};`;
        csv += `${cf.softCosts.toFixed(0)};`;
        csv += `${cf.landPayment.toFixed(0)};`;
        csv += `${cf.interestAndFees.toFixed(0)};`;
        csv += `${cf.netCashFlow.toFixed(0)};`;
        csv += `${cf.cumulativeCashFlow.toFixed(0)}\n`;
      });
    });
    
    csv += '\n';
    
    // ============================================================================
    // LEVE DI NEGOZIAZIONE
    // ============================================================================
    csv += '\nLEVE DI NEGOZIAZIONE\n';
    csv += 'Scenario;Tipo;Descrizione;Valore Attuale;Valore Target;Impatto VAN;Spiegazione\n';
    
    outputs.forEach(output => {
      output.negotiationLevers.forEach(lever => {
        csv += `${output.scenarioName};`;
        csv += `${lever.type.replace(/_/g, ' ')};`;
        csv += `"${lever.description}";`;
        csv += `${lever.currentValue.toFixed(0)};`;
        csv += `${lever.targetValue.toFixed(0)};`;
        csv += `${lever.deltaImpact.toFixed(0)};`;
        csv += `"${lever.explanation}"\n`;
      });
    });
    
    csv += '\n';
    
    // ============================================================================
    // ASSUNZIONI
    // ============================================================================
    if (outputs.length > 0) {
      csv += '\nASSUNZIONI CHIAVE\n';
      outputs[0].keyAssumptions.forEach(assumption => {
        csv += `"${assumption}"\n`;
      });
    }
    
    // Return CSV as data URL
    return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  }
  
  /**
   * 📋 EXPORT TERM SHEET - CONDIZIONI TRATTATIVA
   */
  async exportTermSheet(
    input: BusinessPlanInput,
    selectedScenario: BusinessPlanOutput,
    comparison?: ScenarioComparison
  ): Promise<Blob> {
    console.log('📋 [Export] Generazione Term Sheet...');
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Purple-600
    doc.text('TERM SHEET', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.text(input.projectName, 105, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Scenario selezionato
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(`Scenario: ${selectedScenario.scenarioName}`, 15, yPosition);
    yPosition += 10;
    
    // Condizioni terreno
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text('CONDIZIONI TERRENO:', 15, yPosition);
    yPosition += 8;
    
    const scenario = input.landScenarios.find(s => s.id === selectedScenario.scenarioId);
    if (scenario) {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      if (scenario.type === 'CASH') {
        doc.text(`• Pagamento cash upfront: €${formatNumber(scenario.upfrontPayment || 0)}`, 20, yPosition);
      } else if (scenario.type === 'PERMUTA') {
        doc.text(`• Permuta: ${scenario.unitsInPermuta} unità`, 20, yPosition);
        yPosition += 6;
        doc.text(`• Contributo cash: €${formatNumber(scenario.cashContribution || 0)} a ${scenario.cashContributionPeriod}`, 20, yPosition);
      } else if (scenario.type === 'DEFERRED_PAYMENT') {
        doc.text(`• Pagamento differito: €${formatNumber(scenario.deferredPayment || 0)}`, 20, yPosition);
        yPosition += 6;
        doc.text(`• Scadenza: ${scenario.deferredPaymentPeriod}`, 20, yPosition);
      }
      
      yPosition += 10;
    }
    
    // Metriche chiave
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text('METRICHE FINANZIARIE:', 15, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    
    const metricsData = [
      `VAN: €${formatNumber(selectedScenario.metrics.npv)}`,
      `TIR: ${selectedScenario.metrics.irr.toFixed(1)}%`,
      `Margine: ${selectedScenario.summary.marginPercentage.toFixed(1)}%`,
      `Payback: ${selectedScenario.metrics.payback.toFixed(1)} anni`,
      selectedScenario.metrics.dscr.min < 999 ? `DSCR: ${selectedScenario.metrics.dscr.min.toFixed(2)}x` : null
    ].filter(Boolean);
    
    metricsData.forEach(metric => {
      if (metric) {
        doc.text(`• ${metric}`, 20, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 10;
    
    // Leve di negoziazione (top 3)
    if (selectedScenario.negotiationLevers.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text('LEVE DI NEGOZIAZIONE:', 15, yPosition);
      yPosition += 8;
      
      doc.setFontSize(9);
      doc.setTextColor(139, 92, 246);
      
      selectedScenario.negotiationLevers.slice(0, 3).forEach(lever => {
        const wrappedText = doc.splitTextToSize(`• ${lever.explanation}`, 175);
        doc.text(wrappedText, 20, yPosition);
        yPosition += (wrappedText.length * 6) + 3;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Term Sheet generato da Urbanova • ${new Date().toLocaleDateString('it-IT')}`,
      105,
      285,
      { align: 'center' }
    );
    
    return doc.output('blob');
  }
  
  /**
   * 💾 DOWNLOAD FILE
   */
  downloadFile(blob: Blob | string, filename: string): void {
    let url: string;
    
    if (typeof blob === 'string') {
      // CSV data URL
      url = blob;
    } else {
      // Blob
      url = URL.createObjectURL(blob);
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (typeof blob !== 'string') {
      URL.revokeObjectURL(url);
    }
  }
}

// Export singleton
export const businessPlanExportService = new BusinessPlanExportService();

