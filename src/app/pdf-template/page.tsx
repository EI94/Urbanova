'use client';

import React from 'react';
import { FeasibilityProject } from '@/types/land';

interface PDFTemplateProps {
  project: FeasibilityProject;
  calculatedCosts: any;
  calculatedRevenues: any;
  calculatedResults: any;
}

export default function PDFTemplate({ 
  project, 
  calculatedCosts, 
  calculatedRevenues, 
  calculatedResults 
}: PDFTemplateProps) {
  return (
    <div className="min-h-screen bg-white p-8" style={{ width: '210mm', height: '297mm' }}>
      {/* Header Blu PERFETTO */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          Studio di Fattibilità
        </h1>
        <p className="text-lg text-center">
          Analisi completa dell'investimento immobiliare
        </p>
      </div>

      {/* Informazioni Progetto */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {project.name || 'Progetto'}
          </h2>
          <p className="text-xl text-gray-500">
            {project.address || 'Indirizzo non specificato'}
          </p>
        </div>
        <div className="text-right">
          <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold mb-2">
            PIANIFICAZIONE
          </div>
          <p className="text-sm text-gray-500">Creato il</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>

      {/* 4 Card Metriche PERFETTE */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Investimento Totale */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📊</span>
            <h3 className="text-lg font-medium text-gray-700">Investimento Totale</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            €{(calculatedCosts.total || 0).toLocaleString('it-IT')}
          </p>
        </div>

        {/* ROI Atteso */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🎯</span>
            <h3 className="text-lg font-medium text-gray-700">ROI Atteso</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {(calculatedResults.roi || 0).toFixed(1)}%
          </p>
        </div>

        {/* Payback Period */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⏰</span>
            <h3 className="text-lg font-medium text-gray-700">Payback Period</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {(calculatedResults.paybackPeriod || 0).toFixed(1)} anni
          </p>
        </div>

        {/* NPV */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📄</span>
            <h3 className="text-lg font-medium text-gray-700">NPV</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            €{(calculatedResults.profit || 0).toLocaleString('it-IT')}
          </p>
        </div>
      </div>

      {/* Sezioni Analisi PERFETTE */}
      <div className="grid grid-cols-2 gap-6">
        {/* Analisi del Rischio */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            Analisi del Rischio
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Livello di Rischio: </span>
              <span className="font-semibold text-gray-900">
                {calculatedResults.margin > 30 ? 'Basso' : calculatedResults.margin > 15 ? 'Medio' : 'Alto'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tasso Interno di Rendimento: </span>
              <span className="font-semibold text-gray-900">
                {(calculatedResults.roi || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Trend di Mercato */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">📈</span>
            Trend di Mercato
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Direzione del Mercato: </span>
              <span className="font-semibold text-green-600">
                {calculatedResults.margin > 25 ? 'Positivo' : calculatedResults.margin > 15 ? 'Stabile' : 'Negativo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
