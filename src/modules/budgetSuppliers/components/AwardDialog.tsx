'use client';

/**
 * 🏆 AWARD DIALOG
 * 
 * Dialog per selezione vincitori e creazione bundle contratti
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Package, 
  Users, 
  Euro, 
  CheckCircle, 
  X, 
  Plus,
  Minus,
  Save,
  FileText,
  AlertCircle,
  Info,
  Star,
  Award
} from 'lucide-react';
import { ComparisonResult, ComparisonItem } from '../api/compare';
import { AwardBundle, AwardItem } from '../api/contract';

interface AwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: ComparisonResult;
  onAwardComplete?: (bundles: AwardBundle[]) => void;
}

export function AwardDialog({ isOpen, onClose, comparison, onAwardComplete }: AwardDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [bundles, setBundles] = useState<AwardBundle[]>([]);
  const [currentBundle, setCurrentBundle] = useState<Partial<AwardBundle>>({
    name: '',
    vendorName: '',
    items: [],
    totalValue: 0,
    milestones: [],
    retention: 5,
    penalties: [],
    bonuses: []
  });
  const [step, setStep] = useState<'select' | 'bundle' | 'review'>('select');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Inizializza selezione vuota
      const initialSelection: Record<string, string> = {};
      comparison.items.forEach(item => {
        initialSelection[item.description] = '';
      });
      setSelectedItems(initialSelection);
      setBundles([]);
      setStep('select');
    }
  }, [isOpen, comparison]);

  const handleItemSelection = (itemDescription: string, vendorName: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemDescription]: vendorName
    }));
  };

  const handleCreateBundle = () => {
    const selectedVendors = [...new Set(Object.values(selectedItems).filter(Boolean))];
    
    if (selectedVendors.length === 0) {
      setError('Seleziona almeno un fornitore per creare un bundle');
      return;
    }

    if (selectedVendors.length > 1) {
      setError('Seleziona un solo fornitore per bundle');
      return;
    }

    const vendorName = selectedVendors[0];
    const bundleItems = comparison.items.filter(item => 
      selectedItems[item.description] === vendorName
    );

    if (bundleItems.length === 0) {
      setError('Nessun item selezionato per questo fornitore');
      return;
    }

    const awardItems: AwardItem[] = bundleItems.map(item => {
      const offer = item.offers[vendorName];
      return {
        itemId: item.description, // Usa description come ID per semplicità
        vendorName,
        unitPrice: offer.unitPriceWithVat,
        totalPrice: offer.totalPriceWithVat,
        qty: item.qty,
        uom: item.uom,
        description: item.description,
        category: item.category || 'Generale'
      };
    });

    const totalValue = awardItems.reduce((sum, item) => sum + item.totalPrice, 0);

    setCurrentBundle({
      name: `Bundle ${vendorName}`,
      vendorName,
      items: awardItems,
      totalValue,
      milestones: [
        {
          id: 'milestone-1',
          name: 'Anticipo',
          percentage: 30,
          description: 'Pagamento anticipato all\'avvio lavori',
          conditions: ['Firma contratto', 'Presentazione cauzione']
        },
        {
          id: 'milestone-2',
          name: 'Sal',
          percentage: 60,
          description: 'Pagamento al completamento lavori',
          conditions: ['Collaudo positivo', 'Documentazione completa']
        },
        {
          id: 'milestone-3',
          name: 'Retention',
          percentage: 10,
          description: 'Ritenuta di garanzia',
          conditions: ['Garanzia 24 mesi', 'Manutenzione ordinaria']
        }
      ],
      retention: 5,
      penalties: [],
      bonuses: []
    });

    setStep('bundle');
    setError(null);
  };

  const handleSaveBundle = () => {
    if (!currentBundle.name || !currentBundle.vendorName) {
      setError('Nome bundle e fornitore sono obbligatori');
      return;
    }

    const bundle: AwardBundle = {
      id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: currentBundle.name,
      vendorName: currentBundle.vendorName,
      items: currentBundle.items || [],
      totalValue: currentBundle.totalValue || 0,
      milestones: currentBundle.milestones || [],
      retention: currentBundle.retention || 5,
      penalties: currentBundle.penalties || [],
      bonuses: currentBundle.bonuses || []
    };

    setBundles(prev => [...prev, bundle]);
    setCurrentBundle({
      name: '',
      vendorName: '',
      items: [],
      totalValue: 0,
      milestones: [],
      retention: 5,
      penalties: [],
      bonuses: []
    });
    setStep('select');
    setError(null);
  };

  const handleRemoveBundle = (bundleId: string) => {
    setBundles(prev => prev.filter(b => b.id !== bundleId));
  };

  const handleCompleteAward = () => {
    if (bundles.length === 0) {
      setError('Crea almeno un bundle per completare l\'aggiudicazione');
      return;
    }

    if (onAwardComplete) {
      onAwardComplete(bundles);
    }

    onClose();
  };

  const getVendorOptions = (item: ComparisonItem) => {
    return comparison.vendorScores
      .filter(vendor => item.offers[vendor.vendorName]?.hasOffer)
      .map(vendor => ({
        name: vendor.vendorName,
        price: item.offers[vendor.vendorName].unitPriceWithVat,
        isBest: item.bestOffer?.vendorName === vendor.vendorName
      }));
  };

  const getTotalAwardedValue = () => {
    return bundles.reduce((sum, bundle) => sum + bundle.totalValue, 0);
  };

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Aggiudicazione Offerte</h2>
              <p className="text-sm text-gray-600">
                Step {step === 'select' ? '1' : step === 'bundle' ? '2' : '3'} di 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {['select', 'bundle', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-yellow-500 text-white' 
                    : ['select', 'bundle', 'review'].indexOf(step) > index
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  step === stepName ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {stepName === 'select' ? 'Selezione' : 
                   stepName === 'bundle' ? 'Bundle' : 'Riepilogo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Step 1: Selezione Items */}
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Fornitori per Items</h3>
                
                <div className="space-y-4">
                  {comparison.items.map((item, index) => {
                    const vendorOptions = getVendorOptions(item);
                    const selectedVendor = selectedItems[item.description];
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.description}</h4>
                            <p className="text-sm text-gray-600">
                              {item.qty.toLocaleString()} {item.uom} • {item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Miglior offerta</div>
                            <div className="font-semibold text-green-600">
                              €{item.bestOffer?.unitPrice.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {vendorOptions.map((vendor) => (
                            <button
                              key={vendor.name}
                              onClick={() => handleItemSelection(item.description, vendor.name)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedVendor === vendor.name
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : vendor.isBest
                                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                                    : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{vendor.name}</span>
                                {vendor.isBest && (
                                  <Star className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                €{vendor.price.toLocaleString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configurazione Bundle */}
          {step === 'bundle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione Bundle</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Info Bundle */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Bundle *
                      </label>
                      <input
                        type="text"
                        value={currentBundle.name || ''}
                        onChange={(e) => setCurrentBundle(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="es. Bundle Opere Strutturali"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fornitore
                      </label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                        {currentBundle.vendorName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valore Totale
                      </label>
                      <div className="px-4 py-3 bg-green-100 rounded-lg text-green-800 font-semibold">
                        €{currentBundle.totalValue?.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ritenuta (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={currentBundle.retention || 5}
                        onChange={(e) => setCurrentBundle(prev => ({ ...prev, retention: parseFloat(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Items Bundle */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Items nel Bundle</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentBundle.items?.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.description}</div>
                              <div className="text-sm text-gray-600">
                                {item.qty.toLocaleString()} {item.uom}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                €{item.totalPrice.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                €{item.unitPrice.toLocaleString()}/{item.uom}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Milestones */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Milestone Pagamento</h4>
                  <div className="space-y-3">
                    {currentBundle.milestones?.map((milestone, index) => (
                      <div key={milestone.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {milestone.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className="text-sm font-semibold text-blue-800">
                          €{((currentBundle.totalValue || 0) * milestone.percentage / 100).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Step 3: Riepilogo */}
          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Aggiudicazione</h3>
                
                <div className="space-y-4">
                  {bundles.map((bundle, index) => (
                    <div key={bundle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                          <p className="text-sm text-gray-600">{bundle.vendorName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            €{bundle.totalValue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {bundle.items.length} items
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Ritenuta</div>
                          <div className="font-medium">{bundle.retention}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Milestone</div>
                          <div className="font-medium">{bundle.milestones.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Penali</div>
                          <div className="font-medium">{bundle.penalties.length}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">Valore Totale Aggiudicato</h4>
                      <p className="text-sm text-green-600">{bundles.length} bundle creati</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        €{getTotalAwardedValue().toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {step === 'select' && `${getSelectedItemsCount()} items selezionati`}
            {step === 'bundle' && 'Configurazione bundle'}
            {step === 'review' && `${bundles.length} bundle pronti`}
          </div>
          <div className="flex items-center space-x-3">
            {step !== 'select' && (
              <button
                onClick={() => {
                  if (step === 'bundle') setStep('select');
                  if (step === 'review') setStep('bundle');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Indietro
              </button>
            )}
            
            {step === 'select' && (
              <button
                onClick={handleCreateBundle}
                disabled={getSelectedItemsCount() === 0}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Crea Bundle</span>
              </button>
            )}
            
            {step === 'bundle' && (
              <button
                onClick={handleSaveBundle}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salva Bundle</span>
              </button>
            )}
            
            {step === 'review' && (
              <button
                onClick={handleCompleteAward}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Completa Aggiudicazione</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Errore</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

      </div>
    </div>
  );
}
