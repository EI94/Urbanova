import {
  BillingState,
  UsageEvent,
  zBillingState,
  zUsageEvent,
  PLAN_ENTITLEMENTS,
} from '@urbanova/types';
// Database - defined locally until available in @urbanova/infra
const db = {
  FieldValue: {
    increment: (value: number) => `increment_${value}`,
  },
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => console.log(`Setting ${name}/${id}:`, data),
      get: async () => ({ 
        exists: false, 
        data: () => ({
          lastBillingDate: new Date().toISOString(),
          nextBillingDate: new Date().toISOString(),
          trialEndsAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
      }),
      update: async (data: any) => console.log(`Updating ${name}/${id}:`, data),
    }),
    get: async () => ({ 
      forEach: (callback: any) => {
        callback({
          id: 'temp-id',
          data: () => ({
            lastBillingDate: new Date().toISOString(),
            nextBillingDate: new Date().toISOString(),
            trialEndsAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })
        });
      } 
    }),
    where: (field: string, op: string, value: any) => ({
      get: async () => ({ forEach: (callback: any) => {} }),
      orderBy: (field: string, direction: string) => ({
        get: async () => ({ forEach: (callback: any) => {} })
      })
    }),
    orderBy: (field: string, direction: string) => ({
      get: async () => ({ forEach: (callback: any) => {} })
    }),
  }),
};

// ============================================================================
// BILLING STATE PERSISTENCE
// ============================================================================

export async function persistBillingState(billingState: BillingState): Promise<void> {
  try {
    const validated = zBillingState.parse(billingState);

    await db
      .collection('billing_states')
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
    const doc = await db.collection('billing_states').doc(workspaceId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    const billingState = {
      ...data,
      lastBillingDate: new Date(data.lastBillingDate),
      nextBillingDate: new Date(data.nextBillingDate),
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
    };

    return zBillingState.parse(billingState);
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
    const snapshot = await db.collection('billing_states').get();

    const billingStates: BillingState[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const billingState = {
        ...data,
        lastBillingDate: new Date(data.lastBillingDate),
        nextBillingDate: new Date(data.nextBillingDate),
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
      };

      try {
        billingStates.push(zBillingState.parse(billingState));
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

    await db
      .collection('usage_events')
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
    const doc = await db.collection('usage_events').doc(eventId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    const usageEvent = {
      ...data,
      timestamp: new Date(data.timestamp),
    };

    return zUsageEvent.parse(usageEvent);
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
    let query = db.collection('usage_events').where('workspaceId', '==', workspaceId);

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
      };

      try {
        usageEvents.push(zUsageEvent.parse(usageEvent));
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
    await db.collection('usage_events').doc(eventId).update({
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
    await db
      .collection('usage_events')
      .doc(eventId)
      .update({
        retryCount: db.FieldValue.increment(1),
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
    stripeSubId: '', // Will be set when subscription is created
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
    const snapshot = await db
      .collection('usage_events')
      .where('status', '==', 'pending')
      .where('retryCount', '<', 3)
      .get();

    const events: UsageEvent[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const event = {
        ...data,
        timestamp: new Date(data.timestamp),
      };

      try {
        events.push(zUsageEvent.parse(event));
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
