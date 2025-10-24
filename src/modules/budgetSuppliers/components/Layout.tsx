'use client';

/**
 * 🏗️ BUDGET SUPPLIERS LAYOUT
 * 
 * Layout principale con tre aree: Sidebar, Canvas, Sidecar OS
 */

import React, { useState } from 'react';
import { KpiHeader } from './KpiHeader';
import { Sidebar } from './Sidebar';
import { BoqGrid } from './BoqGrid';
import { ActionsBar } from './ActionsBar';

export function BudgetSuppliersLayout() {
  const [selectedTypology, setSelectedTypology] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    level: '',
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const handleItemsImport = (items: any[]) => {
    console.log('Items imported:', items);
    // TODO: Aggiornare la lista items nel BoqGrid
  };

  const handleRfpCreated = (rfp: any) => {
    console.log('RFP created:', rfp);
    // TODO: Aggiornare la lista RFP
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* Header con KPI */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <KpiHeader />
      </div>

      {/* Layout principale */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar - Tipologie e Filtri */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <Sidebar 
            selectedTypology={selectedTypology}
            onTypologySelect={setSelectedTypology}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Canvas principale - BoqGrid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Actions Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <ActionsBar 
              onItemsImport={handleItemsImport}
              selectedItems={selectedItems}
              onRfpCreated={handleRfpCreated}
            />
          </div>

          {/* BoqGrid */}
          <div className="flex-1 overflow-auto">
            <BoqGrid 
              selectedTypology={selectedTypology}
              filters={filters}
            />
          </div>
        </div>

        {/* Sidecar OS - Placeholder per ora */}
        <div className="w-96 bg-white border-l border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              OS Assistant
            </h3>
            <p className="text-sm text-gray-600">
              Assistente AI per analisi budget e ottimizzazione fornitori
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
