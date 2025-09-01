export { DealNormalizerService } from './normalizer';
export { AuctionsScraperService } from './auctions';
export { WatchlistService } from './watchlist';
export { MarketScannerService } from './marketScanner';

// Main LandScraperTool class that orchestrates all services
export class LandScraperTool {
  private marketScanner: MarketScannerService;
  private watchlistService: WatchlistService;
  private normalizer: DealNormalizerService;

  constructor() {
    this.marketScanner = new MarketScannerService();
    this.watchlistService = new WatchlistService();
    this.normalizer = new DealNormalizerService();
  }

  // ============================================================================
  // CORE SCANNING METHODS
  // ============================================================================

  /**
   * Scan a specific property by link
   * Normalizes, deduplicates, and returns the deal
   */
  async scanByLink(link: string) {
    return this.marketScanner.scanByLink(link);
  }

  /**
   * Scan the market based on search filters
   * Queries multiple sources, merges results, and ranks by trust score
   */
  async scanMarket(filter: any) {
    return this.marketScanner.scanMarket(filter);
  }

  /**
   * Find auctions in a specific city
   */
  async findAuctions(city: string) {
    return this.marketScanner.findAuctions(city);
  }

  // ============================================================================
  // WATCHLIST METHODS
  // ============================================================================

  /**
   * Create a new watchlist for a user
   */
  async createWatchlist(userId: string, filter: any, notifications: any) {
    return this.watchlistService.createWatchlist(userId, filter, notifications);
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(watchlistId: string, userId: string) {
    return this.watchlistService.deleteWatchlist(watchlistId, userId);
  }

  /**
   * List all watchlists for a user
   */
  async listWatchlists(userId: string) {
    return this.watchlistService.listWatchlists(userId);
  }

  /**
   * Update a watchlist
   */
  async updateWatchlist(watchlistId: string, updates: any) {
    return this.watchlistService.updateWatchlist(watchlistId, updates);
  }

  /**
   * Check watchlists and generate alerts for new high-score deals
   */
  async checkWatchlists() {
    return this.watchlistService.checkWatchlists();
  }

  /**
   * Get alerts for a specific watchlist
   */
  async getWatchlistAlerts(watchlistId: string) {
    return this.watchlistService.getWatchlistAlerts(watchlistId);
  }

  /**
   * Mark an alert as read
   */
  async markAlertAsRead(alertId: string) {
    return this.watchlistService.markAlertAsRead(alertId);
  }

  /**
   * Get watchlist statistics
   */
  async getWatchlistStats(userId: string) {
    return this.watchlistService.getWatchlistStats(userId);
  }

  // ============================================================================
  // MARKET ANALYSIS METHODS
  // ============================================================================

  /**
   * Get market statistics for a city
   */
  async getMarketStats(city: string) {
    return this.marketScanner.getMarketStats(city);
  }

  /**
   * Get trending deals (high trust score, recent)
   */
  async getTrendingDeals(city?: string, limit?: number) {
    return this.marketScanner.getTrendingDeals(city, limit);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate a fingerprint for a deal
   */
  async generateFingerprint(deal: any) {
    return this.normalizer.generateFingerprint(deal);
  }

  /**
   * Calculate trust score for a deal
   */
  async calculateTrustScore(deal: any) {
    return this.normalizer.calculateTrustScore(deal);
  }

  /**
   * Check if two deals are duplicates
   */
  async areDuplicates(deal1: any, deal2: any) {
    return this.normalizer.areDuplicates(deal1, deal2);
  }

  /**
   * Merge duplicate deals
   */
  async mergeDuplicates(deal1: any, deal2: any) {
    return this.normalizer.mergeDuplicates(deal1, deal2);
  }

  /**
   * Normalize a deal
   */
  async normalizeDeal(deal: any) {
    return this.normalizer.normalizeDeal(deal);
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Batch scan multiple links
   */
  async batchScanByLinks(links: string[]) {
    console.log(`🔄 Batch scanning ${links.length} links...`);

    const results = await Promise.allSettled(links.map(link => this.scanByLink(link)));

    const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null);
    const failed = results.filter(r => r.status === 'rejected' || r.value === null);

    console.log(`✅ Batch scan complete: ${successful.length} successful, ${failed.length} failed`);

    return {
      successful: successful.map(r => (r as PromiseFulfilledResult<any>).value),
      failed: failed.length,
      total: links.length,
    };
  }

  /**
   * Batch check all watchlists
   */
  async batchCheckWatchlists() {
    console.log('🔄 Batch checking all watchlists...');

    try {
      const alerts = await this.watchlistService.checkWatchlists();

      console.log(`✅ Batch watchlist check complete: ${alerts.length} alerts generated`);

      return {
        alerts,
        totalAlerts: alerts.length,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Error in batch watchlist check:', error);
      return {
        alerts: [],
        totalAlerts: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check the health of all services
   */
  async healthCheck() {
    const checks = {
      normalizer: true, // Always available
      marketScanner: true, // Always available
      watchlistService: true, // Always available
      timestamp: new Date(),
    };

    try {
      // Test basic functionality
      await this.normalizer.generateFingerprint({ address: 'test' });
      await this.marketScanner.getMarketStats('Torino');
      await this.watchlistService.getWatchlistStats('test-user');

      return {
        ...checks,
        status: 'healthy',
        message: 'All services are functioning correctly',
      };
    } catch (error) {
      return {
        ...checks,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export a default instance
export const landScraperTool = new LandScraperTool();

// Export individual services for direct use
export const dealNormalizer = new DealNormalizerService();
export const auctionsScraper = new AuctionsScraperService();
export const watchlistService = new WatchlistService();
export const marketScanner = new MarketScannerService();
