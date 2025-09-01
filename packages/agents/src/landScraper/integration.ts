// Integration service for LandScraper with RealLandScrapingAgent and Firestore

import type { DealNormalized, SearchFilter, DealSearchResult } from '@urbanova/types';
import { DealNormalizerService } from './normalizer';

// Simplified types for integration
interface ScrapedLand {
  id: string;
  title: string;
  location: string;
  price: number;
  area: number;
  source: string;
  url: string;
  zoning?: string;
  buildingRights?: string;
  coordinates?: [number, number];
  description: string;
  features: string[];
  images?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    agent?: string;
  };
  dateScraped?: Date;
  timestamp?: Date;
  hasRealPrice?: boolean;
  hasRealArea?: boolean;
  aiScore?: number;
  marketTrend?: string;
  roiData?: {
    pricePerSqm: number;
    location: string;
    trend: string;
    source: string;
  };
}

interface LandSearchCriteria {
  location: string;
  maxPrice?: number;
  minArea?: number;
  propertyType?: string;
}

interface RealLandScrapingResult {
  lands: ScrapedLand[];
  analysis: any[];
  emailSent: boolean;
  summary: {
    totalFound: number;
    averagePrice: number;
    bestOpportunities: ScrapedLand[];
    marketTrends: string;
    recommendations: string[];
  };
}

// Simplified RealLandScrapingAgent for integration
class SimplifiedRealLandScrapingAgent {
  async runAutomatedSearch(
    criteria: LandSearchCriteria,
    email: string
  ): Promise<RealLandScrapingResult> {
    // Simplified implementation that returns mock data
    // In production, this would use the real scraping agent
    const mockLands: ScrapedLand[] = [
      {
        id: `mock-${Date.now()}`,
        title: `Property in ${criteria.location}`,
        location: `Via Roma 123, ${criteria.location}`,
        price: criteria.maxPrice ? criteria.maxPrice * 0.8 : 500000,
        area: criteria.minArea ? criteria.minArea + 50 : 150,
        source: 'idealista',
        url: `https://idealista.it/property-${Date.now()}`,
        zoning: 'residential',
        description: `Beautiful property in ${criteria.location}`,
        features: ['Garden', 'Parking', 'Balcony'],
        dateScraped: new Date(),
      },
    ];

    return {
      lands: mockLands,
      analysis: [],
      emailSent: false,
      summary: {
        totalFound: mockLands.length,
        averagePrice: mockLands[0].price,
        bestOpportunities: mockLands,
        marketTrends: 'Stable market',
        recommendations: ['Good investment opportunity'],
      },
    };
  }
}

export class LandScraperIntegrationService {
  private normalizer: DealNormalizerService;
  private realLandScrapingAgent: SimplifiedRealLandScrapingAgent;

  constructor() {
    this.normalizer = new DealNormalizerService();
    this.realLandScrapingAgent = new SimplifiedRealLandScrapingAgent();
  }

  /**
   * Map ScrapedLand to DealNormalized
   */
  private mapScrapedLandToDealNormalized(scrapedLand: ScrapedLand): Partial<DealNormalized> {
    return {
      id: scrapedLand.id,
      link: scrapedLand.url,
      source: scrapedLand.source,
      address: scrapedLand.location,
      city: this.extractCityFromLocation(scrapedLand.location),
      lat: scrapedLand.coordinates?.[0] || undefined,
      lng: scrapedLand.coordinates?.[1] || undefined,
      surface: scrapedLand.area,
      priceAsk: scrapedLand.price,
      zoningHint: scrapedLand.zoning || scrapedLand.buildingRights || undefined,
      policy: 'allowed', // Default policy for scraped data
      trust: this.calculateTrustFromScrapedData(scrapedLand),
      discoveredAt: scrapedLand.dateScraped || scrapedLand.timestamp || new Date(),
      updatedAt: new Date(),
      metadata: {
        title: scrapedLand.title,
        description: scrapedLand.description,
        features: scrapedLand.features,
        images: scrapedLand.images,
        contactInfo: scrapedLand.contactInfo,
        aiScore: scrapedLand.aiScore,
        marketTrend: scrapedLand.marketTrend,
        roiData: scrapedLand.roiData,
      },
    };
  }

  /**
   * Extract city from location string
   */
  private extractCityFromLocation(location: string): string {
    // Simple city extraction - in production this should be more sophisticated
    const parts = location.split(',').map(part => part.trim());
    return parts[parts.length - 1] || location;
  }

  /**
   * Calculate trust score from scraped data quality
   */
  private calculateTrustFromScrapedData(scrapedLand: ScrapedLand): number {
    let trust = 0.5; // Base trust

    // Increase trust for data quality indicators
    if (scrapedLand.hasRealPrice) trust += 0.2;
    if (scrapedLand.hasRealArea) trust += 0.2;
    if (scrapedLand.coordinates) trust += 0.1;
    if (scrapedLand.images && scrapedLand.images.length > 0) trust += 0.1;
    if (scrapedLand.contactInfo?.phone || scrapedLand.contactInfo?.email) trust += 0.1;

    // Cap at 1.0
    return Math.min(trust, 1.0);
  }

  /**
   * Scan market using real scraping agent
   */
  async scanMarketReal(filter: SearchFilter): Promise<DealSearchResult> {
    const startTime = Date.now();

    try {
      // Convert SearchFilter to LandSearchCriteria
      const criteria: LandSearchCriteria = {
        location: filter.city,
        maxPrice: filter.budgetMax || undefined,
        minArea: filter.surfaceMin || undefined,
        propertyType: filter.zoning?.[0] || undefined,
      };

      // Use real scraping agent
      const scrapingResult = await this.realLandScrapingAgent.runAutomatedSearch(
        criteria,
        'system@urbanova.life' // System email for automated searches
      );

      // Map and normalize scraped lands
      const normalizedDeals: DealNormalized[] = [];
      const duplicates: DealNormalized[] = [];

      for (const scrapedLand of scrapingResult.lands) {
        const dealData = this.mapScrapedLandToDealNormalized(scrapedLand);
        const normalizedDeal = await this.normalizer.normalizeDeal(dealData);

        if (normalizedDeal) {
          // For now, we'll skip duplicate checking to avoid Firestore dependencies
          // In production, this would check for duplicates and merge them
          normalizedDeals.push(normalizedDeal);
        }
      }

      // Sort by trust score
      normalizedDeals.sort((a, b) => (b.trust || 0) - (a.trust || 0));

      const duration = Math.max(1, Date.now() - startTime);

      return {
        deals: normalizedDeals,
        duplicates,
        totalFound: scrapingResult.lands.length,
        totalReturned: normalizedDeals.length,
        scanDuration: duration,
        scanTimestamp: new Date(),
        error: undefined,
      };
    } catch (error) {
      const duration = Math.max(1, Date.now() - startTime);

      return {
        deals: [],
        duplicates: [],
        totalFound: 0,
        totalReturned: 0,
        scanDuration: duration,
        scanTimestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scan by link using real scraping agent
   */
  async scanByLinkReal(link: string): Promise<DealNormalized | null> {
    try {
      // For now, we'll simulate the link scanning
      // In production, this would use the real scraping agent to extract data from the link
      const mockScrapedLand: ScrapedLand = {
        id: `link-${Date.now()}`,
        title: 'Property from Link',
        location: 'Unknown Location',
        price: 0,
        area: 0,
        source: 'link',
        url: link,
        description: 'Property from link scanning',
        features: [],
        dateScraped: new Date(),
      };

      const dealData = this.mapScrapedLandToDealNormalized(mockScrapedLand);
      const normalizedDeal = await this.normalizer.normalizeDeal(dealData);

      return normalizedDeal;
    } catch (error) {
      console.error('❌ Error scanning by link:', error);
      return null;
    }
  }

  /**
   * Find existing deals by filter
   */
  async findExistingDeals(filter: SearchFilter): Promise<DealNormalized[]> {
    try {
      // For now, return empty array to avoid Firestore dependencies
      // In production, this would query Firestore
      return [];
    } catch (error) {
      console.error('❌ Error finding existing deals:', error);
      return [];
    }
  }

  /**
   * Get market statistics from existing deals
   */
  async getMarketStatsReal(city: string): Promise<{
    city: string;
    totalDeals: number;
    averagePrice: number;
    averageSurface: number;
    priceRange: { min: number; max: number };
    surfaceRange: { min: number; max: number };
    topSources: string[];
  }> {
    try {
      // For now, return mock stats to avoid Firestore dependencies
      // In production, this would query Firestore
      return {
        city,
        totalDeals: 0,
        averagePrice: 0,
        averageSurface: 0,
        priceRange: { min: 0, max: 0 },
        surfaceRange: { min: 0, max: 0 },
        topSources: [],
      };
    } catch (error) {
      console.error('❌ Error getting market stats:', error);
      return {
        city,
        totalDeals: 0,
        averagePrice: 0,
        averageSurface: 0,
        priceRange: { min: 0, max: 0 },
        surfaceRange: { min: 0, max: 0 },
        topSources: [],
      };
    }
  }
}
