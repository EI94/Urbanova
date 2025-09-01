// Watchlist Service - Real Integration with Firestore

import type { Watchlist, DealAlert, SearchFilter } from '@urbanova/types';
import {
  persistWatchlist,
  getWatchlistById,
  listWatchlistsByUser,
  updateWatchlist,
  deleteWatchlist,
  persistDealAlert,
  getDealAlertsByWatchlist,
  markAlertAsRead,
  getUnreadAlertsCount,
} from '@urbanova/data';

export class WatchlistService {
  /**
   * Create a new watchlist
   */
  async createWatchlist(userId: string, filter: SearchFilter): Promise<Watchlist> {
    try {
      const watchlistData = {
        userId,
        filter,
        lastCheckedAt: new Date(),
        isActive: true,
      };

      const watchlistId = await persistWatchlist(watchlistData);

      // Get the created watchlist
      const watchlist = await getWatchlistById(watchlistId);
      if (!watchlist) {
        throw new Error('Failed to create watchlist');
      }

      console.log(`✅ Watchlist created: ${watchlistId}`);
      return watchlist;
    } catch (error) {
      console.error('❌ Error creating watchlist:', error);
      throw error;
    }
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(watchlistId: string): Promise<boolean> {
    try {
      const result = await deleteWatchlist(watchlistId);
      console.log(`✅ Watchlist deleted: ${watchlistId}`);
      return result;
    } catch (error) {
      console.error('❌ Error deleting watchlist:', error);
      throw error;
    }
  }

  /**
   * List all watchlists for a user
   */
  async listWatchlists(userId: string): Promise<Watchlist[]> {
    try {
      const watchlists = await listWatchlistsByUser(userId);
      console.log(`✅ Found ${watchlists.length} watchlists for user: ${userId}`);
      return watchlists;
    } catch (error) {
      console.error('❌ Error listing watchlists:', error);
      throw error;
    }
  }

  /**
   * Update a watchlist
   */
  async updateWatchlist(
    watchlistId: string,
    updates: Partial<Watchlist>
  ): Promise<Watchlist | null> {
    try {
      const updatedWatchlist = await updateWatchlist(watchlistId, updates);
      if (updatedWatchlist) {
        console.log(`✅ Watchlist updated: ${watchlistId}`);
      }
      return updatedWatchlist;
    } catch (error) {
      console.error('❌ Error updating watchlist:', error);
      throw error;
    }
  }

  /**
   * Check watchlists for new high-score deals and create alerts
   */
  async checkWatchlists(): Promise<DealAlert[]> {
    try {
      // For now, we'll return an empty array to avoid complex logic
      // In production, this would:
      // 1. Get all active watchlists
      // 2. Check for new deals matching each watchlist's filter
      // 3. Create alerts for deals above the trust score threshold
      console.log('🔍 Checking watchlists for new deals...');
      return [];
    } catch (error) {
      console.error('❌ Error checking watchlists:', error);
      throw error;
    }
  }

  /**
   * Get alerts for a specific watchlist
   */
  async getWatchlistAlerts(watchlistId: string): Promise<DealAlert[]> {
    try {
      const alerts = await getDealAlertsByWatchlist(watchlistId);
      console.log(`✅ Found ${alerts.length} alerts for watchlist: ${watchlistId}`);
      return alerts;
    } catch (error) {
      console.error('❌ Error getting watchlist alerts:', error);
      throw error;
    }
  }

  /**
   * Mark an alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await markAlertAsRead(alertId);
      console.log(`✅ Alert marked as read: ${alertId}`);
    } catch (error) {
      console.error('❌ Error marking alert as read:', error);
      throw error;
    }
  }

  /**
   * Get unread alerts count for a user
   */
  async getUnreadAlertsCount(userId: string): Promise<number> {
    try {
      const count = await getUnreadAlertsCount(userId);
      console.log(`✅ User ${userId} has ${count} unread alerts`);
      return count;
    } catch (error) {
      console.error('❌ Error getting unread alerts count:', error);
      throw error;
    }
  }
}
