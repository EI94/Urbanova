'use client';

/**
 * 📊 VARIATIONS DIALOG
 * 
 * Dialog per gestione varianti (change orders) con versioning
 */

import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Plus, 
  Minus, 
  CheckCircle, 
  X, 
  AlertCircle,
  Info,
  Clock,
  User,
  FileText,
  Save,
  History,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { ProgressService, VariationEntry } from '../api/progress';
import { Contract, BoqItem } from '../lib/types';

interface VariationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onVariationRecorded?: (variation: VariationEntry) => void;
}

export function VariationsDialog({ 
  isOpen, 
  onClose, 
  contract, 
  onVariationRecorded 
}: VariationsDialogProps) {
  const [variations, setVariations] = useState<VariationEntry[]>([]);
  const [isAddingVariation, setIsAddingVariation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  
  // Form per nuova variante
  const [newVariation, setNewVariation] = useState({
    itemId: '',
    type: 'addition' as 'addition' | 'reduction' | 'modification',
    amount: 0,
    description: '',
    reason: '',
    justification: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadContractVariations();
    }
  }, [isOpen, contract.id]);

  const loadContractVariations = async () => {
    try {
      setLoading(true);
      const contractVariations = await ProgressService.getContractVariations(contract.id);
      setVariations(contractVariations);
    } catch (error: any) {
      console.error('❌ [VARIATIONS] Errore caricamento varianti:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariation = async () => {
    try {
      if (!newVariation.description || newVariation.amount === 0) {
        setError('Inserisci descrizione e importo valido');
        return;
      }

      setLoading(true);
      setError(null);

      const variation = await ProgressService.recordVariation(
        contract.id,
        newVariation.itemId || null,
        newVariation.type,
        newVariation.amount,
        newVariation.description,
        newVariation.reason,
        newVariation.justification
      );

      setVariations(prev => [...prev, variation]);

      if (onVariationRecorded) {
        onVariationRecorded(variation);
      }

      // Reset form
      setNewVariation({
        itemId: '',
        type: 'addition',
        amount: 0,
        description: '',
        reason: '',
        justification: ''
      });
      
      setIsAddingVariation(false);
      setSuccess('Variante registrata con successo!');

    } catch (error: any) {
      console.error('❌ [VARIATIONS] Errore registrazione variante:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVariation = async (variationId: string) => {
    try {
      setLoading(true);
      const approvedVariation = await ProgressService.approveVariation(variationId, 'current-user');
      
      setVariations(prev => prev.map(variation => 
        variation.id === variationId ? approvedVariation : variation
      ));
      
      setSuccess('Variante approvata con successo!');

    } catch (error: any) {
      console.error('❌ [VARIATIONS] Errore approvazione variante:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVariationTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return <Plus className="w-4 h-4 text-green-600" />;
      case 'reduction': return <Minus className="w-4 h-4 text-red-600" />;
      case 'modification': return <Edit className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVariationTypeColor = (type: string): string => {
    switch (type) {
      case 'addition': return 'text-green-600 bg-green-100';
      case 'reduction': return 'text-red-600 bg-red-100';
      case 'modification': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTotalVariations = (): number => {
    return variations
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + v.amount, 0);
  };

  const getItemVariations = (itemId: string): number => {
    return variations
      .filter(v => v.itemId === itemId && v.status === 'approved')
      .reduce((sum, v) => sum + v.amount, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestione Varianti</h2>
              <p className="text-sm text-gray-600">
                Contratto {contract.vendorName} - €{contract.totalValue.toLocaleString()}
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

        {/* Alert Messages */}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Riepilogo Varianti</h3>
                <p className="text-sm text-gray-600">{variations.length} varianti registrate</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  €{getTotalVariations().toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Totale varianti approvate</div>
              </div>
            </div>
          </div>

          {/* Items with Variations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items con Varianti</h3>
            
            <div className="space-y-3">
              {contract.items.map((item) => {
                const itemVariations = getItemVariations(item.itemId);
                const contractAmount = item.totalPrice;
                const newAmount = contractAmount + itemVariations;
                const variationPercentage = contractAmount > 0 ? (itemVariations / contractAmount) * 100 : 0;
                
                return (
                  <div key={item.itemId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.description}</h4>
                        <p className="text-sm text-gray-600">
                          {item.qty.toLocaleString()} {item.uom} • {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Importo Finale</div>
                        <div className="font-semibold text-green-600">
                          €{newAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Contratto Originale</div>
                        <div className="font-medium text-blue-600">
                          €{contractAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Varianti</div>
                        <div className={`font-medium ${
                          itemVariations > 0 ? 'text-green-600' : 
                          itemVariations < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {itemVariations > 0 ? '+' : ''}€{itemVariations.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Variazione %</div>
                        <div className={`font-medium ${
                          variationPercentage > 0 ? 'text-green-600' : 
                          variationPercentage < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {variationPercentage > 0 ? '+' : ''}{variationPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Variation Form */}
          {isAddingVariation && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuova Variante</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Item Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item (opzionale)
                  </label>
                  <select
                    value={newVariation.itemId}
                    onChange={(e) => setNewVariation(prev => ({ ...prev, itemId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Variante su contratto intero</option>
                    {contract.items.map(item => (
                      <option key={item.itemId} value={item.itemId}>
                        {item.description} - €{item.totalPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Variante *
                  </label>
                  <select
                    value={newVariation.type}
                    onChange={(e) => setNewVariation(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="addition">Aggiunta</option>
                    <option value="reduction">Riduzione</option>
                    <option value="modification">Modifica</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importo (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVariation.amount}
                    onChange={(e) => setNewVariation(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. 10000"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione *
                  </label>
                  <input
                    type="text"
                    value={newVariation.description}
                    onChange={(e) => setNewVariation(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. Aggiunta impermeabilizzazione"
                  />
                </div>

              </div>

              {/* Reason */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={newVariation.reason}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Richiesta cliente"
                />
              </div>

              {/* Justification */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giustificazione *
                </label>
                <textarea
                  value={newVariation.justification}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, justification: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Dettagliare la giustificazione tecnica/economica..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingVariation(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddVariation}
                  disabled={loading || !newVariation.description || newVariation.amount === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Registra Variante</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Variations History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Storico Varianti</h3>
              <button
                onClick={() => setIsAddingVariation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Variante</span>
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Caricamento varianti...</p>
              </div>
            ) : variations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Edit className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nessuna variante registrata</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variations.map((variation) => {
                  const item = contract.items.find(i => i.itemId === variation.itemId);
                  
                  return (
                    <div key={variation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getVariationTypeIcon(variation.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{variation.description}</h4>
                            <p className="text-sm text-gray-600">
                              {item ? item.description : 'Contratto intero'} • v{variation.version}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            variation.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {variation.amount > 0 ? '+' : ''}€{variation.amount.toLocaleString()}
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(variation.status)}`}>
                            {getStatusIcon(variation.status)}
                            <span className="ml-1 capitalize">{variation.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-gray-600">Tipo</div>
                          <div className={`font-medium ${getVariationTypeColor(variation.type)} px-2 py-1 rounded-full text-xs inline-block`}>
                            {variation.type === 'addition' ? 'Aggiunta' : 
                             variation.type === 'reduction' ? 'Riduzione' : 'Modifica'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Data</div>
                          <div className="font-medium">
                            {new Date(variation.date).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Motivo</div>
                          <div className="font-medium">{variation.reason}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Azioni</div>
                          <div className="flex items-center space-x-2">
                            {variation.status === 'pending' && (
                              <button
                                onClick={() => handleApproveVariation(variation.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Approva variante"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <strong>Giustificazione:</strong> {variation.justification}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {variations.length} varianti • Totale: €{getTotalVariations().toLocaleString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
