'use client';

import React, { useState } from 'react';
import { Check, X, Star, Zap, Crown } from 'lucide-react';

interface Plan {
  id: 'starter' | 'pro' | 'business';
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  limits: {
    projects: number;
    users: number;
    actions: number;
  };
  popular?: boolean;
}

interface PlanComparisonProps {
  currentPlan?: 'starter' | 'pro' | 'business';
  onSelectPlan: (planId: string) => void;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for small teams getting started',
    icon: <Star className="h-6 w-6" />,
    color: 'blue',
    features: [
      '5 progetti',
      '1 utente',
      '1.000 actions/mese',
      'Supporto email',
      'Dashboard base',
      'Export PDF',
    ],
    limits: {
      projects: 5,
      users: 1,
      actions: 1000,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    description: 'Ideal for growing businesses',
    icon: <Zap className="h-6 w-6" />,
    color: 'purple',
    popular: true,
    features: [
      '25 progetti',
      '5 utenti',
      '10.000 actions/mese',
      'Supporto prioritario',
      'Analytics avanzate',
      'API access',
      'Integrazioni custom',
      'Backup automatico',
    ],
    limits: {
      projects: 25,
      users: 5,
      actions: 10000,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    description: 'For large organizations with advanced needs',
    icon: <Crown className="h-6 w-6" />,
    color: 'green',
    features: [
      '100 progetti',
      '20 utenti',
      '50.000 actions/mese',
      'Supporto dedicato',
      'White-label options',
      'Advanced security',
      'Custom workflows',
      'SLA 99.9%',
      'Training sessions',
    ],
    limits: {
      projects: 100,
      users: 20,
      actions: 50000,
    },
  },
];

const meteredPricing = [
  { name: 'OCR Processing', price: '€0.01', unit: 'per page' },
  { name: 'Feasibility Reports', price: '€0.50', unit: 'per report' },
  { name: 'Market Scans', price: '€0.10', unit: 'per scan' },
  { name: 'Document Requests', price: '€0.25', unit: 'per request' },
  { name: 'WhatsApp Messages', price: '€0.05', unit: 'per message' },
  { name: 'Market Intelligence', price: '€0.25', unit: 'per scan' },
  { name: 'Trend Reports', price: '€1.00', unit: 'per report' },
  { name: 'Questionnaires', price: '€0.10', unit: 'per questionnaire' },
];

export default function PlanComparison({ currentPlan, onSelectPlan }: PlanComparisonProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' | 'button') => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700',
      },
    };
    return colors[color as keyof typeof colors]?.[variant] || '';
  };

  const getPrice = (plan: Plan) => {
    const price = billingPeriod === 'yearly' ? plan.price * 10 : plan.price; // 2 months free yearly
    return billingPeriod === 'yearly' ? `€${price}/year` : `€${price}/month`;
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 mb-6">Select the perfect plan for your team's needs</p>

        {/* Billing Period Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${
              plan.popular
                ? `${getColorClasses(plan.color, 'border')} shadow-lg`
                : 'border-gray-200'
            } ${currentPlan === plan.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div
                className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${getColorClasses(plan.color, 'bg')} text-white px-4 py-1 rounded-full text-sm font-medium`}
              >
                Most Popular
              </div>
            )}

            {/* Current Plan Badge */}
            {currentPlan === plan.id && (
              <div className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Current Plan
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${getColorClasses(plan.color, 'bg')} text-white rounded-lg mb-4`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-1">
                      €{plan.price}/month billed annually
                    </p>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => onSelectPlan(plan.id)}
                disabled={currentPlan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `${getColorClasses(plan.color, 'button')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Metered Pricing */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Pay-as-you-use Pricing
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Additional usage beyond your plan limits is charged at these rates
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {meteredPricing.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center">
              <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
              <p className="text-2xl font-bold text-gray-900">{item.price}</p>
              <p className="text-sm text-gray-500">{item.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need help choosing?</h3>
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          Contact our sales team →
        </button>
      </div>
    </div>
  );
}
