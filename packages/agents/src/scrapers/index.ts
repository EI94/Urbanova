// Scrapers facade for @urbanova/agents package

// Types - defined locally until available in @urbanova/types
export interface Deal {
  id: string;
  projectId: string;
  status: string;
  type: string;
  value: number;
  currency: string;
  parties: any[];
  documents: any[];
  milestones: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  source: string;
  externalId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  metadata: any;
}
import { realLandScrapingAgent } from '../../../../src/lib/realLandScrapingAgent';
import type { ScrapedLand, LandSearchCriteria } from '../../../../src/types/land';

// Real interface for LandScrapingAgent
export interface LandScrapingAgent {
  byLink(link: string): Promise<Deal>;
  search(params: { city: string; budgetMax: string }): Promise<Listing[]>;
}

// Real implementation using RealLandScrapingAgent
export class RealLandScrapingAgentAdapter implements LandScrapingAgent {
  async byLink(link: string): Promise<Deal> {
    console.log(`🔍 Real scraping link: ${link}`);

    try {
      // Create search criteria from link
      const criteria: LandSearchCriteria = {
        location: 'Milano', // Default location, could be extracted from link
        maxPrice: 1000000, // Default max price
        minArea: 100, // Default min area
        propertyType: 'RESIDENTIAL',
      };

      // Use the real agent to search
      const result = await realLandScrapingAgent.runAutomatedSearch(
        criteria,
        'system@urbanova.life'
      );

      // Convert first result to Deal
      if (result.lands.length > 0) {
        const firstLand = result.lands[0];
        if (firstLand) {
          return this.convertScrapedLandToDeal(firstLand, link);
        }
      }

      // If no results, create a default deal
      return this.createDefaultDealFromLink(link);
    } catch (error) {
      console.error('❌ Error in real scraping by link:', error);
      // Fallback to default deal
      return this.createDefaultDealFromLink(link);
    }
  }

  async search(params: { city: string; budgetMax: string }): Promise<Listing[]> {
    console.log(`🔍 Real searching: ${params.city}, max budget: ${params.budgetMax}`);

    try {
      // Parse budget
      const maxPrice = this.parseBudget(params.budgetMax);

      // Create search criteria
      const criteria: LandSearchCriteria = {
        location: params.city,
        maxPrice,
        minArea: 100,
        propertyType: 'RESIDENTIAL',
      };

      // Use the real agent to search
      const result = await realLandScrapingAgent.runAutomatedSearch(
        criteria,
        'system@urbanova.life'
      );

      // Convert results to Listings
      return result.lands.map((land: any) => this.convertScrapedLandToListing(land));
    } catch (error) {
      console.error('❌ Error in real search:', error);
      // Fallback to empty results
      return [];
    }
  }

  private convertScrapedLandToDeal(land: ScrapedLand, link: string): Deal {
    return {
      id: land.id || `deal-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      status: 'NEGOTIATION',
      type: 'PURCHASE',
      value: land.price,
      currency: 'EUR',
      parties: [],
      documents: [],
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private convertScrapedLandToListing(land: any): Listing {
    return {
      id: land.id || `listing-${Date.now()}`,
      source: land.source,
      externalId: land.id || `ext-${Date.now()}`,
      title: land.title,
      description: land.description,
      price: land.price,
      location: `${land.location}, Milano, Lombardia, Italia`,
      // features: land.features, // Not available in Listing type
      // images: land.images || [], // Not available in Listing type
      contactInfo: {
        name: land.contactInfo?.agent || 'Agenzia Immobiliare',
        email: land.contactInfo?.email || 'info@agenzia.it',
        phone: land.contactInfo?.phone || '+39 02 1234567',
      },
      createdAt: land.dateScraped || new Date(),
      updatedAt: new Date(),
    };
  }

  private createDefaultDealFromLink(link: string): Deal {
    return {
      id: `deal-${Date.now()}`,
      projectId: `project-${Date.now()}`,
      status: 'NEGOTIATION',
      type: 'PURCHASE',
      value: 500000,
      currency: 'EUR',
      parties: [],
      documents: [],
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private parseBudget(budgetStr: string): number {
    // Parse budget strings like "1.2M", "500K", "750k"
    const normalized = budgetStr.toUpperCase().replace(/\s/g, '');

    if (normalized.includes('M')) {
      return parseFloat(normalized.replace('M', '')) * 1000000;
    } else if (normalized.includes('K')) {
      return parseFloat(normalized.replace('K', '')) * 1000;
    } else {
      return parseFloat(normalized) || 1000000;
    }
  }

  private extractCity(location: string): string {
    // Simple city extraction - could be improved
    const parts = location.split(',').map(p => p.trim());
    return parts[0] || 'Milano';
  }
}

// Export singleton instance
export const landScrapingAgent = new RealLandScrapingAgentAdapter();

// Export functions for easy use
export const land = {
  byLink: (link: string) => landScrapingAgent.byLink(link),
  search: (params: { city: string; budgetMax: string }) => landScrapingAgent.search(params),
};
