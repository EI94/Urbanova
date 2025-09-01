'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.feasibilityTool = exports.feasibilityActions = exports.feasibilityManifest = void 0;
const feasibilityService_1 = require('../../../src/lib/feasibilityService');
const dealMemo_1 = require('../../../packages/pdf/src/dealMemo');
const infra_1 = require('@urbanova/infra');
// Real Feasibility Tool
exports.feasibilityManifest = {
  id: 'feasibility',
  name: 'Feasibility Analysis',
  version: '1.0.0',
  icon: '📊',
  category: 'feasibility',
  description: 'Runs feasibility analysis and generates reports',
  intents: ['fattibilità', 'analisi', 'roi', 'profitto', 'feasibility', 'report'],
  tags: ['feasibility', 'analysis', 'financial', 'roi', 'reporting'],
};
exports.feasibilityActions = [
  {
    name: 'run',
    description: 'Runs feasibility analysis for a project',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: false,
  },
  {
    name: 'run_sensitivity',
    description: 'Runs sensitivity analysis with multiple scenarios',
    zArgs: {}, // Will be properly typed
    requiredRole: 'pm',
    longRunning: true,
  },
];
// Real service instances
const feasibilityService = new feasibilityService_1.FeasibilityService();
const reportGenerator = new dealMemo_1.RealFeasibilityReportGenerator();
exports.feasibilityTool = {
  manifest: exports.feasibilityManifest,
  actions: exports.feasibilityActions,
  async run(ctx, args) {
    console.log(`📊 Real running feasibility analysis for project: ${args.projectId}`);
    try {
      // Get project data
      const project = await feasibilityService.getProject(args.projectId);
      if (!project) {
        throw new Error(`Project not found: ${args.projectId}`);
      }
      // Run feasibility analysis
      const analysis = await feasibilityService.generateFeasibilityAnalysis(project);
      if (!analysis.success) {
        throw new Error(`Feasibility analysis failed: ${analysis.error}`);
      }
      return {
        success: true,
        data: {
          projectId: args.projectId,
          analysis: analysis.data,
          summary: `Feasibility analysis completed. ROI: ${analysis.data?.roi?.expected || 'N/A'}%, Margin: ${analysis.data?.margin || 'N/A'}%`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real feasibility analysis:', error);
      throw error;
    }
  },
  async run_sensitivity(ctx, args) {
    console.log(`📊 Real running sensitivity analysis for project: ${args.projectId}`);
    try {
      // Get project data
      const project = await feasibilityService.getProject(args.projectId);
      if (!project) {
        throw new Error(`Project not found: ${args.projectId}`);
      }
      // Run sensitivity analysis
      const sensitivityResult = await feasibilityService.runSensitivityAnalysis(
        project,
        args.deltas
      );
      if (!sensitivityResult.success) {
        throw new Error(`Sensitivity analysis failed: ${sensitivityResult.error}`);
      }
      // Generate PDF report
      const pdfBuffer = await reportGenerator.generateDealMemo(
        project, // Type conversion needed
        { id: 'sensitivity-deal', title: 'Sensitivity Analysis' },
        sensitivityResult.data
      );
      // Upload to GCS
      const bucketName = process.env.GCS_BUCKET_MATERIALS || 'urbanova-materials';
      const path = `projects/${args.projectId}/sensitivity/${Date.now()}.pdf`;
      const uploadResult = await (0, infra_1.uploadPdfAndGetUrl)(bucketName, path, pdfBuffer, {
        projectId: args.projectId,
        type: 'sensitivity-analysis',
        generatedAt: new Date().toISOString(),
      });
      if (!uploadResult.success || !uploadResult.storageRef?.signedUrl) {
        throw new Error('Failed to upload PDF to GCS');
      }
      return {
        success: true,
        data: {
          projectId: args.projectId,
          sensitivity: sensitivityResult.data,
          pdfUrl: uploadResult.storageRef.signedUrl,
          summary: `Sensitivity analysis completed with ${args.deltas.length} scenarios. PDF report available.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real sensitivity analysis:', error);
      throw error;
    }
  },
};
//# sourceMappingURL=index.js.map
