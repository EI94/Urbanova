import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FeasibilityAnalysis {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  totalInvestment: number;
  expectedROI: number;
  paybackPeriod: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  marketTrend: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  recommendations: string[];
  createdAt: string;
}

interface AIAnalysis {
  pros: string[];
  cons: string[];
  recommendation: string;
  strategies: string[];
}

export class PDFGeneratorService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  async generateFeasibilityReport(analysis: FeasibilityAnalysis, aiAnalysis: AIAnalysis): Promise<Buffer> {
    try {
      // Configurazione iniziale
      this.doc.setFont('helvetica');
      
      // Pagina 1: Header e Overview
      this.generateHeader(analysis);
      this.generateOverview(analysis);
      this.generateFinancialMetrics(analysis);
      
      // Nuova pagina per analisi AI
      this.doc.addPage();
      this.generateAIAnalysis(aiAnalysis);
      this.generateRecommendations(analysis);
      this.generateFooter();
      
      // Restituisci il PDF come buffer
      return Buffer.from(this.doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      throw new Error('Errore nella generazione del PDF');
    }
  }

  private generateHeader(analysis: FeasibilityAnalysis) {
    // Logo Urbanova (simulato con rettangolo)
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(20, 20, 40, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.text('URBANOVA', 25, 30);
    
    // Titolo principale
    this.doc.setTextColor(17, 24, 39); // Gray-900
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Studio di Fattibilità', 20, 50);
    
    // Sottotitolo
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray-500
    this.doc.text(analysis.title, 20, 65);
    
    // Informazioni progetto
    this.doc.setFontSize(12);
    this.doc.text(`Località: ${analysis.location}`, 20, 80);
    this.doc.text(`Tipo: ${analysis.propertyType}`, 20, 90);
    this.doc.text(`Data: ${new Date(analysis.createdAt).toLocaleDateString('it-IT')}`, 20, 100);
    
    // Linea separatrice
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.line(20, 110, 190, 110);
  }

  private generateOverview(analysis: FeasibilityAnalysis) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('Panoramica Progetto', 20, 130);
    
    // Box riassuntivo
    this.doc.setFillColor(249, 250, 251); // Gray-50
    this.doc.rect(20, 140, 170, 40, 'F');
    this.doc.setDrawColor(209, 213, 219); // Gray-300
    this.doc.rect(20, 140, 170, 40, 'S');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81); // Gray-700
    
    this.doc.text(`• Investimento totale: €${analysis.totalInvestment.toLocaleString('it-IT')}`, 25, 155);
    this.doc.text(`• ROI atteso: ${analysis.expectedROI.toFixed(1)}%`, 25, 165);
    this.doc.text(`• Periodo di recupero: ${analysis.paybackPeriod.toFixed(1)} anni`, 25, 175);
  }

  private generateFinancialMetrics(analysis: FeasibilityAnalysis) {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('Metriche Finanziarie', 20, 200);
    
    // Tabella metriche
    const tableData = [
      ['Metrica', 'Valore', 'Stato'],
      ['ROI Atteso', `${analysis.expectedROI.toFixed(1)}%`, this.getROIStatus(analysis.expectedROI)],
      ['NPV', `€${analysis.netPresentValue.toLocaleString('it-IT')}`, this.getNPVStatus(analysis.netPresentValue)],
      ['IRR', `${analysis.internalRateOfReturn.toFixed(1)}%`, this.getIRRStatus(analysis.internalRateOfReturn)],
      ['Rischio', this.getRiskLabel(analysis.riskLevel), this.getRiskColor(analysis.riskLevel)],
      ['Trend Mercato', this.getTrendLabel(analysis.marketTrend), this.getTrendColor(analysis.marketTrend)]
    ];
    
    autoTable(this.doc, {
      startY: 210,
      head: [['Metrica', 'Valore', 'Stato']],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      margin: { left: 20, right: 20 }
    });
  }

  private generateAIAnalysis(aiAnalysis: AIAnalysis) {
    // Header pagina 2
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('Analisi AI Integrata', 20, 30);
    
    // PRO dell'investimento
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(34, 197, 94); // Green-600
    this.doc.text('✅ PRO dell\'Investimento', 20, 50);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    
    aiAnalysis.pros.forEach((pro, index) => {
      this.doc.text(`• ${pro}`, 25, 65 + (index * 8));
    });
    
    // CONTRO dell'investimento
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(239, 68, 68); // Red-500
    this.doc.text('❌ CONTRO dell\'Investimento', 20, 100);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    
    aiAnalysis.cons.forEach((con, index) => {
      this.doc.text(`• ${con}`, 25, 115 + (index * 8));
    });
    
    // Raccomandazione finale
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue-600
    this.doc.text('🎯 Raccomandazione Finale', 20, 150);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    this.doc.text(aiAnalysis.recommendation, 25, 165);
    
    // Strategie
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(168, 85, 247); // Purple-500
    this.doc.text('🚀 Strategie per Massimizzare ROI', 20, 190);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    
    aiAnalysis.strategies.forEach((strategy, index) => {
      this.doc.text(`• ${strategy}`, 25, 205 + (index * 8));
    });
  }

  private generateRecommendations(analysis: FeasibilityAnalysis) {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('Raccomandazioni del Sistema', 20, 250);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 65, 81);
    
    analysis.recommendations.forEach((rec, index) => {
      this.doc.text(`• ${rec}`, 25, 265 + (index * 8));
    });
  }

  private generateFooter() {
    // Linea separatrice
    this.doc.setDrawColor(229, 231, 235);
    this.doc.line(20, 270, 190, 270);
    
    // Footer
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('Report generato da Urbanova - Piattaforma di Analisi Immobiliare', 20, 280);
    this.doc.text(`Data generazione: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}`, 20, 285);
    
    // Link Urbanova
    this.doc.setTextColor(59, 130, 246);
    this.doc.text('https://urbanova.com - Visualizza studio completo su Urbanova', 20, 290);
  }

  // Metodi helper per lo stato
  private getROIStatus(roi: number): string {
    if (roi >= 15) return 'Eccellente';
    if (roi >= 10) return 'Buono';
    if (roi >= 5) return 'Discreto';
    return 'Basso';
  }

  private getNPVStatus(npv: number): string {
    if (npv > 0) return 'Profittevole';
    return 'In perdita';
  }

  private getIRRStatus(irr: number): string {
    if (irr >= 20) return 'Eccellente';
    if (irr >= 15) return 'Buono';
    if (irr >= 10) return 'Accettabile';
    return 'Basso';
  }

  private getRiskLabel(risk: string): string {
    switch (risk) {
      case 'LOW': return 'Basso';
      case 'MEDIUM': return 'Medio';
      case 'HIGH': return 'Alto';
      default: return 'Sconosciuto';
    }
  }

  private getRiskColor(risk: string): string {
    switch (risk) {
      case 'LOW': return 'Verde';
      case 'MEDIUM': return 'Giallo';
      case 'HIGH': return 'Rosso';
      default: return 'Grigio';
    }
  }

  private getTrendLabel(trend: string): string {
    switch (trend) {
      case 'POSITIVE': return 'Positivo';
      case 'NEUTRAL': return 'Neutro';
      case 'NEGATIVE': return 'Negativo';
      default: return 'Sconosciuto';
    }
  }

  private getTrendColor(trend: string): string {
    switch (trend) {
      case 'POSITIVE': return 'Verde';
      case 'NEUTRAL': return 'Giallo';
      case 'NEGATIVE': return 'Rosso';
      default: return 'Grigio';
    }
  }
}
