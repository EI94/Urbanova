'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import ComplianceTab from '@/components/ui/ComplianceTab';
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
  BuildingIcon,
} from 'lucide-react';

interface Permit {
  id: string;
  name: string;
  category: 'URBANISTICO' | 'AMBIENTALE' | 'SICUREZZA' | 'COMMERCIALE' | 'ENERGETICO';
  status:
    | 'NON_RICHIESTO'
    | 'IN_PREPARAZIONE'
    | 'PRESENTATO'
    | 'IN_ESAME'
    | 'APPROVATO'
    | 'RIGETTATO'
    | 'SCADUTO';
  priority: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BASSO';
  requiredBy: Date;
  estimatedDuration: number; // giorni
  cost: number;
  authority: string;
  dependencies: string[]; // permessi prerequisiti
  documentation: string[];
  currentStep: string;
  progress: number; // 0-100
  assignedTo?: string;
  notes?: string;
  submittedDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  aiRecommendations?: string[];
}

interface ComplianceAlert {
  id: string;
  type: 'SCADENZA' | 'MODIFICA_NORMATIVA' | 'RITARDO' | 'MANCANZA';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  actionRequired: string;
  deadline?: Date;
  relatedPermits: string[];
}

export default function PermitsCompliancePage() {
  const { t, formatCurrency: fmtCurrency, formatDate: fmtDate } = useLanguage();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'permits' | 'timeline' | 'alerts' | 'compliance'
  >('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Mock data
  useEffect(() => {
    const mockPermits: Permit[] = [
      {
        id: 'permit-1',
        name: 'Permesso di Costruire',
        category: 'URBANISTICO',
        status: 'IN_ESAME',
        priority: 'CRITICO',
        requiredBy: new Date('2024-03-15'),
        estimatedDuration: 60,
        cost: 2500,
        authority: 'Comune di Milano - Ufficio Urbanistica',
        dependencies: ['Nulla Osta Soprintendenza'],
        documentation: [
          'Progetto architettonico',
          'Relazione tecnica',
          'Calcoli strutturali',
          'Piano sicurezza',
        ],
        currentStep: 'Esame istruttorio',
        progress: 65,
        assignedTo: 'Arch. Marco Rossi',
        submittedDate: new Date('2024-01-10'),
        aiRecommendations: [
          'Aggiornare documentazione antincendio entro 5 giorni',
          'Schedulare sopralluogo tecnico',
        ],
      },
      {
        id: 'permit-2',
        name: 'Valutazione Impatto Ambientale',
        category: 'AMBIENTALE',
        status: 'IN_PREPARAZIONE',
        priority: 'ALTO',
        requiredBy: new Date('2024-02-28'),
        estimatedDuration: 90,
        cost: 5000,
        authority: 'Regione Lombardia - ARPA',
        dependencies: [],
        documentation: ['Studio impatto ambientale', 'Relazione geologica', 'Analisi acustica'],
        currentStep: 'Raccolta documentazione',
        progress: 30,
        assignedTo: 'Ing. Laura Bianchi',
        aiRecommendations: ['Richiedere analisi rumore urgente', 'Completare studio flora/fauna'],
      },
      {
        id: 'permit-3',
        name: 'Certificazione Energetica',
        category: 'ENERGETICO',
        status: 'APPROVATO',
        priority: 'MEDIO',
        requiredBy: new Date('2024-01-31'),
        estimatedDuration: 30,
        cost: 800,
        authority: 'Certificatore Energetico Accreditato',
        dependencies: ['Permesso di Costruire'],
        documentation: ['APE preliminare', 'Calcoli energetici'],
        currentStep: 'Completato',
        progress: 100,
        assignedTo: 'Ing. Giuseppe Verdi',
        approvalDate: new Date('2024-01-25'),
        expiryDate: new Date('2034-01-25'),
      },
      {
        id: 'permit-4',
        name: 'Autorizzazione Antincendio',
        category: 'SICUREZZA',
        status: 'NON_RICHIESTO',
        priority: 'ALTO',
        requiredBy: new Date('2024-04-01'),
        estimatedDuration: 45,
        cost: 1200,
        authority: 'Vigili del Fuoco - Comando Provinciale',
        dependencies: ['Permesso di Costruire'],
        documentation: ['Progetto antincendio', 'Relazione tecnica', 'Planimetrie evacuazione'],
        currentStep: 'Da avviare',
        progress: 0,
        aiRecommendations: ['Iniziare iter immediatamente - rischio ritardo critico'],
      },
    ];

    const mockAlerts: ComplianceAlert[] = [
      {
        id: 'alert-1',
        type: 'SCADENZA',
        severity: 'HIGH',
        title: 'Scadenza Permesso di Costruire',
        description:
          'Il permesso di costruire scade tra 15 giorni. È necessario richiedere la proroga.',
        actionRequired: 'Presentare richiesta proroga entro 10 giorni',
        deadline: new Date('2024-02-15'),
        relatedPermits: ['permit-1'],
      },
      {
        id: 'alert-2',
        type: 'MODIFICA_NORMATIVA',
        severity: 'MEDIUM',
        title: 'Aggiornamento Normativa Energetica',
        description:
          'Nuove disposizioni regionali per certificazioni energetiche in vigore dal 1 marzo',
        actionRequired: 'Verificare conformità progetto alle nuove norme',
        relatedPermits: ['permit-3'],
      },
      {
        id: 'alert-3',
        type: 'RITARDO',
        severity: 'HIGH',
        title: 'Ritardo VIA',
        description:
          'Valutazione Impatto Ambientale in ritardo di 10 giorni sulla tabella di marcia',
        actionRequired: 'Accelerare raccolta documentazione mancante',
        relatedPermits: ['permit-2'],
      },
    ];

    setTimeout(() => {
      setPermits(mockPermits);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  // Helper functions
  const formatCurrency = (value: number) => fmtCurrency(value);
  const formatDate = (date: Date) => fmtDate(date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVATO':
        return 'bg-green-100 text-green-800';
      case 'IN_ESAME':
        return 'bg-blue-100 text-blue-800';
      case 'PRESENTATO':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PREPARAZIONE':
        return 'bg-orange-100 text-orange-800';
      case 'NON_RICHIESTO':
        return 'bg-gray-100 text-gray-800';
      case 'RIGETTATO':
        return 'bg-red-100 text-red-800';
      case 'SCADUTO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICO':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'ALTO':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'BASSO':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredPermits =
    selectedFilter === 'ALL' ? permits : permits.filter(p => p.category === selectedFilter);

  const stats = {
    totalPermits: permits.length,
    approved: permits.filter(p => p.status === 'APPROVATO').length,
    inProgress: permits.filter(p =>
      ['IN_PREPARAZIONE', 'PRESENTATO', 'IN_ESAME'].includes(p.status)
    ).length,
    critical: permits.filter(p => p.priority === 'CRITICO').length,
    totalCost: permits.reduce((sum, p) => sum + p.cost, 0),
    averageProgress: Math.round(permits.reduce((sum, p) => sum + p.progress, 0) / permits.length),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
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
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    📋 {t('title', 'permitsCompliance')}
                  </h1>
                  <p className="text-sm text-gray-500">{t('subtitle', 'permitsCompliance')}</p>
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
                <button
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-red-100 text-red-700"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </button>
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
                  <BuildingIcon className="w-4 h-4 mr-3" />
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
                  <BuildingIcon className="w-4 h-4 mr-3" />
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
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
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

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: t('tabs.overview', 'permitsCompliance') },
                { key: 'permits', label: t('tabs.permits', 'permitsCompliance') },
                { key: 'timeline', label: t('tabs.timeline', 'permitsCompliance') },
                { key: 'alerts', label: t('tabs.alerts', 'permitsCompliance') },
                { key: 'compliance', label: '🏛️ Compliance Documenti' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.totalPermits', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPermits}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.approved', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.inProgress', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.critical', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.totalCost', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(stats.totalCost)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {t('stats.averageProgress', 'permitsCompliance')}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">{stats.averageProgress}%</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 {t('quickActions.newPermit', 'permitsCompliance')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="primary" className="w-full">
                    <span className="text-sm">
                      🆕 {t('quickActions.newPermit', 'permitsCompliance')}
                    </span>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <span className="text-sm">
                      📊 {t('quickActions.generateReport', 'permitsCompliance')}
                    </span>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <span className="text-sm">
                      📅 {t('quickActions.scheduleInspection', 'permitsCompliance')}
                    </span>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <span className="text-sm">
                      ⏰ {t('quickActions.updateTimeline', 'permitsCompliance')}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Permits by Category */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📂 {t('categories.urban', 'permitsCompliance')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'URBANISTICO', label: t('categories.urban', 'permitsCompliance') },
                    {
                      key: 'AMBIENTALE',
                      label: t('categories.environmental', 'permitsCompliance'),
                    },
                    { key: 'SICUREZZA', label: t('categories.safety', 'permitsCompliance') },
                    { key: 'ENERGETICO', label: t('categories.energy', 'permitsCompliance') },
                  ].map(category => {
                    const categoryPermits = permits.filter(p => p.category === category.key);
                    const categoryProgress =
                      categoryPermits.length > 0
                        ? Math.round(
                            categoryPermits.reduce((sum, p) => sum + p.progress, 0) /
                              categoryPermits.length
                          )
                        : 0;

                    return (
                      <div key={category.key} className="bg-white rounded-lg shadow-sm p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{category.label}</h4>
                          <span className="text-sm text-gray-500">{categoryPermits.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${categoryProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {categoryProgress}% {t('stats.averageProgress', 'permitsCompliance')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Critical Alerts */}
              {alerts.filter(a => a.severity === 'HIGH').length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    ⚠️ {t('criticalAlerts.title', 'permitsCompliance')}
                  </h3>
                  <div className="space-y-3">
                    {alerts
                      .filter(a => a.severity === 'HIGH')
                      .slice(0, 3)
                      .map(alert => (
                        <div key={alert.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900">{alert.title}</h4>
                            <p className="text-sm text-red-700">{alert.actionRequired}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-3">
                    <a href="#" className="text-sm text-red-600 hover:text-red-800 font-medium">
                      {t('criticalAlerts.seeAllAlerts', 'permitsCompliance')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Permits Tab */}
          {activeTab === 'permits' && (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {[
                    { key: 'ALL', label: t('filters.all', 'projectTimeline') },
                    { key: 'URBANISTICO', label: t('categories.urban', 'permitsCompliance') },
                    {
                      key: 'AMBIENTALE',
                      label: t('categories.environmental', 'permitsCompliance'),
                    },
                    { key: 'SICUREZZA', label: t('categories.safety', 'permitsCompliance') },
                    { key: 'ENERGETICO', label: t('categories.energy', 'permitsCompliance') },
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        selectedFilter === filter.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permits List */}
              <div className="space-y-4">
                {filteredPermits.map(permit => (
                  <div key={permit.id} className="bg-white rounded-lg shadow-sm p-6 border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{permit.name}</h3>
                        <p className="text-sm text-gray-600">{permit.authority}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(permit.status)}`}
                        >
                          {permit.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(permit.priority)}`}
                        >
                          {permit.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Costo</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(permit.cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Durata Stimata</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {permit.estimatedDuration} giorni
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Progresso</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${permit.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {permit.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {permit.assignedTo && (
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Assegnato a:</span> {permit.assignedTo}
                      </div>
                    )}

                    {permit.aiRecommendations && permit.aiRecommendations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          🤖 AI Recommendations
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {permit.aiRecommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Timeline Permessi</h3>
              <p className="text-gray-600">Timeline view implementation...</p>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🚨 {t('tabs.alerts', 'permitsCompliance')}
              </h3>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                      alert.severity === 'HIGH'
                        ? 'border-red-500'
                        : alert.severity === 'MEDIUM'
                          ? 'border-yellow-500'
                          : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{alert.title}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    <p className="text-sm font-medium text-gray-900">{alert.actionRequired}</p>
                    {alert.deadline && (
                      <p className="text-sm text-gray-500 mt-2">
                        Scadenza: {formatDate(alert.deadline)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="p-6">
              <ComplianceTab />
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
