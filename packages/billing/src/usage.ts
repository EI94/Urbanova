import { UsageEvent, ToolAction, USAGE_METRICS, getPriceIdForMetric } from '@urbanova/types';
import { reportUsage } from './stripe';
import {
  persistUsageEvent,
  updateUsageEventStatus,
  incrementRetryCount,
  updateMonthlyUsage,
} from './data';

// ============================================================================
// USAGE PIPELINE
// ============================================================================

export async function emitUsageEvent(
  workspaceId: string,
  toolId: string,
  action: ToolAction,
  quantity: number,
  runId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Create usage event
    const usageEvent: UsageEvent = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workspaceId,
      toolId,
      action,
      qty: quantity,
      runId,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
      metadata,
    };

    // Persist to Firestore
    await persistUsageEvent(usageEvent);

    // Update local monthly usage
    await updateMonthlyUsage(workspaceId, `${toolId}.${action}`, quantity);

    // Report to Stripe (async, don't wait)
    reportUsageToStripe(usageEvent).catch(error => {
      console.error('Error reporting usage to Stripe:', error);
    });

    console.log(`Usage event emitted: ${toolId}.${action} = ${quantity}`);
  } catch (error) {
    console.error('Error emitting usage event:', error);
    throw new Error(
      `Failed to emit usage event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// STRIPE REPORTING
// ============================================================================

async function reportUsageToStripe(usageEvent: UsageEvent): Promise<void> {
  try {
    // Get the metric for this action
    const metric = USAGE_METRICS[usageEvent.action];
    if (!metric) {
      console.warn(`No metric mapping found for action: ${usageEvent.action}`);
      return;
    }

    // Get the Stripe price ID for this metric
    const priceId = getPriceIdForMetric(metric);

    // For now, we'll use a mock subscription item ID
    // In production, this would come from the customer's subscription
    const subscriptionItemId = `si_${metric}_${usageEvent.workspaceId}`;

    // Report usage to Stripe
    await reportUsage(subscriptionItemId, usageEvent.qty, usageEvent.timestamp);

    // Update event status to sent
    await updateUsageEventStatus(usageEvent.id, 'sent');

    console.log(`Usage reported to Stripe: ${metric} = ${usageEvent.qty}`);
  } catch (error) {
    console.error('Error reporting usage to Stripe:', error);

    // Increment retry count
    await incrementRetryCount(usageEvent.id);

    // Update event status to failed
    await updateUsageEventStatus(usageEvent.id, 'failed');

    throw error;
  }
}

// ============================================================================
// RETRY MECHANISM
// ============================================================================

export async function retryFailedUsageEvents(): Promise<void> {
  try {
    const { getPendingUsageEvents } = await import('./data');
    const pendingEvents = await getPendingUsageEvents();

    console.log(`Retrying ${pendingEvents.length} failed usage events`);

    for (const event of pendingEvents) {
      try {
        await reportUsageToStripe(event);
      } catch (error) {
        console.error(`Failed to retry usage event ${event.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error retrying failed usage events:', error);
  }
}

// ============================================================================
// USAGE CALCULATION HELPERS
// ============================================================================

export function calculateUsageForToolRun(toolId: string, action: ToolAction, result: any): number {
  switch (action) {
    case 'ocr.process':
      return result.pagesProcessed || 1;

    case 'feasibility.run_bp':
      return 1; // One BP run

    case 'land-scraper.scan_market':
      return result.dealsFound || 1;

    case 'doc-hunter.request':
      return 1; // One document request

    case 'messaging.send_wa':
      return result.messagesSent || 1;

    case 'market-intelligence.scan_city':
      return 1; // One market scan

    case 'market-intelligence.trend_report':
      return 1; // One trend report

    case 'deal-caller.send_questionnaire':
      return 1; // One questionnaire

    default:
      return 1; // Default to 1
  }
}

export function getUsageMetadata(
  toolId: string,
  action: ToolAction,
  result: any
): Record<string, any> {
  const metadata: Record<string, any> = {
    toolId,
    action,
    timestamp: new Date().toISOString(),
  };

  // Add tool-specific metadata
  switch (action) {
    case 'ocr.process':
      metadata.pagesProcessed = result.pagesProcessed;
      metadata.documentType = result.documentType;
      break;

    case 'feasibility.run_bp':
      metadata.projectId = result.projectId;
      metadata.complexity = result.complexity;
      break;

    case 'land-scraper.scan_market':
      metadata.city = result.city;
      metadata.dealsFound = result.dealsFound;
      break;

    case 'doc-hunter.request':
      metadata.documentType = result.documentType;
      metadata.urgency = result.urgency;
      break;

    case 'messaging.send_wa':
      metadata.recipients = result.recipients;
      metadata.messageType = result.messageType;
      break;

    case 'market-intelligence.scan_city':
      metadata.city = result.city;
      metadata.assetType = result.assetType;
      break;

    case 'market-intelligence.trend_report':
      metadata.city = result.city;
      metadata.horizonMonths = result.horizonMonths;
      break;

    case 'deal-caller.send_questionnaire':
      metadata.projectId = result.projectId;
      metadata.vendorEmail = result.vendorEmail;
      break;
  }

  return metadata;
}

// ============================================================================
// USAGE ANALYTICS
// ============================================================================

export async function getUsageAnalytics(
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalUsage: number;
  totalCost: number;
  breakdown: Record<string, { usage: number; cost: number }>;
}> {
  try {
    const { listUsageEventsByWorkspace } = await import('./data');
    const events = await listUsageEventsByWorkspace(workspaceId, startDate, endDate);

    const breakdown: Record<string, { usage: number; cost: number }> = {};
    let totalUsage = 0;
    let totalCost = 0;

    events.forEach(event => {
      const key = `${event.toolId}.${event.action}`;
      const metric = USAGE_METRICS[event.action];

      if (!breakdown[key]) {
        breakdown[key] = { usage: 0, cost: 0 };
      }

      breakdown[key].usage += event.qty;
      totalUsage += event.qty;

      // Calculate cost (simplified)
      const costPerUnit = 0.01; // Default cost
      const cost = event.qty * costPerUnit;
      breakdown[key].cost += cost;
      totalCost += cost;
    });

    return {
      totalUsage,
      totalCost,
      breakdown,
    };
  } catch (error) {
    console.error('Error getting usage analytics:', error);
    throw new Error(
      `Failed to get usage analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
