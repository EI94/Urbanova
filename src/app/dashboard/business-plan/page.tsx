'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { BuildingIcon } from '@/components/icons';
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
import Button from '@/components/ui/Button';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface BusinessPlanData {
  projectName: string;
  projectType: 'RESIDENZIALE' | 'COMMERCIALE' | 'MISTO' | 'INDUSTRIALE';
  location: string;
  totalInvestment: number;
  constructionCost: number;
  landCost: number;
  marketingCost: number;
  contingencyCost: number;
  expectedRevenue: number;
  projectDuration: number;
  units: number;
  averageUnitPrice: number;
  financingType: 'PROPRIO' | 'PRESTITO_BANCARIO' | 'INVESTITORI' | 'MISTO';
  loanAmount?: number;
  interestRate?: number;
  loanTermYears?: number;
}

interface BusinessPlanResult {
  id: string;
  projectSummary: {
    name: string;
    type: string;
    location: string;
    totalInvestment: number;
    expectedRevenue: number;
    netProfit: number;
    roi: number;
    irr: number;
  };
  financialProjections: {
    year: number;
    cashInflow: number;
    cashOutflow: number;
    netCashFlow: number;
    cumulativeCashFlow: number;
  }[];
  keyMetrics: {
    breakEvenPoint: number;
    paybackPeriod: number;
    profitMargin: number;
    debtServiceCoverage?: number;
  };
  riskAnalysis: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  marketAnalysis: {
    marketSize: string;
    targetMarket: string;
    competitorAnalysis: string;
    marketTrends: string[];
  };
  executionPlan: {
    phases: {
      name: string;
      duration: number;
      budget: number;
      milestones: string[];
    }[];
  };
  fundingStrategy: {
    sources: {
      source: string;
      amount: number;
      percentage: number;
      terms: string;
    }[];
    totalFunding: number;
  };
}

export default function BusinessPlanPage() {
  const [formData, setFormData] = useState<BusinessPlanData>({
    projectName: '',
    projectType: 'RESIDENZIALE',
    location: '',
    totalInvestment: 0,
    constructionCost: 0,
    landCost: 0,
    marketingCost: 0,
    contingencyCost: 0,
    expectedRevenue: 0,
    projectDuration: 0,
    units: 0,
    averageUnitPrice: 0,
    financingType: 'PROPRIO',
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
  });

  const [results, setResults] = useState<BusinessPlanResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BusinessPlanResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (field: keyof BusinessPlanData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateBusinessPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Simula chiamata API per generare business plan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: BusinessPlanResult = {
        id: Date.now().toString(),
        projectSummary: {
          name: formData.projectName,
          type: formData.projectType,
          location: formData.location,
          totalInvestment: formData.totalInvestment,
          expectedRevenue: formData.expectedRevenue,
          netProfit: formData.expectedRevenue - formData.totalInvestment,
          roi: ((formData.expectedRevenue - formData.totalInvestment) / formData.totalInvestment) * 100,
          irr: 15.5, // Calcolo semplificato
        },
        financialProjections: [
          { year: 1, cashInflow: formData.expectedRevenue * 0.3, cashOutflow: formData.totalInvestment * 0.4, netCashFlow: 0, cumulativeCashFlow: 0 },
          { year: 2, cashInflow: formData.expectedRevenue * 0.5, cashOutflow: formData.totalInvestment * 0.3, netCashFlow: 0, cumulativeCashFlow: 0 },
          { year: 3, cashInflow: formData.expectedRevenue * 0.7, cashOutflow: formData.totalInvestment * 0.2, netCashFlow: 0, cumulativeCashFlow: 0 },
          { year: 4, cashInflow: formData.expectedRevenue * 0.9, cashOutflow: formData.totalInvestment * 0.1, netCashFlow: 0, cumulativeCashFlow: 0 },
          { year: 5, cashInflow: formData.expectedRevenue, cashOutflow: formData.totalInvestment * 0.05, netCashFlow: 0, cumulativeCashFlow: 0 },
        ],
        keyMetrics: {
          breakEvenPoint: formData.totalInvestment * 0.6,
          paybackPeriod: 3.2,
          profitMargin: ((formData.expectedRevenue - formData.totalInvestment) / formData.expectedRevenue) * 100,
          debtServiceCoverage: formData.financingType === 'PRESTITO_BANCARIO' ? 1.5 : undefined,
        },
        riskAnalysis: {
          riskLevel: formData.totalInvestment > 5000000 ? 'HIGH' : formData.totalInvestment > 2000000 ? 'MEDIUM' : 'LOW',
          riskFactors: ['Variazioni di mercato', 'Costi di costruzione', 'Ritardi nei permessi'],
          mitigationStrategies: ['Diversificazione del portafoglio', 'Contratti a prezzo fisso', 'Permessi anticipati'],
        },
        marketAnalysis: {
          marketSize: '€2.5M - €5M',
          targetMarket: 'Famiglie giovani e professionisti',
          competitorAnalysis: 'Mercato competitivo con 3-4 operatori principali',
          marketTrends: ['Crescita sostenibile', 'Domanda per sostenibilità', 'Preferenza per location centrali'],
        },
        executionPlan: {
          phases: [
            { name: 'Fase 1: Pianificazione', duration: 6, budget: formData.totalInvestment * 0.1, milestones: ['Permessi', 'Progettazione'] },
            { name: 'Fase 2: Costruzione', duration: 18, budget: formData.totalInvestment * 0.7, milestones: ['Fondazioni', 'Struttura', 'Finiture'] },
            { name: 'Fase 3: Vendita', duration: 12, budget: formData.totalInvestment * 0.2, milestones: ['Marketing', 'Vendite', 'Consegna'] },
          ],
        },
        fundingStrategy: {
          sources: [
            { source: 'Capitale proprio', amount: formData.totalInvestment * 0.3, percentage: 30, terms: 'Nessun costo' },
            { source: 'Prestito bancario', amount: formData.totalInvestment * 0.7, percentage: 70, terms: '4.5% annuo, 20 anni' },
          ],
          totalFunding: formData.totalInvestment,
        },
      };

      setResults(prev => [mockResult, ...prev]);
      setSelectedResult(mockResult);
      setShowForm(false);
    } catch (error) {
      console.error('Errore nella generazione del business plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                Business Plan Generator
              </h1>
              <p className="text-gray-600 mt-2">
                Genera Business Plan professionali con proiezioni finanziarie intelligenti
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuovo Business Plan
            </Button>
          </div>

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{result.projectSummary.name}</h3>
                      <p className="text-sm text-gray-600">{result.projectSummary.location}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(result.riskAnalysis.riskLevel)}`}>
                      {result.riskAnalysis.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investimento:</span>
                      <span className="text-sm font-medium">{formatCurrency(result.projectSummary.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ROI:</span>
                      <span className="text-sm font-medium text-green-600">{result.projectSummary.roi.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payback:</span>
                      <span className="text-sm font-medium">{result.keyMetrics.paybackPeriod} anni</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Profitto Netto:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(result.projectSummary.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Nuovo Business Plan</h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informazioni Base */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Informazioni Base</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Progetto
                        </label>
                        <input
                          type="text"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange('projectName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Es. Residenze Milano Centro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo Progetto
                        </label>
                        <select
                          value={formData.projectType}
                          onChange={(e) => handleInputChange('projectType', e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="RESIDENZIALE">Residenziale</option>
                          <option value="COMMERCIALE">Commerciale</option>
                          <option value="MISTO">Misto</option>
                          <option value="INDUSTRIALE">Industriale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Località
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Es. Milano, Via Roma 123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durata Progetto (mesi)
                        </label>
                        <input
                          type="number"
                          value={formData.projectDuration}
                          onChange={(e) => handleInputChange('projectDuration', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="24"
                        />
                      </div>
                    </div>

                    {/* Costi */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Costi</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo Terreno
                        </label>
                        <input
                          type="number"
                          value={formData.landCost}
                          onChange={(e) => handleInputChange('landCost', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo Costruzione
                        </label>
                        <input
                          type="number"
                          value={formData.constructionCost}
                          onChange={(e) => handleInputChange('constructionCost', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1500000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo Marketing
                        </label>
                        <input
                          type="number"
                          value={formData.marketingCost}
                          onChange={(e) => handleInputChange('marketingCost', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo Contingenza
                        </label>
                        <input
                          type="number"
                          value={formData.contingencyCost}
                          onChange={(e) => handleInputChange('contingencyCost', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    {/* Ricavi */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Ricavi</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numero Unità
                        </label>
                        <input
                          type="number"
                          value={formData.units}
                          onChange={(e) => handleInputChange('units', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prezzo Medio per Unità
                        </label>
                        <input
                          type="number"
                          value={formData.averageUnitPrice}
                          onChange={(e) => handleInputChange('averageUnitPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="300000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ricavi Attesi Totali
                        </label>
                        <input
                          type="number"
                          value={formData.expectedRevenue}
                          onChange={(e) => handleInputChange('expectedRevenue', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3600000"
                        />
                      </div>
                    </div>

                    {/* Finanziamento */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Finanziamento</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo Finanziamento
                        </label>
                        <select
                          value={formData.financingType}
                          onChange={(e) => handleInputChange('financingType', e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="PROPRIO">Capitale Proprio</option>
                          <option value="PRESTITO_BANCARIO">Prestito Bancario</option>
                          <option value="INVESTITORI">Investitori</option>
                          <option value="MISTO">Misto</option>
                        </select>
                      </div>

                      {formData.financingType === 'PRESTITO_BANCARIO' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Importo Prestito
                            </label>
                            <input
                              type="number"
                              value={formData.loanAmount || 0}
                              onChange={(e) => handleInputChange('loanAmount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="1500000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tasso Interesse (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={formData.interestRate || 0}
                              onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="4.5"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Durata Prestito (anni)
                            </label>
                            <input
                              type="number"
                              value={formData.loanTermYears || 0}
                              onChange={(e) => handleInputChange('loanTermYears', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="20"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={generateBusinessPlan}
                      disabled={isGenerating}
                      className="flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          Genera Business Plan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Result View */}
          {selectedResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedResult.projectSummary.name}</h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Summary */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Progetto</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{selectedResult.projectSummary.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Località:</span>
                        <span className="font-medium">{selectedResult.projectSummary.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investimento Totale:</span>
                        <span className="font-medium">{formatCurrency(selectedResult.projectSummary.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ricavi Attesi:</span>
                        <span className="font-medium">{formatCurrency(selectedResult.projectSummary.expectedRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profitto Netto:</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedResult.projectSummary.netProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-medium text-green-600">{selectedResult.projectSummary.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Metriche Chiave</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Break Even Point:</span>
                        <span className="font-medium">{formatCurrency(selectedResult.keyMetrics.breakEvenPoint)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payback Period:</span>
                        <span className="font-medium">{selectedResult.keyMetrics.paybackPeriod} anni</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margine di Profitto:</span>
                        <span className="font-medium">{selectedResult.keyMetrics.profitMargin.toFixed(1)}%</span>
                      </div>
                      {selectedResult.keyMetrics.debtServiceCoverage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Debt Service Coverage:</span>
                          <span className="font-medium">{selectedResult.keyMetrics.debtServiceCoverage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Projections Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Proiezioni Finanziarie</h3>
                  <div className="space-y-2">
                    {selectedResult.financialProjections.map((projection, index) => (
                      <div key={projection.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Anno {projection.year}</span>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Cash Flow: {formatCurrency(projection.netCashFlow)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cumulativo: {formatCurrency(projection.cumulativeCashFlow)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisi del Rischio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fattori di Rischio</h4>
                    <ul className="space-y-1">
                      {selectedResult.riskAnalysis.riskFactors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Strategie di Mitigazione</h4>
                    <ul className="space-y-1">
                      {selectedResult.riskAnalysis.mitigationStrategies.map((strategy, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Execution Plan */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Piano di Esecuzione</h3>
                <div className="space-y-4">
                  {selectedResult.executionPlan.phases.map((phase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{phase.name}</h4>
                        <div className="text-sm text-gray-600">
                          {phase.duration} mesi • {formatCurrency(phase.budget)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {phase.milestones.map((milestone, milestoneIndex) => (
                          <div key={milestoneIndex} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {milestone}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun Business Plan Generato</h3>
              <p className="text-gray-600 mb-6">
                Crea il tuo primo business plan per iniziare l'analisi del progetto
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Genera Business Plan
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <FeedbackWidget />
    </DashboardLayout>
  );
}