'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calculator,
  TrendingUp,
  Euro,
  Building,
  Plus,
  BarChart3,
  Compare,
  CheckCircle,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Trophy,
  Target,
  Shield,
  CreditCard,
  Search
} from 'lucide-react';

export default function FeasibilityAnalysisPage() {
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inizializzazione ultra-semplice
    const initializeComponent = async () => {
      try {
        // Aspetta che il DOM sia pronto
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
      setLoading(false);
      } catch (err) {
        console.error('Error initializing component:', err);
        setError('Errore nell\'inizializzazione del componente');
        setIsReady(true);
      setLoading(false);
    }
  };

    initializeComponent();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inizializzazione...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analisi Fattibilità</h1>
                  <p className="text-sm text-gray-600">Valuta la fattibilità economica dei tuoi progetti</p>
                </div>
              </div>
          </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Nuovo Progetto</span>
            </button>
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
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors">
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
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Usage</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                  <p className="text-2xl font-bold text-gray-900">€0</p>
              </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Progetti di Fattibilità</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cerca progetti..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
        </div>

              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto trovato</h3>
                <p className="text-gray-600 mb-4">Inizia creando il tuo primo progetto di fattibilità.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Crea Nuovo Progetto
                          </button>
                        </div>
            </div>
        </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calculator className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
                  </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Compare className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Report Completo</h3>
                  <p className="text-sm text-gray-600">Genera report dettagliato</p>
                </div>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}