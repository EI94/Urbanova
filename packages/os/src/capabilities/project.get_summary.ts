// Project Get Summary Capability - Urbanova OS
import { z } from 'zod';
import { Capability, CapabilityContext } from '@urbanova/types';
import { zProjectSummaryArgs, ProjectSummary } from '@urbanova/types';

// Schema argomenti
const zArgs = zProjectSummaryArgs;

// Project Get Summary capability
export const projectGetSummaryCapability: Capability = {
  spec: {
    name: 'project.get_summary',
    description: 'Ottiene il riepilogo completo di un progetto con KPI, documenti e milestone',
    zArgs,
    requiredRole: 'pm',
    confirm: false,
    dryRun: false,
  },

  handler: async (ctx: CapabilityContext, args: z.infer<typeof zArgs>): Promise<ProjectSummary> => {
    const { projectId } = args;

    ctx.logger.info(`[ProjectSummary] Esecuzione get_summary per progetto: ${projectId}`);

    // TODO: Integrare con servizi reali
    // Per ora, restituisci dati mock

    // Simula fetch da Firestore
    const projectData = await getMockProjectData(projectId);
    const feasibilityData = await getMockFeasibilityData(projectId);
    const checklistData = await getMockChecklistData(projectId);
    const milestonesData = await getMockMilestonesData(projectId);

    const summary: ProjectSummary = {
      roi: feasibilityData.roi,
      marginPct: feasibilityData.marginPct,
      paybackYears: feasibilityData.paybackYears,
      docs: {
        complete: checklistData.complete,
        total: checklistData.total,
        missing: checklistData.missing,
      },
      milestones: milestonesData,
    };

    ctx.logger.info(
      `[ProjectSummary] Riepilogo generato per progetto ${projectId}: ROI ${summary.roi}%, Docs ${summary.docs.complete}/${summary.docs.total}`
    );

    return summary;
  },
};

// Mock data functions (da sostituire con servizi reali)
async function getMockProjectData(projectId: string): Promise<any> {
  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    id: projectId,
    name: `Progetto ${projectId}`,
    status: 'IN_PROGRESS',
    createdAt: new Date(),
  };
}

async function getMockFeasibilityData(projectId: string): Promise<any> {
  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 150));

  // ROI variabile per progetto
  const baseRoi = 12 + (projectId.charCodeAt(0) % 10); // 12-21%

  return {
    roi: baseRoi,
    marginPct: baseRoi * 1.5,
    paybackYears: 60 / baseRoi, // Payback inversamente proporzionale al ROI
  };
}

async function getMockChecklistData(projectId: string): Promise<any> {
  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 80));

  const allDocs = [
    'CDU',
    'VISURA',
    'DURC',
    'Planimetria',
    'Progetto',
    'Permessi',
    'Contratto',
    'Assicurazione',
  ];
  const complete = Math.min(8, Math.max(3, projectId.length + 2)); // 3-8 documenti completati
  const missing = allDocs.slice(complete);

  return {
    complete,
    total: allDocs.length,
    missing,
  };
}

async function getMockMilestonesData(projectId: string): Promise<any[]> {
  // Simula delay di rete
  await new Promise(resolve => setTimeout(resolve, 120));

  const now = new Date();
  const milestones = [
    {
      title: 'Approvazione Permessi Urbanistici',
      due: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // +15 giorni
      status: 'due' as const,
    },
    {
      title: 'Inizio Lavori di Fondazione',
      due: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // -5 giorni (overdue)
      status: 'overdue' as const,
    },
    {
      title: 'Completamento Struttura',
      due: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // +45 giorni
      status: 'due' as const,
    },
    {
      title: 'Collaudo Finale',
      due: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // +90 giorni
      status: 'due' as const,
    },
  ];

  return milestones;
}

// Export types
export type ProjectGetSummaryArgs = z.infer<typeof zArgs>;
