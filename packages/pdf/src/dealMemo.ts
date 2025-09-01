// Deal Memo PDF service for @urbanova/pdf package

import type { Deal, FeasibilityResult, Project } from '@urbanova/types';
import { uploadPdfAndGetUrl } from '@urbanova/infra';
import { PDFGeneratorService } from '../../../src/lib/pdfGeneratorService';

// Real interface for FeasibilityReportGenerator
export interface FeasibilityReportGenerator {
  generateDealMemo(project: Project, deal: Deal, feasibility: FeasibilityResult): Promise<string>; // Returns GCS signed URL
}

// Real implementation using PDFGeneratorService and GCS
export class RealFeasibilityReportGenerator implements FeasibilityReportGenerator {
  private pdfService: PDFGeneratorService;

  constructor() {
    this.pdfService = new PDFGeneratorService();
  }

  async generateDealMemo(
    project: Project,
    deal: Deal,
    feasibility: FeasibilityResult
  ): Promise<string> {
    console.log(`🔍 Real generating Deal Memo for project: ${project.name}, deal: ${deal.id}`);

    try {
      // Generate PDF using the real service
      const pdfBuffer = await this.generateDealMemoPDF(project, deal, feasibility);

      // Upload to GCS and get signed URL
      const bucketName = process.env.GCS_BUCKET_MATERIALS || 'urbanova-materials';
      const path = `projects/${project.id}/memos/${Date.now()}.pdf`;

      const uploadResult = await uploadPdfAndGetUrl(bucketName, path, pdfBuffer, {
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

  private async generateDealMemoPDF(
    project: Project,
    deal: Deal,
    feasibility: FeasibilityResult
  ): Promise<Buffer> {
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
      marketTrend: 'POSITIVE' as const, // Default
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

// Export singleton instance
export const feasibilityReportGenerator = new RealFeasibilityReportGenerator();

// Export function for easy use
export const generateDealMemo = (
  project: Project,
  deal: Deal,
  feasibility: FeasibilityResult
): Promise<string> => {
  return feasibilityReportGenerator.generateDealMemo(project, deal, feasibility);
};

// Helper function to create project deep link
export function createProjectDeepLink(projectId: string): string {
  return `/dashboard/projects/${projectId}`;
}

// Helper function to format ROI and payback for display
export function formatFinancialMetrics(feasibility: FeasibilityResult): {
  roi: string;
  paybackYears: string;
} {
  // Use the new structure
  const roi = feasibility.roi?.expected || 15;
  const paybackPeriod = feasibility.analysis?.financial?.paybackPeriod || 60; // in months
  const paybackYears = paybackPeriod / 12; // convert to years

  return {
    roi: `${roi.toFixed(1)}%`,
    paybackYears: `${paybackYears.toFixed(1)} anni`,
  };
}
