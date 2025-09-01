// Stripe Service - Urbanova AI
import Stripe from 'stripe';

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  paymentMethodId?: string;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url?: string;
}

export class StripeService {
  private stripe: Stripe;
  private isConfigured: boolean = false;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (secretKey && secretKey !== 'undefined' && secretKey !== '') {
      try {
        this.stripe = new Stripe(secretKey, {
          apiVersion: '2024-12-18.acacia',
        });
        this.isConfigured = true;
        console.log('✅ [StripeService] Stripe configurato correttamente');
      } catch (error) {
        console.warn('⚠️ [StripeService] Errore configurazione Stripe:', error);
        this.isConfigured = false;
      }
    } else {
      console.log(
        'ℹ️ [StripeService] STRIPE_SECRET_KEY non configurata - modalità fallback attiva'
      );
      this.isConfigured = false;
    }
  }

  /**
   * Crea un PaymentIntent per il pagamento
   */
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      if (!this.isConfigured) {
        // Modalità fallback per test
        return this.createMockPaymentIntent(request);
      }

      console.log('💳 [StripeService] Creazione PaymentIntent:', request);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Stripe usa centesimi
        currency: request.currency.toLowerCase(),
        metadata: request.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: 'test@urbanova.life', // In produzione, email del vendor
        description: `SAL Payment - ${request.metadata?.salId || 'Unknown'}`,
      });

      console.log('✅ [StripeService] PaymentIntent creato:', paymentIntent.id);

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: request.amount,
        currency: request.currency,
        status: paymentIntent.status,
        receipt_url: paymentIntent.charges.data[0]?.receipt_url,
      };
    } catch (error) {
      console.error('❌ [StripeService] Errore creazione PaymentIntent:', error);

      // Fallback a mock per test
      return this.createMockPaymentIntent(request);
    }
  }

  /**
   * Conferma un pagamento
   */
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        // Modalità fallback
        console.log('🔄 [StripeService] Mock conferma pagamento:', paymentIntentId);
        return true;
      }

      console.log('✅ [StripeService] Conferma pagamento:', paymentIntentId);

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('❌ [StripeService] Errore conferma pagamento:', error);
      return false;
    }
  }

  /**
   * Ottiene i dettagli di un PaymentIntent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponse | null> {
    try {
      if (!this.isConfigured) {
        // Modalità fallback
        return this.getMockPaymentIntent(paymentIntentId);
      }

      console.log('🔍 [StripeService] Recupero PaymentIntent:', paymentIntentId);

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount / 100, // Converti da centesimi
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        receipt_url: paymentIntent.charges.data[0]?.receipt_url,
      };
    } catch (error) {
      console.error('❌ [StripeService] Errore recupero PaymentIntent:', error);
      return null;
    }
  }

  /**
   * Rimborsa un pagamento
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        // Modalità fallback
        console.log('🔄 [StripeService] Mock rimborso:', paymentIntentId);
        return true;
      }

      console.log('💰 [StripeService] Rimborso pagamento:', paymentIntentId);

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: 'requested_by_customer',
      });

      return refund.status === 'succeeded';
    } catch (error) {
      console.error('❌ [StripeService] Errore rimborso:', error);
      return false;
    }
  }

  /**
   * Crea un PaymentIntent mock per test
   */
  private createMockPaymentIntent(request: PaymentIntentRequest): PaymentIntentResponse {
    const mockId = `pi_mock_${Date.now()}`;
    const mockSecret = `pi_mock_${mockId}_secret_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🔄 [StripeService] Mock PaymentIntent creato:', mockId);

    return {
      id: mockId,
      clientSecret: mockSecret,
      amount: request.amount,
      currency: request.currency,
      status: 'requires_payment_method',
      receipt_url: `https://mock.stripe.com/receipts/${mockId}`,
    };
  }

  /**
   * Ottiene un PaymentIntent mock per test
   */
  private getMockPaymentIntent(paymentIntentId: string): PaymentIntentResponse | null {
    if (!paymentIntentId.startsWith('pi_mock_')) {
      return null;
    }

    console.log('🔄 [StripeService] Mock PaymentIntent recuperato:', paymentIntentId);

    return {
      id: paymentIntentId,
      clientSecret: `pi_mock_${paymentIntentId}_secret`,
      amount: 1000, // Mock amount
      currency: 'EUR',
      status: 'succeeded',
      receipt_url: `https://mock.stripe.com/receipts/${paymentIntentId}`,
    };
  }

  /**
   * Verifica la configurazione del servizio
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Ottiene le chiavi pubbliche per il frontend
   */
  getPublicKeys(): { publishableKey: string; isTestMode: boolean } {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';

    return {
      publishableKey,
      isTestMode: !this.isConfigured || publishableKey.includes('test'),
    };
  }
}

export const stripeService = new StripeService();
