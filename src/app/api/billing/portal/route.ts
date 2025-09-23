import { NextRequest, NextResponse } from 'next/server';
// import { createCustomerPortalSession } from '@urbanova/billing/src/stripe';
// import { getBillingState } from '@urbanova/billing/src/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';
    const returnUrl = searchParams.get('returnUrl') || '/dashboard/billing';

    // Mock customer portal session
    const session = {
      url: `https://billing.stripe.com/p/session_${Date.now()}`,
    };

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
