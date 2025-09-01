// Business Plan PDF service for @urbanova/pdf package
// Genera report BP completi con appendix Comps/OMI

import type { BPInput, BPResult, Project } from '@urbanova/types';
import { uploadPdfAndGetUrl } from '@urbanova/infra';
import { PDFGeneratorService } from '../../../src/lib/pdfGeneratorService';

export interface BusinessPlanReportGenerator {
  generateBusinessPlanPDF(project: Project, bpInput: BPInput, bpResult: BPResult): Promise<string>; // Returns GCS signed URL
}

export class RealBusinessPlanReportGenerator implements BusinessPlanReportGenerator {
  private pdfService: PDFGeneratorService;

  constructor() {
    this.pdfService = new PDFGeneratorService();
  }

  async generateBusinessPlanPDF(
    project: Project,
    bpInput: BPInput,
    bpResult: BPResult
  ): Promise<string> {
    console.log(`📊 Generating Business Plan PDF for project: ${project.name}`);

    try {
      // Generate PDF using the real service
      const pdfBuffer = await this.generateBusinessPlanPDFBuffer(project, bpInput, bpResult);

      // Upload to GCS and get signed URL
      const bucketName = process.env.GCS_BUCKET_MATERIALS || 'urbanova-materials';
      const path = `projects/${project.id}/business-plans/${Date.now()}.pdf`;

      const uploadResult = await uploadPdfAndGetUrl(bucketName, path, pdfBuffer, {
        projectId: project.id,
        type: 'business-plan',
        generatedAt: new Date().toISOString(),
        version: '1.0',
      });

      if (!uploadResult.success || !uploadResult.storageRef?.signedUrl) {
        throw new Error('Failed to upload Business Plan PDF to GCS');
      }

      console.log(
        `✅ Business Plan PDF generated and uploaded: ${uploadResult.storageRef.signedUrl}`
      );
      return uploadResult.storageRef.signedUrl;
    } catch (error) {
      console.error('❌ Error generating Business Plan PDF:', error);
      throw error;
    }
  }

  private async generateBusinessPlanPDFBuffer(
    project: Project,
    bpInput: BPInput,
    bpResult: BPResult
  ): Promise<Buffer> {
    // Prepare Business Plan data for PDF generation
    const bpData = {
      id: `bp-${Date.now()}`,
      title: `Business Plan - ${project.name}`,
      project: {
        name: project.name,
        location: project.location?.city || 'N/A',
        type: project.type || 'Residenziale',
        surface: bpInput.land.surface || 0,
        budget: project.budget?.total || 0,
      },
      financial: {
        roi: (bpResult.roi * 100).toFixed(1) + '%',
        margin: (bpResult.marginPct * 100).toFixed(1) + '%',
        paybackYears: bpResult.paybackYears.toFixed(1),
        irr: bpResult.irr ? (bpResult.irr * 100).toFixed(1) + '%' : 'N/A',
        totalCosts: this.calculateTotalCosts(bpInput),
        totalRevenues: this.calculateTotalRevenues(bpInput),
      },
      scenarios: bpResult.scenarios.map(s => ({
        label: s.deltaLabel,
        roi: (s.roi * 100).toFixed(1) + '%',
        margin: (s.marginPct * 100).toFixed(1) + '%',
      })),
      comps: {
        omi: {
          zone: bpResult.compsUsed.omi.zone,
          range: bpResult.compsUsed.omi.range,
          confidence: bpResult.compsUsed.omi.range.confidence,
        },
        internal: {
          count: bpResult.compsUsed.internal.count,
          p50: bpResult.compsUsed.internal.p50,
          p75: bpResult.compsUsed.internal.p75,
        },
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
      },
    };

    // Generate PDF using the existing service (temporary)
    return await this.pdfService.generateFeasibilityReport(
      {
        id: bpData.id,
        title: bpData.title,
        location: bpData.project.location,
        propertyType: bpData.project.type,
        totalInvestment: bpData.financial.totalCosts,
        expectedROI: parseFloat(bpData.financial.roi),
        paybackPeriod: parseFloat(bpData.financial.paybackYears) * 12,
        netPresentValue: bpData.financial.totalRevenues - bpData.financial.totalCosts,
        internalRateOfReturn:
          bpData.financial.irr !== 'N/A' ? parseFloat(bpData.financial.irr) : 0.15,
        riskLevel: 'MEDIUM' as const,
        marketTrend: 'POSITIVE' as const,
        recommendations: [
          `ROI: ${bpData.financial.roi}`,
          `Margine: ${bpData.financial.margin}`,
          `Payback: ${bpData.financial.paybackYears} anni`,
        ],
        createdAt: bpData.metadata.generatedAt,
      },
      {
        pros: [
          `ROI elevato: ${bpData.financial.roi}`,
          `Margine positivo: ${bpData.financial.margin}`,
          `Payback rapido: ${bpData.financial.paybackYears} anni`,
        ],
        cons: ['Costi di costruzione elevati', 'Tempi di realizzazione lunghi'],
        recommendation: 'Procedere con il progetto - ROI e margini soddisfacenti',
        strategies: [
          'Ottimizzare costi di costruzione',
          'Accelerare tempi di realizzazione',
          'Monitorare trend di mercato',
        ],
      }
    );
  }

  private calculateTotalCosts(bpInput: BPInput): number {
    const { land, costs } = bpInput;
    const hardCosts =
      costs.hard.perSqm * costs.hard.buildableSqm + (costs.hard.infrastructure || 0);
    const softCosts =
      costs.soft.design + costs.soft.permits + costs.soft.supervision + (costs.soft.other || 0);
    const fees = costs.fees.agency + costs.fees.notary + (costs.fees.other || 0);
    return land.priceAsk + (land.taxes || 0) + hardCosts + softCosts + fees + costs.contingency;
  }

  private calculateTotalRevenues(bpInput: BPInput): number {
    const { land, prices } = bpInput;
    const surface = land.surface || 0;
    return surface * prices.psqmBase;
  }
}

// Export singleton instance
export const businessPlanReportGenerator = new RealBusinessPlanReportGenerator();

// Export function for easy use
export const generateBusinessPlanPDF = (
  project: Project,
  bpInput: BPInput,
  bpResult: BPResult
): Promise<string> => {
  return businessPlanReportGenerator.generateBusinessPlanPDF(project, bpInput, bpResult);
};
