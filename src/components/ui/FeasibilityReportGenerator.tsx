'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Download, FileText, Building2, MapPin, Calculator, Target, TrendingUp, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EmailSharingModal from './EmailSharingModal';

interface FeasibilityReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: {
    id: string;
    name: string;
    address: string;
    propertyType: string;
    totalArea: number;
    costs: any;
    revenues: any;
    results: any;
    targetMargin: number;
    notes?: string;
    createdAt: string;
  };
}

export default function FeasibilityReportGenerator({ isOpen, onClose, analysis }: FeasibilityReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Se non è aperto, non renderizzare nulla
  if (!isOpen) return null;

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
          notes: analysis.notes // Includi le note per l'elaborazione LLM
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Studio-Fattibilita-${analysis.name.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast('✅ Report generato con successo! 🎉');
        onClose();
      } else {
        throw new Error('Errore nella generazione del report');
      }
    } catch (error) {
      console.error('Errore generazione report:', error);
      toast('❌ Errore nella generazione del report');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Generatore Report Fattibilità</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Header del Progetto */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{analysis.name}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {analysis.address}
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
                €{analysis.costs.total.toLocaleString('it-IT')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">ROI Atteso</p>
              <p className="text-xl font-bold text-green-600">
                {analysis.results.roi.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Payback Period</p>
              <p className="text-xl font-bold text-purple-600">
                {analysis.results.paybackPeriod.toFixed(1)} anni
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Marginalità</p>
              <p className="text-xl font-bold text-orange-600">
                {analysis.results.margin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Note del Progetto */}
          {analysis.notes && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Note del Progetto
              </h3>
              <p className="text-gray-700">{analysis.notes}</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-2">Scarica il Report Completo</h3>
            <p className="text-blue-100 mb-4">
              Report PDF professionale con analisi dettagliata
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="btn btn-primary btn-lg bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Scarica Report PDF
                  </>
                )}
              </button>
              
              <button
                onClick={openEmailSharing}
                className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold shadow-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Condividi via Email
              </button>
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
        </div>

        {/* Modal Condivisione Email */}
        <EmailSharingModal
          isOpen={isEmailModalOpen}
          onClose={closeEmailSharing}
          reportTitle={analysis.name}
          reportUrl={`${window.location.origin}/dashboard/feasibility-analysis/${analysis.id}`}
          onShareSuccess={() => {
            toast('✅ Report condiviso con successo! 📧✨');
          }}
        />
      </div>
    </div>
  );
}
