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
          'feasibility.run_bp': 45,
          'land-scraper.scan_market': 180,
          'market-intelligence.scan_city': 25,
          'deal-caller.send_questionnaire': 12,
        },
        entitlements: {
          projectsMax: 25,
          usersMax: 5,
          actionsLimits: {
            'ocr.process': { soft: 5000, hard: 10000 },
            'feasibility.run_bp': { soft: 500, hard: 1000 },
            'land-scraper.scan_market': { soft: 2000, hard: 5000 },
            'market-intelligence.scan_city': { soft: 500, hard: 1000 },
            'deal-caller.send_questionnaire': { soft: 500, hard: 1000 },
          },
        },
      };

      setBillingState(mockBillingState);

      // Calculate usage summary
      const summary: UsageSummary[] = Object.entries(mockBillingState.usageMonth)
        .map(([action, used]) => {
          const limits = mockBillingState.entitlements.actionsLimits[action];
          const percentage = Math.round((used / (limits?.hard || 1)) * 100);
          const cost = calculateCost(action, used);

          return {
            toolAction: action,
            used,
            soft: limits?.soft || 0,
            hard: limits?.hard || 0,
            percentage,
            cost,
          };
        })
        .sort((a, b) => b.percentage - a.percentage);

      setUsageSummary(summary);
      setLoading(false);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setLoading(false);
    }
  };

  const calculateCost = (action: string, usage: number): number => {
    const costs: Record<string, number> = {
      'ocr.process': 0.01,
      'feasibility.run_bp': 0.5,
      'land-scraper.scan_market': 0.1,
      'market-intelligence.scan_city': 0.25,
      'deal-caller.send_questionnaire': 0.1,
    };
    return (costs[action] || 0) * usage;
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'ocr.process': 'OCR Processing',
      'feasibility.run_bp': 'Business Plans',
      'land-scraper.scan_market': 'Market Scans',
      'market-intelligence.scan_city': 'Market Intelligence',
      'deal-caller.send_questionnaire': 'Questionnaires',
    };
    return labels[action] || action;
  };

  const getPlanDetails = (plan: string) => {
    const plans = {
      starter: { name: 'Starter', price: 29, color: 'bg-blue-500' },
      pro: { name: 'Pro', price: 99, color: 'bg-purple-500' },
      business: { name: 'Business', price: 299, color: 'bg-green-500' },
    };
    return plans[plan as keyof typeof plans] || plans.starter;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch(
        '/api/billing/portal?workspaceId=workspace-123&returnUrl=/dashboard/billing'
      );
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
                  <p className="text-sm text-gray-500">Manage your subscription and monitor usage</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.open('/dashboard/feedback', '_blank')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Invia Feedback"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Overview
                </Link>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <Link
                  href="/dashboard/market-intelligence"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Design Center
                </Link>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <Link
                  href="/dashboard/business-plan"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </Link>
              </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <Link
                  href="/dashboard/progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/progetti/nuovo"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Nuovo Progetto
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Mappa Progetti
                </Link>
              </div>

              {/* Gestione Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GESTIONE PROGETTI
                </h3>
                <Link
                  href="/dashboard/project-management"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Riunioni
                </Link>
              </div>

              {/* Marketing/Sales */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MARKETING/SALES
                </h3>
                <Link
                  href="/dashboard/marketing"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
                <Link
                  href="/dashboard/marketing/campaigns"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Campagne
                </Link>
                <Link
                  href="/dashboard/marketing/materials"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Materiali
                </Link>
              </div>

              {/* Construction/EPC */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CONSTRUCTION/EPC
                </h3>
                <Link
                  href="/dashboard/epc"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Construction Site
                </Link>
                <Link
                  href="/dashboard/epc/technical-documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Technical Documents
                </Link>
                <Link
                  href="/dashboard/epc/permits"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permits
                </Link>
              </div>

              {/* AI Assistant */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI ASSISTANT
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Bot className="w-4 h-4 mr-3" />
                  Urbanova OS
                </Link>
              </div>

              {/* Feedback */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SUPPORTO
                </h3>
                <Link
                  href="/dashboard/feedback"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Feedback
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 ${planDetails.color} rounded-lg flex items-center justify-center`}
                >
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{planDetails.name} Plan</h2>
                  <p className="text-gray-600">€{planDetails.price}/month</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center space-x-2">
                    {billingState.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium capitalize">{billingState.status}</span>
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Plan Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Projects</p>
                  <p className="font-medium">{billingState.entitlements.projectsMax}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="font-medium">{billingState.entitlements.usersMax}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Next Billing</p>
                  <p className="font-medium">
                    {new Date(billingState.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Usage This Month</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Euro className="h-4 w-4" />
                    <span>Total: €{totalMonthlyCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {usageSummary.map(item => (
                    <div key={item.toolAction} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {getActionLabel(item.toolAction)}
                        </span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">
                            {item.used.toLocaleString()} / {item.hard.toLocaleString()}
                          </span>
                          <span className="font-medium">€{item.cost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(item.percentage)}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{item.percentage}% used</span>
                          {item.used >= item.soft && (
                            <span className="text-yellow-600">
                              {item.used >= item.hard
                                ? 'Hard limit reached'
                                : 'Soft limit exceeded'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleManageSubscription}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </button>

                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoices
                  </button>

                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Usage Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Upgrade */}
            {billingState.plan !== 'business' && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-sm">
                <div className="p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Upgrade Your Plan</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Get more projects, users, and higher limits with our{' '}
                    {billingState.plan === 'starter' ? 'Pro' : 'Business'} plan.
                  </p>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-white border-opacity-20 rounded-md shadow-sm text-sm font-medium text-white bg-white bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Usage Warnings */}
            {usageSummary.some(item => item.percentage >= 80) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="text-sm font-medium text-yellow-800">Usage Alert</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're approaching your usage limits. Consider upgrading your plan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
