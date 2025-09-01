'use client';

import React, { useState } from 'react';
import { X, Crown, Zap, Star, Check, CreditCard } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'starter' | 'pro' | 'business';
  blockedAction?: string;
  usageInfo?: {
    current: number;
    limit: number;
    percentage: number;
  };
}

const planDetails = {
  starter: {
    name: 'Starter',
    price: 29,
    icon: <Star className="h-6 w-6" />,
    color: 'blue',
    features: ['5 progetti', '1 utente', '1,000 actions/mese', 'Supporto email'],
  },
  pro: {
    name: 'Pro',
    price: 99,
    icon: <Zap className="h-6 w-6" />,
    color: 'purple',
    features: [
      '25 progetti',
      '5 utenti',
      '10,000 actions/mese',
      'Supporto prioritario',
      'Analytics avanzate',
    ],
  },
  business: {
    name: 'Business',
    price: 299,
    icon: <Crown className="h-6 w-6" />,
    color: 'green',
    features: [
      '100 progetti',
      '20 utenti',
      '50,000 actions/mese',
      'Supporto dedicato',
      'White-label',
    ],
  },
};

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  blockedAction,
  usageInfo,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>(
    currentPlan === 'starter' ? 'pro' : 'business'
  );

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: 'workspace-123',
          planId: selectedPlan,
          successUrl: window.location.origin + '/dashboard/billing?success=true',
          cancelUrl: window.location.origin + '/dashboard/billing?canceled=true',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Error upgrading plan');
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action?: string): string => {
    if (!action) return 'questa funzionalità';

    const labels: Record<string, string> = {
      'ocr.process': 'OCR Processing',
      'feasibility.run_bp': 'Business Plans',
      'land-scraper.scan_market': 'Market Scans',
      'market-intelligence.scan_city': 'Market Intelligence',
      'deal-caller.send_questionnaire': 'Questionnaires',
    };
    return labels[action] || action;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-200 text-blue-600',
      purple: 'bg-purple-500 border-purple-200 text-purple-600',
      green: 'bg-green-500 border-green-200 text-green-600',
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  const getRecommendedPlan = () => {
    if (currentPlan === 'starter') return 'pro';
    return 'business';
  };

  if (!isOpen) return null;

  const recommendedPlan = getRecommendedPlan();
  const availablePlans = currentPlan === 'starter' ? ['pro', 'business'] : ['business'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {blockedAction ? 'Limite Raggiunto' : 'Potenzia il Tuo Piano'}
              </h2>

              {blockedAction ? (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Hai raggiunto il limite per <strong>{getActionLabel(blockedAction)}</strong>
                  </p>
                  {usageInfo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        Utilizzo: {usageInfo.current.toLocaleString()} /{' '}
                        {usageInfo.limit.toLocaleString()} ({usageInfo.percentage}%)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Sblocca funzionalità avanzate e limiti più alti</p>
              )}
            </div>

            {/* Plan Selection */}
            <div className="space-y-4 mb-8">
              {availablePlans.map(planId => {
                const plan = planDetails[planId as keyof typeof planDetails];
                const isRecommended = planId === recommendedPlan;
                const isSelected = planId === selectedPlan;

                return (
                  <div
                    key={planId}
                    onClick={() => setSelectedPlan(planId as 'pro' | 'business')}
                    className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Consigliato
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 bg-${plan.color}-500 rounded-lg flex items-center justify-center text-white`}
                        >
                          {plan.icon}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                          <p className="text-2xl font-bold text-gray-900">
                            €{plan.price}
                            <span className="text-sm text-gray-500">/mese</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-3">Cosa ottieni con l'upgrade:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Limiti più alti</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Più progetti e utenti</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Supporto prioritario</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">14 giorni di prova gratuita</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Annulla
              </button>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Upgrade a {planDetails[selectedPlan].name}
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Puoi annullare o modificare il tuo piano in qualsiasi momento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
