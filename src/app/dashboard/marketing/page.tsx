'use client';

import Link from 'next/link';
import { MarketingIcon, CampaignIcon, DocumentIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import {
  BarChart3,
  FileText,
  Shield,
  Calendar,
  Plus,
  Target,
  Bot,
  Sparkles,
  MessageCircle,
  Search,
  TrendingUp,
} from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">📢 Marketing & Vendite</h1>
                  <p className="text-sm text-gray-500">Gestisci campagne marketing e materiali promozionali</p>
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
                  <MarketingIcon className="w-4 h-4 mr-3" />
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
                  <MarketingIcon className="w-4 h-4 mr-3" />
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
                <button
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-green-100 text-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Marketing
                </button>
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
                  <MarketingIcon className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <MarketingIcon className="w-4 h-4 mr-3" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <MarketingIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Marketing</h2>
                </div>
                <p className="text-gray-600 mb-4">Strategie e campagne marketing</p>
                <button className="btn btn-primary w-full">Gestisci Marketing</button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <CampaignIcon className="h-8 w-8 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Campagne</h2>
                </div>
                <p className="text-gray-600 mb-4">Crea e gestisci campagne promozionali</p>
                <button className="btn btn-primary w-full">Gestisci Campagne</button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <DocumentIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Materiali</h2>
                </div>
                <p className="text-gray-600 mb-4">Gestisci materiali promozionali</p>
                <button className="btn btn-primary w-full">Gestisci Materiali</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
