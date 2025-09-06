import {
  BillingState,
  UsageEvent,
  zBillingState,
  zUsageEvent,
  PLAN_ENTITLEMENTS,
} from '@urbanova/types';
import { getFirestoreInstance, serverTimestamp, safeCollection } from '@urbanova/infra';

// REAL Firebase instance - NO MORE MOCKS!
const db = getFirestoreInstance();
const FieldValue = {
  increment: (value: number) => {
    const { FieldValue } = require('firebase-admin/firestore');
    return FieldValue.increment(value);
  },
  serverTimestamp: () => serverTimestamp(),
};

// ============================================================================
// BILLING STATE PERSISTENCE
// ============================================================================

export async function persistBillingState(billingState: BillingState): Promise<void> {
  try {
    const validated = zBillingState.parse(billingState);

    await safeCollection('billing_states')
      .doc(validated.workspaceId)
      .set({
        ...validated,
        lastBillingDate: validated.lastBillingDate.toISOString(),
        nextBillingDate: validated.nextBillingDate.toISOString(),
        trialEndsAt: validated.trialEndsAt?.toISOString(),
        updatedAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error persisting billing state:', error);
    throw new Error(
      `Failed to persist billing state: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getBillingState(workspaceId: string): Promise<BillingState | null> {
  try {
    const doc = await safeCollection('billing_states').doc(workspaceId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    const billingState = {
      ...data,
      lastBillingDate: new Date(data.lastBillingDate),
      nextBillingDate: new Date(data.nextBillingDate),
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
      stripeSubId: data.stripeSubId || 'temp-sub-id',
    } as unknown as BillingState;

    return zBillingState.parse(billingState as any) as BillingState;
  } catch (error) {
    console.error('Error retrieving billing state:', error);
    throw new Error(
      `Failed to retrieve billing state: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateBillingState(
  workspaceId: string,
  updates: Partial<BillingState>
): Promise<void> {
  try {
    const currentState = await getBillingState(workspaceId);
    if (!currentState) {
      throw new Error('Billing state not found');
    }

    const updatedState = {
      ...currentState,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await persistBillingState(updatedState);
  } catch (error) {
    console.error('Error updating billing state:', error);
    throw new Error(
      `Failed to update billing state: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function listBillingStates(): Promise<BillingState[]> {
  try {
    const snapshot = await safeCollection('billing_states').get();

    const billingStates: BillingState[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const billingState = {
        ...data,
        lastBillingDate: new Date(data.lastBillingDate),
        nextBillingDate: new Date(data.nextBillingDate),
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
        stripeSubId: data.stripeSubId || 'temp-sub-id',
      } as unknown as BillingState;

      try {
        billingStates.push(zBillingState.parse(billingState as any) as BillingState);
      } catch (parseError) {
        console.warn(`Invalid billing state for workspace ${doc.id}:`, parseError);
      }
    });

    return billingStates;
  } catch (error) {
    console.error('Error listing billing states:', error);
    throw new Error(
      `Failed to list billing states: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// USAGE EVENTS PERSISTENCE
// ============================================================================

export async function persistUsageEvent(usageEvent: UsageEvent): Promise<void> {
  try {
    const validated = zUsageEvent.parse(usageEvent);

    await safeCollection('usage_events')
      .doc(validated.id)
      .set({
        ...validated,
        timestamp: validated.timestamp.toISOString(),
        createdAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error persisting usage event:', error);
    throw new Error(
      `Failed to persist usage event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getUsageEvent(eventId: string): Promise<UsageEvent | null> {
  try {
    const doc = await safeCollection('usage_events').doc(eventId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    const usageEvent = {
      ...data,
      timestamp: new Date(data.timestamp),
      action: (data.action || 'unknown') as any, // Cast to ToolAction with fallback
    } as unknown as UsageEvent;

    return zUsageEvent.parse(usageEvent as any) as UsageEvent;
  } catch (error) {
    console.error('Error retrieving usage event:', error);
    throw new Error(
      `Failed to retrieve usage event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function listUsageEventsByWorkspace(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date
): Promise<UsageEvent[]> {
  try {
    let query: any = safeCollection('usage_events').where('workspaceId', '==', workspaceId);

    if (startDate) {
      query = query.where('timestamp', '>=', startDate.toISOString());
    }

    if (endDate) {
      query = query.where('timestamp', '<=', endDate.toISOString());
    }

    const snapshot = await query.orderBy('timestamp', 'desc').get();

    const usageEvents: UsageEvent[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const usageEvent = {
        ...data,
        timestamp: new Date(data.timestamp),
        action: data.action as any, // Cast to ToolAction
      } as unknown as UsageEvent;

      try {
        usageEvents.push(zUsageEvent.parse(usageEvent as any) as UsageEvent);
      } catch (parseError) {
        console.warn(`Invalid usage event ${doc.id}:`, parseError);
      }
    });

    return usageEvents;
  } catch (error) {
    console.error('Error listing usage events:', error);
    throw new Error(
      `Failed to list usage events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateUsageEventStatus(
  eventId: string,
  status: 'pending' | 'sent' | 'failed'
): Promise<void> {
  try {
    await safeCollection('usage_events').doc(eventId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating usage event status:', error);
    throw new Error(
      `Failed to update usage event status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function incrementRetryCount(eventId: string): Promise<void> {
  try {
    await safeCollection('usage_events')
      .doc(eventId)
      .update({
        retryCount: FieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error incrementing retry count:', error);
    throw new Error(
      `Failed to increment retry count: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// USAGE AGGREGATION
// ============================================================================

export async function getMonthlyUsage(
  workspaceId: string,
  year: number,
  month: number
): Promise<Record<string, number>> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const usageEvents = await listUsageEventsByWorkspace(workspaceId, startDate, endDate);

    const usage: Record<string, number> = {};

    usageEvents.forEach(event => {
      const key = `${event.toolId}.${event.action as string}`;
      usage[key] = (usage[key] || 0) + event.qty;
    });

    return usage;
  } catch (error) {
    console.error('Error getting monthly usage:', error);
    throw new Error(
      `Failed to get monthly usage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateMonthlyUsage(
  workspaceId: string,
  toolAction: string,
  quantity: number
): Promise<void> {
  try {
    const currentState = await getBillingState(workspaceId);
    if (!currentState) {
      throw new Error('Billing state not found');
    }

    const currentUsage = currentState.usageMonth[toolAction] || 0;
    const newUsage = currentUsage + quantity;

    await updateBillingState(workspaceId, {
      usageMonth: {
        ...currentState.usageMonth,
        [toolAction]: newUsage,
      },
    });
  } catch (error) {
    console.error('Error updating monthly usage:', error);
    throw new Error(
      `Failed to update monthly usage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function createDefaultBillingState(
  workspaceId: string,
  stripeCustomerId: string,
  plan: 'starter' | 'pro' | 'business' = 'starter'
): Promise<BillingState> {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const billingState: BillingState = {
    workspaceId,
    stripeCustomerId,
    plan,
    trialEndsAt,
    entitlements: PLAN_ENTITLEMENTS[plan],
    usageMonth: {},
    lastBillingDate: now,
    nextBillingDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: 'trialing',
    stripeSubId: 'temp-sub-id', // Will be set when subscription is created
  };

  await persistBillingState(billingState);
  return billingState;
}

export async function resetMonthlyUsage(workspaceId: string): Promise<void> {
  try {
    await updateBillingState(workspaceId, {
      usageMonth: {},
      lastBillingDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    throw new Error(
      `Failed to reset monthly usage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getPendingUsageEvents(): Promise<UsageEvent[]> {
  try {
    const snapshot = await safeCollection('usage_events')
      .where('status', '==', 'pending')
      .where('retryCount', '<', 3)
      .get();

    const events: UsageEvent[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const event = {
        ...data,
        timestamp: new Date(data.timestamp),
        action: data.action as any, // Cast to ToolAction
      } as unknown as UsageEvent;

      try {
        events.push(zUsageEvent.parse(event as any) as UsageEvent);
      } catch (parseError) {
        console.warn(`Invalid usage event ${doc.id}:`, parseError);
      }
    });

    return events;
  } catch (error) {
    console.error('Error getting pending usage events:', error);
    throw new Error(
      `Failed to get pending usage events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
