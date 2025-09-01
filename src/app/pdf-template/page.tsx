'use client';

import React from 'react';

interface PDFTemplateProps {
  project?: any;
  calculatedCosts?: any;
  calculatedRevenues?: any;
  calculatedResults?: any;
}

export default function PDFTemplate({
  project,
  calculatedCosts,
  calculatedRevenues,
  calculatedResults,
}: PDFTemplateProps) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* HEADER URBANOVA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🏗️ URBANOVA</h1>
        <p className="text-xl">Studio di Fattibilità</p>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="max-w-4xl mx-auto p-8">
        {/* DATI BASE PROGETTO */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Dati Base Progetto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project?.name && (
              <div className="bg-white p-4 rounded border">
                <span className="font-semibold text-gray-700">Nome Progetto:</span>
                <span className="ml-2 text-gray-900">{project.name}</span>
              </div>
            )}

            {project?.location && (
              <div className="bg-white p-4 rounded border">
                <span className="font-semibold text-gray-700">Località:</span>
                <span className="ml-2 text-gray-900">{project.location}</span>
              </div>
            )}

            {project?.totalArea && (
              <div className="bg-white p-4 rounded border">
                <span className="font-semibold text-gray-700">Superficie Totale:</span>
                <span className="ml-2 text-gray-900">{project.totalArea} m²</span>
              </div>
            )}

            {project?.units && (
              <div className="bg-white p-4 rounded border">
                <span className="font-semibold text-gray-700">Numero Unità:</span>
                <span className="ml-2 text-gray-900">{project.units}</span>
              </div>
            )}

            {project?.salePrice && (
              <div className="bg-white p-4 rounded border">
                <span className="font-semibold text-gray-700">Prezzo Vendita:</span>
                <span className="ml-2 text-gray-900">
                  €{project.salePrice.toLocaleString('it-IT')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* COSTI DI COSTRUZIONE */}
        {calculatedCosts && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Costi di Costruzione
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculatedCosts.totalConstructionCost && (
                <div className="bg-white p-4 rounded border border-blue-200">
                  <span className="font-semibold text-blue-700">Costo Totale Costruzione:</span>
                  <span className="ml-2 text-blue-900 font-bold">
                    €{calculatedCosts.totalConstructionCost.toLocaleString('it-IT')}
                  </span>
                </div>
              )}

              {calculatedCosts.costPerSquareMeter && (
                <div className="bg-white p-4 rounded border border-blue-200">
                  <span className="font-semibold text-blue-700">Costo per m²:</span>
                  <span className="ml-2 text-blue-900 font-bold">
                    €{calculatedCosts.costPerSquareMeter.toLocaleString('it-IT')}
                  </span>
                </div>
              )}

              {calculatedCosts.finishingCosts && (
                <div className="bg-white p-4 rounded border border-blue-200">
                  <span className="font-semibold text-blue-700">Costi di Finitura:</span>
                  <span className="ml-2 text-blue-900 font-bold">
                    €{calculatedCosts.finishingCosts.toLocaleString('it-IT')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RICAVI */}
        {calculatedRevenues && (
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              <span className="mr-2">💵</span>
              Ricavi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculatedRevenues.totalRevenue && (
                <div className="bg-white p-4 rounded border border-green-200">
                  <span className="font-semibold text-green-700">Ricavo Totale:</span>
                  <span className="ml-2 text-green-900 font-bold">
                    €{calculatedRevenues.totalRevenue.toLocaleString('it-IT')}
                  </span>
                </div>
              )}

              {calculatedRevenues.revenuePerSquareMeter && (
                <div className="bg-white p-4 rounded border border-green-200">
                  <span className="font-semibold text-green-700">Ricavo per m²:</span>
                  <span className="ml-2 text-green-900 font-bold">
                    €{calculatedRevenues.revenuePerSquareMeter.toLocaleString('it-IT')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RISULTATI FINALI */}
        {calculatedResults && (
          <div className="bg-purple-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Risultati Finali
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculatedResults.totalInvestment && (
                <div className="bg-white p-4 rounded border border-purple-200">
                  <span className="font-semibold text-purple-700">Investimento Totale:</span>
                  <span className="ml-2 text-purple-900 font-bold">
                    €{calculatedResults.totalInvestment.toLocaleString('it-IT')}
                  </span>
                </div>
              )}

              {calculatedResults.totalProfit && (
                <div className="bg-white p-4 rounded border border-purple-200">
                  <span className="font-semibold text-purple-700">Profitto Totale:</span>
                  <span className="ml-2 text-purple-900 font-bold">
                    €{calculatedResults.totalProfit.toLocaleString('it-IT')}
                  </span>
                </div>
              )}

              {calculatedResults.profitMargin && (
                <div className="bg-white p-4 rounded border border-purple-200">
                  <span className="font-semibold text-purple-700">Margine di Profitto:</span>
                  <span className="ml-2 text-purple-900 font-bold">
                    {calculatedResults.profitMargin.toFixed(2)}%
                  </span>
                </div>
              )}

              {calculatedResults.roi && (
                <div className="bg-white p-4 rounded border border-purple-200">
                  <span className="font-semibold text-purple-700">ROI:</span>
                  <span className="ml-2 text-purple-900 font-bold">
                    {calculatedResults.roi.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GRAFICO VISUALE */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Riepilogo Visivo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <p className="font-semibold text-gray-700">Costi</p>
              {calculatedCosts?.totalConstructionCost && (
                <p className="text-blue-600 font-bold">
                  €{calculatedCosts.totalConstructionCost.toLocaleString('it-IT')}
                </p>
              )}
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💵</span>
              </div>
              <p className="font-semibold text-gray-700">Ricavi</p>
              {calculatedRevenues?.totalRevenue && (
                <p className="text-green-600 font-bold">
                  €{calculatedRevenues.totalRevenue.toLocaleString('it-IT')}
                </p>
              )}
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <p className="font-semibold text-gray-700">Profitto</p>
              {calculatedResults?.totalProfit && (
                <p className="text-purple-600 font-bold">
                  €{calculatedResults.totalProfit.toLocaleString('it-IT')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
        <p className="text-lg font-semibold mb-2">
          🏗️ Urbanova AI - Analisi di Fattibilità Intelligente
        </p>
        <p className="text-sm">© 2024 Urbanova. Tutti i diritti riservati.</p>
      </div>
    </div>
  );
}
