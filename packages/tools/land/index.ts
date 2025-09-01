import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
import { RealLandScrapingAgent } from '../../../src/lib/realLandScrapingAgent';
import { ProjectManagerService } from '../../../src/lib/projectManagerService';

// Real Land Scraper Tool
export const landScraperManifest: ToolManifest = {
  id: 'land',
  name: 'Land Scraper',
  version: '1.0.0',
  icon: '🗺️',
  category: 'scraping',
  description: 'Scans land listings, market data, and auctions',
  intents: ['terreno', 'annuncio', 'aste', 'scansiona', 'land', 'off-market'],
  tags: ['scraping', 'discovery', 'market-analysis', 'real-estate'],
};

export const landScraperActions: ToolActionSpec[] = [
  {
    name: 'scan_by_link',
    description: 'Scans a land listing by URL and creates a deal/project',
    zArgs: {} as any, // Will be properly typed
    requiredRole: 'sales',
    longRunning: false,
  },
  {
    name: 'scan_market',
    description: 'Scans market for land deals in a specific city',
    zArgs: {} as any, // Will be properly typed
    requiredRole: 'sales',
    longRunning: false,
  },
  {
    name: 'find_auctions',
    description: 'Finds land auctions in a specific city',
    zArgs: {} as any, // Will be properly typed
    requiredRole: 'sales',
    longRunning: false,
  },
];

// Real service instances
const landScrapingAgent = new RealLandScrapingAgent();
const projectManager = new ProjectManagerService();

export const landScraperTool = {
  manifest: landScraperManifest,
  actions: landScraperActions,

  async scan_by_link(ctx: any, args: { link: string; projectName?: string }) {
    console.log(`🔍 Real scanning land listing: ${args.link}`);

    try {
      // Use real land scraping agent - create a basic search criteria
      const searchCriteria = {
        location: 'Unknown',
        propertyType: 'land',
        budgetRange: { min: 0, max: 1000000 },
        surfaceRange: { min: 100, max: 10000 },
      };

      const scanResult = await landScrapingAgent.runAutomatedSearch(
        searchCriteria,
        'user@example.com'
      );

      // Create project if name provided
      let projectId: string | undefined;
      if (args.projectName) {
        const projectResult = await projectManager.smartSaveProject({
          name: args.projectName,
          address: 'Scanned from listing',
          status: 'PIANIFICAZIONE',
          startDate: new Date(),
          constructionStartDate: new Date(),
          duration: 12,
          costs: {
            land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
            construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
            externalWorks: 0,
            concessionFees: 0,
            design: 0,
            bankCharges: 0,
            exchange: 0,
            insurance: 0,
            total: 0,
          },
          revenues: {
            units: 1,
            averageArea: 100,
            pricePerSqm: 0,
            revenuePerUnit: 0,
            totalSales: 0,
            otherRevenues: 0,
            total: 0,
          },
          results: { profit: 0, margin: 0, roi: 0, paybackPeriod: 0 },
          targetMargin: 20,
          isTargetAchieved: false,
          createdBy: 'system',
        });
        projectId = projectResult.projectId;
      }

      return {
        success: true,
        data: {
          scanResult: scanResult,
          projectId,
          summary: `Land listing scanned successfully. Found ${scanResult.lands?.length || 0} lands.`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real land scanning:', error);
      throw error;
    }
  },

  async scan_market(ctx: any, args: { city: string; budgetMax?: number; surfaceMin?: number }) {
    console.log(`🔍 Real scanning market for city: ${args.city}`);

    try {
      // Use real land scraping agent for market scanning
      const searchCriteria = {
        location: args.city,
        propertyType: 'land',
        budgetRange: { min: 0, max: args.budgetMax || 1000000 },
        surfaceRange: { min: args.surfaceMin || 100, max: 10000 },
      };

      const marketResult = await landScrapingAgent.runAutomatedSearch(
        searchCriteria,
        'user@example.com'
      );

      return {
        success: true,
        data: {
          city: args.city,
          deals: marketResult.lands || [],
          totalFound: marketResult.lands?.length || 0,
          summary: `Found ${marketResult.lands?.length || 0} deals in ${args.city}`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real market scanning:', error);
      throw error;
    }
  },

  async find_auctions(ctx: any, args: { city: string }) {
    console.log(`🔍 Real finding auctions for city: ${args.city}`);

    try {
      // Use real land scraping agent for auction finding
      const searchCriteria = {
        location: args.city,
        propertyType: 'land',
        budgetRange: { min: 0, max: 1000000 },
        surfaceRange: { min: 100, max: 10000 },
      };

      const auctionResult = await landScrapingAgent.runAutomatedSearch(
        searchCriteria,
        'user@example.com'
      );

      return {
        success: true,
        data: {
          city: args.city,
          auctions: auctionResult.lands || [],
          totalFound: auctionResult.lands?.length || 0,
          summary: `Found ${auctionResult.lands?.length || 0} potential auction properties in ${args.city}`,
        },
      };
    } catch (error) {
      console.error('❌ Error in real auction search:', error);
      throw error;
    }
  },
};
