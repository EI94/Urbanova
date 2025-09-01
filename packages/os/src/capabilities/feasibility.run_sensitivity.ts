// Feasibility Sensitivity Capability - Urbanova OS
import { z } from 'zod';
import { Capability, CapabilityContext } from '@urbanova/types';
import { zSensitivityArgs, SensitivityResult } from '@urbanova/types';

// Schema argomenti
const zArgs = zSensitivityArgs;

// Feasibility Sensitivity capability
export const feasibilitySensitivityCapability: Capability = {
  spec: {
    name: 'feasibility.run_sensitivity',
    description: 'Esegue analisi di sensibilità su costi e prezzi per un progetto',
    zArgs,
    requiredRole: 'pm',
    confirm: false,
    dryRun: true,
  },

  handler: async (
    ctx: CapabilityContext,
    args: z.infer<typeof zArgs>
  ): Promise<SensitivityResult> => {
    const { projectId, deltas } = args;

    ctx.logger.info(
      `[FeasibilitySensitivity] Esecuzione sensitivity per progetto: ${projectId} con deltas: ${deltas.join(', ')}`
    );

    // TODO: Integrare con servizi reali
    // Per ora, restituisci dati mock

    // Simula fetch da Firestore e calcoli
    const baseFeasibility = await getMockBaseFeasibility(projectId);
    const sensitivityResults = await calculateSensitivityScenarios(baseFeasibility, deltas);
    const pdfUrl = await generateAndUploadSensitivityReport(projectId, sensitivityResults);

    const result: SensitivityResult = {
      baseRoi: baseFeasibility.roi,
      range: {
        min: Math.min(...sensitivityResults.map(s => s.roi)),
        max: Math.max(...sensitivityResults.map(s => s.roi)),
      },
      pdfUrl,
    };

    ctx.logger.info(
      `[FeasibilitySensitivity] Sensitivity completata per progetto ${projectId}: base ${result.baseRoi}%, range ${result.range.min}-${result.range.max}%`
    );

    return result;
  },
};

// Mock data functions (da sostituire con servizi reali)
async function getMockBaseFeasibility(projectId: string): Promise<any> {
  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 200));

  // ROI base variabile per progetto
  const baseRoi = 15 + (projectId.charCodeAt(0) % 8); // 15-22%

  return {
    roi: baseRoi,
    costs: {
      land: 500000,
      construction: 1200000,
      permits: 50000,
      contingency: 100000,
    },
    revenues: {
      salePrice: 2500000,
      rentalIncome: 120000,
    },
    timeline: 24, // mesi
  };
}

async function calculateSensitivityScenarios(
  baseFeasibility: any,
  deltas: number[]
): Promise<any[]> {
  // Simula calcoli di sensibilità
  await new Promise(resolve => setTimeout(resolve, 300));

  return deltas.map(delta => {
    // Applica delta ai costi e ricavi
    const costMultiplier = 1 + delta;
    const revenueMultiplier = 1 + delta * 0.8; // Ricavi meno sensibili ai costi

    const totalCosts =
      baseFeasibility.costs.land +
      baseFeasibility.costs.construction +
      baseFeasibility.costs.permits +
      baseFeasibility.costs.contingency;

    const modifiedCosts = totalCosts * costMultiplier;
    const modifiedRevenues =
      (baseFeasibility.revenues.salePrice + baseFeasibility.revenues.rentalIncome) *
      revenueMultiplier;

    // Calcola nuovo ROI
    const newRoi = ((modifiedRevenues - modifiedCosts) / modifiedCosts) * 100;

    return {
      delta,
      roi: Math.max(0, newRoi), // ROI non può essere negativo
      costs: modifiedCosts,
      revenues: modifiedRevenues,
    };
  });
}

async function generateAndUploadSensitivityReport(
  projectId: string,
  sensitivityResults: any[]
): Promise<string> {
  // Simula generazione PDF e upload
  await new Promise(resolve => setTimeout(resolve, 500));

  // Genera URL mock per il PDF
  const timestamp = Date.now();
  const pdfUrl = `https://storage.googleapis.com/urbanova-projects/${projectId}/memos/sensitivity-${timestamp}.pdf`;

  // TODO: Implementare generazione PDF reale con FeasibilityReportGenerator
  // TODO: Implementare upload a GCS con signed URL

  return pdfUrl;
}

// Export types
export type FeasibilitySensitivityArgs = z.infer<typeof zArgs>;
