// Tool Imports Bridge - Soluzione definitiva per importare i tool
// Questo file risolve i problemi di rootDir e permette import puliti

import { ToolManifest, ToolActionSpec } from '@urbanova/types';

// Import dinamici per evitare problemi di rootDir
export async function importTool(toolName: string): Promise<{
  manifest: ToolManifest;
  actions: ToolActionSpec[];
}> {
  switch (toolName) {
    case 'listing':
      const listing = await import('../../tools/listing');
      return {
        manifest: listing.listingManifest,
        actions: listing.listingActions,
      };

    case 'procurement':
      const procurement = await import('../../tools/procurement');
      return {
        manifest: procurement.procurementManifest,
        actions: procurement.procurementActions,
      };

    case 'timeline':
      const timeline = await import('../../tools/timeline');
      return {
        manifest: timeline.timelineManifest,
        actions: timeline.timelineActions,
      };

    case 'buyer':
      const buyer = await import('../../tools/buyer');
      return {
        manifest: buyer.buyerManifest,
        actions: buyer.buyerActions,
      };

    case 'leads':
      const leads = await import('../../tools/leads');
      return {
        manifest: leads.leadsManifest,
        actions: leads.leadsActions,
      };

    default:
      throw new Error(`Tool ${toolName} non trovato`);
  }
}

// Export dei tool disponibili
export const AVAILABLE_TOOLS = ['listing', 'procurement', 'timeline', 'buyer', 'leads'] as const;

export type AvailableTool = (typeof AVAILABLE_TOOLS)[number];
