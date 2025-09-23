# ADR-0097: Usage Reporting

**Status**: Accepted  
**Date**: 2024-12-31  
**Context**: Sistema di reporting usage per metered billing con Stripe.

## Decision

### Usage events

Ogni ToolRun emette `UsageEvent` con:

- `id`, `workspaceId`, `toolId`, `action`, `qty`, `runId`, `timestamp`

### Stripe integration

- `usage_record.create` su subscription item metered
- Retry con exponential backoff
- Coda locale se Stripe down

### Aggregazione

- Cloud Task cron per riconciliazione giornaliera
- Metrics tracking: Locale + Stripe per audit

## Consequences

### Positive

- Billing accurato e real-time
- Resilienza a downtime Stripe
- Audit trail completo
- Revenue tracking preciso

### Negative

- Complessità nella gestione della coda
- Overhead per retry logic
- Necessità di riconciliazione

## Implementation Notes

### Usage Event Structure

```typescript
interface UsageEvent {
  id: string;
  workspaceId: string;
  toolId: string;
  action: string;
  qty: number;
  runId: string;
  timestamp: Date;
  stripeItemId?: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}
```

### Stripe Integration

```typescript
async function reportUsageToStripe(usageEvent: UsageEvent) {
  try {
    const usageRecord = await stripe.usageRecords.create(usageEvent.stripeItemId!, {
      quantity: usageEvent.qty,
      timestamp: Math.floor(usageEvent.timestamp.getTime() / 1000),
      action: 'increment',
    });

    await updateUsageEventStatus(usageEvent.id, 'sent');
  } catch (error) {
    await incrementRetryCount(usageEvent.id);
    if (usageEvent.retryCount < 3) {
      await queueForRetry(usageEvent);
    }
  }
}
```

### Retry Strategy

- Exponential backoff: 1s, 2s, 4s, 8s
- Max retries: 3
- Dead letter queue per eventi falliti
- Manual reconciliation dashboard

### Cron Job

```typescript
// Daily reconciliation
async function reconcileUsage() {
  const pendingEvents = await getPendingUsageEvents();
  const stripeUsage = await getStripeUsageForPeriod();

  // Compare local vs Stripe
  // Flag discrepancies
  // Send alerts for manual review
}
```
