'use client';

import React, { useState } from 'react';

import { BuildingIcon } from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';

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
    projectDuration: 24,
    units: 0,
    averageUnitPrice: 0,
    financingType: 'PROPRIO',
    loanAmount: 0,
    interestRate: 3.5,
    loanTermYears: 15,
  });

  const [businessPlan, setBusinessPlan] = useState<BusinessPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('form');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: BusinessPlanData) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value,
    }));
  };

  const generateBusinessPlan = async () => {
    setLoading(true);

    // Simula analisi AI per business plan
    setTimeout(() => {
      const netProfit = formData.expectedRevenue - formData.totalInvestment;
      const roi = (netProfit / formData.totalInvestment) * 100;
      const irr = roi > 0 ? 8 + roi * 0.2 : 3;

      // Genera proiezioni finanziarie per 5 anni
      const projections = [];
      const projectYears = Math.ceil(formData.projectDuration / 12) + 2;

      for (let year = 1; year <= projectYears; year++) {
        const isConstructionYear = year <= Math.ceil(formData.projectDuration / 12);
        const cashOutflow = isConstructionYear
          ? formData.totalInvestment / Math.ceil(formData.projectDuration / 12)
          : formData.expectedRevenue * 0.1; // costi operativi

        const cashInflow = !isConstructionYear
          ? formData.expectedRevenue / (projectYears - Math.ceil(formData.projectDuration / 12))
          : 0;

        const netCashFlow = cashInflow - cashOutflow;
        const prevCumulative: number = year > 1 ? (projections[year - 2] as any)?.cumulativeCashFlow || 0 : 0;

        projections.push({
          year,
          cashInflow,
          cashOutflow,
          netCashFlow,
          cumulativeCashFlow: prevCumulative + netCashFlow,
        });
      }

      // Calcola breakeven point
      let breakEvenPoint = 0;
      for (let i = 0; i < projections.length; i++) {
        if ((projections[i] as any)?.cumulativeCashFlow > 0) {
          breakEvenPoint = i + 1;
          break;
        }
      }

      const mockBusinessPlan: BusinessPlanResult = {
        id: `bp-${Date.now()}`,
        projectSummary: {
          name: formData.projectName,
          type: formData.projectType,
          location: formData.location,
          totalInvestment: formData.totalInvestment,
          expectedRevenue: formData.expectedRevenue,
          netProfit,
          roi,
          irr,
        },
        financialProjections: projections,
        keyMetrics: {
          breakEvenPoint,
          paybackPeriod: breakEvenPoint,
          profitMargin: (netProfit / formData.expectedRevenue) * 100,
          debtServiceCoverage: formData.loanAmount
            ? netProfit / ((formData.loanAmount * (formData.interestRate || 0)) / 100)
            : undefined,
        } as any,
        riskAnalysis: {
          riskLevel: roi > 15 ? 'LOW' : roi > 8 ? 'MEDIUM' : 'HIGH',
          riskFactors: [
            ...(roi < 10 ? ['Bassa redditività prevista'] : []),
            ...(formData.projectDuration > 30 ? ['Tempi di realizzazione lunghi'] : []),
            ...(formData.financingType !== 'PROPRIO'
              ? ['Dipendenza da finanziamento esterno']
              : []),
            'Variazioni costi materie prime',
            'Fluttuazioni mercato immobiliare',
          ],
          mitigationStrategies: [
            'Diversificazione fornitori',
            'Contratti fixed-price con costruttori',
            'Pre-vendite per ridurre rischio mercato',
            'Buffer finanziario del 10-15%',
            'Monitoring continuo KPI progetto',
          ],
        },
        marketAnalysis: {
          marketSize: `Mercato ${formData.location} valutato in crescita del 5-8% annuo`,
          targetMarket:
            formData.projectType === 'RESIDENZIALE'
              ? 'Famiglie giovani e professionisti'
              : 'Aziende in espansione e investitori',
          competitorAnalysis:
            'Analisi competitor indica posizionamento competitivo nel segmento medio-alto',
          marketTrends: [
            'Crescente domanda sostenibilità',
            'Preferenza per soluzioni smart',
            'Aumento valore immobili zona',
            'Miglioramento infrastrutture trasporti',
          ],
        },
        executionPlan: {
          phases: [
            {
              name: 'Fase 1: Progettazione e Permessi',
              duration: 6,
              budget: formData.totalInvestment * 0.1,
              milestones: [
                'Approvazione progetto',
                'Permesso di costruire',
                'Finanziamenti confermati',
              ],
            },
            {
              name: 'Fase 2: Costruzione',
              duration: formData.projectDuration - 6,
              budget: formData.constructionCost,
              milestones: ['Fondazioni complete', 'Struttura completata', 'Finitures terminate'],
            },
            {
              name: 'Fase 3: Commercializzazione',
              duration: 12,
              budget: formData.marketingCost,
              milestones: ['Lancio vendite', '50% unità vendute', 'Progetto completato'],
            },
          ],
        },
        fundingStrategy: {
          sources: [
            ...(formData.financingType === 'PROPRIO' || formData.financingType === 'MISTO'
              ? [
                  {
                    source: 'Capital Proprio',
                    amount: formData.totalInvestment - (formData.loanAmount || 0),
                    percentage:
                      ((formData.totalInvestment - (formData.loanAmount || 0)) /
                        formData.totalInvestment) *
                      100,
                    terms: 'Equity investment senza restituzione',
                  },
                ]
              : []),
            ...(formData.loanAmount && formData.loanAmount > 0
              ? [
                  {
                    source: 'Finanziamento Bancario',
                    amount: formData.loanAmount,
                    percentage: (formData.loanAmount / formData.totalInvestment) * 100,
                    terms: `Tasso ${formData.interestRate}% per ${formData.loanTermYears} anni`,
                  },
                ]
              : []),
          ],
          totalFunding: formData.totalInvestment,
        },
      };

      setBusinessPlan(mockBusinessPlan);
      setActiveSection('results');
      setLoading(false);
    }, 3500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const downloadBusinessPlan = () => {
    // Simula download PDF
    alert('Funzionalità download in sviluppo - Il business plan verrà generato in PDF');
  };

  return (
    <DashboardLayout title="Business Plan Generator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Plan Generator AI</h1>
            <p className="text-gray-600">
              Genera piani d'affari professionali con proiezioni finanziarie intelligenti
            </p>
          </div>
          <BuildingIcon className="h-8 w-8 text-blue-600" />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'form', name: 'Parametri Progetto', icon: '📝' },
              { id: 'results', name: 'Business Plan', icon: '📊' },
              { id: 'export', name: 'Esporta & Condividi', icon: '📄' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                disabled={tab.id === 'results' && !businessPlan}
                className={`${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${tab.id === 'results' && !businessPlan ? 'opacity-50 cursor-not-allowed' : ''}
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Section */}
        {activeSection === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Dati del Progetto</h3>

              <div className="space-y-6">
                {/* Informazioni Base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Progetto
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Es. Residenza Vista Mare"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipologia
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="RESIDENZIALE">Residenziale</option>
                      <option value="COMMERCIALE">Commerciale</option>
                      <option value="MISTO">Misto</option>
                      <option value="INDUSTRIALE">Industriale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Località</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Milano, Zona Isola"
                  />
                </div>

                {/* Costi e Investimenti */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">💰 Struttura Costi</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo Terreno (€)
                      </label>
                      <input
                        type="number"
                        name="landCost"
                        value={formData.landCost}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo Costruzione (€)
                      </label>
                      <input
                        type="number"
                        name="constructionCost"
                        value={formData.constructionCost}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marketing & Vendita (€)
                      </label>
                      <input
                        type="number"
                        name="marketingCost"
                        value={formData.marketingCost}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contingency (€)
                      </label>
                      <input
                        type="number"
                        name="contingencyCost"
                        value={formData.contingencyCost}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      Investimento Totale:{' '}
                      {formatCurrency(
                        formData.landCost +
                          formData.constructionCost +
                          formData.marketingCost +
                          formData.contingencyCost
                      )}
                    </div>
                  </div>
                </div>

                {/* Ricavi */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">📈 Proiezioni Ricavi</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero Unità
                      </label>
                      <input
                        type="number"
                        name="units"
                        value={formData.units}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prezzo Medio Unità (€)
                      </label>
                      <input
                        type="number"
                        name="averageUnitPrice"
                        value={formData.averageUnitPrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">
                      Ricavo Totale Previsto:{' '}
                      {formatCurrency(formData.units * formData.averageUnitPrice)}
                    </div>
                  </div>
                </div>

                {/* Finanziamento */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    🏦 Strategia Finanziamento
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo Finanziamento
                      </label>
                      <select
                        name="financingType"
                        value={formData.financingType}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PROPRIO">Capitale Proprio</option>
                        <option value="PRESTITO_BANCARIO">Prestito Bancario</option>
                        <option value="INVESTITORI">Investitori Esterni</option>
                        <option value="MISTO">Finanziamento Misto</option>
                      </select>
                    </div>

                    {(formData.financingType === 'PRESTITO_BANCARIO' ||
                      formData.financingType === 'MISTO') && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Importo Prestito (€)
                          </label>
                          <input
                            type="number"
                            name="loanAmount"
                            value={formData.loanAmount}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tasso Interesse (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="interestRate"
                            value={formData.interestRate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durata (anni)
                          </label>
                          <input
                            type="number"
                            name="loanTermYears"
                            value={formData.loanTermYears}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durata Progetto (mesi)
                  </label>
                  <input
                    type="number"
                    name="projectDuration"
                    value={formData.projectDuration}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Riepilogo Rapido</h3>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Investimento Totale</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      formData.landCost +
                        formData.constructionCost +
                        formData.marketingCost +
                        formData.contingencyCost
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Ricavo Previsto</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(formData.units * formData.averageUnitPrice)}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Utile Stimato</div>
                  <div
                    className={`text-lg font-bold ${
                      formData.units * formData.averageUnitPrice -
                        (formData.landCost +
                          formData.constructionCost +
                          formData.marketingCost +
                          formData.contingencyCost) >
                      0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(
                      formData.units * formData.averageUnitPrice -
                        (formData.landCost +
                          formData.constructionCost +
                          formData.marketingCost +
                          formData.contingencyCost)
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">ROI Stimato</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formData.landCost +
                      formData.constructionCost +
                      formData.marketingCost +
                      formData.contingencyCost >
                    0
                      ? formatPercentage(
                          ((formData.units * formData.averageUnitPrice -
                            (formData.landCost +
                              formData.constructionCost +
                              formData.marketingCost +
                              formData.contingencyCost)) /
                            (formData.landCost +
                              formData.constructionCost +
                              formData.marketingCost +
                              formData.contingencyCost)) *
                            100
                        )
                      : '0.00%'}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={loading}
                  onClick={generateBusinessPlan}
                  disabled={!formData.projectName || !formData.location || formData.units === 0}
                >
                  {loading ? 'AI sta generando...' : 'Genera Business Plan AI'}
                </Button>
              </div>

              {loading && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  <div className="animate-pulse">
                    L'AI sta elaborando proiezioni finanziarie,
                    <br />
                    analisi di mercato e piano esecutivo...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {activeSection === 'results' && businessPlan && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">📋 Executive Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(businessPlan.projectSummary.totalInvestment)}
                  </div>
                  <div className="text-sm text-blue-800">Investimento Totale</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(businessPlan.projectSummary.expectedRevenue)}
                  </div>
                  <div className="text-sm text-green-800">Ricavo Previsto</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(businessPlan.projectSummary.roi)}
                  </div>
                  <div className="text-sm text-purple-800">ROI</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {businessPlan.keyMetrics.paybackPeriod} anni
                  </div>
                  <div className="text-sm text-orange-800">Payback</div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700">
                  <strong>{businessPlan.projectSummary.name}</strong> è un progetto{' '}
                  {businessPlan.projectSummary.type.toLowerCase()}
                  localizzato a {businessPlan.projectSummary.location}. L'investimento totale di{' '}
                  {formatCurrency(businessPlan.projectSummary.totalInvestment)}è previsto generare
                  ricavi per {formatCurrency(businessPlan.projectSummary.expectedRevenue)} con un
                  ROI del {formatPercentage(businessPlan.projectSummary.roi)}.
                </p>
              </div>
            </div>

            {/* Financial Projections */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                📈 Proiezioni Finanziarie
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Anno</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Entrate</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Uscite</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Flusso Netto
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Flusso Cumulativo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessPlan.financialProjections.map(projection => (
                      <tr key={projection.year} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Anno {projection.year}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(projection.cashInflow)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(projection.cashOutflow)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${projection.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(projection.netCashFlow)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${projection.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(projection.cumulativeCashFlow)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Analysis & Market Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Analisi dei Rischi</h3>

                <div className="mb-4">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(businessPlan.riskAnalysis.riskLevel)}`}
                  >
                    Livello Rischio: {businessPlan.riskAnalysis.riskLevel}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Fattori di Rischio:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {businessPlan.riskAnalysis.riskFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Strategie di Mitigazione:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {businessPlan.riskAnalysis.mitigationStrategies.map((strategy, idx) => (
                        <li key={idx}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Analisi di Mercato</h3>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Dimensione Mercato:</h5>
                    <p className="text-sm text-gray-600">
                      {businessPlan.marketAnalysis.marketSize}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Target di Mercato:</h5>
                    <p className="text-sm text-gray-600">
                      {businessPlan.marketAnalysis.targetMarket}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Analisi Competitor:</h5>
                    <p className="text-sm text-gray-600">
                      {businessPlan.marketAnalysis.competitorAnalysis}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Trend di Mercato:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {businessPlan.marketAnalysis.marketTrends.map((trend, idx) => (
                        <li key={idx}>{trend}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🚀 Piano di Esecuzione</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {businessPlan.executionPlan.phases.map((phase, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{phase.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durata:</span>
                        <span className="font-medium">{phase.duration} mesi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">{formatCurrency(phase.budget)}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-1">Milestone:</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {phase.milestones.map((milestone, midx) => (
                          <li key={midx}>• {milestone}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Strategy */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                💰 Strategia di Finanziamento
              </h3>

              <div className="space-y-4">
                {businessPlan.fundingStrategy.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{source.source}</div>
                      <div className="text-sm text-gray-600">{source.terms}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(source.amount)}</div>
                      <div className="text-sm text-gray-500">
                        {formatPercentage(source.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Totale Finanziamento:</span>
                  <span className="font-bold text-xl text-blue-600">
                    {formatCurrency(businessPlan.fundingStrategy.totalFunding)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Section */}
        {activeSection === 'export' && businessPlan && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              📄 Esporta & Condividi Business Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                <div className="text-3xl mb-3">📄</div>
                <h4 className="font-semibold text-gray-900 mb-2">Download PDF</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Business plan completo in formato PDF professionale
                </p>
                <Button variant="primary" onClick={downloadBusinessPlan}>
                  Scarica PDF
                </Button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">Export Excel</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Proiezioni finanziarie modificabili in Excel
                </p>
                <Button variant="outline">Scarica Excel</Button>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors">
                <div className="text-3xl mb-3">🔗</div>
                <h4 className="font-semibold text-gray-900 mb-2">Condividi Link</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Genera link di condivisione per investitori
                </p>
                <Button variant="outline">Crea Link</Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">
                💡 Suggerimenti per la presentazione:
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Personalizza il documento con il tuo branding aziendale</li>
                <li>• Includi documentazione di supporto (render, planimetrie, permessi)</li>
                <li>• Prepara una presentazione esecutiva di 10-15 slide</li>
                <li>• Considera scenari alternativi per discussions con investitori</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
