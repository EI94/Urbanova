'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  BarChart3,
  Calendar,
  Euro,
  FileText,
  Shield,
  Plus,
  Target,
  Bot,
  Sparkles,
  MessageCircle,
  Search,
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface BillingState {
  workspaceId: string;
  plan: 'starter' | 'pro' | 'business';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  trialEndsAt?: string;
  nextBillingDate: string;
  usageMonth: Record<string, number>;
  entitlements: {
    projectsMax: number;
    usersMax: number;
    actionsLimits: Record<string, { soft: number; hard: number }>;
  };
}

interface UsageSummary {
  toolAction: string;
  used: number;
  soft: number;
  hard: number;
  percentage: number;
  cost: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BillingPage() {
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // Load billing data
  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      // Mock data for demonstration
      const mockBillingState: BillingState = {
        workspaceId: 'workspace-123',
        plan: 'pro',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        usageMonth: {
          'ocr.process': 2500,
          'ai.analysis': 1200,
          'market.intelligence': 800,
          'feasibility.analysis': 450,
          'design.generation': 320,
        },
        entitlements: {
          projectsMax: 50,
          usersMax: 10,
          actionsLimits: {
            'ocr.process': { soft: 5000, hard: 6000 },
            'ai.analysis': { soft: 2000, hard: 2500 },
            'market.intelligence': { soft: 1000, hard: 1200 },
            'feasibility.analysis': { soft: 500, hard: 600 },
            'design.generation': { soft: 400, hard: 500 },
          },
        },
      };

      setBillingState(mockBillingState);

      // Calculate usage summary
      const summary: UsageSummary[] = Object.entries(mockBillingState.usageMonth).map(([action, used]) => {
        const limits = mockBillingState.entitlements.actionsLimits[action];
        const percentage = (used / limits.soft) * 100;
        const cost = used * 0.02; // Mock cost calculation
        
        return {
          toolAction: action,
          used,
          soft: limits.soft,
          hard: limits.hard,
          percentage,
          cost,
        };
      });

      setUsageSummary(summary);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanDetails = (plan: string) => {
    const plans = {
      starter: {
        name: 'Starter',
        price: '€29/mese',
        color: 'bg-blue-600',
        features: ['5 Progetti', '2 Utenti', 'Supporto Email'],
      },
      pro: {
        name: 'Professional',
        price: '€99/mese',
        color: 'bg-green-600',
        features: ['50 Progetti', '10 Utenti', 'Supporto Prioritario', 'API Access'],
      },
      business: {
        name: 'Business',
        price: '€299/mese',
        color: 'bg-purple-600',
        features: ['Progetti Illimitati', 'Utenti Illimitati', 'Supporto 24/7', 'White Label'],
      },
    };
    return plans[plan as keyof typeof plans];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-50',
      past_due: 'text-yellow-600 bg-yellow-50',
      canceled: 'text-red-600 bg-red-50',
      trialing: 'text-blue-600 bg-blue-50',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.url, '_blank');
      } else {
        alert("Errore nell'apertura del portale clienti");
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert("Errore nell'apertura del portale clienti");
    } finally {
      setPortalLoading(false);
    }
  };

  const totalMonthlyCost = usageSummary.reduce((sum, item) => sum + item.cost, 0);
  const planDetails = billingState ? getPlanDetails(billingState.plan) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!billingState || !planDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Billing Data Not Available</h2>
          <p className="text-gray-600">Unable to load billing information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Billing & Usage</h1>
                  <p className="text-sm text-gray-600">Gestisci il tuo piano e monitora l'utilizzo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Market Intelligence</span>
              </Link>
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Analisi Fattibilità</span>
              </Link>
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Design Center</span>
              </Link>
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-5 h-5" />
                <span>Business Plan</span>
              </Link>
              <Link href="/dashboard/budget-suppliers" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Euro className="w-5 h-5" />
                <span>Budget & Fornitori</span>
              </Link>
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                <span>Permessi & Compliance</span>
              </Link>
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline AI</span>
              </Link>
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Progetti</span>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Usage</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Plan Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Piano Attuale</h2>
                <p className="text-sm text-gray-600">Gestisci il tuo abbonamento</p>
              </div>
              <button
                onClick={openCustomerPortal}
                disabled={portalLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{portalLoading ? 'Caricamento...' : 'Gestisci Piano'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${planDetails.color} rounded-lg flex items-center justify-center`}>
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{planDetails.name}</h3>
                  <p className="text-sm text-gray-600">{planDetails.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Stato</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(billingState.status)}`}>
                    {billingState.status === 'active' ? 'Attivo' : billingState.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Prossimo Addebito</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(billingState.nextBillingDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Funzionalità Incluse</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Utilizzo Mensile</h2>
                <p className="text-sm text-gray-600">Monitoraggio delle tue attività</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Costo Stimato</p>
                <p className="text-lg font-semibold text-gray-900">€{totalMonthlyCost.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {usageSummary.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {item.toolAction.replace('.', ' ')}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUsageColor(item.percentage)}`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{item.used.toLocaleString()} / {item.soft.toLocaleString()}</span>
                    <span>€{item.cost.toFixed(2)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.percentage >= 90 ? 'bg-red-500' : 
                        item.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  {item.percentage >= 90 && (
                    <p className="text-xs text-red-600 mt-1">
                      Limite quasi raggiunto! Considera l'upgrade del piano.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={openCustomerPortal}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Gestisci Pagamenti</h3>
                  <p className="text-sm text-gray-600">Modifica metodi di pagamento</p>
                </div>
              </button>

              <button
                onClick={openCustomerPortal}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Scarica Fatture</h3>
                  <p className="text-sm text-gray-600">Accedi alle tue fatture</p>
                </div>
              </button>

              <button
                onClick={openCustomerPortal}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Upgrade Piano</h3>
                  <p className="text-sm text-gray-600">Sblocca più funzionalità</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
