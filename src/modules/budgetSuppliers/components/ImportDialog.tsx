'use client';

/**
 * 📥 IMPORT DIALOG
 * 
 * Dialog per importazione Excel con mapping colonne e librerie
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Download, 
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Library,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  detectColumns, 
  validateImportedData, 
  convertToBoqItems,
  generateExcelTemplate,
  SUPPORTED_COLUMNS,
  ExcelMapping,
  ExcelSheet
} from '../lib/xlsMapping';
import { 
  availableLibraries, 
  LibraryItem, 
  searchItems,
  addItemToUserLibrary 
} from '../lib/libraries';
import { MicrocopyDisplay, useBudgetSuppliersMicrocopy } from '../hooks/useMicrocopy';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const microcopy = useBudgetSuppliersMicrocopy();
  const [activeTab, setActiveTab] = useState<'excel' | 'library'>('excel');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelSheets, setExcelSheets] = useState<ExcelSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [mappings, setMappings] = useState<ExcelMapping[]>([]);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<LibraryItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestione upload file Excel
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Seleziona un file Excel (.xlsx o .xls)');
      return;
    }

    setExcelFile(file);
    
    // Simula parsing Excel (in produzione useresti una libreria come xlsx)
    const mockSheets: ExcelSheet[] = [
      {
        name: 'Opere',
        headers: ['Descrizione', 'Categoria', 'UM', 'Q.tà', 'Prezzo Budget', 'Codice'],
        data: [
          ['Scavi e fondazioni', 'OPERE', 'mc', 150, 45000, '001'],
          ['Struttura portante', 'OPERE', 'mc', 200, 120000, '002'],
          ['Murature', 'OPERE', 'mq', 800, 24000, '003']
        ],
        rowCount: 3
      },
      {
        name: 'Forniture',
        headers: ['Descrizione', 'Categoria', 'UM', 'Q.tà', 'Prezzo Budget'],
        data: [
          ['Impianto elettrico', 'FORNITURE', 'mq', 1200, 36000],
          ['Pavimenti', 'FORNITURE', 'mq', 800, 24000]
        ],
        rowCount: 2
      }
    ];
    
    setExcelSheets(mockSheets);
    setSelectedSheet(mockSheets[0].name);
    
    // Auto-detect mappings per il primo sheet
    const autoMappings = detectColumns(mockSheets[0].headers);
    setMappings(autoMappings);
    
    // Valida i dati
    const validationResult = validateImportedData(mockSheets[0].data, autoMappings);
    setValidation(validationResult);
  };

  // Gestione selezione sheet
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
    const sheet = excelSheets.find(s => s.name === sheetName);
    if (sheet) {
      const autoMappings = detectColumns(sheet.headers);
      setMappings(autoMappings);
      
      const validationResult = validateImportedData(sheet.data, autoMappings);
      setValidation(validationResult);
    }
  };

  // Gestione mapping colonne
  const handleMappingChange = (column: string, field: string) => {
    const newMappings = mappings.map(mapping => 
      mapping.column === column 
        ? { ...mapping, field }
        : mapping
    );
    setMappings(newMappings);
    
    // Ri-valida i dati
    const sheet = excelSheets.find(s => s.name === selectedSheet);
    if (sheet) {
      const validationResult = validateImportedData(sheet.data, newMappings);
      setValidation(validationResult);
    }
  };

  // Gestione importazione
  const handleImport = () => {
    if (activeTab === 'excel') {
      const sheet = excelSheets.find(s => s.name === selectedSheet);
      if (sheet && validation?.isValid) {
        const items = convertToBoqItems(sheet.data, mappings);
        onImport(items);
        onClose();
      }
    } else {
      // Importa dalla libreria
      const items = selectedLibraryItems.map(item => ({
        id: `library-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId: '',
        code: item.code,
        description: item.description,
        category: item.category,
        uom: item.uom,
        qty: 1, // Default quantity
        budget: item.priceRange.average,
        notes: item.notes || '',
        status: 'draft',
        level: 'definitive',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));
      
      onImport(items);
      onClose();
    }
  };

  // Gestione libreria
  const handleLibraryItemSelect = (item: LibraryItem) => {
    setSelectedLibraryItems(prev => 
      prev.find(i => i.id === item.id) 
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  // Download template
  const handleDownloadTemplate = () => {
    const template = generateExcelTemplate();
    const blob = new Blob([template], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-computo.tsv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Importa Items</h2>
              <p className="text-sm text-gray-600">Carica dati da Excel o seleziona dalla libreria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'excel'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Importa Excel
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Library className="w-4 h-4 inline mr-2" />
            Libreria Voci
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          
          {activeTab === 'excel' && (
            <div className="space-y-6">
              
              {/* Upload Area */}
              {!excelFile && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Carica file Excel
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Seleziona un file .xlsx o .xls con le voci di computo
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Seleziona File
                    </button>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Scarica Template
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}

              {/* File Info */}
              {excelFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{excelFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {excelSheets.length} sheet • {excelSheets.reduce((sum, s) => sum + s.rowCount, 0)} righe totali
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setExcelFile(null);
                        setExcelSheets([]);
                        setMappings([]);
                        setValidation(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sheet Selection */}
              {excelSheets.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Seleziona Sheet</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {excelSheets.map((sheet) => (
                      <button
                        key={sheet.name}
                        onClick={() => handleSheetSelect(sheet.name)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedSheet === sheet.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{sheet.name}</p>
                        <p className="text-sm text-gray-600">{sheet.rowCount} righe</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Column Mapping */}
              {mappings.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Mapping Colonne</h3>
                  <div className="space-y-3">
                    {mappings.map((mapping) => (
                      <div key={mapping.column} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium text-gray-700">
                          {mapping.column}
                        </div>
                        <div className="flex-1">
                          <select
                            value={mapping.field}
                            onChange={(e) => handleMappingChange(mapping.column, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">-- Seleziona campo --</option>
                            {SUPPORTED_COLUMNS.map((col) => (
                              <option key={col.name} value={col.name}>
                                {col.name} {col.required && '*'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-20 text-xs text-gray-500">
                          {mapping.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation */}
              {validation && (
                <div className="space-y-3">
                  {validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-medium text-red-800">Errori da correggere</h4>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Avvisi</h4>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validation.isValid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-800">File valido per l'importazione</h4>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca nella libreria..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Microcopy Benchmark Disclaimer */}
              <MicrocopyDisplay type="benchmarkDisclaimer" showDescription={true} />
              
              {/* Library Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Library className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Urbanova — Lazio 2023 (Allegato A)</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Benchmark prezzi costruzione Regione Lazio. I prezzi sono indicativi e non vincolanti.
                </p>
                <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
                  <span>24 voci disponibili</span>
                  <span>•</span>
                  <span>5 categorie</span>
                  <span>•</span>
                  <span>Aggiornato: Dic 2023</span>
                </div>
              </div>

              {/* Library Items */}
              <div className="space-y-3">
                {availableLibraries[0].items
                  .filter(item => 
                    !librarySearch || 
                    item.description.toLowerCase().includes(librarySearch.toLowerCase()) ||
                    item.code.toLowerCase().includes(librarySearch.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedLibraryItems.find(i => i.id === item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLibraryItemSelect(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{item.code}</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.category}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {item.uom}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Range: €{item.priceRange.min} - €{item.priceRange.max}</span>
                            <span>•</span>
                            <span>Media: €{item.priceRange.average}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {selectedLibraryItems.find(i => i.id === item.id) ? (
                            <Check className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected Items Summary */}
              {selectedLibraryItems.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-800">
                      {selectedLibraryItems.length} voci selezionate
                    </h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Le voci selezionate verranno aggiunte al computo con quantità di default.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {activeTab === 'excel' 
              ? `${excelSheets.reduce((sum, s) => sum + s.rowCount, 0)} righe da importare`
              : `${selectedLibraryItems.length} voci selezionate`
            }
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleImport}
              disabled={
                (activeTab === 'excel' && (!validation?.isValid || mappings.length === 0)) ||
                (activeTab === 'library' && selectedLibraryItems.length === 0)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Importa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
