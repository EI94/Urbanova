import { NextRequest, NextResponse } from 'next/server';
// import { stripe } from '@urbanova/billing/src/stripe';
// import {
//   createDefaultBillingState,
//   updateBillingState,
//   getBillingState
// } from '@urbanova/billing/src/data';
// import { getCustomer, getSubscription } from '@urbanova/billing/src/stripe';

// Mock functions since the imports are commented out
const getCustomer = async (customerId: string) => ({ id: customerId, email: 'mock@example.com' });
const getBillingState = async (userId: string) => ({ userId, status: 'active' });
const updateBillingState = async (userId: string, data: any) => ({ userId, ...data });
const createDefaultBillingState = async (userId: string) => ({ userId, status: 'active' });
const getSubscription = async (subscriptionId: string) => ({ 
  id: subscriptionId, 
  status: 'active',
  current_period_end: Date.now() + 86400000 // 24 hours from now
});
const stripe = { 
  webhooks: { 
    constructEvent: (body: any, signature: any, secret: any) => ({ 
      type: 'checkout.session.completed',
      data: { object: {} }
    }) 
  } 
};

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object;
  const workspaceId = session.metadata?.workspaceId || 'default';
  const plan = session.metadata?.plan || 'starter';

  console.log(`Checkout completed for workspace ${workspaceId}, plan ${plan}`);

  try {
    // Get customer details
    const customer = await getCustomer(session.customer);

    // Create or update billing state
    const existingState = await getBillingState(workspaceId);

    if (existingState) {
      await updateBillingState(workspaceId, {
        stripeSubId: session.subscription,
        plan: plan as any,
        status: 'active',
        trialEndsAt: undefined,
      });
    } else {
      await createDefaultBillingState(workspaceId);
    }

    console.log(`Billing state updated for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

async function handleCustomerSubscriptionUpdated(event: any) {
  const subscription = event.data.object;
  const workspaceId = subscription.metadata?.workspaceId || 'default';

  console.log(`Subscription updated for workspace ${workspaceId}`);

  try {
    const subscriptionData = await getSubscription(subscription.id);

    await updateBillingState(workspaceId, {
      stripeSubId: subscription.id,
      status: subscriptionData.status,
      plan: (subscription.metadata?.plan as any) || 'starter',
      nextBillingDate: new Date(subscriptionData.current_period_end * 1000),
    });

    console.log(`Billing state updated for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleCustomerSubscriptionDeleted(event: any) {
  const subscription = event.data.object;
  const workspaceId = subscription.metadata?.workspaceId || 'default';

  console.log(`Subscription deleted for workspace ${workspaceId}`);

  try {
    await updateBillingState(workspaceId, {
      status: 'canceled',
      stripeSubId: undefined,
    });

    console.log(`Billing state updated for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(event: any) {
  const invoice = event.data.object;
  const workspaceId = invoice.metadata?.workspaceId || 'default';

  console.log(`Invoice payment succeeded for workspace ${workspaceId}`);

  try {
    await updateBillingState(workspaceId, {
      lastBillingDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log(`Billing state updated for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(event: any) {
  const invoice = event.data.object;
  const workspaceId = invoice.metadata?.workspaceId || 'default';

  console.log(`Invoice payment failed for workspace ${workspaceId}`);

  try {
    await updateBillingState(workspaceId, {
      status: 'past_due',
    });

    console.log(`Billing state updated for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Received webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
