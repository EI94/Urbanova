import {
  MarketSnapshot,
  MarketTrendReport,
  zMarketSnapshot,
  zMarketTrendReport,
} from '@urbanova/types';
import { getFirestoreInstance, serverTimestamp, safeCollection } from '@urbanova/infra';

const db = getFirestoreInstance();

// ============================================================================
// MARKET SNAPSHOTS PERSISTENCE
// ============================================================================

/**
 * Salva un nuovo market snapshot
 */
export async function persistMarketSnapshot(snapshot: MarketSnapshot): Promise<void> {
  try {
    const validated = zMarketSnapshot.parse(snapshot);

    await db
      .collection('market_snapshots')
      .doc(validated.id)
      .set({
        ...validated,
        timestamp: validated.timestamp.toISOString(),
        data: {
          ...validated.data,
          heatmap: validated.data.heatmap,
          insights: validated.data.insights.map(insight => ({
            ...insight,
            id: insight.id,
            dataPoints: insight.dataPoints,
          })),
          comps: validated.data.comps,
          omi: {
            ...validated.data.omi,
            lastUpdate: validated.data.omi.lastUpdate.toISOString(),
          },
        },
        metadata: {
          ...validated.metadata,
          dataSources: validated.metadata.dataSources,
        },
      });
  } catch (error) {
    console.error('Error persisting market snapshot:', error);
    throw error;
  }
}

/**
 * Recupera snapshot per ID
 */
export async function getMarketSnapshot(id: string): Promise<MarketSnapshot | null> {
  try {
    const doc = await safeCollection('market_snapshots').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      data: {
        ...data.data,
        insights: data.data.insights.map((insight: any) => ({
          ...insight,
          id: insight.id,
        })),
        omi: {
          ...data.data.omi,
          lastUpdate: new Date(data.data.omi.lastUpdate),
        },
      },
    } as MarketSnapshot;
  } catch (error) {
    console.error('Error getting market snapshot:', error);
    return null;
  }
}

/**
 * Recupera snapshot per chiave (city_asset_horizon)
 */
export async function getMarketSnapshotByKey(
  city: string,
  asset: string,
  horizonMonths: number
): Promise<MarketSnapshot | null> {
  try {
    const snapshot = await db
      .collection('market_snapshots')
      .where('city', '==', city)
      .where('asset', '==', asset)
      .where('horizonMonths', '==', horizonMonths)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0]!;
    const data = doc.data();

    return {
      ...data,
      timestamp: new Date(data.timestamp),
      data: {
        ...data.data,
        insights: data.data.insights.map((insight: any) => ({
          ...insight,
          id: insight.id,
        })),
        omi: {
          ...data.data.omi,
          lastUpdate: new Date(data.data.omi.lastUpdate),
        },
      },
    } as MarketSnapshot;
  } catch (error) {
    console.error('Error getting market snapshot by key:', error);
    return null;
  }
}

/**
 * Lista snapshot per città
 */
export async function listMarketSnapshotsByCity(
  city: string,
  limit: number = 50
): Promise<MarketSnapshot[]> {
  try {
    const snapshot = await db
      .collection('market_snapshots')
      .where('city', '==', city)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
        data: {
          ...data.data,
          insights: data.data.insights.map((insight: any) => ({
            ...insight,
            id: insight.id,
          })),
          omi: {
            ...data.data.omi,
            lastUpdate: new Date(data.data.omi.lastUpdate),
          },
        },
      } as MarketSnapshot;
    });
  } catch (error) {
    console.error('Error listing market snapshots by city:', error);
    return [];
  }
}

/**
 * Lista snapshot recenti
 */
export async function listRecentMarketSnapshots(limit: number = 20): Promise<MarketSnapshot[]> {
  try {
    const snapshot = await db
      .collection('market_snapshots')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
        data: {
          ...data.data,
          insights: data.data.insights.map((insight: any) => ({
            ...insight,
            id: insight.id,
          })),
          omi: {
            ...data.data.omi,
            lastUpdate: new Date(data.data.omi.lastUpdate),
          },
        },
      } as MarketSnapshot;
    });
  } catch (error) {
    console.error('Error listing recent market snapshots:', error);
    return [];
  }
}

// ============================================================================
// MARKET TREND REPORTS PERSISTENCE
// ============================================================================

/**
 * Salva un nuovo market trend report
 */
export async function persistMarketTrendReport(report: MarketTrendReport): Promise<void> {
  try {
    const validated = zMarketTrendReport.parse(report);

    await db
      .collection('market_trend_reports')
      .doc(validated.id)
      .set({
        ...validated,
        generatedAt: validated.generatedAt.toISOString(),
        summary: {
          ...validated.summary,
          keyInsights: validated.summary.keyInsights.map(insight => ({
            ...insight,
            id: insight.id,
          })),
        },
      });
  } catch (error) {
    console.error('Error persisting market trend report:', error);
    throw error;
  }
}

/**
 * Recupera trend report per ID
 */
export async function getMarketTrendReport(id: string): Promise<MarketTrendReport | null> {
  try {
    const doc = await safeCollection('market_trend_reports').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
      summary: {
        ...data.summary,
        keyInsights: data.summary.keyInsights.map((insight: any) => ({
          ...insight,
          id: insight.id,
        })),
      },
    } as MarketTrendReport;
  } catch (error) {
    console.error('Error getting market trend report:', error);
    return null;
  }
}

/**
 * Lista trend reports per città
 */
export async function listMarketTrendReportsByCity(
  city: string,
  limit: number = 20
): Promise<MarketTrendReport[]> {
  try {
    const snapshot = await db
      .collection('market_trend_reports')
      .where('city', '==', city)
      .orderBy('generatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        generatedAt: new Date(data.generatedAt),
        summary: {
          ...data.summary,
          keyInsights: data.summary.keyInsights.map((insight: any) => ({
            ...insight,
            id: insight.id,
          })),
        },
      } as MarketTrendReport;
    });
  } catch (error) {
    console.error('Error listing market trend reports by city:', error);
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Genera statistiche market snapshots
 */
export async function getMarketSnapshotStats(city?: string): Promise<{
  total: number;
  byAsset: Record<string, number>;
  byHorizon: Record<number, number>;
  averageGenerationTime: number;
  averageDataQuality: number;
}> {
  try {
    let query: any = safeCollection('market_snapshots');

    if (city) {
      query = query.where('city', '==', city);
    }

    const snapshot = await query.get();
    const snapshots = snapshot.docs.map((doc: any) => doc.data());

    const byAsset: Record<string, number> = {};
    const byHorizon: Record<number, number> = {};
    let totalGenerationTime = 0;
    let totalDataQuality = 0;

    snapshots.forEach((snap: any) => {
      // Count by asset
      byAsset[snap.asset] = (byAsset[snap.asset] || 0) + 1;

      // Count by horizon
      byHorizon[snap.horizonMonths] = (byHorizon[snap.horizonMonths] || 0) + 1;

      // Sum generation time and data quality
      totalGenerationTime += snap.metadata.generationTime;
      totalDataQuality += snap.metadata.dataQuality;
    });

    return {
      total: snapshots.length,
      byAsset,
      byHorizon,
      averageGenerationTime: snapshots.length > 0 ? totalGenerationTime / snapshots.length : 0,
      averageDataQuality: snapshots.length > 0 ? totalDataQuality / snapshots.length : 0,
    };
  } catch (error) {
    console.error('Error getting market snapshot stats:', error);
    return {
      total: 0,
      byAsset: {},
      byHorizon: {},
      averageGenerationTime: 0,
      averageDataQuality: 0,
    };
  }
}

/**
 * Pulisce snapshot obsoleti
 */
export async function cleanupOldMarketSnapshots(
  daysOld: number = 30
): Promise<{ cleaned: number; errors: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const snapshot = await db
      .collection('market_snapshots')
      .where('timestamp', '<', cutoffDate.toISOString())
      .get();

    let cleaned = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
      try {
        await doc.ref.delete();
        cleaned++;
      } catch (error) {
        console.error('Error deleting old snapshot:', error);
        errors++;
      }
    }

    return { cleaned, errors };
  } catch (error) {
    console.error('Error in cleanup old market snapshots:', error);
    return { cleaned: 0, errors: 1 };
  }
}

/**
 * Aggiorna cache hit per snapshot
 */
export async function updateSnapshotCacheHit(snapshotId: string, cacheHit: boolean): Promise<void> {
  try {
    await safeCollection('market_snapshots').doc(snapshotId).update({
      'metadata.cacheHit': cacheHit,
      'metadata.lastAccessed': new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating snapshot cache hit:', error);
  }
}
