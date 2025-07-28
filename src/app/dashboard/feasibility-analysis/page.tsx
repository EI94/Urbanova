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

    try {
      // Calcoli reali di fattibilità
      const totalInvestment = formData.acquisitionCost + formData.constructionCost + formData.additionalCosts;
      const totalRevenue = formData.buildingArea * formData.sellingPricePerSqm;
      const netProfit = totalRevenue - totalInvestment;
      const roi = totalInvestment > 0 ? ((netProfit / totalInvestment) * 100) : 0;
      
      // Calcoli NPV e IRR
      const discountRate = 0.08; // 8% tasso di sconto
      const totalTimeYears = (formData.constructionTimeMonths + formData.sellingTimeMonths) / 12;
      const npv = netProfit / Math.pow(1 + discountRate, totalTimeYears);
      
      // IRR semplificato
      const irr = roi > 0 ? Math.min(roi * 0.8, 25) : 0;
      
      // Payback period
      const paybackPeriod = totalInvestment > 0 ? totalInvestment / (netProfit / totalTimeYears) : 0;
      
      // Risk score basato su fattori reali
      let riskScore = 50;
      
      // Fattori di rischio
      if (roi > 25) riskScore -= 15;
      else if (roi > 15) riskScore -= 10;
      else if (roi < 5) riskScore += 20;
      
      if (formData.projectType === 'COMMERCIALE') riskScore += 5;
      if (formData.projectType === 'INDUSTRIALE') riskScore += 10;
      
      if (formData.constructionTimeMonths > 36) riskScore += 15;
      if (formData.constructionTimeMonths < 12) riskScore -= 5;
      
      if (totalInvestment > 10000000) riskScore += 10;
      if (totalInvestment < 1000000) riskScore -= 5;
      
      riskScore = Math.max(0, Math.min(100, riskScore));

      // Scenari
      const optimistic = {
        roi: roi * 1.3,
        npv: npv * 1.2,
        netProfit: netProfit * 1.25
      };
      
      const realistic = {
        roi: roi,
        npv: npv,
        netProfit: netProfit
      };
      
      const pessimistic = {
        roi: roi * 0.7,
        npv: npv * 0.8,
        netProfit: netProfit * 0.75
      };

      // Raccomandazioni basate sui risultati
      const recommendations: string[] = [];
      
      if (roi < 10) {
        recommendations.push('ROI basso: considerare rinegoziazione prezzi o ottimizzazione costi');
      }
      if (riskScore > 70) {
        recommendations.push('Rischio elevato: valutare strategie di mitigazione');
      }
      if (paybackPeriod > 5) {
        recommendations.push('Tempo di ritorno lungo: considerare finanziamenti a lungo termine');
      }
      if (formData.constructionTimeMonths > 36) {
        recommendations.push('Tempi di costruzione elevati: valutare accelerazione lavori');
      }
      if (recommendations.length === 0) {
        recommendations.push('Progetto finanziariamente sostenibile');
      }

      const calculatedResults: FeasibilityResults = {
        totalInvestment,
        totalRevenue,
        netProfit,
        roi,
        npv,
        irr,
        paybackPeriod,
        riskScore,
        recommendations,
        scenarios: {
          optimistic,
          realistic,
          pessimistic
        }
      };

      setResults(calculatedResults);
    } catch (error) {
      console.error('Errore nel calcolo della fattibilità:', error);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-success';
    if (score <= 60) return 'text-warning';
    return 'text-error';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return 'text-success';
    if (roi >= 10) return 'text-warning';
    return 'text-error';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analisi di Fattibilità</h1>
          <p className="text-neutral-600 mt-1">
            Valutazione finanziaria e di rischio dei progetti immobiliari
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Input */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Dati Progetto</h2>
            
            <div className="space-y-4">
              <FormInput
                label="Nome Progetto"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Es. Residenza Milano Centro"
              />
              
              <FormInput
                label="Località"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Es. Milano, Lombardia"
              />
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tipo Progetto</span>
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="RESIDENZIALE">Residenziale</option>
                  <option value="COMMERCIALE">Commerciale</option>
                  <option value="MISTO">Misto</option>
                  <option value="INDUSTRIALE">Industriale</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-2 gap-4">
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
                  placeholder="1200000"
                />
              </div>
              
              <FormInput
                label="Costi Aggiuntivi (€)"
                name="additionalCosts"
                type="number"
                value={formData.additionalCosts}
                onChange={handleInputChange}
                placeholder="100000"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Prezzo Vendita (€/m²)"
                  name="sellingPricePerSqm"
                  type="number"
                  value={formData.sellingPricePerSqm}
                  onChange={handleInputChange}
                  placeholder="3000"
                />
                
                <FormInput
                  label="Prezzo Affitto (€/m²)"
                  name="rentPricePerSqm"
                  type="number"
                  value={formData.rentPricePerSqm}
                  onChange={handleInputChange}
                  placeholder="15"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                isLoading={analyzing}
                onClick={calculateFeasibility}
                disabled={!formData.projectName || !formData.location}
              >
                {analyzing ? 'Analizzando...' : 'Calcola Fattibilità'}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Risultati Analisi</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : results ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title text-neutral-500">ROI</div>
                    <div className={`stat-value text-2xl ${getROIColor(results.roi)}`}>
                      {formatPercentage(results.roi)}
                    </div>
                  </div>
                  
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title text-neutral-500">Rischio</div>
                    <div className={`stat-value text-2xl ${getRiskColor(results.riskScore)}`}>
                      {results.riskScore}/100
                    </div>
                  </div>
                </div>
                
                {/* Financial Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900">Riepilogo Finanziario</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Investimento Totale:</span>
                      <span className="font-medium">{formatCurrency(results.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Ricavi Totali:</span>
                      <span className="font-medium">{formatCurrency(results.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Utile Netto:</span>
                      <span className={`font-medium ${results.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                        {formatCurrency(results.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">NPV:</span>
                      <span className={`font-medium ${results.npv >= 0 ? 'text-success' : 'text-error'}`}>
                        {formatCurrency(results.npv)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">IRR:</span>
                      <span className="font-medium">{formatPercentage(results.irr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Payback Period:</span>
                      <span className="font-medium">{results.paybackPeriod.toFixed(1)} anni</span>
                    </div>
                  </div>
                </div>
                
                {/* Scenarios */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900">Scenari</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-success/10 rounded">
                      <span className="text-success font-medium">Ottimistico</span>
                      <span className="text-success font-medium">{formatPercentage(results.scenarios.optimistic.roi)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-base-200 rounded">
                      <span className="font-medium">Realistico</span>
                      <span className="font-medium">{formatPercentage(results.scenarios.realistic.roi)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-error/10 rounded">
                      <span className="text-error font-medium">Pessimistico</span>
                      <span className="text-error font-medium">{formatPercentage(results.scenarios.pessimistic.roi)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900">Raccomandazioni</h3>
                  
                  <div className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="alert alert-info">
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <BuildingIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  Inserisci i dati del progetto
                </h3>
                <p className="text-neutral-500">
                  Compila il form per calcolare la fattibilità del progetto
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 