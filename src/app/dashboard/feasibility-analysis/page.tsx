'use client';

import React from 'react';
import Link from 'next/link';

export default function FeasibilityAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analisi Fattibilità</h1>
                  <p className="text-sm text-gray-600">Valuta la fattibilità economica dei tuoi progetti</p>
                </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <span>+</span>
              <span>Nuova Analisi</span>
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
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>📈</span>
                <span>Market Intelligence</span>
              </Link>
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors">
                <span>📋</span>
                <span>Analisi Fattibilità</span>
              </Link>
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🏗️</span>
                <span>Design Center</span>
              </Link>
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🎯</span>
                <span>Business Plan</span>
              </Link>
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🛡️</span>
                <span>Permessi & Compliance</span>
              </Link>
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>📅</span>
                <span>Project Timeline AI</span>
              </Link>
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>🏢</span>
                <span>Progetti</span>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <span>💳</span>
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
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <span className="text-2xl">🏢</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                  <p className="text-2xl font-bold text-gray-900">€1.650.000</p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                  <p className="text-2xl font-bold text-gray-900">8.0%</p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                  <p className="text-2xl font-bold text-gray-900">13.8%</p>
                </div>
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Cerca progetti..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="in-progress">In Corso</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progetti di Fattibilità</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Residenziale Milano Centro</h3>
                        <p className="text-sm text-gray-600">Milano, MI • Appartamento</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                        Completato
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                        Basso
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span>💰</span>
                      <div>
                        <p className="text-sm text-gray-600">Investimento</p>
                        <p className="font-medium text-gray-900">€450.000</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>📈</span>
                      <div>
                        <p className="text-sm text-gray-600">Rendimento Annuo</p>
                        <p className="font-medium text-gray-900">7.5%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>🏆</span>
                      <div>
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="font-medium text-gray-900">12.3%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <div>
                        <p className="text-sm text-gray-600">Payback</p>
                        <p className="font-medium text-gray-900">8.2 anni</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Creato il 15/01/2024 • Aggiornato il 20/01/2024
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        👁️
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        📊
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Analizza
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Uffici Roma EUR</h3>
                        <p className="text-sm text-gray-600">Roma, RM • Ufficio</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100">
                        In Corso
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-yellow-600 bg-yellow-100">
                        Medio
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span>💰</span>
                      <div>
                        <p className="text-sm text-gray-600">Investimento</p>
                        <p className="font-medium text-gray-900">€1.200.000</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>📈</span>
                      <div>
                        <p className="text-sm text-gray-600">Rendimento Annuo</p>
                        <p className="font-medium text-gray-900">8.5%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>🏆</span>
                      <div>
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="font-medium text-gray-900">15.2%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <div>
                        <p className="text-sm text-gray-600">Payback</p>
                        <p className="font-medium text-gray-900">6.6 anni</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Creato il 01/02/2024 • Aggiornato il 10/02/2024
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        👁️
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        ✏️
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        📊
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Analizza
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl">🧮</span>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl">⚖️</span>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl">📊</span>
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