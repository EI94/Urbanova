'use strict';
// Deal Memo PDF service for @urbanova/pdf package
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateDealMemo =
  exports.feasibilityReportGenerator =
  exports.RealFeasibilityReportGenerator =
    void 0;
exports.createProjectDeepLink = createProjectDeepLink;
exports.formatFinancialMetrics = formatFinancialMetrics;
const infra_1 = require('@urbanova/infra');
const pdfGeneratorService_1 = require('../../../src/lib/pdfGeneratorService');
// Real implementation using PDFGeneratorService and GCS
class RealFeasibilityReportGenerator {
  constructor() {
    this.pdfService = new pdfGeneratorService_1.PDFGeneratorService();
  }
  async generateDealMemo(project, deal, feasibility) {
    console.log(`🔍 Real generating Deal Memo for project: ${project.name}, deal: ${deal.id}`);
    try {
      // Generate PDF using the real service
      const pdfBuffer = await this.generateDealMemoPDF(project, deal, feasibility);
      // Upload to GCS and get signed URL
      const bucketName = process.env.GCS_BUCKET_MATERIALS || 'urbanova-materials';
      const path = `projects/${project.id}/memos/${Date.now()}.pdf`;
      const uploadResult = await (0, infra_1.uploadPdfAndGetUrl)(bucketName, path, pdfBuffer, {
        projectId: project.id,
        dealId: deal.id,
        type: 'deal-memo',
        generatedAt: new Date().toISOString(),
      });
      if (!uploadResult.success || !uploadResult.storageRef?.signedUrl) {
        throw new Error('Failed to upload PDF to GCS');
      }
      console.log(`✅ Real Deal Memo generated and uploaded: ${uploadResult.storageRef.signedUrl}`);
      return uploadResult.storageRef.signedUrl;
    } catch (error) {
      console.error('❌ Error generating real Deal Memo:', error);
      throw error;
    }
  }
  async generateDealMemoPDF(project, deal, feasibility) {
    // Create feasibility analysis data for PDF generation
    const analysis = {
      id: feasibility.id,
      title: `Deal Memo - ${project.name}`,
      location: project.location.city,
      propertyType: project.type,
      totalInvestment: project.budget.total,
      expectedROI: feasibility.roi?.expected || 15,
      paybackPeriod: feasibility.analysis?.financial?.paybackPeriod || 60,
      netPresentValue: feasibility.analysis?.financial?.npv || 150000,
      internalRateOfReturn: feasibility.analysis?.financial?.irr || 0.15,
      riskLevel: feasibility.riskAssessment?.overall || 'MEDIUM',
      marketTrend: 'POSITIVE', // Default
      recommendations: feasibility.recommendations?.map(r => r.description) || [
        "Procedere con l'analisi dettagliata",
      ],
      createdAt: new Date().toISOString(),
    };
    const aiAnalysis = {
      pros: ['Mercato in crescita', 'Zona richiesta', 'ROI positivo'],
      cons: ['Costi materiali', 'Tempi permessi'],
      recommendation: "Procedere con l'analisi dettagliata",
      strategies: ['Completare analisi di mercato', 'Verificare permessi', 'Contattare venditore'],
    };
    // Generate PDF using the real service
    return await this.pdfService.generateFeasibilityReport(analysis, aiAnalysis);
  }
}
exports.RealFeasibilityReportGenerator = RealFeasibilityReportGenerator;
// Export singleton instance
exports.feasibilityReportGenerator = new RealFeasibilityReportGenerator();
// Export function for easy use
const generateDealMemo = (project, deal, feasibility) => {
  return exports.feasibilityReportGenerator.generateDealMemo(project, deal, feasibility);
};
exports.generateDealMemo = generateDealMemo;
// Helper function to create project deep link
function createProjectDeepLink(projectId) {
  return `/dashboard/projects/${projectId}`;
}
// Helper function to format ROI and payback for display
function formatFinancialMetrics(feasibility) {
  // Use the new structure
  const roi = feasibility.roi?.expected || 15;
  const paybackPeriod = feasibility.analysis?.financial?.paybackPeriod || 60; // in months
  const paybackYears = paybackPeriod / 12; // convert to years
  return {
    roi: `${roi.toFixed(1)}%`,
    paybackYears: `${paybackYears.toFixed(1)} anni`,
  };
}
//# sourceMappingURL=dealMemo.js.map
