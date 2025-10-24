'use client';

/**
 * 🎯 ACTIONS BAR
 * 
 * Barra azioni con pulsanti: Importa Excel, Aggiungi Items, Crea RFP, Confronta Offerte, Crea Bundle/Contratto
 */

import React, { useState } from 'react';
import { 
  Upload, 
  Plus, 
  FileText, 
  GitCompare, 
  FileCheck, 
  Download,
  Settings,
  Filter
} from 'lucide-react';
import { ImportDialog } from './ImportDialog';
import { RfpCreateDrawer } from './RfpCreateDrawer';
import { CompareOffers } from './CompareOffers';

interface ActionsBarProps {
  onItemsImport?: (items: any[]) => void;
  selectedItems?: any[];
  onRfpCreated?: (rfp: any) => void;
}

export function ActionsBar({ onItemsImport, selectedItems = [], onRfpCreated }: ActionsBarProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRfpDrawerOpen, setIsRfpDrawerOpen] = useState(false);
  const [isCompareOffersOpen, setIsCompareOffersOpen] = useState(false);
  
  const handleImportExcel = () => {
    setIsImportDialogOpen(true);
  };

  const handleItemsImport = (items: any[]) => {
    console.log('Items imported:', items);
    if (onItemsImport) {
      onItemsImport(items);
    }
    setIsImportDialogOpen(false);
  };

  const handleCreateRfp = () => {
    if (selectedItems.length === 0) {
      alert('Seleziona almeno un item per creare una RFP');
      return;
    }
    setIsRfpDrawerOpen(true);
  };

  const handleRfpCreated = (rfp: any) => {
    console.log('RFP created:', rfp);
    if (onRfpCreated) {
      onRfpCreated(rfp);
    }
  };
  
  const handleAddItems = () => {
    console.log('Aggiungi Items clicked');
    // TODO: Implementare aggiunta items
  };

  const handleCompareOffers = () => {
    setIsCompareOffersOpen(true);
  };

  const handleCreateContract = () => {
    console.log('Crea Bundle/Contratto clicked');
    // TODO: Implementare creazione contratto
  };

  const handleExport = () => {
    console.log('Esporta clicked');
    // TODO: Implementare esportazione
  };

  const handleSettings = () => {
    console.log('Impostazioni clicked');
    // TODO: Implementare impostazioni
  };

  return (
    <>
      <div className="flex items-center justify-between">
        
        {/* Azioni Principali */}
        <div className="flex items-center space-x-3">
          
          {/* Importa Excel */}
          <button
            onClick={handleImportExcel}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importa Excel
          </button>

          {/* Aggiungi Items */}
          <button
            onClick={handleAddItems}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Items
          </button>

          {/* Crea RFP */}
          <button
            onClick={handleCreateRfp}
            disabled={selectedItems.length === 0}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedItems.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Crea RFP {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>

          {/* Confronta Offerte */}
          <button
            onClick={handleCompareOffers}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Confronta Offerte
          </button>

          {/* Crea Bundle/Contratto */}
          <button
            onClick={handleCreateContract}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Crea Bundle/Contratto
          </button>

        </div>

        {/* Azioni Secondarie */}
        <div className="flex items-center space-x-2">
          
          {/* Esporta */}
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </button>

          {/* Filtri Avanzati */}
          <button
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtri
          </button>

          {/* Impostazioni */}
          <button
            onClick={handleSettings}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleItemsImport}
      />

      {/* RFP Create Drawer */}
      <RfpCreateDrawer
        isOpen={isRfpDrawerOpen}
        onClose={() => setIsRfpDrawerOpen(false)}
        selectedItems={selectedItems}
        onRfpCreated={handleRfpCreated}
      />

      {/* Compare Offers Modal */}
      {isCompareOffersOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confronto Offerte</h2>
              <button
                onClick={() => setIsCompareOffersOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <CompareOffers />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
