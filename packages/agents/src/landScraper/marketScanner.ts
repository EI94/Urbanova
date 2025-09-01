// Market Scanner Service - Real Integration with Firestore and RealLandScrapingAgent

import type { DealNormalized, SearchFilter, DealSearchResult } from '@urbanova/types';
import { DealNormalizerService } from './normalizer';
import { LandScraperIntegrationService } from './integration';

export class MarketScannerService {
  private normalizer: DealNormalizerService;
  private integration: LandScraperIntegrationService;

  constructor() {
    this.normalizer = new DealNormalizerService();
    this.integration = new LandScraperIntegrationService();
  }

  /**
   * Scan market using real scraping and existing deals
   */
  async scanMarket(filter: SearchFilter): Promise<DealSearchResult> {
    const startTime = Date.now();

    try {
      // First, get existing deals from Firestore
      const existingDeals = await this.integration.findExistingDeals(filter);

      // Then, scan for new deals using real scraping
      const newDealsResult = await this.integration.scanMarketReal(filter);

      // Combine and deduplicate
      const allDeals = [...existingDeals, ...newDealsResult.deals];
      const deduplicatedDeals = await this.handleDuplicates(allDeals);

      // Sort by trust score
      deduplicatedDeals.sort((a, b) => (b.trust || 0) - (a.trust || 0));

      // Apply limit if specified
      const finalDeals = filter.limit
        ? deduplicatedDeals.slice(0, filter.limit)
        : deduplicatedDeals;

      const duration = Math.max(1, Date.now() - startTime);

      return {
        deals: finalDeals,
        duplicates: newDealsResult.duplicates,
        totalFound: existingDeals.length + newDealsResult.totalFound,
        totalReturned: finalDeals.length,
        scanDuration: duration,
        scanTimestamp: new Date(),
        error: null,
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
   * Scan by link using real integration
   */
  async scanByLink(link: string): Promise<DealNormalized | null> {
    try {
      return await this.integration.scanByLinkReal(link);
    } catch (error) {
      console.error('❌ Error scanning by link:', error);
      return null;
    }
  }

  /**
   * Handle duplicates in deal list
   */
  private async handleDuplicates(deals: DealNormalized[]): Promise<DealNormalized[]> {
    const uniqueDeals: DealNormalized[] = [];
    const processedFingerprints = new Set<string>();

    for (const deal of deals) {
      const fingerprintKey = `${deal.fingerprint.addressHash}-${deal.fingerprint.surfaceRange}-${deal.fingerprint.priceRange}`;

      if (!processedFingerprints.has(fingerprintKey)) {
        processedFingerprints.add(fingerprintKey);
        uniqueDeals.push(deal);
      }
    }

    return uniqueDeals;
  }

  /**
   * Get market statistics from real data
   */
  async getMarketStats(city: string): Promise<{
    city: string;
    totalDeals: number;
    averagePrice: number;
    averageSurface: number;
    priceRange: { min: number; max: number };
    surfaceRange: { min: number; max: number };
    topSources: string[];
  }> {
    return await this.integration.getMarketStatsReal(city);
  }

  /**
   * Get trending deals based on trust score and recency
   */
  async getTrendingDeals(city: string, limit: number = 5): Promise<DealNormalized[]> {
    try {
      const deals = await this.integration.findExistingDeals({ city });

      // Sort by trust score and recency
      return deals
        .sort((a, b) => {
          const trustDiff = (b.trust || 0) - (a.trust || 0);
          if (Math.abs(trustDiff) > 0.1) return trustDiff;

          const recencyDiff =
            new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
          return recencyDiff;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting trending deals:', error);
      return [];
    }
  }
}
