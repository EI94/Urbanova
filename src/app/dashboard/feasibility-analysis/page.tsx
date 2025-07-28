'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BuildingIcon, LocationIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';

interface FeasibilityData {
  projectName: string;
  location: string;
  projectType: 'RESIDENZIALE' | 'COMMERCIALE' | 'MISTO' | 'INDUSTRIALE';
  totalArea: number;
  buildingArea: number;
  acquisitionCost: number;
  constructionCost: number;
  additionalCosts: number;
  sellingPricePerSqm: number;
  rentPricePerSqm: number;
  constructionTimeMonths: number;
  sellingTimeMonths: number;
}

interface FeasibilityResults {
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  npv: number;
  irr: number;
  paybackPeriod: number;
  riskScore: number;
  recommendations: string[];
  scenarios: {
    optimistic: { roi: number; npv: number; netProfit: number };
    realistic: { roi: number; npv: number; netProfit: number };
    pessimistic: { roi: number; npv: number; netProfit: number };
  };
}

export default function FeasibilityAnalysisPage() {
  const [formData, setFormData] = useState<FeasibilityData>({
    projectName: '',
    location: '',
    projectType: 'RESIDENZIALE',
    totalArea: 0,
    buildingArea: 0,
    acquisitionCost: 0,
    constructionCost: 0,
    additionalCosts: 0,
    sellingPricePerSqm: 0,
    rentPricePerSqm: 0,
    constructionTimeMonths: 24,
    sellingTimeMonths: 12
  });

  const [results, setResults] = useState<FeasibilityResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FeasibilityData) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value
    }));
  };

  const calculateFeasibility = async () => {
    setAnalyzing(true);
    setLoading(true);

    // Simula analisi AI
    setTimeout(() => {
      const totalInvestment = formData.acquisitionCost + formData.constructionCost + formData.additionalCosts;
      const totalRevenue = formData.buildingArea * formData.sellingPricePerSqm;
      const netProfit = totalRevenue - totalInvestment;
      const roi = ((netProfit / totalInvestment) * 100);
      
      // Calcoli simulati per NPV e IRR
      const discountRate = 0.08;
      const npv = netProfit / Math.pow(1 + discountRate, formData.constructionTimeMonths / 12);
      const irr = roi > 0 ? 12 + (roi * 0.3) : 5;
      
      const paybackPeriod = totalInvestment / (netProfit / (formData.constructionTimeMonths + formData.sellingTimeMonths));
      
      // Risk score basato su diversi fattori
      let riskScore = 50;
      if (roi > 20) riskScore -= 10;
      if (roi < 10) riskScore += 15;
      if (formData.projectType === 'COMMERCIALE') riskScore += 5;
      if (formData.constructionTimeMonths > 36) riskScore += 10;
      riskScore = Math.max(0, Math.min(100, riskScore));

      const mockResults: FeasibilityResults = {
        totalInvestment,
        totalRevenue,
        netProfit,
        roi,
        npv,
        irr,
        paybackPeriod: paybackPeriod / 12, // in anni
        riskScore,
        recommendations: [
          roi > 15 ? '✅ Progetto altamente redditizio' : roi > 8 ? '⚠️ Redditività moderata' : '❌ Bassa redditività',
          riskScore < 40 ? '✅ Rischio contenuto' : riskScore < 70 ? '⚠️ Rischio medio' : '❌ Rischio elevato',
          formData.constructionTimeMonths > 30 ? '⚠️ Tempi di realizzazione lunghi' : '✅ Tempi ragionevoli',
          npv > 0 ? '✅ Valore attuale netto positivo' : '❌ VAN negativo - valutare alternative'
        ],
        scenarios: {
          optimistic: {
            roi: roi * 1.3,
            npv: npv * 1.4,
            netProfit: netProfit * 1.35
          },
          realistic: {
            roi,
            npv,
            netProfit
          },
          pessimistic: {
            roi: roi * 0.65,
            npv: npv * 0.55,
            netProfit: netProfit * 0.6
          }
        }
      };

      setResults(mockResults);
      setAnalyzing(false);
      setLoading(false);
    }, 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-green-600 bg-green-50';
    if (score < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getROIColor = (roi: number) => {
    if (roi > 15) return 'text-green-600';
    if (roi > 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout title="Analisi Fattibilità">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analisi di Fattibilità AI</h1>
            <p className="text-gray-600">Valutazione economica intelligente con scenari multipli</p>
          </div>
          <div className="flex items-center gap-2">
            <BuildingIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Input */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Parametri del Progetto</h3>
            
            <div className="space-y-4">
              <FormInput
                label="Nome Progetto"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Es. Residenza Marina"
                required
              />

              <FormInput
                label="Località"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Es. Milano, Zona Porta Nuova"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia Progetto</label>
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

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Superficie Totale (m²)"
                  name="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={handleInputChange}
                  placeholder="1000"
                />
                
                <FormInput
                  label="Superficie Edificabile (m²)"
                  name="buildingArea"
                  type="number"
                  value={formData.buildingArea}
                  onChange={handleInputChange}
                  placeholder="800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Costo Acquisizione (€)"
                  name="acquisitionCost"
                  type="number"
                  value={formData.acquisitionCost}
                  onChange={handleInputChange}
                  placeholder="500000"
                />
                
                <FormInput
                  label="Costo Costruzione (€)"
                  name="constructionCost"
                  type="number"
                  value={formData.constructionCost}
                  onChange={handleInputChange}
                  placeholder="800000"
                />
              </div>

              <FormInput
                label="Costi Aggiuntivi (€)"
                name="additionalCosts"
                type="number"
                value={formData.additionalCosts}
                onChange={handleInputChange}
                placeholder="200000"
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Prezzo Vendita al m² (€)"
                  name="sellingPricePerSqm"
                  type="number"
                  value={formData.sellingPricePerSqm}
                  onChange={handleInputChange}
                  placeholder="3500"
                />
                
                <FormInput
                  label="Canone Affitto al m² (€/anno)"
                  name="rentPricePerSqm"
                  type="number"
                  value={formData.rentPricePerSqm}
                  onChange={handleInputChange}
                  placeholder="200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Tempo Costruzione (mesi)"
                  name="constructionTimeMonths"
                  type="number"
                  value={formData.constructionTimeMonths}
                  onChange={handleInputChange}
                  placeholder="24"
                />
                
                <FormInput
                  label="Tempo Vendita (mesi)"
                  name="sellingTimeMonths"
                  type="number"
                  value={formData.sellingTimeMonths}
                  onChange={handleInputChange}
                  placeholder="12"
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={analyzing}
                onClick={calculateFeasibility}
                className="mt-6"
              >
                {analyzing ? 'AI sta analizzando...' : 'Analizza Fattibilità con AI'}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Risultati Analisi</h3>
            
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">L'AI sta elaborando l'analisi...</p>
                </div>
              </div>
            )}

            {!loading && !results && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">
                  <BuildingIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Inserisci i parametri e avvia l'analisi</p>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">ROI</div>
                    <div className={`text-2xl font-bold ${getROIColor(results.roi)}`}>
                      {formatPercentage(results.roi)}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 mb-1">VAN</div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(results.npv)}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 mb-1">TIR</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {formatPercentage(results.irr)}
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getRiskColor(results.riskScore)}`}>
                    <div className="text-sm mb-1">Rischio</div>
                    <div className="text-2xl font-bold">
                      {results.riskScore}/100
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Riepilogo Finanziario</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investimento Totale:</span>
                      <span className="font-medium">{formatCurrency(results.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ricavi Previsti:</span>
                      <span className="font-medium">{formatCurrency(results.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Utile Netto:</span>
                      <span className={`font-bold ${results.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(results.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback Period:</span>
                      <span className="font-medium">{results.paybackPeriod.toFixed(1)} anni</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Raccomandazioni AI</h4>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scenarios */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Scenari di Analisi</h4>
                  <div className="space-y-3">
                    {Object.entries(results.scenarios).map(([scenario, data]) => (
                      <div key={scenario} className="p-3 border rounded-lg">
                        <div className="font-medium text-gray-900 capitalize mb-2">{scenario}</div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500">ROI</div>
                            <div className="font-semibold">{formatPercentage(data.roi)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">VAN</div>
                            <div className="font-semibold">{formatCurrency(data.npv)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Utile</div>
                            <div className="font-semibold">{formatCurrency(data.netProfit)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 