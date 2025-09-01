import Stripe from 'stripe';
import {
  StripeCustomer,
  StripeSubscription,
  StripeInvoice,
  CheckoutSession,
  CustomerPortalSession,
  PlanId,
} from '@urbanova/types';

// ============================================================================
// STRIPE INITIALIZATION
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// ============================================================================
// PRICE IDS (TEST MODE)
// ============================================================================

const STRIPE_PRICE_IDS = {
  // Monthly plans
  starter: process.env.STRIPE_PRICE_PLAN_STARTER || 'price_starter_monthly_test',
  pro: process.env.STRIPE_PRICE_PLAN_PRO || 'price_pro_monthly_test',
  business: process.env.STRIPE_PRICE_PLAN_BUSINESS || 'price_business_monthly_test',

  // Metered usage
  ocr_pages: process.env.STRIPE_PRICE_METERED_OCR || 'price_metered_ocr_test',
  feasibility_runs: process.env.STRIPE_PRICE_METERED_FEAS || 'price_metered_feasibility_test',
  scraper_scans: process.env.STRIPE_PRICE_METERED_SCRAPER || 'price_metered_scraper_test',
  doc_requests: process.env.STRIPE_PRICE_METERED_DOC || 'price_metered_doc_request_test',
  wa_messages: process.env.STRIPE_PRICE_METERED_WA || 'price_metered_wa_message_test',
  market_scans: process.env.STRIPE_PRICE_METERED_MARKET || 'price_metered_market_scan_test',
  trend_reports: process.env.STRIPE_PRICE_METERED_TREND || 'price_metered_trend_report_test',
  questionnaires:
    process.env.STRIPE_PRICE_METERED_QUESTIONNAIRE || 'price_metered_questionnaire_test',
};

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

export async function createCustomer(email: string, name?: string): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.create({
      email,
      ...(name && { name }),
      metadata: {
        source: 'urbanova_billing',
      },
    });

    return {
      id: customer.id,
      email: customer.email!,
      ...(customer.name && { name: customer.name }),
      ...(customer.phone && { phone: customer.phone }),
      address: customer.address
        ? {
            line1: customer.address.line1 || '',
            ...(customer.address.line2 && { line2: customer.address.line2 }),
            city: customer.address.city || '',
            ...(customer.address.state && { state: customer.address.state }),
            postal_code: customer.address.postal_code || '',
            country: customer.address.country || '',
          } as any
        : undefined,
      tax_exempt: customer.tax_exempt as any,
      tax_ids: customer.tax_ids?.data.map(taxId => ({
        type: taxId.type as any,
        value: taxId.value,
        verification: {
          status: taxId.verification?.status as any || 'unverified',
        },
      })),
    } as any;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error(
      `Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getCustomer(customerId: string): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return {
      id: customer.id,
      email: customer.email!,
      ...(customer.name && { name: customer.name }),
      ...(customer.phone && { phone: customer.phone }),
      address: customer.address
        ? {
            line1: customer.address.line1 || '',
            ...(customer.address.line2 && { line2: customer.address.line2 }),
            city: customer.address.city || '',
            ...(customer.address.state && { state: customer.address.state }),
            postal_code: customer.address.postal_code || '',
            country: customer.address.country || '',
          } as any
        : undefined,
      tax_exempt: customer.tax_exempt as any,
      tax_ids: customer.tax_ids?.data.map(taxId => ({
        type: taxId.type as any,
        value: taxId.value,
        verification: {
          status: taxId.verification?.status as any || 'unverified',
        },
      })),
    } as any;
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    throw new Error(
      `Failed to retrieve customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateCustomer(
  customerId: string,
  updates: Partial<StripeCustomer>
): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.update(customerId, {
      ...(updates.email && { email: updates.email }),
      ...(updates.name && { name: updates.name }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.address && { address: updates.address as any }),
      ...(updates.tax_exempt && { tax_exempt: updates.tax_exempt }),
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      address: customer.address
        ? {
            line1: customer.address.line1,
            line2: customer.address.line2,
            city: customer.address.city,
            state: customer.address.state,
            postal_code: customer.address.postal_code,
            country: customer.address.country,
          }
        : undefined,
      tax_exempt: customer.tax_exempt,
      tax_ids: customer.tax_ids?.data.map(taxId => ({
        type: taxId.type,
        value: taxId.value,
        verification: {
          status: taxId.verification.status,
        },
      })),
    };
  } catch (error) {
    console.error('Error updating Stripe customer:', error);
    throw new Error(
      `Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export async function createSubscription(
  customerId: string,
  planId: PlanId,
  trialDays: number = 14
): Promise<StripeSubscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: STRIPE_PRICE_IDS[planId],
          quantity: 1,
        },
      ],
      trial_period_days: trialDays,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        plan: planId,
        source: 'urbanova_billing',
      },
    });

    return {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status as any,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      ...(subscription.trial_start && { trial_start: subscription.trial_start }),
      ...(subscription.trial_end && { trial_end: subscription.trial_end }),
      items: {
        data: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount!,
            currency: item.price.currency,
                      ...(item.price.recurring && {
            recurring: {
              interval: item.price.recurring.interval as any,
              usage_type: item.price.recurring.usage_type as any,
            }
          }),
          },
          ...(item.quantity && { quantity: item.quantity }),
        })),
      },
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error(
      `Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getSubscription(subscriptionId: string): Promise<StripeSubscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status as any,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      ...(subscription.trial_start && { trial_start: subscription.trial_start }),
      ...(subscription.trial_end && { trial_end: subscription.trial_end }),
      items: {
        data: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount!,
            currency: item.price.currency,
                      ...(item.price.recurring && {
            recurring: {
              interval: item.price.recurring.interval as any,
              usage_type: item.price.recurring.usage_type as any,
            }
          }),
          },
          ...(item.quantity && { quantity: item.quantity }),
        })),
      },
    };
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    throw new Error(
      `Failed to retrieve subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    return {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status as any,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      ...(subscription.trial_start && { trial_start: subscription.trial_start }),
      ...(subscription.trial_end && { trial_end: subscription.trial_end }),
      items: {
        data: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount!,
            currency: item.price.currency,
                      ...(item.price.recurring && {
            recurring: {
              interval: item.price.recurring.interval as any,
              usage_type: item.price.recurring.usage_type as any,
            }
          }),
          },
          ...(item.quantity && { quantity: item.quantity }),
        })),
      },
    };
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw new Error(
      `Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// CHECKOUT & PORTAL
// ============================================================================

export async function createCheckoutSession(
  customerId: string,
  planId: PlanId,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[planId],
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        plan: planId,
        source: 'urbanova_billing',
      },
    });

    return {
      id: session.id,
      url: session.url!,
      customer: session.customer as string,
      subscription: session.subscription as string,
      mode: session.mode as any,
      success_url: session.success_url!,
      cancel_url: session.cancel_url!,
      metadata: session.metadata as any,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(
      `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<CustomerPortalSession> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      id: session.id,
      url: session.url || '',
      customer: session.customer || '',
      return_url: session.return_url || '',
    };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new Error(
      `Failed to create portal session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// USAGE REPORTING
// ============================================================================

export async function reportUsage(
  subscriptionItemId: string,
  quantity: number,
  timestamp: Date
): Promise<void> {
  try {
    await (stripe as any).usageRecords.create(subscriptionItemId, {
      quantity,
      timestamp: Math.floor(timestamp.getTime() / 1000),
      action: 'increment',
    });
  } catch (error) {
    console.error('Error reporting usage to Stripe:', error);
    throw new Error(
      `Failed to report usage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getUsageRecords(
  subscriptionItemId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ quantity: number; timestamp: number }>> {
  try {
    const usageRecords = await (stripe as any).usageRecords.list({
      subscription_item: subscriptionItemId,
      limit: 100,
    });

    return usageRecords.data
      .filter((record: any) => {
        const recordDate = new Date(record.timestamp * 1000);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .map((record: any) => ({
        quantity: record.quantity,
        timestamp: record.timestamp,
      }));
  } catch (error) {
    console.error('Error retrieving usage records:', error);
    throw new Error(
      `Failed to retrieve usage records: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

export async function getInvoices(customerId: string): Promise<StripeInvoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      customer: invoice.customer as string,
      subscription: invoice.subscription as string,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status as any,
      ...(invoice.hosted_invoice_url && { hosted_invoice_url: invoice.hosted_invoice_url }),
      ...(invoice.invoice_pdf && { invoice_pdf: invoice.invoice_pdf }),
      created: invoice.created,
      ...(invoice.due_date && { due_date: invoice.due_date }),
      tax: invoice.tax || 0,
      total_tax_amounts: invoice.total_tax_amounts.map(taxAmount => ({
        amount: taxAmount.amount,
        inclusive: taxAmount.inclusive,
        tax_rate: {
          percentage: (taxAmount.tax_rate as any).percentage,
          country: (taxAmount.tax_rate as any).country,
        },
      })),
    })) as StripeInvoice[];
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    throw new Error(
      `Failed to retrieve invoices: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPriceIdForMetric(metric: string): string {
  const priceId = STRIPE_PRICE_IDS[metric as keyof typeof STRIPE_PRICE_IDS];
  if (!priceId) {
    throw new Error(`No price ID found for metric: ${metric}`);
  }
  return priceId;
}

export function getPriceIdForPlan(planId: PlanId): string {
  const priceId = STRIPE_PRICE_IDS[planId];
  if (!priceId) {
    throw new Error(`No price ID found for plan: ${planId}`);
  }
  return priceId;
}

export { stripe };
