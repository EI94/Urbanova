// Data persistence service for deals and watchlists - @urbanova/data package

import { z } from 'zod';
import type {
  DealNormalized,
  SearchFilter,
  Watchlist,
  DealAlert,
  DealSearchResult,
  DealFingerprint,
} from '@urbanova/types';
import { getFirestoreInstance, serverTimestamp } from '@urbanova/infra';

// Zod schemas for data validation
export const zCreateDealData = z.object({
  id: z.string().min(1),
  link: z.string().url().optional(),
  source: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  surface: z.number().positive().optional(),
  priceAsk: z.number().positive().optional(),
  zoningHint: z.string().optional(),
  policy: z.enum(['allowed', 'limited', 'blocked']).default('allowed'),
  trust: z.number().min(0).max(1),
  discoveredAt: z.date(),
  updatedAt: z.date(),
  fingerprint: z.object({
    addressHash: z.string(),
    surfaceRange: z.string(),
    priceRange: z.string(),
    zoning: z.string(),
  }),
  metadata: z.record(z.any()).default({}),
});

export type CreateDealData = z.infer<typeof zCreateDealData>;

export const zCreateWatchlistData = z.object({
  userId: z.string().min(1),
  filter: z.object({
    city: z.string().min(1),
    budgetMax: z.number().positive().optional(),
    surfaceMin: z.number().positive().optional(),
    zoning: z.array(z.string()).optional(),
    limit: z.number().positive().optional(),
  }),
  lastCheckedAt: z.date(),
  isActive: z.boolean().default(true),
});

export type CreateWatchlistData = z.infer<typeof zCreateWatchlistData>;

export const zCreateDealAlertData = z.object({
  watchlistId: z.string().min(1),
  dealId: z.string().min(1),
  isRead: z.boolean().default(false),
  message: z.string().min(1),
  trustScore: z.number().min(0).max(1),
  createdAt: z.date(),
});

export type CreateDealAlertData = z.infer<typeof zCreateDealAlertData>;

// Real Firestore persistence functions for deals
export async function persistDeal(dealData: CreateDealData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const dealId = dealData.id;

    const dealRef = db.collection('deals').doc(dealId);
    await dealRef.set({
      ...dealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Deal persisted to Firestore: ${dealId}`);
    return dealId;
  } catch (error) {
    console.error('❌ Error persisting deal to Firestore:', error);
    throw error;
  }
}

export async function getDealById(dealId: string): Promise<DealNormalized | null> {
  try {
    const db = getFirestoreInstance();
    const dealDoc = await db.collection('deals').doc(dealId).get();

    if (!dealDoc.exists) {
      return null;
    }

    return dealDoc.data() as DealNormalized;
  } catch (error) {
    console.error('❌ Error getting deal from Firestore:', error);
    throw error;
  }
}

export async function findDealsByFilter(filter: SearchFilter): Promise<DealNormalized[]> {
  try {
    const db = getFirestoreInstance();
    let query: any = db.collection('deals');

    // Apply filters
    if (filter.city) {
      query = query.where('city', '==', filter.city);
    }

    if (filter.budgetMax) {
      query = query.where('priceAsk', '<=', filter.budgetMax);
    }

    if (filter.surfaceMin) {
      query = query.where('surface', '>=', filter.surfaceMin);
    }

    if (filter.zoning && filter.zoning.length > 0) {
      query = query.where('zoningHint', 'in', filter.zoning);
    }

    // Order by trust score and limit results
    query = query.orderBy('trust', 'desc');
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const snapshot = await query.get();
    const deals: DealNormalized[] = [];

    snapshot.forEach(doc => {
      deals.push(doc.data() as DealNormalized);
    });

    return deals;
  } catch (error) {
    console.error('❌ Error finding deals in Firestore:', error);
    throw error;
  }
}

export async function findDealByFingerprint(
  fingerprint: DealFingerprint
): Promise<DealNormalized | null> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db
      .collection('deals')
      .where('fingerprint.addressHash', '==', fingerprint.addressHash)
      .where('fingerprint.surfaceRange', '==', fingerprint.surfaceRange)
      .where('fingerprint.priceRange', '==', fingerprint.priceRange)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0]?.data() as DealNormalized;
  } catch (error) {
    console.error('❌ Error finding deal by fingerprint in Firestore:', error);
    throw error;
  }
}

export async function updateDeal(dealId: string, updates: Partial<DealNormalized>): Promise<void> {
  try {
    const db = getFirestoreInstance();
    await db
      .collection('deals')
      .doc(dealId)
      .update({
        ...updates,
        updatedAt: serverTimestamp(),
      });

    console.log(`✅ Deal updated in Firestore: ${dealId}`);
  } catch (error) {
    console.error('❌ Error updating deal in Firestore:', error);
    throw error;
  }
}

// Real Firestore persistence functions for watchlists
export async function persistWatchlist(watchlistData: CreateWatchlistData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const watchlistId = `watchlist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const watchlistRef = db.collection('watchlists').doc(watchlistId);
    await watchlistRef.set({
      ...watchlistData,
      id: watchlistId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Watchlist persisted to Firestore: ${watchlistId}`);
    return watchlistId;
  } catch (error) {
    console.error('❌ Error persisting watchlist to Firestore:', error);
    throw error;
  }
}

export async function getWatchlistById(watchlistId: string): Promise<Watchlist | null> {
  try {
    const db = getFirestoreInstance();
    const watchlistDoc = await db.collection('watchlists').doc(watchlistId).get();

    if (!watchlistDoc.exists) {
      return null;
    }

    return watchlistDoc.data() as Watchlist;
  } catch (error) {
    console.error('❌ Error getting watchlist from Firestore:', error);
    throw error;
  }
}

export async function listWatchlistsByUser(userId: string): Promise<Watchlist[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db
      .collection('watchlists')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const watchlists: Watchlist[] = [];
    snapshot.forEach(doc => {
      watchlists.push(doc.data() as Watchlist);
    });

    return watchlists;
  } catch (error) {
    console.error('❌ Error listing watchlists from Firestore:', error);
    throw error;
  }
}

export async function updateWatchlist(
  watchlistId: string,
  updates: Partial<Watchlist>
): Promise<Watchlist | null> {
  try {
    const db = getFirestoreInstance();
    const watchlistRef = db.collection('watchlists').doc(watchlistId);

    await watchlistRef.update({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Get updated watchlist
    const updatedDoc = await watchlistRef.get();
    if (!updatedDoc.exists) {
      return null;
    }

    console.log(`✅ Watchlist updated in Firestore: ${watchlistId}`);
    return updatedDoc.data() as Watchlist;
  } catch (error) {
    console.error('❌ Error updating watchlist in Firestore:', error);
    throw error;
  }
}

export async function deleteWatchlist(watchlistId: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    await db.collection('watchlists').doc(watchlistId).delete();

    console.log(`✅ Watchlist deleted from Firestore: ${watchlistId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting watchlist from Firestore:', error);
    throw error;
  }
}

// Real Firestore persistence functions for deal alerts
export async function persistDealAlert(alertData: CreateDealAlertData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const alertRef = db.collection('dealAlerts').doc(alertId);
    await alertRef.set({
      ...alertData,
      id: alertId,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Deal alert persisted to Firestore: ${alertId}`);
    return alertId;
  } catch (error) {
    console.error('❌ Error persisting deal alert to Firestore:', error);
    throw error;
  }
}

export async function getDealAlertsByWatchlist(watchlistId: string): Promise<DealAlert[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db
      .collection('dealAlerts')
      .where('watchlistId', '==', watchlistId)
      .orderBy('createdAt', 'desc')
      .get();

    const alerts: DealAlert[] = [];
    snapshot.forEach(doc => {
      alerts.push(doc.data() as DealAlert);
    });

    return alerts;
  } catch (error) {
    console.error('❌ Error getting deal alerts from Firestore:', error);
    throw error;
  }
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    const db = getFirestoreInstance();
    await db.collection('dealAlerts').doc(alertId).update({
      isRead: true,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Alert marked as read: ${alertId}`);
  } catch (error) {
    console.error('❌ Error marking alert as read in Firestore:', error);
    throw error;
  }
}

export async function getUnreadAlertsCount(userId: string): Promise<number> {
  try {
    const db = getFirestoreInstance();

    // Get all watchlists for the user
    const watchlists = await listWatchlistsByUser(userId);
    const watchlistIds = watchlists.map(w => w.id);

    if (watchlistIds.length === 0) {
      return 0;
    }

    // Count unread alerts for all user's watchlists
    const snapshot = await db
      .collection('dealAlerts')
      .where('watchlistId', 'in', watchlistIds)
      .where('isRead', '==', false)
      .get();

    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting unread alerts count from Firestore:', error);
    throw error;
  }
}
