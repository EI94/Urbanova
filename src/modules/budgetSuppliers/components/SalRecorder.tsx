'use client';

/**
 * 📊 SAL RECORDER
 * 
 * Componente per registrazione SAL e aggiornamento consuntivo
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  X, 
  Upload,
  Calendar,
  Euro,
  Percent,
  AlertCircle,
  Info,
  Clock,
  User,
  Building,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import { ProgressService, SalEntry } from '../api/progress';
import { Contract, BoqItem } from '../lib/types';

interface SalRecorderProps {
  contract: Contract;
  onSalRecorded?: (sal: SalEntry) => void;
  onConsuntivoUpdated?: (itemId: string, newConsuntivo: number) => void;
}

export function SalRecorder({ contract, onSalRecorded, onConsuntivoUpdated }: SalRecorderProps) {
  const [sals, setSals] = useState<SalEntry[]>([]);
  const [isAddingSal, setIsAddingSal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form per nuovo SAL
  const [newSal, setNewSal] = useState({
    itemId: '',
    amount: 0,
    percentage: 0,
    description: '',
    notes: ''
  });

  useEffect(() => {
    loadContractSals();
  }, [contract.id]);

  const loadContractSals = async () => {
    try {
      setLoading(true);
      const contractSals = await ProgressService.getContractSals(contract.id);
      setSals(contractSals);
    } catch (error: any) {
      console.error('❌ [SAL] Errore caricamento SAL:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSal = async () => {
    try {
      if (!newSal.itemId || newSal.amount <= 0) {
        setError('Seleziona item e inserisci importo valido');
        return;
      }

      setLoading(true);
      setError(null);

      const sal = await ProgressService.recordSal(
        contract.id,
        newSal.itemId,
        newSal.amount,
        newSal.percentage,
        newSal.description,
        newSal.notes
      );

      setSals(prev => [...prev, sal]);
      
      // Calcola nuovo consuntivo
      const newConsuntivo = await ProgressService.getItemConsuntivo(newSal.itemId);
      
      if (onConsuntivoUpdated) {
        onConsuntivoUpdated(newSal.itemId, newConsuntivo);
      }

      if (onSalRecorded) {
        onSalRecorded(sal);
      }

      // Reset form
      setNewSal({
        itemId: '',
        amount: 0,
        percentage: 0,
        description: '',
        notes: ''
      });
      
      setIsAddingSal(false);
      setSuccess('SAL registrato con successo!');

    } catch (error: any) {
      console.error('❌ [SAL] Errore registrazione SAL:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSal = async (salId: string) => {
    try {
      setLoading(true);
      const approvedSal = await ProgressService.approveSal(salId, 'current-user');
      
      setSals(prev => prev.map(sal => 
        sal.id === salId ? approvedSal : sal
      ));
      
      setSuccess('SAL approvato con successo!');

    } catch (error: any) {
      console.error('❌ [SAL] Errore approvazione SAL:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemConsuntivo = (itemId: string): number => {
    return sals
      .filter(sal => sal.itemId === itemId && sal.status === 'approved')
      .reduce((sum, sal) => sum + sal.amount, 0);
  };

  const getItemProgress = (itemId: string): number => {
    const itemSals = sals.filter(sal => sal.itemId === itemId);
    if (itemSals.length === 0) return 0;
    
    return Math.max(...itemSals.map(sal => sal.percentage));
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrazione SAL</h2>
          <p className="text-gray-600 mt-1">
            Contratto {contract.vendorName} - €{contract.totalValue.toLocaleString()}
          </p>
        </div>
        
        <button
          onClick={() => setIsAddingSal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo SAL</span>
        </button>
      </div>

      {/* Alert Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Items Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Contratto</h3>
        
        <div className="space-y-3">
          {contract.items.map((item, index) => {
            const consuntivo = getItemConsuntivo(item.itemId);
            const progress = getItemProgress(item.itemId);
            const contractAmount = item.totalPrice;
            const driftAmount = consuntivo - contractAmount;
            const driftPercentage = contractAmount > 0 ? (driftAmount / contractAmount) * 100 : 0;
            
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
                    <div className="text-sm text-gray-500">Contratto</div>
                    <div className="font-semibold text-blue-600">
                      €{contractAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Consuntivo</div>
                    <div className="font-medium text-green-600">
                      €{consuntivo.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Progresso</div>
                    <div className="font-medium text-purple-600">
                      {progress.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Scostamento</div>
                    <div className={`font-medium ${
                      driftAmount > 0 ? 'text-red-600' : 
                      driftAmount < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {driftAmount > 0 ? '+' : ''}€{driftAmount.toLocaleString()}
                      <span className="text-xs ml-1">
                        ({driftPercentage > 0 ? '+' : ''}{driftPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add SAL Form */}
      {isAddingSal && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuovo SAL</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Item Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item *
              </label>
              <select
                value={newSal.itemId}
                onChange={(e) => setNewSal(prev => ({ ...prev, itemId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleziona item</option>
                {contract.items.map(item => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.description} - €{item.totalPrice.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo (€) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newSal.amount}
                onChange={(e) => setNewSal(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. 15000"
              />
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentuale Completamento (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newSal.percentage}
                onChange={(e) => setNewSal(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. 75"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione *
              </label>
              <input
                type="text"
                value={newSal.description}
                onChange={(e) => setNewSal(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. Completamento struttura"
              />
            </div>

          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={newSal.notes}
              onChange={(e) => setNewSal(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Note aggiuntive..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsAddingSal(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleAddSal}
              disabled={loading || !newSal.itemId || newSal.amount <= 0}
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
                  <span>Registra SAL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SAL History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storico SAL</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Caricamento SAL...</p>
          </div>
        ) : sals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nessun SAL registrato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sals.map((sal) => {
              const item = contract.items.find(i => i.itemId === sal.itemId);
              
              return (
                <div key={sal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{sal.description}</h4>
                      <p className="text-sm text-gray-600">
                        {item?.description} • {sal.percentage.toFixed(1)}% completamento
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        €{sal.amount.toLocaleString()}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sal.status)}`}>
                        {getStatusIcon(sal.status)}
                        <span className="ml-1 capitalize">{sal.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Data</div>
                      <div className="font-medium">
                        {new Date(sal.date).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Percentuale</div>
                      <div className="font-medium">{sal.percentage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Approvato da</div>
                      <div className="font-medium">{sal.approvedBy || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Azioni</div>
                      <div className="flex items-center space-x-2">
                        {sal.status === 'pending' && (
                          <button
                            onClick={() => handleApproveSal(sal.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approva SAL"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {sal.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <strong>Note:</strong> {sal.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
