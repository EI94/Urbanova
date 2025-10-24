'use client';

/**
 * 💰 OFFER ENTRY
 * 
 * Componente per inserimento offerte fornitori (token-based)
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Euro,
  Package,
  File,
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { OfferService, TokenValidation } from '../api/offer';
import { OfferLine } from '../lib/types';

interface RfpItem {
  id: string;
  code: string;
  description: string;
  category: string;
  uom: string;
  qty: number;
  notes?: string;
  level: number;
}

interface RfpData {
  id: string;
  name: string;
  dueAt: number;
  items: RfpItem[];
  rules: {
    requireUnitPrices: boolean;
    requireLeadTime: boolean;
    paymentTerms: string;
  };
}

interface OfferEntryProps {
  token: string;
  onOfferSubmitted?: (offer: any) => void;
}

export function OfferEntry({ token, onOfferSubmitted }: OfferEntryProps) {
  const [rfpData, setRfpData] = useState<RfpData | null>(null);
  const [offerLines, setOfferLines] = useState<OfferLine[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadRfpData();
  }, [token]);

  const loadRfpData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [OFFER] Caricamento RFP per token:', token);
      
      const rfp = await OfferService.getRfpByToken(token);
      setRfpData(rfp);
      
      // Inizializza offer lines
      const initialLines: OfferLine[] = rfp.items.map(item => ({
        itemId: item.id,
        code: item.code,
        description: item.description,
        category: item.category,
        uom: item.uom,
        qty: item.qty,
        unitPrice: 0,
        totalPrice: 0,
        notes: '',
        exclusions: '',
        leadTime: '',
        level: item.level
      }));
      
      setOfferLines(initialLines);
      
      console.log('✅ [OFFER] RFP caricata con', rfp.items.length, 'items');
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore caricamento RFP:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOfferLine = (index: number, field: keyof OfferLine, value: any) => {
    const newLines = [...offerLines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Ricalcola totalPrice se cambia unitPrice o qty
    if (field === 'unitPrice' || field === 'qty') {
      newLines[index].totalPrice = newLines[index].unitPrice * newLines[index].qty;
    }
    
    setOfferLines(newLines);
    
    // Pulisci errori di validazione quando l'utente modifica
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Verifica che ci siano almeno alcune offerte
    const filledLines = offerLines.filter(line => line.unitPrice > 0);
    if (filledLines.length === 0) {
      errors.push('Inserisci almeno un prezzo per procedere');
    }
    
    // Verifica che tutti i prezzi siano positivi
    const negativePrices = offerLines.filter(line => line.unitPrice < 0);
    if (negativePrices.length > 0) {
      errors.push('I prezzi non possono essere negativi');
    }
    
    // Verifica campi obbligatori se richiesti dalle regole
    if (rfpData?.rules?.requireUnitPrices) {
      const missingPrices = offerLines.filter(line => line.unitPrice <= 0);
      if (missingPrices.length > 0) {
        warnings.push('Alcuni prezzi unitari sono mancanti');
      }
    }
    
    if (rfpData?.rules?.requireLeadTime) {
      const missingLeadTime = offerLines.filter(line => line.unitPrice > 0 && !line.leadTime?.trim());
      if (missingLeadTime.length > 0) {
        warnings.push('Alcuni tempi di consegna sono mancanti');
      }
    }
    
    setValidationErrors(errors);
    setValidationWarnings(warnings);
    
    return errors.length === 0;
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!validateForm()) {
        return;
      }
      
      console.log('💾 [OFFER] Salvataggio bozza...');
      
      const filledLines = offerLines.filter(line => line.unitPrice > 0);
      await OfferService.saveOffer(token, filledLines, files);
      
      setSuccess('Bozza salvata con successo!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore salvataggio bozza:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitOffer = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!validateForm()) {
        return;
      }
      
      console.log('📤 [OFFER] Invio offerta finale...');
      
      const filledLines = offerLines.filter(line => line.unitPrice > 0);
      const offer = await OfferService.submitOffer(token, filledLines, files);
      
      setSuccess('Offerta inviata con successo!');
      
      if (onOfferSubmitted) {
        onOfferSubmitted(offer);
      }
      
    } catch (error: any) {
      console.error('❌ [OFFER] Errore invio offerta:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalOfferValue = () => {
    return offerLines.reduce((sum, line) => sum + line.totalPrice, 0);
  };

  const getFilledItemsCount = () => {
    return offerLines.filter(line => line.unitPrice > 0).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Caricamento RFP...</h2>
          <p className="text-gray-600">Verifica del token in corso</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Errore</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={loadRfpData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!rfpData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RFP non trovata</h2>
          <p className="text-gray-600">La richiesta di offerta non è disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{rfpData.name}</h1>
              <p className="text-gray-600 mt-1">
                Scadenza: {formatDate(rfpData.dueAt)} • {rfpData.items.length} items
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Valore Totale</div>
                <div className="text-xl font-bold text-green-600">
                  €{getTotalOfferValue().toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Items Compilati</div>
                <div className="text-xl font-bold text-blue-600">
                  {getFilledItemsCount()}/{rfpData.items.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Errori da correggere:</span>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Avvisi:</span>
            </div>
            <ul className="text-yellow-700 text-sm space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Items da Offrire</h2>
            <p className="text-sm text-gray-600 mt-1">
              Inserisci i prezzi unitari per gli items che desideri offrire
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrizione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prezzo Unitario (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totale (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note/Esclusioni
                  </th>
                  {rfpData.rules.requireLeadTime && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo Consegna
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offerLines.map((line, index) => (
                  <tr key={line.itemId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {line.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{line.description}</div>
                        <div className="text-xs text-gray-500">{line.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.uom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {line.qty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unitPrice || ''}
                        onChange={(e) => updateOfferLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{line.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        value={line.notes || ''}
                        onChange={(e) => updateOfferLine(index, 'notes', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Note..."
                        rows={2}
                      />
                    </td>
                    {rfpData.rules.requireLeadTime && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={line.leadTime || ''}
                          onChange={(e) => updateOfferLine(index, 'leadTime', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="es. 30 giorni"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* File Upload */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Allegati</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Carica documenti aggiuntivi (PDF, Excel, immagini)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Seleziona File
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Scadenza: {formatDate(rfpData.dueAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvataggio...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salva Bozza</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSubmitOffer}
              disabled={saving || submitting || validationErrors.length > 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Invio...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Invia Offerta</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
