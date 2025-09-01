'use client';

import {
  Download,
  FileText,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Calculator,
  Target,
  Mail,
  Share2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import EmailSharingModal from './EmailSharingModal';

interface FeasibilityAnalysis {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  totalInvestment: number;
  expectedROI: number;
  paybackPeriod: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  marketTrend: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  recommendations: string[];
  notes?: string; // Note aggiuntive per l'analisi LLM
  createdAt: string;
}

interface FeasibilityReportGeneratorProps {
  analysis: FeasibilityAnalysis;
  onGenerateReport: () => void;
}

export default function FeasibilityReportGenerator({
  analysis,
  onGenerateReport,
}: FeasibilityReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Chiamata API per generare il report
      const response = await fetch('/api/generate-feasibility-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          notes: analysis.notes, // Includi le note per l'elaborazione LLM
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Studio-Fattibilita-${analysis.title.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Report generato con successo! 🎉');
        onGenerateReport();
      } else {
        throw new Error('Errore nella generazione del report');
      }
    } catch (error) {
      console.error('Errore generazione report:', error);
      toast.error('Errore nella generazione del report');
    } finally {
      setIsGenerating(false);
    }
  };

  const openEmailSharing = () => {
    setIsEmailModalOpen(true);
  };

  const closeEmailSharing = () => {
    setIsEmailModalOpen(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'POSITIVE':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'NEGATIVE':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'POSITIVE':
        return 'text-green-600';
      case 'NEGATIVE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Studio di Fattibilità
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Analisi completa dell'investimento immobiliare</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Header del Progetto */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{analysis.title}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                {analysis.location}
              </div>
              <Badge variant="outline" className="text-sm">
                {analysis.propertyType}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Creato il</p>
              <p className="font-semibold text-gray-800">
                {new Date(analysis.createdAt).toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        </div>

        {/* Metriche Principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Investimento Totale</p>
            <p className="text-xl font-bold text-gray-800">
              €{analysis.totalInvestment.toLocaleString('it-IT')}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">ROI Atteso</p>
            <p className="text-xl font-bold text-green-600">{analysis.expectedROI.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Payback Period</p>
            <p className="text-xl font-bold text-purple-600">
              {analysis.paybackPeriod.toFixed(1)} anni
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">NPV</p>
            <p className="text-xl font-bold text-orange-600">
              €{analysis.netPresentValue.toLocaleString('it-IT')}
            </p>
          </div>
        </div>

        {/* Analisi del Rischio e Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Analisi del Rischio
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Livello di Rischio:</span>
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {analysis.riskLevel === 'LOW'
                    ? 'Basso'
                    : analysis.riskLevel === 'MEDIUM'
                      ? 'Medio'
                      : 'Alto'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tasso Interno di Rendimento:</span>
                <span className="font-semibold text-gray-800">
                  {analysis.internalRateOfReturn.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Trend di Mercato
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Direzione del Mercato:</span>
                <div className="flex items-center">
                  {getTrendIcon(analysis.marketTrend)}
                  <span className={`ml-2 font-semibold ${getTrendColor(analysis.marketTrend)}`}>
                    {analysis.marketTrend === 'POSITIVE'
                      ? 'Positivo'
                      : analysis.marketTrend === 'NEGATIVE'
                        ? 'Negativo'
                        : 'Neutro'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Raccomandazioni */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
            Raccomandazioni AI
          </h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Scarica il Report Completo</h3>
          <p className="text-blue-100 mb-4">
            Report PDF professionale con analisi dettagliata e raccomandazioni AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Scarica Report PDF
                </>
              )}
            </Button>

            <Button
              onClick={openEmailSharing}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold shadow-lg"
            >
              <Mail className="w-5 h-5 mr-2" />
              Condividi via Email
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Report generato da Urbanova - Piattaforma di Analisi Immobiliare</p>
          <p className="mt-1">
            <a
              href={`/dashboard/feasibility-analysis/${analysis.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              Visualizza studio completo su Urbanova →
            </a>
          </p>
        </div>
      </CardContent>

      {/* Modal Condivisione Email */}
      <EmailSharingModal
        isOpen={isEmailModalOpen}
        onClose={closeEmailSharing}
        reportTitle={analysis.title}
        reportUrl={`${window.location.origin}/dashboard/feasibility-analysis/${analysis.id}`}
        onShareSuccess={() => {
          toast.success('Report condiviso con successo! 📧✨');
        }}
      />
    </Card>
  );
}
